# CLAUDE.md — Chess Scan App

> Rule book loaded every prompt. Keep it tight; deep detail lives in `.claude/skills/`.

## What this is

**Chess Scan** — a React Native + Expo mobile app. Two flows:
1. **Position scan** (photo/screenshot) → Gemini reads the board → Stockfish gives best move + variations.
2. **Score sheet scan** (paper, handwritten/printed) → Gemini OCR → validated game → engine review.

Target user: club amateur (USCF 800–1800). US first. v1 = no backend, no auth, AsyncStorage only.

Full spec: `.claude/skills/chess-scan-build/references/project-spec.md`.
**Visual + interaction ground truth:** `design/ChessScan.html` (interactive prototype) and
`design/ui-prototype-src/*.jsx` (decoded React source). Port screens from there. Styling = NativeWind.

## Skills — load the right one

| Working on… | Read skill |
|---|---|
| Roadmap, scope, architecture decisions | `chess-scan-build` |
| Screens, navigation, Expo modules, permissions | `react-native-expo` |
| FEN/PGN/SAN, chess.js, move/validation logic | `chess-domain` |
| Gemini recognition (`lib/recognition.ts`) | `gemini-recognition` |
| Stockfish / UCI / eval (`lib/engine.ts`) | `stockfish-engine` |
| Colors, spacing, components, visual polish | `design-system` |
| Tricky types, generics, strict-mode errors | `typescript-strict` |
| EAS builds, native modules, store submit | `eas-build` |

Skills are loaded on demand — when a task touches a domain, open its SKILL.md first.

## Non-negotiable rules

1. **v1 scope.** NO auth, NO move explanations, NO social/community. Persistence = AsyncStorage only.
   **Subscription IS in v1** (owner decision 2026-06): onboarding paywall funnel, free-trial→auto-renew.
   Payments are abstracted in `lib/purchases.ts`: **real RevenueCat** on a dev/prod build when
   `EXPO_PUBLIC_RC_*` keys are set, **stub** in Expo Go (IAP can't run there). Owner must finish the
   store/RevenueCat setup — see `.claude/skills/chess-scan-build/references/revenuecat-setup.md`.
   Everything else → v2. Scope creep is still the #1 risk.
2. **One recognition pipeline:** Gemini Flash (`gemini-2.5-flash`) only. Never reintroduce
   tensorflow_chessbot or chesscog (both dropped).
3. **Unified Game Review** (`app/game/[id].tsx`) serves position scans AND score sheets.
4. **TypeScript strict mode**, always. No `any` without a written reason. No `// @ts-ignore` without a comment.
5. **Routing:** expo-router file-based only. **State:** React Context + hooks (no Redux/Zustand).
6. **No secrets in code.** Keys via `process.env.EXPO_PUBLIC_*` from `.env` (gitignored).

## Conventions

- **Files:** components `PascalCase.tsx`, lib/hooks/utils `camelCase.ts`, routes follow expo-router naming.
- **Components:** function components + hooks only. One component per file. Props typed via `interface Props`.
- **Imports:** absolute via `@/` alias (configure in `tsconfig.json` + babel). No deep `../../../`.
- **Styles:** NativeWind (`className`) using tokens from `tailwind.config.js`; never hardcode hex in screens. The UI is ported from the prototype in `design/` — match it.
- **Async:** always `try/catch` around Gemini/engine/network calls; surface a user-facing error + retry.
- **chess.js is the single source of truth** for legality, FEN, SAN. Never hand-roll move logic.

## Definition of done (every task)

- [ ] `npx tsc --noEmit` passes (strict, zero errors)
- [ ] No hardcoded colors/strings (use `constants/` + i18n)
- [ ] Loading + error + empty states handled for any async UI
- [ ] Tested on Expo Go (or dev build if native module involved)
- [ ] Matches the screen design in the spec (Part 5)

## Quick facts

- Palette: sage `#5C7A6B`, cream `#FAF7F2` / `#F5EFE0`. Light + dark mode both required.
- Languages: EN + VN (all UI strings in `lib/i18n.ts`).
- Engine default: MultiPV=3, depth=18.
- Timeline: 9–10 weeks to launch. Follow the day-by-day plan; don't jump ahead.

## Working agreement

- Confirm the v1 scope boundary before building anything not on the day-by-day plan.
- Prefer Expo SDK modules over bare native; only reach for native (dev build) when unavoidable (Stockfish).
- When a library underdelivers (chessboard, stockfish), check the skill's fallback section before improvising.
