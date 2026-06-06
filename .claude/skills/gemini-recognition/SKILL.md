---
name: gemini-recognition
description: Gemini Flash vision integration for the Chess Scan app — recognizing board positions (→FEN) and score sheets (→moves) in lib/recognition.ts. Load when writing/tuning recognition prompts, parsing the JSON response, handling confidence/uncertainty, retries, errors, or improving accuracy on real-world photos.
---

# Gemini Recognition (`lib/recognition.ts`)

Single multimodal pipeline. Model: `gemini-2.5-flash` via `@google/generative-ai`. ~$0.0001/scan, 2–5s latency.

## Setup

```ts
import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: { responseMimeType: 'application/json', temperature: 0 },
});
```

- `responseMimeType: 'application/json'` forces valid JSON — no markdown fences to strip.
- `temperature: 0` for deterministic recognition (we want the same image → same FEN).
- Key is `EXPO_PUBLIC_` (inlined at build). Acceptable for v1; in v2 proxy through a backend so the key isn't shipped in the bundle.

## Two functions, two prompts

### Position → FEN
Prompt demands a strict JSON shape and sensible defaults:
```
Return JSON: { "fen": "...", "confidence": 0.0-1.0, "notes": "..." }
- Standard FEN, all 64 squares accounted for.
- Default active color to white if uncertain.
- Default castling to KQkq only if pieces are home; else "-".
- confidence reflects image quality / occlusion.
```
Add to the prompt for robustness:
- "If the image is a screenshot from chess.com/lichess, read piece glyphs precisely."
- "If you cannot identify the board, return confidence 0 and fen for the empty board `8/8/8/8/8/8/8/8 w - - 0 1`."

### Score sheet → moves
```
Return JSON:
{ "moves": [ { "moveNumber": 1, "white": "e4", "black": "e5" }, ... ],
  "result": "1-0" | "0-1" | "1/2-1/2" | "*",
  "confidence": 0.0-1.0,
  "uncertainMoves": [3, 7] }
- Transcribe SAN exactly as written; do not "correct" to legal moves — that's our validator's job.
- Flag a move number in uncertainMoves when handwriting is ambiguous.
- A missing black move (game ended on white's move) → omit black for that number.
```
**Key principle:** Gemini transcribes, it does NOT validate. Legality is checked downstream by `lib/validation.ts` (see `chess-domain` skill). If Gemini "fixes" moves, the cascade validator can't catch real OCR errors.

## Calling

```ts
export async function recognizePosition(imageBase64: string): Promise<RecognizedPosition> {
  const res = await model.generateContent([
    POSITION_PROMPT,
    { inlineData: { data: imageBase64, mimeType: 'image/jpeg' } },
  ]);
  return safeParse(res.response.text());   // typed parse + shape guard
}
```
- `imageBase64` = raw base64 (no `data:` prefix). Resize to ≤1024px wide first (see `react-native-expo` skill) — smaller = cheaper + faster, accuracy holds for board photos.
- Type the return; don't trust the model blindly — validate the shape (`fen` is a string, `moves` is an array) before using.

## Retries & errors

```ts
async function withRetry<T>(fn: () => Promise<T>, tries = 2): Promise<T> {
  let last;
  for (let i = 0; i <= tries; i++) {
    try { return await fn(); }
    catch (e) { last = e; if (!isTransient(e)) break; await sleep(500 * (i + 1)); }
  }
  throw last;
}
```
- Retry on 429 (rate limit) / 503 / network timeout. Do NOT retry on 400 (bad request) or auth errors.
- On final failure: surface a friendly message + "Try again" + "Enter manually" escape hatch (drop user into the Confirm screen with the starting position).
- JSON parse failure (rare with `responseMimeType` set) → treat as a transient retry once, then manual fallback.

## Confidence → UX

- Position: if `confidence < 0.6`, show a banner on Confirm Position ("Low confidence — double-check pieces").
- Sheet: `uncertainMoves` → amber flags; `confidence` gates a "re-scan recommended" hint.
- Never auto-accept; the Confirm screen is always shown. User correction is the safety net.

## Accuracy tips (real-world inputs)

- Encourage well-lit, top-down photos in the capture UI (overlay guide frame).
- Screenshots recognize best — pixel-perfect glyphs. Photos of physical boards are hardest (angle, shadows, similar piece shapes).
- If accuracy on physical boards is <80% in testing (Week 2), options: tighten the prompt with piece-shape hints, try `gemini-2.5-pro` for hard cases, or add a perspective-correction crop step. Decide with real test images, not speculation.

## Cost/latency budget

- Resize before send. Cache nothing per-image (positions are unique).
- Show a determinate-feeling loading state ("Recognizing…") — 2–5s feels long without feedback.
