// Recognition — image → FEN (position) or SAN moves (score sheet) via Gemini Flash.
// Real Gemini call when EXPO_PUBLIC_GEMINI_API_KEY is set (works in Expo Go — it's a network
// call). Falls back to the prototype mock otherwise so the flow runs without a key.

import * as ImageManipulator from 'expo-image-manipulator';
import { SCAN_FEN } from '@/constants/chess';
import { GAME_PLIES } from '@/lib/mockData';
import type { Ply } from '@/types/chess';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const MODEL = 'gemini-2.5-flash';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

export interface RecognizedPosition {
  fen: string;          // placement + turn (e.g. "…/… w - - 0 1")
  confidence: number;
  mock: boolean;
  notes?: string;
}
export interface SheetMove { moveNumber: number; white?: string; black?: string }
export interface RecognizedSheet {
  moves: SheetMove[];
  result?: string;
  uncertain: number[];  // move numbers flagged by OCR
  confidence: number;
  mock: boolean;
}

const POSITION_PROMPT = `You are a chess position recognition expert. Look at this image of a chess board (photo, screenshot, or paper diagram).
Return ONLY JSON: { "fen": string, "confidence": number, "notes": string }
- "fen": full FEN. Read all 64 squares carefully. Uppercase = white, lowercase = black.
- Default the side to move to white unless clearly black. Default castling to "-" and en passant to "-".
- "confidence": 0.0-1.0 based on image quality.
- If you cannot find a board, return fen "8/8/8/8/8/8/8/8 w - - 0 1" and confidence 0.`;

const SHEET_PROMPT = `You are a chess score-sheet OCR expert. Extract every move from this handwritten or printed score sheet.
Return ONLY JSON: { "moves": [{ "moveNumber": number, "white": string, "black": string }], "result": "1-0"|"0-1"|"1/2-1/2"|"*", "confidence": number, "uncertainMoves": number[] }
- Transcribe SAN exactly as written (e.g. "Nf3", "exd5", "O-O", "Qxe7+"). Do NOT correct moves to be legal — that is validated later.
- Omit "black" for a move number that has only a white move.
- "uncertainMoves": move numbers where the handwriting is ambiguous.`;

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

async function toBase64(uri: string): Promise<string> {
  const out = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1024 } }],
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true },
  );
  return out.base64 ?? '';
}

async function callGemini(prompt: string, base64: string): Promise<unknown> {
  const res = await fetch(`${ENDPOINT}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: 'image/jpeg', data: base64 } }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0 },
    }),
  });
  if (!res.ok) throw new Error(`Gemini ${res.status}`);
  const data = await res.json();
  const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini: empty response');
  return JSON.parse(text);
}

export async function recognizePosition(imageUri?: string): Promise<RecognizedPosition> {
  if (!API_KEY || !imageUri) {
    await delay(1000);
    return { fen: `${SCAN_FEN} w - - 0 1`, confidence: 0.6, mock: true };
  }
  const base64 = await toBase64(imageUri);
  const x = (await callGemini(POSITION_PROMPT, base64)) as { fen?: string; confidence?: number; notes?: string };
  if (!x || typeof x.fen !== 'string') throw new Error('Gemini: bad position shape');
  return { fen: x.fen, confidence: typeof x.confidence === 'number' ? x.confidence : 0.7, notes: x.notes, mock: false };
}

export async function recognizeScoreSheet(imageUri?: string): Promise<RecognizedSheet> {
  if (!API_KEY || !imageUri) {
    await delay(1200);
    const moves: SheetMove[] = [];
    for (let i = 0; i < GAME_PLIES.length; i += 2) {
      moves.push({ moveNumber: i / 2 + 1, white: GAME_PLIES[i]?.san, black: GAME_PLIES[i + 1]?.san });
    }
    return { moves, result: '*', uncertain: [3, 7], confidence: 0.6, mock: true };
  }
  const base64 = await toBase64(imageUri);
  const x = (await callGemini(SHEET_PROMPT, base64)) as {
    moves?: SheetMove[]; result?: string; uncertainMoves?: number[]; confidence?: number;
  };
  if (!x || !Array.isArray(x.moves)) throw new Error('Gemini: bad sheet shape');
  return {
    moves: x.moves,
    result: x.result,
    uncertain: Array.isArray(x.uncertainMoves) ? x.uncertainMoves : [],
    confidence: typeof x.confidence === 'number' ? x.confidence : 0.7,
    mock: false,
  };
}

export type { Ply };
