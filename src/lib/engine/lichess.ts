// Lichess Cloud Eval — fast path for positions already in Lichess's DB.
// Returns null on 404 (position not analyzed) so the caller falls back to the WASM engine.

import { uciPvToPlies, sideToMove, toWhiteCp, toWhiteMate } from '@/lib/engine/uci';
import type { EngineResult } from '@/lib/engine/types';
import type { MultiPVLine } from '@/types/chess';

interface LichessPv { moves: string; cp?: number; mate?: number }
interface LichessResp { depth: number; pvs: LichessPv[] }

export async function analyzeLichess(fen: string, multipv = 3, signal?: AbortSignal): Promise<EngineResult | null> {
  try {
    const url = `https://lichess.org/api/cloud-eval?fen=${encodeURIComponent(fen)}&multiPv=${multipv}`;
    const res = await fetch(url, { signal });
    if (!res.ok) return null; // 404 = not in cloud DB
    const data = (await res.json()) as LichessResp;
    if (!data.pvs?.length) return null;
    const turn = sideToMove(fen);
    const lines: MultiPVLine[] = data.pvs.map((pv) => {
      const uci = pv.moves.split(' ');
      return {
        evalCp: pv.cp != null ? toWhiteCp(pv.cp, turn) : 0,
        scoreMate: pv.mate != null ? toWhiteMate(pv.mate, turn) : undefined,
        plies: uciPvToPlies(fen, uci),
      };
    });
    return { fen, lines, source: 'lichess', depth: data.depth };
  } catch {
    return null;
  }
}
