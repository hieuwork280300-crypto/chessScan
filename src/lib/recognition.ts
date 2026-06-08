// Recognition — image → FEN (position) or SAN moves (score sheet) via Gemini Flash.
// Real Gemini call when EXPO_PUBLIC_GEMINI_API_KEY is set (works in Expo Go — it's a network
// call). Falls back to the prototype mock otherwise so the flow runs without a key.

import * as ImageManipulator from 'expo-image-manipulator';
import { SCAN_FEN } from '@/constants/chess';
import { GAME_PLIES } from '@/lib/mockData';
import type { Ply } from '@/types/chess';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
// Flash on the free tier reads the board ~95% accurate with the square-by-square grid prompt
// (Pro returns 429 on free keys). The accuracy win comes from the prompt, not the model.
const MODEL_POSITION = 'gemini-2.5-flash';
const MODEL_SHEET = 'gemini-2.5-flash';
const endpoint = (model: string) => `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

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

const POSITION_PROMPT = `You are a world-class chess vision system. Identify the piece on EVERY one of the 64 squares of the chess board in this image (photo, screenshot, or paper diagram).

Return ONLY JSON in exactly this shape:
{ "board": [["..8 cells for rank 8.."], ["rank 7"], ["rank 6"], ["rank 5"], ["rank 4"], ["rank 3"], ["rank 2"], ["rank 1"]], "sideToMove": "w"|"b", "confidence": 0.0-1.0 }

CRITICAL RULES:
- board has 8 rows. board[0] = rank 8 (top, Black's back rank side), board[7] = rank 1 (White's back rank). Within each row the 8 cells go file a→h (left→right) as seen from White's side at the bottom.
- Each cell is a 2-character code: color ("w" = the light/white pieces, "b" = the dark/black pieces) + piece ("K","Q","R","B","N","P"). An EMPTY square is the empty string "".
- Inspect each square ONE BY ONE. In most real positions the MAJORITY of squares are EMPTY — never invent a piece on an empty square. Pawns sit on a single square; do not duplicate them.
- Distinguish white vs black by piece COLOR (white/cream pieces = "w", black/dark pieces = "b"), not by which side of the board they're on.
- "sideToMove": "w" unless the position clearly indicates Black to move.
- "confidence": 0.0-1.0 by image clarity.`;

const SHEET_PROMPT = `You are a chess score-sheet OCR expert. Extract every move from this handwritten or printed score sheet.
Return ONLY JSON: { "moves": [{ "moveNumber": number, "white": string, "black": string }], "result": "1-0"|"0-1"|"1/2-1/2"|"*", "confidence": number, "uncertainMoves": number[] }
- Transcribe SAN exactly as written (e.g. "Nf3", "exd5", "O-O", "Qxe7+"). Do NOT correct moves to be legal — that is validated later.
- Omit "black" for a move number that has only a white move.
- "uncertainMoves": move numbers where the handwriting is ambiguous.`;

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

async function toBase64(uri: string): Promise<string> {
  // Keep more detail for the board: larger + lighter compression than before.
  const out = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1280 } }],
    { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG, base64: true },
  );
  return out.base64 ?? '';
}

async function callGemini(model: string, prompt: string, base64: string): Promise<unknown> {
  const res = await fetch(`${endpoint(model)}?key=${API_KEY}`, {
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

// Convert an 8x8 grid (board[0]=rank8, file a→h) into a FEN placement field.
function gridToFen(board: string[][], turn: 'w' | 'b'): string {
  const ranks = board.slice(0, 8).map((row) => {
    let s = '';
    let empty = 0;
    for (let f = 0; f < 8; f++) {
      const cell = (row[f] ?? '').trim();
      if (!cell || cell.length < 2) {
        empty++;
      } else {
        if (empty) { s += empty; empty = 0; }
        const color = cell[0].toLowerCase();
        const piece = cell[1].toUpperCase();
        s += color === 'w' ? piece : piece.toLowerCase();
      }
    }
    if (empty) s += empty;
    return s || '8';
  });
  while (ranks.length < 8) ranks.push('8');
  return `${ranks.join('/')} ${turn} - - 0 1`;
}

export async function recognizePosition(imageUri?: string): Promise<RecognizedPosition> {
  if (!API_KEY || !imageUri) {
    await delay(1000);
    return { fen: `${SCAN_FEN} w - - 0 1`, confidence: 0.6, mock: true };
  }
  const base64 = await toBase64(imageUri);
  const x = (await callGemini(MODEL_POSITION, POSITION_PROMPT, base64)) as {
    board?: string[][]; sideToMove?: string; fen?: string; confidence?: number;
  };
  const turn: 'w' | 'b' = x?.sideToMove === 'b' ? 'b' : 'w';
  let fen: string | undefined;
  if (Array.isArray(x?.board) && x.board.length >= 8) fen = gridToFen(x.board, turn);
  else if (typeof x?.fen === 'string') fen = x.fen; // tolerate models that return FEN directly
  if (!fen) throw new Error('Gemini: bad position shape');
  return { fen, confidence: typeof x?.confidence === 'number' ? x.confidence : 0.7, mock: false };
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
  const x = (await callGemini(MODEL_SHEET, SHEET_PROMPT, base64)) as {
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
