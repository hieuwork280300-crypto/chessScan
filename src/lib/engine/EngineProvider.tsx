// EngineProvider — mounts a hidden WebView running Stockfish (asm.js, single-thread, no
// native build) and exposes analyze(fen). Orchestration: try Lichess cloud first (instant
// for known positions), else run Stockfish in the WebView (works for ANY position).
// Swap in native react-native-stockfish later behind this same interface (EAS dev build).

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import { analyzeLichess } from '@/lib/engine/lichess';
import { uciPvToPlies, sideToMove, toWhiteCp, toWhiteMate } from '@/lib/engine/uci';
import type { AnalyzeOptions, EngineResult } from '@/lib/engine/types';
import type { MultiPVLine } from '@/types/chess';

// Stockfish asm.js (single file, no SharedArrayBuffer / no special headers → WebView-safe).
const SF_URL = 'https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js';

const HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body><script>
  var post = function(m){ try{ window.ReactNativeWebView.postMessage(m); }catch(e){} };
  window.onerror = function(msg){ post('@@error:'+msg); };
  var engine = null;
  var s = document.createElement('script');
  s.src = ${JSON.stringify(SF_URL)};
  s.onload = function(){
    try {
      if (typeof STOCKFISH !== 'function') { post('@@error:no STOCKFISH global'); return; }
      engine = STOCKFISH();
      engine.onmessage = function(e){ post(typeof e === 'string' ? e : (e && e.data) || ''); };
      window.__cmd = function(c){ try{ engine.postMessage(c); }catch(err){ post('@@error:'+err); } };
      post('@@ready');
    } catch(err){ post('@@error:'+err); }
  };
  s.onerror = function(){ post('@@error:script load failed'); };
  document.body.appendChild(s);
</script></body></html>`;

interface PendingState {
  fen: string;
  turn: 'w' | 'b';
  multipv: number;
  lines: Map<number, MultiPVLine>;
  depth: number;
  resolve: (r: EngineResult) => void;
  reject: (e: unknown) => void;
  timer: ReturnType<typeof setTimeout>;
}

interface EngineCtx {
  ready: boolean;
  available: boolean; // false if WASM failed to load (offline / CDN blocked)
  analyze: (fen: string, opts?: AnalyzeOptions) => Promise<EngineResult>;
}

const Ctx = createContext<EngineCtx | null>(null);

export function useEngine(): EngineCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('useEngine must be used within <EngineProvider>');
  return v;
}

function parseInfo(line: string) {
  if (!line.startsWith('info') || line.indexOf(' pv ') < 0 || line.indexOf('score') < 0) return null;
  const t = line.split(/\s+/);
  const idx = (k: string) => t.indexOf(k);
  const multipv = parseInt(t[idx('multipv') + 1] || '1', 10);
  const si = idx('score');
  const stype = t[si + 1];
  const sval = parseInt(t[si + 2], 10);
  const uci = t.slice(idx('pv') + 1);
  return { multipv, stype, sval, uci };
}

export function EngineProvider({ children }: { children: ReactNode }) {
  const webRef = useRef<WebView>(null);
  const readyRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [available, setAvailable] = useState(true);
  const pending = useRef<PendingState | null>(null);
  const queue = useRef<(() => void)[]>([]);

  const send = useCallback((cmd: string) => {
    webRef.current?.injectJavaScript(`window.__cmd && window.__cmd(${JSON.stringify(cmd)}); true;`);
  }, []);

  const finish = useCallback((p: PendingState) => {
    clearTimeout(p.timer);
    const lines = [...p.lines.entries()].sort((a, b) => a[0] - b[0]).map((e) => e[1]);
    p.resolve({ fen: p.fen, lines, source: 'wasm', depth: p.depth });
  }, []);

  const runWasm = useCallback((fen: string, opts: AnalyzeOptions) => {
    const multipv = opts.multipv ?? 3;
    const depth = opts.depth ?? 15;
    return new Promise<EngineResult>((resolve, reject) => {
      const start = () => {
        const turn = sideToMove(fen);
        const timer = setTimeout(() => {
          // safety: resolve with whatever we have, or reject
          const p = pending.current;
          pending.current = null;
          if (p && p.lines.size) finish(p);
          else reject(new Error('engine timeout'));
        }, 20000);
        pending.current = { fen, turn, multipv, lines: new Map(), depth, resolve, reject, timer };
        send('ucinewgame');
        send('setoption name MultiPV value ' + multipv);
        send('position fen ' + fen);
        send('go depth ' + depth);
      };
      if (readyRef.current) start();
      else queue.current.push(start);
    });
  }, [send, finish]);

  const onMessage = useCallback((e: WebViewMessageEvent) => {
    const line = e.nativeEvent.data;
    if (line === '@@ready') {
      readyRef.current = true;
      setReady(true);
      send('uci');
      send('isready');
      const q = queue.current; queue.current = [];
      q.forEach((fn) => fn());
      return;
    }
    if (line.startsWith('@@error:')) {
      setAvailable(false);
      const p = pending.current;
      if (p) { clearTimeout(p.timer); pending.current = null; p.reject(new Error(line)); }
      return;
    }
    const p = pending.current;
    if (!p) return;
    if (line.startsWith('bestmove')) {
      pending.current = null;
      finish(p);
      return;
    }
    const info = parseInfo(line);
    if (!info || info.multipv > p.multipv) return;
    const isMate = info.stype === 'mate';
    p.lines.set(info.multipv, {
      evalCp: isMate ? (toWhiteMate(info.sval, p.turn) > 0 ? 10000 : -10000) : toWhiteCp(info.sval, p.turn),
      scoreMate: isMate ? toWhiteMate(info.sval, p.turn) : undefined,
      plies: uciPvToPlies(p.fen, info.uci, 12),
    });
  }, [finish, send]);

  const analyze = useCallback(async (fen: string, opts: AnalyzeOptions = {}): Promise<EngineResult> => {
    // 1) Lichess fast path (instant for known positions; 404 → null quickly).
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 1800);
    const li = await analyzeLichess(fen, opts.multipv ?? 3, controller.signal).catch(() => null);
    clearTimeout(t);
    if (li && li.lines.length) return li;
    // 2) Stockfish in the WebView (any position).
    if (!available) throw new Error('engine unavailable');
    return runWasm(fen, opts);
  }, [available, runWasm]);

  const value = useMemo<EngineCtx>(() => ({ ready, available, analyze }), [ready, available, analyze]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <View style={{ width: 0, height: 0, position: 'absolute', opacity: 0 }} pointerEvents="none">
        <WebView
          ref={webRef}
          source={{ html: HTML }}
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
          onMessage={onMessage}
          // keep the JS context alive in background
          androidLayerType="software"
        />
      </View>
    </Ctx.Provider>
  );
}
