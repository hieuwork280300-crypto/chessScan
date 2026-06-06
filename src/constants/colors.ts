// Raw hex tokens for use in JS (SVG, Board, Icon colors). UI styling uses NativeWind
// classes from tailwind.config.js; these mirror the same values for non-className contexts.

export const C = {
  sage: '#5C7A6B',
  amber: '#D4A24A',
  bg: '#FAF7F2', bgD: '#16181B',
  ink: '#1A1A1A', inkD: '#ECECEC',
  sub: '#6B6B6B', subD: '#9C9C9C',
  card: '#FFFFFF', cardD: '#1E2024',
  line: '#ECE6DC', lineD: '#2A2D31',
  boardLight: '#E8DDC8', boardDark: '#A88B6C',
  paper: '#FCFAF4', paperInk: '#33312b', paperLine: '#EadFC9', paperLabel: '#9a8e74',
  white: '#FFFFFF',
} as const;

// Theme-aware ink / sub helpers for SVG/icon contexts.
export const ink = (dark: boolean) => (dark ? C.inkD : C.ink);
export const sub = (dark: boolean) => (dark ? C.subD : C.sub);
