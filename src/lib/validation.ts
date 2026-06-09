// Score-sheet validation — replay recognized SAN moves through chess.js (the single source of
// truth for legality). Cascade-aware: the FIRST illegal move is flagged with legal suggestions
// and replay stops there (a wrong move makes everything after it look illegal).

import { Chess } from 'chess.js';
import type { Ply, Position, Square } from '@/types/chess';
import type { SheetMove } from '@/lib/recognition';

// ── Position sanity check ─────────────────────────────────────────────────────
// Catches common recognition mistakes (e.g. 3 knights, 2 kings, a pawn on rank 1)
// so the user can fix them on the Confirm screen before analyzing.
export interface PositionIssues { errors: string[]; warnings: string[] }

export function positionIssues(pos: Position): PositionIssues {
  const errors: string[] = [];
  const warnings: string[] = [];
  const values = Object.values(pos);
  const n = (color: 'w' | 'b', piece: string) => values.filter((p) => p === color + piece).length;

  for (const color of ['w', 'b'] as const) {
    const name = color === 'w' ? 'White' : 'Black';
    const K = n(color, 'K'), Q = n(color, 'Q'), R = n(color, 'R'), B = n(color, 'B'), N = n(color, 'N'), P = n(color, 'P');
    if (K === 0) errors.push(`No ${name} king`);
    else if (K > 1) errors.push(`${K} ${name} kings — only one allowed`);
    if (P > 8) errors.push(`${P} ${name} pawns — max 8`);
    const total = K + Q + R + B + N + P;
    if (total > 16) errors.push(`${name} has ${total} pieces — max 16`);
    // Extra non-pawn pieces must come from promoted pawns; each needs a missing pawn.
    const extra = Math.max(0, Q - 1) + Math.max(0, R - 2) + Math.max(0, B - 2) + Math.max(0, N - 2);
    if (extra > Math.max(0, 8 - P)) {
      warnings.push(`${name} has too many of one piece type — likely a misread`);
    }
  }
  for (const [sq, p] of Object.entries(pos)) {
    if (p[1] === 'P' && (sq[1] === '1' || sq[1] === '8')) {
      errors.push(`A pawn is on ${sq} — pawns can’t be on rank 1 or 8`);
    }
  }
  return { errors, warnings };
}

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

// FEN after replaying the first `n` plies of a game (for per-move engine eval).
export function fenAtPly(plies: Ply[], n: number): string {
  const chess = new Chess();
  for (let i = 0; i < Math.min(n, plies.length); i++) {
    try { chess.move(plies[i].san); } catch { break; }
  }
  return chess.fen();
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
