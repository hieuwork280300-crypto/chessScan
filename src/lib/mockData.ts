// Mock data ported from the prototype — engine lines, reviewed game, saved library.
// Replaced incrementally as real Gemini recognition + Stockfish are wired in.

import { SCAN_FEN, STD_FEN } from '@/constants/chess';
import { fenToPos, applyMove } from '@/lib/board';
import type { MultiPVLine, Ply, Position, ReviewMode, SavedGame } from '@/types/chess';

// Engine multi-PV for the scanned position (White to move). Line 0 = best.
export const POSITION_LINES: MultiPVLine[] = [
  { evalCp: 40, badge: 'best', plies: [
    { from: 'd3', to: 'd4', san: 'd4' }, { from: 'e5', to: 'd4', san: 'exd4' },
    { from: 'c3', to: 'd4', san: 'cxd4' }, { from: 'c5', to: 'b6', san: 'Bb6' },
    { from: 'b1', to: 'c3', san: 'Nc3' }, { from: 'f8', to: 'e8', san: 'Re8' },
    { from: 'c4', to: 'b3', san: 'Bb3' }, { from: 'c6', to: 'e7', san: 'Ne7' },
  ] },
  { evalCp: 20, plies: [
    { from: 'b1', to: 'd2', san: 'Nbd2' }, { from: 'c8', to: 'e6', san: 'Be6' },
    { from: 'c4', to: 'b3', san: 'Bb3' }, { from: 'f8', to: 'e8', san: 'Re8' },
    { from: 'd1', to: 'e2', san: 'Qe2' }, { from: 'h7', to: 'h6', san: 'h6' },
    { from: 'a2', to: 'a4', san: 'a4' }, { from: 'c6', to: 'e7', san: 'Ne7' },
  ] },
  { evalCp: 10, plies: [
    { from: 'a2', to: 'a4', san: 'a4' }, { from: 'a6', to: 'a5', san: 'a5' },
    { from: 'b1', to: 'd2', san: 'Nbd2' }, { from: 'c8', to: 'e6', san: 'Be6' },
    { from: 'c4', to: 'b3', san: 'Bb3' }, { from: 'f8', to: 'e8', san: 'Re8' },
    { from: 'g1', to: 'h1', san: 'Kh1' }, { from: 'f6', to: 'h5', san: 'Nh5' },
  ] },
];

// Reviewed game: an Italian where White's 2nd move (d3) is a small inaccuracy.
export const GAME_PLIES: Ply[] = [
  { from: 'e2', to: 'e4', san: 'e4', name: 'Pawn to e4', color: 'w', evalCp: 30 },
  { from: 'e7', to: 'e5', san: 'e5', name: 'Pawn to e5', color: 'b', evalCp: 20 },
  {
    from: 'd2', to: 'd3', san: 'd3', name: 'Pawn to d3', color: 'w', evalCp: -10,
    inaccuracy: true, quality: 'mistake',
    better: { from: 'g1', to: 'f3', san: 'Nf3', name: 'Knight to f3', why: 'develops a piece and attacks the e5 pawn.' },
  },
  { from: 'g8', to: 'f6', san: 'Nf6', name: 'Knight to f6', color: 'b', evalCp: -20 },
  { from: 'g1', to: 'f3', san: 'Nf3', name: 'Knight to f3', color: 'w', evalCp: 0, quality: 'best' },
  { from: 'b8', to: 'c6', san: 'Nc6', name: 'Knight to c6', color: 'b', evalCp: 0 },
  { from: 'f1', to: 'e2', san: 'Be2', name: 'Bishop to e2', color: 'w', evalCp: -10 },
  { from: 'f8', to: 'c5', san: 'Bc5', name: 'Bishop to c5', color: 'b', evalCp: -20, quality: 'inaccuracy' },
  { from: 'e1', to: 'g1', san: 'O-O', name: 'Castles kingside', color: 'w', evalCp: 0, rook: ['h1', 'f1'] },
  { from: 'e8', to: 'g8', san: 'O-O', name: 'Castles kingside', color: 'b', evalCp: 0, rook: ['h8', 'f8'] },
];

