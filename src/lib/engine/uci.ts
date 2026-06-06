// UCI helpers — convert engine output into the app's Ply model via chess.js, and
// normalize evals to White's perspective.

import { Chess, type Move as CjsMove } from 'chess.js';
import type { Ply, Square } from '@/types/chess';

// Convert a UCI pv (e.g. ['g1f3','b8c6',...]) replayed from `fen` into Ply[] (with
// from/to/san + castling rook + en-passant removal so the board can step through it).
export function uciPvToPlies(fen: string, uci: string[], max = 12): Ply[] {
  const chess = new Chess();
  try {
    chess.load(fen);
  } catch {
    return [];
  }
  const plies: Ply[] = [];
  for (const u of uci.slice(0, max)) {
    const from = u.slice(0, 2) as Square;
    const to = u.slice(2, 4) as Square;
    const promotion = u.length > 4 ? u[4] : undefined;
    let mv: CjsMove;
    try {
      mv = chess.move({ from, to, promotion });
    } catch {
      break;
    }
    const ply: Ply = { from, to, san: mv.san, color: mv.color };
    if (promotion) ply.promotion = promotion;
    if (mv.flags.includes('e')) {
      // en passant: captured pawn sits on the to-file, from-rank
      ply.remove = (to[0] + from[1]) as Square;
    }
    if (mv.flags.includes('k')) ply.rook = mv.color === 'w' ? ['h1', 'f1'] : ['h8', 'f8'];
    if (mv.flags.includes('q')) ply.rook = mv.color === 'w' ? ['a1', 'd1'] : ['a8', 'd8'];
    plies.push(ply);
  }
  return plies;
}

// Stockfish reports score from the side-to-move's perspective; display uses White's.
export function toWhiteCp(cp: number, turn: 'w' | 'b'): number {
  return turn === 'b' ? -cp : cp;
}
export function toWhiteMate(mate: number, turn: 'w' | 'b'): number {
  return turn === 'b' ? -mate : mate;
}

export function sideToMove(fen: string): 'w' | 'b' {
  return fen.split(' ')[1] === 'b' ? 'b' : 'w';
}
