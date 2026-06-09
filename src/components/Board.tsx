// Board — 8×8 render with piece glyphs, coordinate labels, highlight/selected/last-move
// overlays, and an SVG arrow layer. Ported from the prototype (white's view).

import { useEffect, useMemo } from 'react';
import { Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { G, Line, Polygon, SvgXml } from 'react-native-svg';
import { FILES } from '@/constants/chess';
import { C } from '@/constants/colors';
import { PIECE_SVG } from '@/constants/pieces';
import { squareTopLeft, squareXY } from '@/lib/board';
import type { PieceCode, Position, Square } from '@/types/chess';

const SLIDE_MS = 200;

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
              </View>
            );
          })}
        </View>
      ))}
      <PieceLayer position={position} squareSize={s} lastMove={lastMove} />
      <ArrowLayer size={size} arrows={arrows} />
    </View>
  );
}

// Pieces live in their own absolute layer above the squares so a sliding piece
// renders on top of every square it crosses. pointerEvents stays off so taps fall
// through to the square grid (which owns onSquarePress).
function PieceLayer({
  position, squareSize, lastMove,
}: { position: Position; squareSize: number; lastMove?: { from: Square; to: Square } | null }) {
  const moveKey = lastMove ? lastMove.from + lastMove.to : '';
  return (
    <View style={{ position: 'absolute', inset: 0 }} pointerEvents="none">
      {Object.entries(position).map(([sq, piece]) => (
        <AnimatedPiece
          key={sq}
          piece={piece as PieceCode}
          size={squareSize}
          dest={squareTopLeft(sq, squareSize)}
          from={lastMove?.to === sq && lastMove ? squareTopLeft(lastMove.from, squareSize) : null}
          moveKey={moveKey}
        />
      ))}
    </View>
  );
}

// One piece sprite. When this square is the destination of the latest move, it
// starts at the move's origin and slides home; otherwise it just sits at `dest`.
function AnimatedPiece({
  piece, size, dest, from, moveKey,
}: {
  piece: PieceCode;
  size: number;
  dest: { left: number; top: number };
  from: { left: number; top: number } | null;
  moveKey: string;
}) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);

  useEffect(() => {
    if (!from) return;
    tx.value = from.left - dest.left;
    ty.value = from.top - dest.top;
    tx.value = withTiming(0, { duration: SLIDE_MS });
    ty.value = withTiming(0, { duration: SLIDE_MS });
    // Re-run only when the move changes; dest/from are derived from it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moveKey]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute', left: dest.left, top: dest.top, width: size, height: size,
          zIndex: from ? 2 : 1,
          shadowColor: '#000', shadowOpacity: 0.22, shadowRadius: 2.5, shadowOffset: { width: 0, height: 1.5 },
        },
        animStyle,
      ]}>
      <SvgXml xml={PIECE_SVG[piece]} width={size} height={size} />
    </Animated.View>
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