export function buildGamePositions(): Position[] {
  const out: Position[] = [fenToPos(STD_FEN)];
  let cur = out[0];
  for (const m of GAME_PLIES) {
    cur = applyMove(cur, m);
    out.push(cur);
  }
  return out;
}
export const GAME_POSITIONS = buildGamePositions();

// Engine alternative lines for the score-sheet review.
export const SHEET_ALT_LINES: MultiPVLine[] = [
  { evalCp: 35, plies: [
    { from: 'd2', to: 'd4', san: 'd4' }, { from: 'd7', to: 'd5', san: 'd5' },
    { from: 'c2', to: 'c4', san: 'c4' }, { from: 'e7', to: 'e6', san: 'e6' },
    { from: 'b1', to: 'c3', san: 'Nc3' }, { from: 'g8', to: 'f6', san: 'Nf6' },
    { from: 'c1', to: 'g5', san: 'Bg5' }, { from: 'f8', to: 'e7', san: 'Be7' },
  ] },
  { evalCp: 20, plies: [
    { from: 'c2', to: 'c4', san: 'c4' }, { from: 'e7', to: 'e5', san: 'e5' },
    { from: 'b1', to: 'c3', san: 'Nc3' }, { from: 'g8', to: 'f6', san: 'Nf6' },
    { from: 'g1', to: 'f3', san: 'Nf3' }, { from: 'b8', to: 'c6', san: 'Nc6' },
    { from: 'g2', to: 'g3', san: 'g3' }, { from: 'f8', to: 'b4', san: 'Bb4' },
  ] },
];

// Build the 3 multi-PV lines for a mode. Position: all engine. Sheet: line 0 = real game.
export function buildLines(mode: ReviewMode): MultiPVLine[] {
  if (mode === 'sheet') {
    return [{ evalCp: 0, badge: 'yourgame', plies: GAME_PLIES }, SHEET_ALT_LINES[0], SHEET_ALT_LINES[1]];
  }
  return POSITION_LINES;
}

export function startPosFor(mode: ReviewMode): Position {
  return mode === 'sheet' ? fenToPos(STD_FEN) : fenToPos(SCAN_FEN);
}

// Saved games library (mock).
export const SAVED_GAMES: SavedGame[] = [
  { id: 'g1', type: 'S', title: 'Tuesday Rapid vs M. Reyes', event: 'Club Ladder', white: 'You', black: 'M. Reyes',
    result: '1-0', dateSaved: 5, dateSavedLabel: 'Jun 2', datePlayed: 'Mar 14', scope: 'review' },
  { id: 'g2', type: 'P', title: 'Italian, Giuoco Piano', event: 'Position scan', white: '—', black: '—',
    result: '*', dateSaved: 4, dateSavedLabel: 'Jun 1', datePlayed: '—', scope: 'analysis' },
  { id: 'g3', type: 'S', title: 'Saturday Open, round 3', event: 'Saturday Open', white: 'A. Novak', black: 'You',
    result: '½-½', dateSaved: 3, dateSavedLabel: 'May 28', datePlayed: 'Feb 28', scope: 'review' },
  { id: 'g4', type: 'P', title: 'Endgame study', event: 'Position scan', white: '—', black: '—',
    result: '*', dateSaved: 2, dateSavedLabel: 'May 20', datePlayed: '—', scope: 'analysis' },
];

export function savedBoard(g: SavedGame): { pos: Position; arrow?: [string, string] } {
  if (g.id === 'g1') return { pos: GAME_POSITIONS[10] };
  if (g.id === 'g2') return { pos: fenToPos(SCAN_FEN), arrow: ['d3', 'd4'] };
  if (g.id === 'g3') return { pos: GAME_POSITIONS[6] };
  return { pos: fenToPos('r1bqk2r/pppp1ppp/2n2n2/2b1p3/4P3/3P1N2/PPP2PPP/RNBQ1RK1') };
}
