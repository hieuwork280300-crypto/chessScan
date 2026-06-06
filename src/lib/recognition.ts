// Recognition — image → FEN (position) or moves (score sheet).
// v1 in Expo Go has no Gemini key wired, so this simulates the call and returns the
// mock from the prototype. Drop in the Gemini Flash call here (see gemini-recognition skill)
// when EXPO_PUBLIC_GEMINI_API_KEY is set + a backend proxy exists.

import { SCAN_FEN } from '@/constants/chess';
import { GAME_PLIES } from '@/lib/mockData';
import type { Ply } from '@/types/chess';

const HAS_KEY = !!process.env.EXPO_PUBLIC_GEMINI_API_KEY;

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export interface RecognizedPosition {
  fen: string;
  confidence: number;
  mock: boolean;
}
export interface RecognizedSheet {
  plies: Ply[];
  uncertain: number[]; // ply indices flagged by OCR
  confidence: number;
  mock: boolean;
}

export async function recognizePosition(_imageUri?: string): Promise<RecognizedPosition> {
  // TODO(gemini): when HAS_KEY, call gemini-2.5-flash with the POSITION_PROMPT.
  await delay(1200);
  return { fen: SCAN_FEN, confidence: HAS_KEY ? 0.9 : 0.6, mock: !HAS_KEY };
}

export async function recognizeScoreSheet(_imageUri?: string): Promise<RecognizedSheet> {
  // TODO(gemini): when HAS_KEY, call gemini-2.5-flash with the SHEET_PROMPT.
  await delay(1400);
  return { plies: GAME_PLIES, uncertain: [2, 6], confidence: HAS_KEY ? 0.85 : 0.6, mock: !HAS_KEY };
}
