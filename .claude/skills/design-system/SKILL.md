---
name: design-system
description: Visual design system for the Chess Scan app — exact tokens from the UI prototype (sage/cream, paper aesthetic), NativeWind styling, light/dark theming, Inter+Caveat fonts, and shared UI primitives. Load when building any screen/component, choosing colors/spacing, implementing dark mode, or porting a prototype screen to React Native.
---

# Design System (NativeWind)

Styling = **NativeWind v4** (Tailwind for React Native). We reuse the prototype's Tailwind classes
almost 1:1. The canonical design is `design/ChessScan.html` + `design/ui-prototype-src/`. When
building a screen, open the matching prototype file and port its classes.

## Exact tokens (ground truth from the prototype `T` object)

| Role | Light | Dark | Tailwind class |
|---|---|---|---|
| bg | `#FAF7F2` | `#16181B` | `bg-bg dark:bg-bg-d` |
| ink (text) | `#1A1A1A` | `#ECECEC` | `text-ink dark:text-ink-d` |
| sub (muted) | `#6B6B6B` | `#9C9C9C` | `text-sub dark:text-sub-d` |
| card | `#FFFFFF` | `#1E2024` | `bg-card dark:bg-card-d` |
| border | `#ECE6DC` | `#2A2D31` | `border-line dark:border-line-d` |
| **sage** (brand) | `#5C7A6B` | — | `bg-sage` / `text-sage` |
| **amber** (accent) | `#D4A24A` | — | `text-amber` |

Board squares: light `#E8DDC8`, dark (the brown) `#A88B6C`. Paper (score sheet) `#FCFAF4` /
border `#EadFC9`, ink `#33312b`, label `#9a8e74`. Validation flags reuse: ok = sage, warn = amber,
danger = a red (`#C2533F`-ish). Safe areas: top `54`, bottom `30`.

### tailwind.config.js (mirror these)
```js
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: { extend: {
    colors: {
      sage: '#5C7A6B', amber: '#D4A24A',
      bg: '#FAF7F2', 'bg-d': '#16181B',
      ink: '#1A1A1A', 'ink-d': '#ECECEC',
      sub: '#6B6B6B', 'sub-d': '#9C9C9C',
      card: '#FFFFFF', 'card-d': '#1E2024',
      line: '#ECE6DC', 'line-d': '#2A2D31',
      board: { light: '#E8DDC8', dark: '#A88B6C' },
      paper: '#FCFAF4',
    },
    fontFamily: { sans: ['Inter'], hand: ['Caveat'] },
  } },
};
```

## NativeWind setup essentials

