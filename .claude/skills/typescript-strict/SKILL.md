---
name: typescript-strict
description: TypeScript strict-mode conventions for the Chess Scan app — tsconfig setup, path aliases, typing API/recognition/engine results, discriminated unions for the position/sheet flows, and avoiding any. Load when configuring tsconfig, defining types in types/, fixing strict-mode errors, or typing untrusted external data (Gemini JSON, engine output, AsyncStorage).
---

# TypeScript Strict Patterns

Strict mode is non-negotiable (CLAUDE.md). Goal: external data (Gemini, engine, storage) is typed AND validated at the boundary; internal code never touches `any`.

## tsconfig.json

```jsonc
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,   // arr[i] is T | undefined — catches OOB on move/pv arrays
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    "baseUrl": ".",
    "paths": { "@/*": ["*"] }           // import from '@/lib/engine'
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"]
}
```
- `@/*` alias also needs `babel-plugin-module-resolver` (or `expo-router`'s built-in) in `babel.config.js`.
- `noUncheckedIndexedAccess` is worth the friction here — engine `pv[0]`, `moves[i]` are genuinely maybe-undefined.
- Gate every task on `npx tsc --noEmit` (Definition of Done).

## Type the domain (`types/`)

Use discriminated unions for the two flows so the compiler enforces flow-specific fields:
```ts
// types/chess.ts
export type ScanType = 'position' | 'sheet';
export type Result = '1-0' | '1/2-1/2' | '0-1' | '*';

export interface MultiPVLine {
  evalCp?: number;          // exactly one of evalCp / scoreMate
  scoreMate?: number;
  bestMove: string;         // UCI
  continuation: string[];   // up to 8 UCI moves
}

interface BaseGame {
  id: string; title: string; startFen: string;
  event?: string; site?: string; date?: string; round?: string;
  white?: string; black?: string; result?: Result;
  analysis?: { finalFen: string; multiPV: MultiPVLine[]; timestamp: number };
  savedAt: number;
}
export type SavedGame =
  | (BaseGame & { scanType: 'position'; moves: [] })
  | (BaseGame & { scanType: 'sheet'; moves: Move[] });
```
Now `if (game.scanType === 'sheet')` narrows `moves` to the real array — no optional-chaining noise.

## Boundary validation (don't trust external JSON)

Gemini/engine/AsyncStorage return `unknown`. Parse → guard → typed:
```ts
function isRecognizedPosition(x: unknown): x is RecognizedPosition {
  return !!x && typeof x === 'object'
    && typeof (x as any).fen === 'string'
    && typeof (x as any).confidence === 'number';
}
export function safeParsePosition(text: string): RecognizedPosition {
  const x: unknown = JSON.parse(text);
  if (!isRecognizedPosition(x)) throw new RecognitionError('bad shape');
  return x;
}
```
- Optionally adopt `zod` for these schemas (one dep, cleaner) — fine for v1 if you keep it to the boundary.
- AsyncStorage getters return `T | null`; callers must handle null (no `!`).

## Avoiding `any`

- Prefer `unknown` + narrowing over `any`. `any` disables all checking and silently spreads.
- For library types missing/wrong (react-native-chessboard, react-native-stockfish), write a local `types/<lib>.d.ts` declaration instead of `as any`:
  ```ts
  // types/react-native-stockfish.d.ts
  declare module 'react-native-stockfish' {
    export default class Stockfish {
      onmessage: (msg: string) => void;
      postMessage(cmd: string): void;
    }
  }
  ```
- If you must cast, cast to the narrowest type and leave a `// reason:` comment. No bare `// @ts-ignore` — use `// @ts-expect-error <reason>` so it fails when the error disappears.

## Hooks & context typing

- Context with no sensible default: `createContext<Ctx | null>(null)` + a `useX()` that throws if null — gives non-null types to consumers.
- Type hook returns explicitly (`function useEngine(): { analyze: ...; busy: boolean }`) so call sites get stable shapes.
- `useLocalSearchParams<{ id: string }>()` for typed route params.

## Common strict errors & fixes

- "Object is possibly undefined" on `arr[i]` → with `noUncheckedIndexedAccess`, guard or use `arr.at(i)` + check.
- "Type 'string | undefined' not assignable to 'string'" from optional PGN tags → provide defaults at the edge (`white ?? ''`) only when writing PGN, keep optional in the model.
- Async state setters after unmount → fine for types but guard at runtime.
- `exactOptionalPropertyTypes`: don't pass `{ evalCp: undefined }`; omit the key instead.
