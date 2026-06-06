---
name: chess-domain
description: Chess domain logic for the Chess Scan app — FEN, PGN, SAN/UCI notation, chess.js usage, board orientation, and cascade-aware score-sheet validation. Load when writing or reviewing lib/validation.ts, lib/pgn.ts, move handling, FEN editing (turn/castling), or anything that must be chess-legal.
---

# Chess Domain (FEN / PGN / chess.js)

**chess.js is the single source of truth** for legality, FEN parsing, SAN generation. Never hand-roll move rules.

## FEN — the 6 fields

`rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1`

1. **Piece placement** — rank 8→1, files a→h. Uppercase = white, lowercase = black, digits = empty squares.
2. **Active color** — `w` or `b`.
3. **Castling** — subset of `KQkq` (white/black king/queen side), or `-`.
4. **En passant** target square or `-`.
5. **Halfmove clock** (50-move rule).
6. **Fullmove number**.

- `STARTING_FEN` lives in `constants/chess.ts`.
- A position scan only needs fields 1–4 reliably; default field 5/6 to `0 1`.
- After Gemini returns a FEN, **validate before use**: `const chess = new Chess(); chess.load(fen)` throws on invalid → catch and surface to the Confirm screen for manual fix.

## Board orientation

- FEN is always written from White's perspective (rank 8 top). The UI may *display* flipped for a black-to-move review, but the stored FEN never changes.
- react-native-chessboard takes a `fen` prop; flipping is a display concern only.

## chess.js essentials (v1.x API)

```ts
import { Chess } from 'chess.js';

const chess = new Chess(fen);          // or new Chess() for start
chess.fen();                           // current FEN
chess.turn();                          // 'w' | 'b'
chess.moves({ verbose: true });        // legal moves with from/to/san
const m = chess.move('Nf3');           // SAN or { from, to, promotion }
                                       // returns the move, or THROWS if illegal (v1)
chess.isCheckmate(); chess.isDraw(); chess.isGameOver();
chess.history({ verbose: true });      // all moves played
chess.undo();
```

- **v1.x throws on illegal moves** (older 0.x returned `null`). Wrap `move()` in try/catch.
- `move()` accepts SAN (`"Nf3"`, `"exd5"`, `"O-O"`, `"e8=Q"`) or coordinate `{ from:'e7', to:'e8', promotion:'q' }`.
- Promotion is required when a pawn reaches the last rank, else it throws.

## SAN vs UCI

- **SAN** (Standard Algebraic, what chess.js & PGN use): `Nf3`, `exd5`, `O-O-O`, `Qxe7+`, `e8=Q#`.
- **UCI** (what Stockfish speaks): pure coordinates `g1f3`, `e7e8q`. No piece letter, no capture/check marks.
- Convert UCI→SAN by replaying on a `Chess` instance:
  ```ts
  const mv = chess.move({ from: uci.slice(0,2), to: uci.slice(2,4), promotion: uci[4] });
  const san = mv.san;
  ```
- Engine continuations come as UCI — convert to SAN for the move strip / multi-PV display.

## Score-sheet validation (cascade-aware) — `lib/validation.ts`

Gemini returns moves per move-number with `uncertainMoves`. Validate by **replaying from the start**:

```ts
function validateGame(moves: { white?: string; black?: string }[], uncertain: number[]) {
  const chess = new Chess();
  const flags: MoveFlag[] = [];      // 'ok' | 'uncertain' | 'invalid'
  for (let i = 0; i < moves.length; i++) {
    for (const san of [moves[i].white, moves[i].black]) {
      if (!san) continue;
      try {
        chess.move(san);
        flags.push(uncertain.includes(i + 1) ? 'uncertain' : 'ok');
      } catch {
        flags.push('invalid');
        // CASCADE: a wrong move N makes every later move look illegal.
        // Stop hard-failing; record top-3 legal alternatives at THIS position and break.
        const alts = chess.moves().slice(0, 3); // optionally rank by similarity to the OCR token
        return { flags, firstError: { ply: i, alternatives: alts } };
      }
    }
  }
  return { flags, firstError: null };
}
```

Rules:
- **Amber** = `uncertain` (OCR low confidence but legal). **Red** = `invalid` (doesn't replay).
- One bad move cascades — only the FIRST red is real; don't mark everything after it red. Fix it, re-validate from scratch.
- Suggest top-3 legal alternatives at the failing position; rank by string similarity to the OCR token (e.g. `Nf3` vs `Nf6`) when possible.
- Enable "Analyze" only when zero reds remain (ambers allowed — user reviewed them).

## PGN — `lib/pgn.ts`

Seven Tag Roster (order matters): `Event, Site, Date, Round, White, Black, Result`.

```
[Event "Tuesday rapid"]
[Site "Local chess club"]
[Date "2026.06.05"]
[Round "1"]
[White "Mark"]
[Black "Opponent"]
[Result "1-0"]
[FEN "..."]        ← include ONLY for non-starting positions (position scans / setups)
[SetUp "1"]        ← required alongside FEN

1. e4 e5 2. Nf3 Nc6 ... 1-0
```

- Date format is `YYYY.MM.DD` (dots, not dashes). Unknown parts → `????.??.??`.
- Result `½-½` in UI, but PGN uses `1/2-1/2` on the disk format — normalize on export.
- chess.js can emit PGN: `chess.pgn()` after setting headers via `chess.header('White','Mark', ...)`. For non-start positions, `chess.load(fen)` first; chess.js adds the FEN/SetUp tags.
- Parse incoming PGN with `chess.loadPgn(pgnString)` (throws on malformed → catch).
- Export file `.pgn`, share via `expo-sharing`.

## Gotchas

- Castling rights in the FEN editor must be cleared if the king/rook isn't home — invalid castling rights make chess.js reject the FEN.
- En passant target only legal the move after a 2-square pawn push; set `-` otherwise.
- Always round-trip: after editing a FEN, `new Chess(fen).fen()` should normalize cleanly — if it throws, the edit is illegal.
