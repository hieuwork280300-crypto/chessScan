# CHESS SCAN APP — Full Project Specification & Build Plan

> Complete spec for rewriting chess scan app on React Native + Expo + EAS Build.
> Reference document + executable build prompt.

---

# PART 1: PROJECT OVERVIEW

## 1.1 Vision

Mobile app for chess players (intermediate amateurs, 800-1800 ELO) to:
1. **Scan a position** from physical board, online screenshot, or photo → get best move + variations
2. **Scan a paper score sheet** from a club game → get full game analysis with engine evaluation

**Differentiation**: Chess.com/Lichess require manual entry. We capture from real-world inputs (camera, screenshots, paper sheets) → instant analysis.

## 1.2 Target user

- **Primary**: Club-level amateur (USCF 800-1800), plays in tournaments, uses paper score sheets
- **Secondary**: Online casual player wanting to analyze positions from screenshots
- **Geography**: US first (paper score sheet culture strong), then EU

**Persona**: "Mark, 42, club rapid player. Records games on paper. Wants quick analysis without typing 40 moves manually."

## 1.3 Core features (v1 scope)

| Feature | Priority | Effort |
|---|---|---|
| Position scan (photo + screenshot + manual edit) | P0 | 2 weeks |
| Score sheet scan (handwritten/printed) | P0 | 2 weeks |
| Engine analysis (Stockfish + multi-PV) | P0 | 1 week |
| Game review screen (interactive multi-PV) | P0 | 2 weeks |
| Save + PGN export | P0 | 0.5 week |
| Settings + multi-language EN/VN | P1 | 0.5 week |
| User profile (localStorage, no auth v1) | P1 | 0.3 week |
| Onboarding (3 screens) | P1 | 0.5 week |
| **Total v1** | | **~8-9 weeks** |

**Deferred to v2**:
- Login / cloud sync (Supabase Auth)
- Subscription (RevenueCat)
- Move explanations (Gemini-generated tooltips)
- Social sharing / community features

## 1.4 Value proposition

**Tagline**: "Scan any chess position. Get the best move in seconds."

**Engines tell you what. We tell you why** (this is v2 promise with move explanations, not v1).

---

# PART 2: TECH STACK

## 2.1 Final stack

```
FRONTEND
  React Native 0.74+
  Expo SDK 50+ (managed workflow -> dev build)
  expo-router (file-based navigation)
  TypeScript (strict mode)

AI / RECOGNITION
  Gemini Flash API (multi-modal vision)
  - Single API call for all image types
  - Drop tensorflow_chessbot (no offline mode v1)
  - Drop chesscog (was already rolled back)

CHESS ENGINE
  Stockfish (native module via react-native-stockfish)
  Fallback: Lichess Cloud Eval API (if native fails)

CHESS UI
  react-native-chessboard (board component)
  chess.js (move validation, FEN handling)

BACKEND (Phase 2)
  Supabase (Postgres + Auth + Storage)
  - Auth: Email + Google + Apple (v2)
  - Storage: User profile, game history (v2)
  - v1: localStorage only (AsyncStorage)

MONETIZATION (Phase 3)
  RevenueCat (Apple IAP + Google Billing)
  Apple Small Business Program (15% commission)

ANALYTICS
  PostHog (product analytics, free tier 1M events/mo)
  Sentry (crash reporting, free tier 5k errors/mo)

BUILD & DEPLOY
  EAS Build (cloud iOS/Android builds)
  EAS Submit (auto-submit to stores)
  EAS Update (OTA JS updates)

EMAIL
  Resend (transactional, v2)
  Beehiiv (newsletter, v2)

DEV TOOLS
  Claude Code (primary AI dev)
  Cursor (secondary, optional)
  GitHub (version control)
  Expo Go (initial dev testing)
```

## 2.2 Critical dependencies (npm packages)