- Install: `nativewind`, `tailwindcss`, `react-native-reanimated`, `react-native-safe-area-context`.
- `babel.config.js`: presets `['babel-preset-expo', { jsxImportSource: 'nativewind' }]`, plugin `'nativewind/babel'` (+ reanimated plugin LAST).
- `metro.config.js`: wrap with `withNativeWind(config, { input: './global.css' })`.
- `global.css`: `@tailwind base; @tailwind components; @tailwind utilities;` — import it once in `app/_layout.tsx`.
- `nativewind-env.d.ts`: `/// <reference types="nativewind/types" />` so `className` typechecks.
- Dark mode: `darkMode: 'class'` + `useColorScheme()` from nativewind, toggled by wrapping content in a `<View className={dark ? 'dark' : ''}>` (matches the prototype's approach).

## Web → RN element mapping (porting cheatsheet)

| Prototype (web) | React Native + NativeWind |
|---|---|
| `<div className="…">` | `<View className="…">` |
| `<button onClick={fn}>` | `<Pressable onPress={fn}>` (or `TouchableOpacity`) |
| text inside any tag | wrap in `<Text>` — RN has no bare text |
| `<img>` | `<Image>` from `expo-image` |
| `active:scale-[.985]` | use Reanimated/`Pressable` `pressed` state; NativeWind supports `active:` |
| `shadow-[0_8px_22px_…]` | NativeWind maps to `boxShadow` on web; on native use `shadow-*` + `elevation`/`style` |
| `overflow-x-auto` | `<ScrollView horizontal showsHorizontalScrollIndicator={false}>` |
| `grid grid-cols-[…]` | fl: RN has no grid → `flex-row` + `flex-1` / fixed widths |
| `backdrop-blur` | `expo-blur` `<BlurView>` (or a translucent View fallback) |
| `tabular-nums` | `style={{ fontVariant: ['tabular-nums'] }}` |
| `text-wrap: balance/pretty` | not supported — omit |

Keep arbitrary values (`min-h-[52px]`, `rounded-[20px]`, `text-[16px]`) — NativeWind supports them.

**Gotchas seen in this project (use inline `style` to be safe):**
- Large arbitrary font sizes (`text-[27px]`, `text-[32px]`) sometimes fail to apply via className
  (Metro/NativeWind CSS-gen quirk) while small ones (`text-[13px]`–`text-[17px]`) work. For big
  headings use `style={{ fontSize: N, fontWeight: '700' }}`.
- An arbitrary `leading-[34px]` next to `text-[27px]` could drop the size class — prefer
  `style={{ lineHeight: N }}` for arbitrary line-heights.
- Empty bordered circles (`w-6 h-6 rounded-full border-2 border-[#hex]`) rendered as a dark dash;
  for radio/indicator dots use inline `style={{ width, height, borderRadius, borderWidth, borderColor }}`.

## Fonts (Inter + Caveat)

- Load via `@expo-google-fonts/inter` + `@expo-google-fonts/caveat` + `expo-font` `useFonts`.
- Gate render on fonts loaded (SplashScreen.preventAutoHideAsync until ready).
- `font-sans` = Inter (everything), `font-hand` = Caveat (ONLY score-sheet handwritten move glyphs, e.g. `<Text className="font-hand text-[22px]">e4</Text>`).

## UI primitives (`components/ui/`) — port these from `04_screens-onboarding-home.jsx`

- **PrimaryButton** — `w-full min-h-[52px] rounded-2xl bg-sage text-white text-[16px] font-semibold`, centered icon+label, `active:scale-[.985]`, sage glow shadow.
- **TextLink** — `text-sage text-[16px] font-medium min-h-[44px]`, optional trailing icon, `active:opacity-60`.
- **IconButton / DarkToggle** — `w-11 h-11 rounded-full`, `active:bg-black/5 dark:active:bg-white/10`. DarkToggle swaps `moon`/`sun`.
- **PageDots** — active dot `w-6 bg-sage`, inactive `w-1.5 bg-[#D8CFC0] dark:bg-[#33373c]`.
- **Card / Tile** — `rounded-[20px] bg-card dark:bg-card-d border border-line dark:border-line-d`, soft shadow, `active:scale-[.99]`.

Min touch target 44px. One primitive per file, `interface Props`, accept `className?` passthrough.

## Component specifics

- **Board** — see `chess-domain` + prototype `02_chessboard.jsx`. Square, arrows overlay (sage, optional glow). Used at sizes 72/88/214/full.
- **Eval / multi-PV** — selected line filled dot + `▼`, others hollow + `▶`; BEST / YOUR GAME badge on line 0; eval prefix `+0.36` / `#3` with `tabular-nums`.
- **Toast** — bottom center pill `bg-[#1A1A1A] dark:bg-[#33373d] text-white rounded-full`, check icon in sage, auto-dismiss ~2.4s.
- **Score-sheet paper** — `bg-paper border-[#EadFC9]`, dashed row separators, `font-hand` moves, slight rotation for the art.

## Do NOT add (Game Review cleanup list)

Opening-detection text · "roughly equal" labels · engine warning cards · plain-English explanations
in multi-PV · eval sparkline · W/D/B % labels. Keep analysis clean and numeric.

## States — every screen

Loading · error (+retry) · empty (saved games empty → CTA to scan). Animations exist in the
prototype (`anim-slideup/fadein/popin`) — reproduce with Reanimated; respect reduced-motion.
