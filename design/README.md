# Design reference — Chess Scan UI prototype

`ChessScan.html` is the original interactive prototype (React web + Tailwind, self-unpacking
bundle). It is the **ground-truth visual + interaction spec** for the app. Open it in a browser
to see the real screens, animations, and flows.

`ui-prototype-src/` holds the React source decoded out of that bundle (via `extract.mjs`), split
by concern. Read these when translating a screen to React Native — they define exact tokens,
layout, copy, and behavior.

| File | What it defines |
|---|---|
| `00_scaffold.jsx` | Scaffold / usage notes |
| `01_icons.jsx` | Lucide-style line icon set (`<Icon name=… />`) |
| `02_chessboard.jsx` | Board rendering, FEN→position, arrows (mocked engine) |
| `03_state.jsx` | i18n (EN/VI), profile (localStorage), PGN seven-tag-roster |
| `04_screens-onboarding-home.jsx` | Design tokens `T`, primitives, Onboarding 1/2, Home |
| `05_screens-camera-confirmpos.jsx` | Camera (board + sheet) + Confirm position |
| `06_screens-review.jsx` | Unified Game Review (position + sheet), interactive multi-PV |
| `07_screens-scoresheet.jsx` | Confirm score sheet (error-checking surface) |
| `08_screens-settings-savedialog.jsx` | Settings + Save Game dialog + small modals |
| `09_screens-saved.jsx` | Saved Games library (sort/filter/swipe/empty) |
| `10_app-shell.jsx` | Shell: navigation, dark mode, toast, device frame |

## Design tokens (canonical — mirror these into NativeWind `tailwind.config`)

| Token | Light | Dark |
|---|---|---|
| bg | `#FAF7F2` | `#16181B` |
| ink (text) | `#1A1A1A` | `#ECECEC` |
| sub (muted) | `#6B6B6B` | `#9C9C9C` |
| card | `#FFFFFF` | `#1E2024` |
| border | `#ECE6DC` | `#2A2D31` |
| sage (brand) | `#5C7A6B` | — |
| amber (accent) | `#D4A24A` | — |

Board squares: light `#E8DDC8`, dark `#A88B6C`. Fonts: **Inter** (sans), **Caveat** (handwriting,
used for score-sheet move glyphs). Safe areas: top `54`, bottom `30`. Device frame: 390×844.

## Screens / navigation (from app shell)

`onb1 → onb2 → home → { camera(board|sheet) → confirmPos | confirmSheet } → gameReview(position|sheet)`,
plus `settings` and `saved`. Note the prototype uses **2** onboarding screens (not 3).

Do not edit these files — they are a frozen reference. Build the RN app in the project root.