```json
{
  "dependencies": {
    "expo": "~50.0.0",
    "expo-router": "~3.4.0",
    "react": "18.2.0",
    "react-native": "0.73.4",

    "chess.js": "^1.0.0",
    "react-native-chessboard": "^0.1.x",

    "react-native-stockfish": "^x.x.x",

    "expo-camera": "~14.0.0",
    "expo-image-picker": "~14.7.0",
    "expo-image": "~1.10.0",
    "expo-file-system": "~16.0.0",

    "@react-native-async-storage/async-storage": "1.21.0",
    "expo-secure-store": "~12.8.0",

    "react-native-svg": "13.9.0",
    "@expo/vector-icons": "^14.0.0",

    "@google/generative-ai": "^0.x.x",

    "posthog-react-native": "^x.x.x",
    "@sentry/react-native": "^5.x.x"
  }
}
```

---

# PART 3: ARCHITECTURE

## 3.1 Folder structure

```
chess-scan-app/
├── app/                          # expo-router (file-based)
│   ├── _layout.tsx               # Root layout (theme, providers)
│   ├── (onboarding)/             # Onboarding flow (3 screens)
│   │   ├── _layout.tsx
│   │   ├── intro.tsx
│   │   ├── scan-types.tsx
│   │   └── permissions.tsx
│   ├── (tabs)/                   # Main app (no auth v1)
│   │   ├── _layout.tsx
│   │   └── index.tsx             # Home screen
│   ├── scan/
│   │   ├── capture.tsx           # Camera + gallery picker
│   │   ├── confirm-position.tsx  # FEN edit screen
│   │   └── confirm-sheet.tsx     # Score sheet validation
│   ├── game/
│   │   └── [id].tsx              # Game review (unified screen)
│   ├── saved/
│   │   └── index.tsx             # Saved games list
│   ├── settings/
│   │   └── index.tsx             # Settings screen
│   └── +not-found.tsx
│
├── components/                   # Reusable components
│   ├── ChessBoard.tsx            # Wraps react-native-chessboard
│   ├── EvalBar.tsx               # Vertical evaluation bar
│   ├── MoveStrip.tsx             # Horizontal move list
│   ├── MultiPV.tsx               # 3-line variation display
│   ├── NavButtons.tsx            # Start/Prev/Next/End
│   ├── SaveGameDialog.tsx        # PGN Seven Tag Roster modal
│   └── ui/                       # Generic UI primitives
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── SegmentedControl.tsx
│       └── Modal.tsx
│
├── lib/                          # Core logic
│   ├── recognition.ts            # Gemini API integration
│   ├── engine.ts                 # Stockfish wrapper
│   ├── validation.ts             # Score sheet validation (cascade-aware)
│   ├── pgn.ts                    # PGN parse + export
│   ├── storage.ts                # AsyncStorage wrapper
│   └── i18n.ts                   # Translation strings
│
├── hooks/                        # Custom React hooks
│   ├── useProfile.ts
│   ├── useEngine.ts
│   ├── useGameAnalysis.ts
│   ├── useLanguage.ts
│   └── useDarkMode.ts
│
├── constants/                    # App constants
│   ├── colors.ts                 # Sage/cream palette
│   ├── fonts.ts                  # Typography
│   └── chess.ts                  # STARTING_FEN, etc.
│
├── types/                        # TypeScript types
│   ├── chess.ts                  # Move, GameState, SavedGame
│   ├── recognition.ts
│   └── api.ts
│
├── assets/                       # Images, fonts
│   ├── images/
│   ├── fonts/
│   └── icons/
│
├── app.json                      # Expo config
├── eas.json                      # EAS Build config
├── babel.config.js
├── tsconfig.json
├── package.json
└── .env                          # Gemini API key, etc.
```

## 3.2 State management

**No Redux/Zustand for v1**. Use React Context + hooks. Sufficient cho complexity hiện tại.

```typescript
// Contexts
- ProfileContext     // User name, default color
- LanguageContext    // EN/VN translation
- ThemeContext       // Light/dark mode
- GameContext        // Current game in review (per-screen, not global)
```

## 3.3 Data flow

```
Camera / Gallery
   | Image base64
   v
Gemini API (Flash)   <- lib/recognition.ts
   | FEN or PGN
   v
chess.js validation  <- lib/validation.ts
   | Validated game state
   v
Stockfish analysis   <- lib/engine.ts
   | Multi-PV results
   v
Game Review Screen
```

---

# PART 4: DATA MODEL

## 4.1 Local storage schema (AsyncStorage)

