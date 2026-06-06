// Icon — lucide-style line icons (1.5px stroke), ported to react-native-svg.
// Matches the prototype's icon set. Color via `color` prop (default ink).

import Svg, { Circle, Line, Path, Polygon, Rect } from 'react-native-svg';
import { C } from '@/constants/colors';

export type IconName =
  | 'settings' | 'camera' | 'scan' | 'sheet' | 'x' | 'chevronLeft' | 'chevronRight'
  | 'chevronDown' | 'arrowRight' | 'sun' | 'moon' | 'bookmark' | 'share' | 'retry'
  | 'play' | 'pause' | 'skipBack' | 'skipForward' | 'info' | 'search' | 'image'
  | 'fileText' | 'alertCircle' | 'trash' | 'download' | 'fileDown' | 'arrowUpDown'
  | 'check' | 'pencil' | 'rotate' | 'eraser';

interface Props {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

// Each icon is a function of stroke color → array of svg child elements.
const P = (d: string, key?: string | number) => <Path key={key} d={d} />;

const ICONS: Record<IconName, () => React.ReactNode> = {
  settings: () => [
    <Path key="g" d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />,
    <Circle key="c" cx={12} cy={12} r={3} />,
  ],
  camera: () => [
    <Path key="p" d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />,
    <Circle key="c" cx={12} cy={13} r={3} />,
  ],
  scan: () => [
    P('M3 7V5a2 2 0 0 1 2-2h2', 1), P('M17 3h2a2 2 0 0 1 2 2v2', 2),
    P('M21 17v2a2 2 0 0 1-2 2h-2', 3), P('M7 21H5a2 2 0 0 1-2-2v-2', 4), P('M7 12h10', 5),
  ],
  sheet: () => [
    P('M15 12h-5', 1), P('M15 8h-5', 2), P('M19 17V5a2 2 0 0 0-2-2H4', 3),
    P('M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3', 4),
  ],
  x: () => [P('M18 6 6 18', 1), P('m6 6 12 12', 2)],
  chevronLeft: () => [P('m15 18-6-6 6-6')],
  chevronRight: () => [P('m9 18 6-6-6-6')],
  chevronDown: () => [P('m6 9 6 6 6-6')],
  arrowRight: () => [P('M5 12h14', 1), P('m12 5 7 7-7 7', 2)],
  sun: () => [
    <Circle key="c" cx={12} cy={12} r={4} />,
    P('M12 2v2', 1), P('M12 20v2', 2), P('m4.93 4.93 1.41 1.41', 3), P('m17.66 17.66 1.41 1.41', 4),
    P('M2 12h2', 5), P('M20 12h2', 6), P('m6.34 17.66-1.41 1.41', 7), P('m19.07 4.93-1.41 1.41', 8),
  ],
  moon: () => [P('M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z')],
  bookmark: () => [P('m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z')],
  share: () => [
    <Circle key="c1" cx={18} cy={5} r={3} />, <Circle key="c2" cx={6} cy={12} r={3} />,
    <Circle key="c3" cx={18} cy={19} r={3} />, P('m8.59 13.51 6.83 3.98', 1), P('m15.41 6.51-6.82 3.98', 2),
  ],
  retry: () => [P('M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8', 1), P('M3 3v5h5', 2)],
  play: () => [<Polygon key="p" points="6 3 20 12 6 21 6 3" />],
  pause: () => [<Rect key="r1" x={6} y={4} width={4} height={16} rx={1} />, <Rect key="r2" x={14} y={4} width={4} height={16} rx={1} />],
  skipBack: () => [<Polygon key="p" points="19 20 9 12 19 4 19 20" />, <Line key="l" x1={5} x2={5} y1={19} y2={5} />],
  skipForward: () => [<Polygon key="p" points="5 4 15 12 5 20 5 4" />, <Line key="l" x1={19} x2={19} y1={5} y2={19} />],
  info: () => [<Circle key="c" cx={12} cy={12} r={10} />, P('M12 16v-4', 1), P('M12 8h.01', 2)],
  search: () => [<Circle key="c" cx={11} cy={11} r={8} />, P('m21 21-4.3-4.3', 1)],
  image: () => [
    <Rect key="r" width={18} height={18} x={3} y={3} rx={2} ry={2} />,
    <Circle key="c" cx={9} cy={9} r={2} />, P('m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21', 1),
  ],
  fileText: () => [
    P('M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z', 1), P('M14 2v4a2 2 0 0 0 2 2h4', 2),
    P('M10 9H8', 3), P('M16 13H8', 4), P('M16 17H8', 5),
  ],
  alertCircle: () => [<Circle key="c" cx={12} cy={12} r={10} />, P('M12 8v4', 1), P('M12 16h.01', 2)],
  trash: () => [P('M3 6h18', 1), P('M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2', 2)],
  download: () => [P('M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 1), P('M7 10l5 5 5-5', 2), P('M12 15V3', 3)],
  fileDown: () => [
    P('M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z', 1), P('M14 2v4a2 2 0 0 0 2 2h4', 2),
    P('M12 18v-6', 3), P('m9 15 3 3 3-3', 4),
  ],
  arrowUpDown: () => [P('m21 16-4 4-4-4', 1), P('M17 20V4', 2), P('m3 8 4-4 4 4', 3), P('M7 4v16', 4)],
  check: () => [P('M20 6 9 17l-5-5')],
  pencil: () => [P('M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z', 1), P('m15 5 4 4', 2)],
  rotate: () => [P('M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8', 1), P('M21 3v5h-5', 2)],
  eraser: () => [
    P('m7 21-4.3-4.3a1 1 0 0 1 0-1.4l9.6-9.6a1 1 0 0 1 1.4 0l4.3 4.3a1 1 0 0 1 0 1.4L13 21', 1),
    P('M22 21H7', 2), P('m5 11 9 9', 3),
  ],
};

export function Icon({ name, size = 24, strokeWidth = 1.5, color = C.ink }: Props) {
  const render = ICONS[name];
  if (!render) return null;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" color={color}
      stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {render()}
    </Svg>
  );
}
