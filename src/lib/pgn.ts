// PGN — Seven Tag Roster generation (ported from the prototype).

import { STD_FEN } from '@/constants/chess';
import type { Ply, SavedGame } from '@/types/chess';

export function formatPGNDate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd}`;
}

export const isoFromPGNDate = (s: string) => (s || '').replace(/\./g, '-');
export const pgnDateFromISO = (s: string) => (s || '').replace(/-/g, '.');

function escapeTag(v: unknown): string {
  return String(v == null ? '' : v).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

// Normalize UI result (½-½) to PGN disk format (1/2-1/2).
function pgnResult(r?: string): string {
  if (r === '½-½') return '1/2-1/2';
  return r || '*';
}

export function formatMoveList(plies: Ply[], result: string): string {
  let out = '';
  for (let i = 0; i < plies.length; i++) {
    out += i % 2 === 0 ? `${i / 2 + 1}. ${plies[i].san} ` : `${plies[i].san} `;
  }
  return (out + result).trim();
}

export function buildPGN(game: SavedGame): string {
  const result = pgnResult(game.result);
  const tags = [
    `[Event "${escapeTag(game.event || '?')}"]`,
    `[Site "${escapeTag(game.site || '?')}"]`,
    `[Date "${game.date || formatPGNDate(new Date())}"]`,
    `[Round "${escapeTag(game.round || '-')}"]`,
    `[White "${escapeTag(game.white || '?')}"]`,
    `[Black "${escapeTag(game.black || '?')}"]`,
    `[Result "${result}"]`,
  ];
  if (game.startFen && game.startFen !== STD_FEN) {
    tags.push(`[FEN "${game.startFen}"]`);
    tags.push(`[SetUp "1"]`);
  }
  tags.push(`[Generator "Chess Scan App v1.0"]`);
  const body = formatMoveList(game.plies || [], result);
  return tags.join('\n') + '\n\n' + body + '\n';
}
