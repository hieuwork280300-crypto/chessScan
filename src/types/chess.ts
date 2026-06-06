// Core chess + app types.

export type Color = 'w' | 'b';
export type Square = string; // e.g. 'e4'
export type Piece = string;  // e.g. 'wK', 'bN' (color + uppercase letter)
export type Position = Record<Square, Piece>;

export type Result = '1-0' | '½-½' | '0-1' | '*';
export type ScanType = 'P' | 'S'; // P = position scan, S = score-sheet scan
export type ReviewMode = 'position' | 'sheet';
export type Lang = 'en' | 'vi';
export type DefaultColor = 'white' | 'black';

export interface Ply {
  from: Square;
  to: Square;
  san: string;
  name?: string;
  color?: Color;
  evalCp?: number;
  rook?: [Square, Square];      // castling: [rookFrom, rookTo]
  quality?: 'best' | 'inaccuracy' | 'mistake';
  inaccuracy?: boolean;
  better?: { from: Square; to: Square; san: string; name: string; why: string };
}

export interface MultiPVLine {
  evalCp: number;
  scoreMate?: number;
  badge?: 'best' | 'yourgame';
  plies: Ply[];
}

export interface UserProfile {
  displayName: string;
  defaultColor: DefaultColor;
}

export interface SavedGame {
  id: string;
  type: ScanType;
  title: string;
  event?: string;
  site?: string;
  date?: string;          // PGN format YYYY.MM.DD
  round?: string;
  white?: string;
  black?: string;
  result?: Result;
  startFen?: string;
  plies?: Ply[];
  dateSaved?: number;
  dateSavedLabel?: string;
  datePlayed?: string;
  scope?: 'review' | 'analysis';
  savedAt?: number;
}
