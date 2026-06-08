// Lightweight in-memory store for the current scan, passed across the capture → confirm →
// review screens (navigation is immediate, so a module store is enough; no persistence).

import type { Ply, ReviewMode } from '@/types/chess';
import type { MoveCell } from '@/lib/validation';

export interface ScanState {
  mode: ReviewMode;
  imageUri?: string;
  // position scan
  fen?: string;          // full FEN (placement + turn …)
  confidence?: number;
  mock?: boolean;
  // score-sheet scan
  plies?: Ply[];         // validated game moves
  cells?: MoveCell[];    // per-move flags for the confirm grid
  firstError?: number | null;
  result?: string;
}

let current: ScanState | null = null;

export function setScan(s: ScanState): void {
  current = s;
}
export function patchScan(p: Partial<ScanState>): void {
  current = { ...(current ?? { mode: 'position' }), ...p };
}
export function getScan(): ScanState | null {
  return current;
}
export function clearScan(): void {
  current = null;
}
