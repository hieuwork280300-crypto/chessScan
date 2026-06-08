// Board — 8×8 render with piece glyphs, coordinate labels, highlight/selected/last-move
// overlays, and an SVG arrow layer. Ported from the prototype (white's view).

import { useMemo } from 'react';
import { Text, View } from 'react-native';
import Svg, { G, Line, Polygon } from 'react-native-svg';
import { FILES, GLYPH } from '@/constants/chess';
import { C } from '@/constants/colors';
import { squareXY } from '@/lib/board';
import type { Position, Square } from '@/types/chess';

export interface Arrow {
  from: Square;
  to: Square;
  color?: string;
  width?: number;
  glow?: boolean;
  opacity?: number;
  dashed?: boolean;
}

interface BoardProps {
  position: Position;
  size?: number;
  arrows?: Arrow[] | null;
  selected?: Square | null;
  highlight?: Square[] | null;
  lastMove?: { from: Square; to: Square } | null;
  onSquarePress?: (sq: Square) => void;
  dark?: boolean;
}

export function Board({
  position, size = 320, arrows, selected, highlight, lastMove, onSquarePress, dark,
}: BoardProps) {
  const s = size / 8;
  const rows = useMemo(() => {
    const out: { sq: Square; isLight: boolean; r: number; f: number }[][] = [];
    for (let r = 8; r >= 1; r--) {
      const row: { sq: Square; isLight: boolean; r: number; f: number }[] = [];
      for (let f = 0; f < 8; f++) {
        const sq = FILES[f] + r;
        row.push({ sq, isLight: (f + r) % 2 === 1, r, f });
      }
      out.push(row);
    }
    return out;
  }, []);

  return (
    <View
      style={{
        width: size, height: size, borderRadius: 8, overflow: 'hidden',
        shadowColor: '#000', shadowOpacity: dark ? 0.5 : 0.18,
        shadowRadius: 22, shadowOffset: { width: 0, height: 6 },
      }}>
      {rows.map((row, ri) => (
        <View key={ri} style={{ flexDirection: 'row' }}>
          {row.map(({ sq, isLight, r, f }) => {
            const piece = position[sq];
            const isSel = selected === sq;
            const isHl = highlight?.includes(sq);
            const isLast = lastMove && (lastMove.from === sq || lastMove.to === sq);
            const labelColor = isLight ? C.boardDark : C.boardLight;
            return (
              <View
                key={sq}
                onTouchEnd={onSquarePress ? () => onSquarePress(sq) : undefined}
                style={{ width: s, height: s, backgroundColor: isLight ? C.boardLight : C.boardDark, position: 'relative' }}>
                {isLast && <View style={{ position: 'absolute', inset: 0, backgroundColor: C.sage, opacity: 0.16 }} />}
                {isHl && <View style={{ position: 'absolute', inset: 0, backgroundColor: C.amber, opacity: 0.28 }} />}
                {isSel && (
                  <View style={{ position: 'absolute', inset: 0, borderWidth: 3, borderColor: C.sage }} />
                )}
                {f === 0 && (
                  <Text style={{ position: 'absolute', top: 2, left: 3, fontSize: s * 0.2, fontWeight: '600', color: labelColor, opacity: 0.9 }}>
                    {r}
                  </Text>
                )}
                {r === 1 && (
                  <Text style={{ position: 'absolute', bottom: 1, right: 3, fontSize: s * 0.2, fontWeight: '600', color: labelColor, opacity: 0.9 }}>
                    {FILES[f]}
                  </Text>
                )}
                {piece && (
                  <Text
                    style={{
                      position: 'absolute', width: s, height: s, textAlign: 'center',
                      lineHeight: s, fontSize: s * 0.68,
                      color: piece[0] === 'w' ? '#FBF7EE' : '#262521',
                      textShadowColor: piece[0] === 'w' ? 'rgba(0,0,0,.55)' : 'rgba(255,255,255,.15)',
                      textShadowOffset: { width: 0, height: 0.5 }, textShadowRadius: 0.8,
                    }}>
                    {GLYPH[piece[1]]}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      ))}
      <ArrowLayer size={size} arrows={arrows} />
    </View>
  );
}

function ArrowLayer({ size, arrows }: { size: number; arrows?: Arrow[] | null }) {
  if (!arrows || !arrows.length) return null;
  return (
    <Svg width={size} height={size} style={{ position: 'absolute', left: 0, top: 0 }} pointerEvents="none">
      {arrows.map((a, i) => {
        const from = squareXY(a.from, size);
        const to = squareXY(a.to, size);
        const dx = to.x - from.x, dy = to.y - from.y;
        const len = Math.hypot(dx, dy) || 1;
        const ux = dx / len, uy = dy / len;
        const w = a.width || size * 0.026;
        const head = w * 2.6;
        const sx = from.x + ux * (size / 8) * 0.34;
        const sy = from.y + uy * (size / 8) * 0.34;
        const ex = to.x - ux * head * 0.9;
        const ey = to.y - uy * head * 0.9;
        const px = -uy, py = ux;
        const color = a.color || C.sage;
        const tip = `${to.x - ux * head * 0.1},${to.y - uy * head * 0.1}`;
        const b1 = `${ex + px * head * 0.62},${ey + py * head * 0.62}`;
        const b2 = `${ex - px * head * 0.62},${ey - py * head * 0.62}`;
        return (
          <G key={i} opacity={a.opacity ?? 0.9}>
            <Line x1={sx} y1={sy} x2={ex} y2={ey} stroke={color} strokeWidth={w}
              strokeLinecap="round"
              strokeDasharray={a.dashed ? `${w * 1.4},${w * 1.4}` : undefined} />
            <Polygon points={`${tip} ${b1} ${b2}`} fill={color} />
          </G>
        );
      })}
    </Svg>
  );
}
