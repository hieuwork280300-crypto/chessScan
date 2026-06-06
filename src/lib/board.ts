// Board logic — FEN parsing, move application, square geometry, eval formatting.
// Pure functions, no rendering. (chess.js will back the real flows later;
// this mirrors the prototype's lightweight model for display + mock data.)

import { FILES } from '@/constants/chess';
import type { Ply, Position, Square } from '@/types/chess';

export function fenToPos(fen: string): Position {
  const rows = fen.split(' ')[0].split('/');
  const pos: Position = {};
  rows.forEach((row, ri) => {
    const rank = 8 - ri;
    let fi = 0;
    for (const ch of row) {
      if (/\d/.test(ch)) {
        fi += +ch;
      } else {
        const color = ch === ch.toUpperCase() ? 'w' : 'b';
        pos[FILES[fi] + rank] = color + ch.toUpperCase();
        fi++;
      }
    }
  });
  return pos;
}

export function applyMove(pos: Position, m: Ply): Position {
  const np: Position = { ...pos };
  np[m.to] = np[m.from];
  delete np[m.from];
  if (m.rook) {
    np[m.rook[1]] = np[m.rook[0]];
    delete np[m.rook[0]];
  }
  return np;
}

// White's view: rank 8 top, a-file left. Returns center of a square in px.
export function squareXY(sq: Square, sz: number): { x: number; y: number } {
  const file = FILES.indexOf(sq[0] as (typeof FILES)[number]);
  const rank = parseInt(sq[1], 10);
  const s = sz / 8;
  return { x: (file + 0.5) * s, y: (8 - rank + 0.5) * s };
}

// Fold plies onto a starting position; returns array of length plies.length + 1.
export function computeLinePositions(startPos: Position, plies: Ply[]): Position[] {
  const out: Position[] = [startPos];
  let cur = startPos;
  for (const m of plies) {
    cur = applyMove(cur, m);
    out.push(cur);
  }
  return out;
}

// Position → FEN placement field (+ turn). Castling defaulted to '-' (editor edits turn only).
export function posToFen(pos: Position, turn: 'w' | 'b' = 'w'): string {
  const ranks: string[] = [];
  for (let r = 8; r >= 1; r--) {
    let row = '';
    let empty = 0;
    for (let f = 0; f < 8; f++) {
      const piece = pos[FILES[f] + r];
      if (!piece) {
        empty++;
      } else {
        if (empty) { row += empty; empty = 0; }
        const letter = piece[1];
        row += piece[0] === 'w' ? letter.toUpperCase() : letter.toLowerCase();
      }
    }
    if (empty) row += empty;
    ranks.push(row);
  }
  return `${ranks.join('/')} ${turn} - - 0 1`;
}

// Compact eval: +0.4 / −1.2 / 0.0
export function fmtCp(cp: number): string {
  const v = Math.abs(cp / 100).toFixed(1);
  if (cp > 0) return '+' + v;
  if (cp < 0) return '−' + v;
  return '0.0';
}

// White's win-share 0..100 from centipawns (logistic), for the eval bar.
export function whiteShare(cp: number, scoreMate?: number): number {
  if (scoreMate !== undefined && scoreMate !== null) return scoreMate > 0 ? 100 : 0;
  return (1 / (1 + Math.exp(-cp / 350))) * 100;
}