```typescript
// User profile
interface UserProfile {
  displayName: string;
  defaultColor: 'white' | 'black';
}
// Key: 'user-profile'

// Saved game
interface SavedGame {
  id: string;                    // uuid
  title: string;                 // "Club game · Jun 5"
  scanType: 'position' | 'sheet';
  startFen: string;
  moves: Move[];                 // [] for position scans

  // PGN Seven Tag Roster
  event?: string;
  site?: string;
  date?: string;                 // PGN format: 2026.06.05
  round?: string;
  white?: string;
  black?: string;
  result?: '1-0' | '½-½' | '0-1' | '*';

  // Engine analysis cache
  analysis?: {
    finalFen: string;
    multiPV: MultiPVLine[];
    timestamp: number;
  };

  savedAt: number;               // Unix ms
}
// Key: 'saved-games' (array)

interface Move {
  san: string;                   // "Nf3"
  from: Square;                  // e.g. "g1"
  to: Square;                    // e.g. "f3"
  fen: string;                   // FEN after move
  evalCp?: number;               // Centipawn eval after move
}

interface MultiPVLine {
  evalCp: number;
  scoreMate?: number;
  bestMove: string;
  continuation: string[];        // Up to 8 moves
}

// Settings
interface Settings {
  language: 'en' | 'vi';
  darkMode: boolean;
}
// Key: 'app-settings'
```

## 4.2 Supabase schema (Phase 2 — defer)

```sql
-- Users (auto-created by Supabase Auth)
-- Profiles table extending users
create table profiles (
  id uuid references auth.users primary key,
  display_name text,
  default_color text check (default_color in ('white', 'black')),
  created_at timestamptz default now()
);

-- Games
create table games (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text not null,
  scan_type text check (scan_type in ('position', 'sheet')),
  start_fen text not null,
  moves jsonb not null default '[]',

  event text,
  site text,
  date text,
  round text,
  white text,
  black text,
  result text,

  analysis jsonb,

  saved_at timestamptz default now()
);

-- RLS
alter table games enable row level security;
create policy "Users can CRUD own games"
  on games for all
  using (auth.uid() = user_id);
```

---

# PART 5: SCREENS (with designs)

## 5.1 Home screen
**File**: `app/(tabs)/index.tsx`
- Header "Chess Scan" + settings gear
- Tile 1: "Scan a position / Get the best move" -> `scan/capture?type=position`
- Tile 2: "Scan a score sheet / Review your game" -> `scan/capture?type=sheet`
- "Recent games" list (3 items) -> `game/[id]`
- "See all saved games ->" link

## 5.2 Onboarding (3 screens)
**Files**: `app/(onboarding)/intro.tsx`, `scan-types.tsx`, `permissions.tsx`
Show only on first launch. Flag in AsyncStorage `onboarding-completed`.
- Screen 1 Intro: Hero image + tagline
- Screen 2 Scan types: 2 illustrations + explanation
- Screen 3 Permissions: request camera + photo library

## 5.3 Scan Capture
**File**: `app/scan/capture.tsx`
- Live camera preview (expo-camera), board detection overlay
- Capture button + Gallery picker (expo-image-picker)
- Cancel back; Loading "Recognizing..."
- On success -> `confirm-position` (position) or `confirm-sheet` (sheet)

## 5.4 Confirm Position
**File**: `app/scan/confirm-position.tsx`
- Editable chess board (drag pieces to fix recognition)
- Turn toggle (White/Black), Castling rights [K][Q][k][q]
- Reset / Clear / Analyze
- Validate FEN via chess.js -> `game/[id]?from=position`

## 5.5 Confirm Sheet
**File**: `app/scan/confirm-sheet.tsx`
- List moves with flags: green ok, amber uncertain OCR, red invalid
- Cascade-aware validation: if move N fails, mark N + suggest top 3 alternatives
- Tap flagged move -> edit dialog; re-validate on edit
- Enable Analyze only when all green

## 5.6 Game Review (UNIFIED screen for both position + sheet)
**File**: `app/game/[id].tsx`
- Header: editable title · date, edit + settings
- Eval bar (16px) + Board (~360px) with arrow of selected line
- Move strip (horizontal, 8 moves), auto-scroll to currentPly
- Nav buttons: Start / Prev / Next / End
- Multi-PV: 3 lines, selected shows ●▼, others ○▶
  - Position scan: all 3 lines = engine variations, line 0 = BEST (default selected)
  - Score sheet: line 0 = REAL GAME (YOUR GAME badge), lines 1-2 = engine alternatives
