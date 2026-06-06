---
name: chess-scan-build
description: Build guide and source of truth for the Chess Scan mobile app (React Native + Expo + EAS). Load when scaffolding screens, writing recognition/engine/validation/PGN logic, building the chessboard or game-review UI, following the week-by-week roadmap, or making any architecture/scope decision for this app. Covers stack, folder layout, data models, integrations (Gemini, Stockfish, react-native-chessboard), and the v1/v2 scope boundary.
---

# Chess Scan — Build Skill

Source of truth for building **Chess Scan**: a React Native + Expo mobile app that scans
chess positions (photo/screenshot) and paper score sheets, then returns engine analysis
with interactive multi-PV review.

The complete specification lives in [references/project-spec.md](references/project-spec.md).
**Read that file before any non-trivial task** — it has the exact folder structure, data
models, screen designs, integration code, and the 10-week day-by-day plan. This SKILL.md is
the always-loaded summary; the spec is the detail.

## Golden rules (do not violate)

1. **v1 scope is frozen.** NO auth, NO subscription, NO move explanations, NO social/sharing
   community features in v1. Persistence is AsyncStorage only. Anything else → v2 (see spec
   Part 1.3 deferral list). When tempted to add, push back and cite this rule — scope creep
   is the #1 project risk.
2. **One image pipeline.** All recognition goes through Gemini Flash (`gemini-2.5-flash`) in
   `lib/recognition.ts`. Do NOT reintroduce tensorflow_chessbot or chesscog — both were
   dropped.
3. **Unified Game Review.** `app/game/[id].tsx` serves BOTH position scans and score sheets.
   Position scan: 3 engine lines, line 0 = BEST. Score sheet: line 0 = REAL GAME (YOUR GAME
   badge), lines 1-2 = engine alternatives.
4. **Game Review cleanup list** — never add: opening-detection text, "roughly equal" labels,
   engine warning cards, plain-English explanations in multi-PV, eval sparkline, W/D/B %
   labels.
5. **TypeScript strict mode**, file-based routing via expo-router, React Context + hooks
   (no Redux/Zustand).
6. **Save dialog**: Title is the only required field; White + Black sit side-by-side with
   EQUAL flex width; result defaults to `*`.

## Stack at a glance

- React Native 0.73+, Expo SDK 50+ (managed → dev build), expo-router, TypeScript strict
- Recognition: Gemini Flash API (`@google/generative-ai`)
- Engine: `react-native-stockfish` (Option A) → fallback Lichess Cloud Eval API (Option B)
- Board: `react-native-chessboard`; rules/FEN: `chess.js`
- Storage v1: `@react-native-async-storage/async-storage`
- Build: EAS Build / Submit / Update
- Palette: sage `#5C7A6B`, cream `#FAF7F2` / `#F5EFE0`

## Where things go (see spec Part 3.1 for the full tree)

| Concern | Location |
|---|---|
| Screens / routes | `app/` (expo-router) |
| Reusable components | `components/` + `components/ui/` |
| Core logic | `lib/` (recognition, engine, validation, pgn, storage, i18n) |
| Hooks | `hooks/` |
| Types | `types/` (chess, recognition, api) |
| Constants | `constants/` (colors, fonts, chess) |

## Known risks — check before you hit them

- **Stockfish native module** (Week 2 Day 9): test early. If unreliable, switch to Lichess
  Cloud Eval. Document the decision.
- **react-native-chessboard** limits vs web: test drag-drop + arrows Week 3 Day 11. Fallback:
  custom SVG board or WebView chessboard.js.
- **Gemini accuracy** on real photos: test ~20 images; show confidence and allow manual fix.

## Working cadence

Follow the day-by-day plan in spec Part 7. Each work session = one focused day's task that
references the relevant spec section. Confirm the v1 scope boundary before starting anything
not on the plan.
