// Score-sheet validation — replay recognized SAN moves through chess.js (the single source of
// truth for legality). Cascade-aware: the FIRST illegal move is flagged with legal suggestions
// and replay stops there (a wrong move makes everything after it look illegal).

import { Chess } from 'chess.js';
import type { Ply, Square } from '@/types/chess';
import type { SheetMove } from '@/lib/recognition';

export type MoveFlag = 'ok' | 'uncertain' | 'invalid';

export interface MoveCell {
  moveNumber: number;
  side: 'w' | 'b';
  san: string;
  flag: MoveFlag;
  suggest?: string[]; // legal alternatives at the failing position
}

export interface ValidatedSheet {
  plies: Ply[];           // legal plies (up to the first error)
  cells: MoveCell[];      // per-move flags for the grid
  firstError: number | null; // ply index of the first illegal move, or null
  result?: string;
}

const PIECE_NAME: Record<string, string> = { p: 'Pawn', n: 'Knight', b: 'Bishop', r: 'Rook', q: 'Queen', k: 'King' };

function friendlyName(san: string, piece: string, to: string): string {
  if (san.startsWith('O-O-O')) return 'Castles queenside';
  if (san.startsWith('O-O')) return 'Castles kingside';
  return `${PIECE_NAME[piece] ?? 'Piece'} to ${to}`;
}

export function validateSheet(moves: SheetMove[], uncertain: number[] = [], result?: string): ValidatedSheet {
  const chess = new Chess();
  const plies: Ply[] = [];
  const cells: MoveCell[] = [];
  let firstError: number | null = null;

  for (const m of moves) {
    for (const side of ['w', 'b'] as const) {
      const san = side === 'w' ? m.white : m.black;
      if (!san) continue;
      const flaggedUncertain = uncertain.includes(m.moveNumber);
      try {
        const mv = chess.move(san);
        const ply: Ply = {
          from: mv.from as Square, to: mv.to as Square, san: mv.san, color: mv.color,
          name: friendlyName(mv.san, mv.piece, mv.to),
        };
        if (mv.flags.includes('e')) ply.remove = (mv.to[0] + mv.from[1]) as Square;
        if (mv.flags.includes('k')) ply.rook = mv.color === 'w' ? ['h1', 'f1'] : ['h8', 'f8'];
        if (mv.flags.includes('q')) ply.rook = mv.color === 'w' ? ['a1', 'd1'] : ['a8', 'd8'];
        if (mv.promotion) ply.promotion = mv.promotion;
        plies.push(ply);
        cells.push({ moveNumber: m.moveNumber, side, san: mv.san, flag: flaggedUncertain ? 'uncertain' : 'ok' });
      } catch {
        firstError = plies.length;
        cells.push({ moveNumber: m.moveNumber, side, san: san ?? '?', flag: 'invalid', suggest: chess.moves().slice(0, 3) });
        return { plies, cells, firstError, result };
      }
    }
  }
  return { plies, cells, firstError, result };
}