- Bottom actions:
  - Position scan: [New] [Edit] [Save] [Share] (4 buttons)
  - Score sheet: [Save] [Share] [Export PGN] (3 buttons)

**State**:
```typescript
const [selectedLineIndex, setSelectedLineIndex] = useState(0);
const [currentPly, setCurrentPly] = useState(0);
const [engineLines, setEngineLines] = useState<MultiPVLine[]>([]);
```

**Cleanup (DO NOT include)**:
- ❌ Opening detection text
- ❌ "Roughly equal" labels
- ❌ Engine warning cards
- ❌ Plain English explanations in multi-PV
- ❌ Eval sparkline
- ❌ W/D/B percentage labels

## 5.7 Save Game Dialog
**Component**: `components/SaveGameDialog.tsx` (modal, both flows)
Fields: Title* (only required, sage `*`), Event, Site, Date, Round, White, Black, Result.
- Same dialog for both flows
- No "(optional)" text on non-required fields
- White auto-fills from profile if defaultColor === 'white'; Black if 'black'
- Result default: `*`; segmented control [1-0][½-½][0-1][*]
- White + Black side-by-side using flexbox row, equal flex (CRITICAL: equal width)

## 5.8 Settings
**File**: `app/settings/index.tsx`
- PROFILE: Display name, Default color
- PREFERENCES: Dark mode toggle, Language EN/VN
- SUBSCRIPTION: Current plan Free, Upgrade [Coming soon]
- ACCOUNT: Sign in [Coming soon]
- ABOUT: Version 1.0.0, Terms, Privacy, Contact

---

# PART 6: KEY INTEGRATIONS

## 6.1 Gemini API integration

```typescript
// lib/recognition.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: { responseMimeType: 'application/json' }
});

const POSITION_PROMPT = `
You are a chess position recognition expert. Analyze this image of a chess board.
Return JSON in this exact format:
{ "fen": "...", "confidence": 0.95, "notes": "..." }
CRITICAL:
- Use standard FEN notation
- Identify all 64 squares
- Default turn to white if not certain
- Default castling rights to KQkq if unclear
- Set confidence 0.0-1.0 based on image quality
`;

const SHEET_PROMPT = `
You are a chess score sheet OCR expert. Extract all moves from this handwritten/printed score sheet.
Return JSON:
{
  "moves": [ { "moveNumber": 1, "white": "e4", "black": "e5" }, ... ],
  "result": "1-0" | "0-1" | "½-½" | "*",
  "confidence": 0.85,
  "uncertainMoves": [3, 7]
}
`;

export async function recognizePosition(imageBase64: string) {
  const result = await model.generateContent([
    POSITION_PROMPT,
    { inlineData: { data: imageBase64, mimeType: 'image/jpeg' } }
  ]);
  return JSON.parse(result.response.text());
}

export async function recognizeScoreSheet(imageBase64: string) {
  const result = await model.generateContent([
    SHEET_PROMPT,
    { inlineData: { data: imageBase64, mimeType: 'image/jpeg' } }
  ]);
  return JSON.parse(result.response.text());
}
```

**Cost**: ~$0.0001 per recognition. 10k scans = $1.
**Latency**: 2-5 seconds per call. Show loading state.

## 6.2 Stockfish on React Native (CRITICAL — has risks)

### Option A: react-native-stockfish (recommended, try first)
```bash
npm install react-native-stockfish
cd ios && pod install
```
```typescript
// lib/engine.ts
import Stockfish from 'react-native-stockfish';

class Engine {
  private engine: Stockfish;
  constructor() { this.engine = new Stockfish(); }

  async analyze(fen: string, multipv = 3, depth = 18) {
    return new Promise((resolve) => {
      const results: MultiPVLine[] = [];
      this.engine.onmessage = (msg: string) => {
        if (msg.startsWith('info depth ' + depth)) {
          const line = parseInfoLine(msg);
          if (line) results.push(line);
        }
        if (msg.startsWith('bestmove')) resolve(results);
      };
      this.engine.postMessage(`position fen ${fen}`);
      this.engine.postMessage(`setoption name MultiPV value ${multipv}`);
      this.engine.postMessage(`go depth ${depth}`);
    });
  }
}
```

