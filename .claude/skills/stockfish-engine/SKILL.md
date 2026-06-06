---
name: stockfish-engine
description: Stockfish / chess-engine integration for the Chess Scan app — UCI protocol, MultiPV parsing, eval (centipawns/mate), and the react-native-stockfish vs Lichess Cloud Eval fallback. Load when writing lib/engine.ts, parsing engine output, building the eval bar / multi-PV lines, or deciding between native engine and cloud fallback.
---

# Stockfish Engine (`lib/engine.ts`)

Defaults: **MultiPV=3, depth=18**. Engine speaks **UCI**; convert moves to SAN for display (see `chess-domain`).

## Strategy: Option A → fallback Option B

- **Option A — `react-native-stockfish`** (native, offline, preferred). Needs a **dev build** (not Expo Go). Test Week 2 Day 9.
- **Option B — Lichess Cloud Eval API** (fallback if A is unreliable). Online, rate-limited.
- **Option C — custom native module** (last resort, 1–2 weeks). Avoid unless A and B both fail.

Wrap both behind ONE interface so screens never know which is running:
```ts
export interface EngineResult { lines: MultiPVLine[]; }
export interface ChessEngine {
  analyze(fen: string, opts?: { multipv?: number; depth?: number }): Promise<EngineResult>;
  stop(): void;
}
```

## UCI protocol (what you send / receive)

Handshake then analyze:
```
→ uci                                    ← ... uciok
→ isready                                ← readyok
→ setoption name MultiPV value 3
→ ucinewgame
→ position fen <FEN>
→ go depth 18
← info depth 18 seldepth ... multipv 1 score cp 36 ... pv g1f3 b8c6 f1c4 ...
← info depth 18 ... multipv 2 score cp 33 ... pv b1c3 d7d5 ...
← info depth 18 ... multipv 3 score cp 32 ... pv f1c4 g8f6 ...
← bestmove g1f3 ponder b8c6
```
- Set `MultiPV` **before** `go` (and before `ucinewgame`/`position` is fine too — just not mid-search).
- Resolve the promise on `bestmove`. Collect the **last** `info ... multipv N` seen for each N (deeper lines overwrite shallower).

## Parsing `info` lines

```ts
function parseInfo(line: string): Partial<MultiPVLine> | null {
  if (!line.startsWith('info') || !line.includes(' pv ')) return null;
  const tok = line.split(' ');
  const get = (k: string) => tok[tok.indexOf(k) + 1];
  const multipv = Number(get('multipv') ?? '1');
  const scoreType = tok[tok.indexOf('score') + 1];      // 'cp' | 'mate'
  const scoreVal = Number(tok[tok.indexOf('score') + 2]);
  const pv = tok.slice(tok.indexOf('pv') + 1);          // UCI moves
  return {
    // index by multipv-1 into your results array
    evalCp: scoreType === 'cp' ? scoreVal : undefined,
    scoreMate: scoreType === 'mate' ? scoreVal : undefined,
    bestMove: pv[0],
    continuation: pv.slice(0, 8),                        // first 8 UCI moves
  };
}
```
- Keep a `Map<number, MultiPVLine>` keyed by `multipv`; overwrite as deeper info arrives. On `bestmove`, emit sorted by key.
- Convert `bestMove` + `continuation` (UCI) → SAN by replaying on a `Chess(fen)` instance for the move strip and multi-PV display.

## Eval semantics (centipawns + mate)

- `cp` = centipawns from the **side-to-move's** perspective. Divide by 100 for pawns: `+0.36`.
- Display is conventionally from **White's** perspective → if `chess.turn() === 'b'`, negate: `displayCp = turn === 'b' ? -cp : cp`.
- `mate N` = forced mate in N (positive = side-to-move mates, negative = gets mated). Render as `#N` (or `#-N`), not a number.
- Eval bar: clamp cp to ~[-1000, +1000] for the fill ratio; mate → full bar to the mating side.

## react-native-stockfish wrapper sketch

```ts
import Stockfish from 'react-native-stockfish';

class NativeEngine implements ChessEngine {
  private sf = new Stockfish();
  private buf = new Map<number, MultiPVLine>();
  async analyze(fen: string, { multipv = 3, depth = 18 } = {}) {
    this.buf.clear();
    return new Promise<EngineResult>((resolve) => {
      this.sf.onmessage = (msg: string) => {
        const info = parseInfo(msg);
        if (info?.bestMove) this.buf.set(/*multipv from msg*/ , info as MultiPVLine);
        if (msg.startsWith('bestmove')) {
          const lines = [...this.buf.entries()].sort((a,b)=>a[0]-b[0]).map(e=>e[1]);
          resolve({ lines });
        }
      };
      this.sf.postMessage('setoption name MultiPV value ' + multipv);
      this.sf.postMessage('position fen ' + fen);
      this.sf.postMessage('go depth ' + depth);
    });
  }
  stop() { this.sf.postMessage('stop'); }
}
```
- `onmessage` is async stream — never assume one message per line; some libs batch. Split on `\n` defensively.
- Always call `stop` when leaving the Game Review screen or starting a new analysis (avoid stacked searches).

## Lichess Cloud Eval fallback (Option B)

```ts
async function analyzeLichess(fen: string, multiPv = 3): Promise<EngineResult> {
  const r = await fetch(`https://lichess.org/api/cloud-eval?fen=${encodeURIComponent(fen)}&multiPv=${multiPv}`);
  if (r.status === 404) throw new EngineMiss('no cloud eval for this position');
  const d = await r.json();
  return { lines: d.pvs.map((pv: any) => ({
    evalCp: pv.cp, scoreMate: pv.mate,
    bestMove: pv.moves.split(' ')[0],
    continuation: pv.moves.split(' ').slice(1, 9),
  })) };
}
```
- Rate limit ~100/min; cache results per FEN in-memory + the SavedGame `analysis` cache.
- 404 = position not in their cloud DB (common for unusual positions) → if native unavailable, tell the user "no cloud analysis for this position."
- Needs internet; gate behind a connectivity check and show offline state.

## Performance / UX

- depth 18 is a few seconds. Show a "Analyzing…" state; optionally stream the current best line as depth increases.
- Cache the result into `SavedGame.analysis` so reopening a game is instant (don't re-run the engine).
- Re-analyze when the user navigates to a different ply only if you want per-move eval; for v1, analyze the scanned/final position and the move strip's current node.
