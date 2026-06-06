---
name: design-system
description: Visual design system for the Chess Scan app — sage/cream palette, light/dark theming, spacing, typography, and the shared UI primitives (Button, Input, Modal, SegmentedControl). Load when building any screen or component, choosing colors/spacing, implementing dark mode, or ensuring visual consistency.
---

# Design System

Calm, paper-and-felt aesthetic: sage green + cream. Both light and dark mode are required. Pull every color/space token from `constants/` — never hardcode hex in a screen.

## Palette (`constants/colors.ts`)

Core brand:
- **Sage** `#5C7A6B` — primary accent, dark board squares, selected states, required-field `*`.
- **Cream** `#FAF7F2` (app bg light), `#F5EFE0` (light board squares / surfaces).

Define semantic tokens per theme, not raw hex in components:
```ts
export const light = {
  bg: '#FAF7F2', surface: '#FFFFFF', surfaceAlt: '#F5EFE0',
  text: '#1F2A24', textMuted: '#5B675F', border: '#E3DCCF',
  primary: '#5C7A6B', primaryText: '#FFFFFF',
  boardLight: '#F5EFE0', boardDark: '#5C7A6B',
  ok: '#3E7C5A', warn: '#C98A2B', danger: '#B5503F',   // green / amber / red flags
};
export const dark = {
  bg: '#15201A', surface: '#1E2B24', surfaceAlt: '#243029',
  text: '#ECEFE9', textMuted: '#9DAaa1', border: '#33403A',
  primary: '#7FA38C', primaryText: '#10231A',
  boardLight: '#3A4A41', boardDark: '#5C7A6B',
  ok: '#5FB07F', warn: '#E0A84B', danger: '#D67462',
};
export type Theme = typeof light;
```
- Validation flags map to `ok`/`warn`/`danger` (green/amber/red) — the score-sheet semantics.
- Board colors flow into react-native-chessboard `colors={{ white: theme.boardLight, black: theme.boardDark }}`.

## Theming (`ThemeContext` + `useDarkMode`)

- `ThemeContext` exposes the active `Theme` object + `toggle`. Persist choice in AsyncStorage (`app-settings.darkMode`).
- Components read theme via `const t = useTheme()` and build styles inline or via a `makeStyles(t)` factory — NOT a static `StyleSheet` (which can't see runtime theme).
- Default to system scheme on first launch (`useColorScheme()`), then respect the user's explicit toggle.

## Spacing & radius (`constants/` — add a `spacing.ts`)

4-pt scale: `xs:4, sm:8, md:12, lg:16, xl:24, xxl:32`. Radius: `sm:8, md:12, lg:16, pill:999`.
Screen horizontal padding = `lg (16)`. Card padding = `lg`. Gap between tiles = `md`.

## Typography (`constants/fonts.ts`)

- System font v1 (ship fast); optional custom font later via `expo-font`.
- Scale: `h1: 28/700`, `h2: 22/600`, `title: 18/600`, `body: 16/400`, `label: 14/600`, `caption: 13/400` (size/weight).
- Numbers/eval use tabular feel — keep eval text monospace-ish alignment (fixed width via `fontVariant: ['tabular-nums']`).

## UI primitives (`components/ui/`)

Build these first (Day 1); every screen composes them.

- **Button** — variants `primary | secondary | ghost | danger`, sizes `sm | md`, `loading` (spinner), `disabled`, optional leading icon. Min touch target 44px. Primary = sage bg / cream text.
- **Input** — label, value, `onChangeText`, `placeholder`, `error` (red border + message), optional `required` (sage `*`). Themed border, focus ring = primary.
- **Modal** — bottom-sheet style with drag handle (used by SaveGameDialog). Backdrop dim, `KeyboardAvoidingView` inside, rounded top corners `lg`.
- **SegmentedControl** — equal-width segments (Result picker `[1-0][½-½][0-1][*]`, turn White/Black). Selected = sage fill.

Rules:
- One file per primitive, `interface Props`, forward style overrides via a `style?` prop.
- Icons from `@expo/vector-icons`; pick one family (e.g. Feather/Ionicons) and stick to it.

## Component-specific notes

- **EvalBar** — vertical, 16px wide, sage(white side)/dark(black side) fill. Clamp cp, full bar on mate. Animate fill on ply change.
- **Board** — square, `width = screenWidth - 2*16`, `aspectRatio: 1`. Selected-line arrow overlays.
- **MoveStrip** — horizontal `FlatList`, 8 visible, auto-scroll to `currentPly`, current move highlighted with `primary` underline.
- **Multi-PV lines** — selected line: filled dot `●` + `▼`; others: hollow `○` + `▶`. BEST badge (position) / YOUR GAME badge (sheet) on line 0. Eval prefix (`+0.36`, `#3`) tabular-aligned.
- **SaveGameDialog** — White + Black inputs in a `flexDirection:'row'` with `flex:1` each + `gap: md` (EQUAL width, this is called out as critical).

## Do NOT add (Game Review cleanup list)

Opening-detection text · "roughly equal" labels · engine warning cards · plain-English explanations in multi-PV · eval sparkline · W/D/B % labels. Keep the analysis surface clean and numeric.

## States — every screen needs

Loading (skeleton/spinner) · Error (message + retry) · Empty (saved-games empty → friendly CTA to scan). Don't ship a screen with only the happy path.