### Option B: Lichess Cloud Eval API (fallback)
```typescript
async function analyzeLichess(fen: string, multipv = 3) {
  const response = await fetch(
    `https://lichess.org/api/cloud-eval?fen=${encodeURIComponent(fen)}&multiPv=${multipv}`
  );
  const data = await response.json();
  return data.pvs.map(pv => ({
    evalCp: pv.cp,
    bestMove: pv.moves.split(' ')[0],
    continuation: pv.moves.split(' ').slice(1, 9)
  }));
}
```
**Pros**: No native module headache. **Cons**: Rate limit ~100 reqs/min, requires internet, may miss unusual positions.

### Option C: Custom native module (LAST RESORT)
Swift + Kotlin module wrapping Stockfish source. Effort: 1-2 weeks. Only if absolutely necessary.

**Decision tree**:
1. Try Option A in Week 2
2. If fails or unreliable -> switch to Option B
3. If both fail -> consider native rewrite

## 6.3 react-native-chessboard
```typescript
// components/ChessBoard.tsx
import { Chessboard } from 'react-native-chessboard';

function ChessBoard({ fen, onMove, arrows }: Props) {
  return (
    <Chessboard
      fen={fen}
      onMove={({ from, to }) => onMove(from, to)}
      colors={{ white: '#F5EFE0', black: '#5C7A6B' }}
    />
  );
}
```
**Caveat**: Library may have limitations vs react-chessboard (web). Test early Week 2. Fallbacks: custom SVG board (react-native-svg) or WebView wrapper around chessboard.js.

## 6.4 PostHog + Sentry (Week 3+)
```typescript
// app/_layout.tsx
import { PostHogProvider } from 'posthog-react-native';
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  enableInExpoDevelopment: false,
});

export default function RootLayout() {
  return (
    <PostHogProvider apiKey={process.env.EXPO_PUBLIC_POSTHOG_KEY!}
      options={{ host: 'https://app.posthog.com' }}>
      <Slot />
    </PostHogProvider>
  );
}
```
Track key events: `scan_started` (type), `scan_completed` (success, duration_ms), `game_saved`, `game_shared`.

---

# PART 7: DAY-BY-DAY BUILD PLAN

## Week 1: Foundation
- Day 1: Project init — create-expo-app, TS strict, core deps, folder structure, colors/fonts, base UI primitives
- Day 2: Navigation skeleton — expo-router stacks, placeholder screens, nav flow, test on Expo Go
- Day 3: Home + Onboarding — 2 tiles, 3 onboarding screens, AsyncStorage completion flag
- Day 4: Theme + i18n — light/dark toggle, EN/VN toggle, all strings in translation file
- Day 5: Settings screen — 5 sections, profile editing, wire toggles, "Coming soon" placeholders

## Week 2: Recognition + Engine
- Day 6-7: Camera + Image picker — expo-camera, capture screen, permissions, gallery, preprocess (resize 1024px, base64)
- Day 8: Gemini API — .env key, recognizePosition/recognizeScoreSheet, error handling + retries, loading, test real photos
- Day 9: Stockfish setup (RISK) — install, EAS dev build, test analysis, fallback to Lichess if fails, document decision
- Day 10: Engine wrapper — Engine class, Multi-PV (3 lines), depth 18, parse UCI output

## Week 3: Confirm screens
- Day 11-12: Confirm Position — integrate chessboard, drag-drop test, FEN editor, validate chess.js, custom SVG fallback
- Day 13: Score sheet validation — port validation.ts, cascade-aware, top-3 alternatives, amber vs red
- Day 14-15: Confirm Sheet screen — display moves with flags, tap to edit, re-validate, disable Analyze until green

## Week 4: Game Review (biggest chunk)
- Day 16-17: Skeleton — unified screen, editable title, board + eval bar, state
- Day 18-19: Multi-PV interactive — 3 lines, selection visual, BEST/YOUR GAME badge, tap to switch, board arrow
- Day 20-21: Move strip + Nav — scrollable strip, updates per selectedLineIndex, auto-scroll, 4 nav buttons
- Day 22: Bottom actions — position scan 4 buttons, score sheet 3 buttons, wire each

## Week 5: Save + Export
- Day 23: Save Game Dialog — modal 7 PGN fields, White+Black equal-width grid, result segmented, save AsyncStorage
- Day 24: PGN export — Seven Tag Roster, FEN tag for non-starting, share via expo-sharing, .pgn file
- Day 25: Saved Games screen — list view, thumbnails + metadata, tap -> review, swipe to delete

## Week 6: Polish + Beta prep
- Day 26-27: Visual polish — animations, loading/error/empty states
- Day 28: Performance — profile slow screens, optimize board renders, image caching, bundle size
- Day 29: PostHog + Sentry — analytics + crash reporting
- Day 30: Beta build — EAS production, TestFlight, Play Internal Testing, invite 5 testers

## Week 7-8: Beta iteration — collect feedback, fix critical bugs, NO new features
## Week 9-10: Store submission — Apple/Google enrollment, screenshots, descriptions, privacy/ToS, submit

**Total: 9-10 weeks to public launch**
**Critical path risk**: Stockfish native module (Week 2 Day 9). If fails, may add 1-2 weeks.

---

# PART 8: BUILD PROMPT FOR CLAUDE CODE

## Week 1 Day 1 init task
1. `npx create-expo-app@latest chess-scan --template default`
2. Setup folder structure per Part 3.1
3. Install deps: expo-router, react-native-svg, @expo/vector-icons, chess.js, react-native-chessboard, expo-camera, expo-image-picker, expo-image, expo-file-system, @react-native-async-storage/async-storage, expo-secure-store, @google/generative-ai
4. TypeScript strict mode
5. constants/colors.ts (sage #5C7A6B, cream #FAF7F2), constants/chess.ts (STARTING_FEN)
6. types/chess.ts (Move, GameState, SavedGame, MultiPVLine), types/recognition.ts
7. Base UI primitives: Button, Input, Modal, SegmentedControl
8. eas.json with development/preview/production profiles
9. git init + first commit
Then `npx expo start` and verify default screen on Expo Go.

Each subsequent day: paste a focused prompt referencing the relevant spec sections.

---

# PART 9: CRITICAL RISKS + MITIGATION

- **Risk 1 — Stockfish native module fails** (Med/High): test Week 2 Day 9, fallback Lichess Cloud Eval, decision deadline Day 10, worst case +1 week.
- **Risk 2 — react-native-chessboard insufficient** (Med/Med): test Week 3 Day 11, fallback custom SVG board (+1 week) or WebView chessboard.js (+3 days).
- **Risk 3 — Gemini quality on real inputs** (Low/High): use Gemini Flash 2.5, test 20 real photos Week 2, if <80% try Gemini Pro, show confidence + allow manual correction.
- **Risk 4 — Scope creep** (HIGH/High): strict deferral list, NO Auth/Subscription/explanations/social in v1. v1 = 9-10 weeks.
- **Risk 5 — Shipping anxiety** (HIGH/High): hard ship date 10 weeks, beta deadline Week 6, no "one more feature" past Week 7, launch Week 9-10 no matter what.

---

# PART 10: GO / NO-GO CHECKLIST

Before first build prompt, confirm: read full spec; commit 9-10 weeks; understand it's a rewrite (old PWA thrown away); Apple Dev + Google Play accounts (or enroll Week 1); Mac or EAS for iOS; iPhone for testing; Gemini API key; willing to ship imperfect at Week 9; agreed to defer Auth + Subscription to v2. If 9/9 -> start Day 1.

---

# QUICK REFERENCE

- **Project name**: chess-scan-app
- **Stack**: RN + Expo + EAS + Gemini + Stockfish + chess.js + react-native-chessboard
- **Timeline**: 9-10 weeks to App Store launch
- **Dev cost**: ~$124 (Apple + Google) + Gemini (~$5-20/mo dev)
- **Go/no-go decision**: After Day 9 (Stockfish test)
- **Palette**: sage #5C7A6B, cream #FAF7F2 / #F5EFE0
