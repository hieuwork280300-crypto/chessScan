// Confirm Position — review/fix the recognized board, set side to move, then analyze.
// Tap-based editing: pick a palette piece (or eraser) to "paint" squares, or tap a piece
// then a destination to move it. (Drag is a later enhancement.)

import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { Screen } from '@/components/ui/Screen';
import { TextLink } from '@/components/ui/TextLink';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SettingsButton } from '@/components/ui/SettingsButton';
import { Segmented } from '@/components/ui/Segmented';
import { Board } from '@/components/Board';
import { Icon } from '@/components/Icon';
import { useApp } from '@/lib/AppContext';
import { SvgXml } from 'react-native-svg';
import { fenToPos, posToFen } from '@/lib/board';
import { SCAN_FEN } from '@/constants/chess';
import { PIECE_SVG } from '@/constants/pieces';
import { C } from '@/constants/colors';
import { getScan, patchScan } from '@/lib/scanStore';
import { positionIssues } from '@/lib/validation';
import type { PieceCode, Position, Square } from '@/types/chess';

function initialFen(): string {
  const s = getScan();
  return s?.mode === 'position' && s.fen ? s.fen : `${SCAN_FEN} w - - 0 1`;
}

const PALETTE = ['wP', 'wN', 'wB', 'wR', 'wQ', 'wK', 'bP', 'bN', 'bB', 'bR', 'bQ', 'bK'] as const;
type Brush = (typeof PALETTE)[number] | 'erase';

function Glyph({ piece, size }: { piece: PieceCode; size: number }) {
  return <SvgXml xml={PIECE_SVG[piece]} width={size} height={size} />;
}

export default function ConfirmPosition() {
  const { dark } = useApp();
  const insets = useSafeAreaInsets();
  const [pos, setPos] = useState<Position>(() => fenToPos(initialFen()));
  const [turn, setTurn] = useState<'w' | 'b'>(() => (initialFen().split(' ')[1] === 'b' ? 'b' : 'w'));
  const [sel, setSel] = useState<Square | null>(null);
  const [brush, setBrush] = useState<Brush | null>(null);

  function onSquare(sq: Square) {
    if (brush) {
      setPos((p) => {
        const np = { ...p };
        if (brush === 'erase') delete np[sq];
        else np[sq] = brush;
        return np;
      });
      return;
    }
    // move mode
    if (sel) {
      if (sel === sq) { setSel(null); return; }
      setPos((p) => {
        const np = { ...p };
        np[sq] = np[sel];
        delete np[sel];
        return np;
      });
      setSel(null);
    } else if (pos[sq]) {
      setSel(sq);
    }
  }

  const issues = positionIssues(pos);

  function analyze() {
    if (issues.errors.length) {
      Alert.alert('Fix the position first', issues.errors.slice(0, 4).join('\n'));
      return;
    }
    const fen = posToFen(pos, turn);
    patchScan({ mode: 'position', fen });
    router.push({ pathname: '/review', params: { mode: 'position', fen } });
  }

  return (
    <Screen edges={{ top: true, bottom: false }}>
      <View className="flex-row items-center justify-between px-2">
        <TextLink onPress={() => router.back()} className="px-1">Retake</TextLink>
        <Text className="text-[16px] font-semibold text-ink dark:text-ink-d">Check the position</Text>
        <SettingsButton />
      </View>

      <ScrollView className="flex-1 px-6 pt-1" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center gap-3 mb-4">
          <View className="rounded-[8px] overflow-hidden border border-line dark:border-line-d">
            <Board position={pos} size={56} />
          </View>
          <View className="flex-1">
            <Text className="text-[13px] font-semibold text-ink dark:text-ink-d">From your photo</Text>
            <Text className="text-[13px] text-sub dark:text-sub-d">Tap a piece then a square to move it, or pick from the tray below.</Text>
          </View>
        </View>

        <View className="items-center">
          <Board position={pos} size={300} selected={sel} dark={dark} onSquarePress={onSquare} />
        </View>

        {(issues.errors.length > 0 || issues.warnings.length > 0) && (
          <View
            style={{
              marginTop: 16, borderRadius: 12, padding: 12, borderWidth: 1,
              borderColor: issues.errors.length ? '#C2533F' : C.amber,
              backgroundColor: issues.errors.length ? (dark ? '#3a201c' : '#FBEAE6') : (dark ? '#39331f' : '#FAF3E0'),
            }}>
            <View className="flex-row items-center gap-1.5 mb-1">
              <Icon name="alertCircle" size={15} color={issues.errors.length ? '#C2533F' : C.amber} />
              <Text style={{ fontSize: 13, fontWeight: '700', color: issues.errors.length ? '#C2533F' : C.amber }}>
                {issues.errors.length ? 'This position looks off — fix before analyzing' : 'Possible misread — double-check'}
              </Text>
            </View>
            {[...issues.errors, ...issues.warnings].slice(0, 3).map((m, i) => (
              <Text key={i} className="text-ink dark:text-ink-d" style={{ fontSize: 12.5, lineHeight: 18 }}>• {m}</Text>
            ))}
          </View>
        )}

        <View className="mt-5">
          <Segmented
            value={turn} onChange={setTurn}
            options={[{ value: 'w', label: 'White to move', dot: 'w' }, { value: 'b', label: 'Black to move', dot: 'b' }]}
          />
        </View>
        <View className="h-3" />
      </ScrollView>

      {/* palette tray + analyze */}
      <View className="px-6 border-t border-line dark:border-line-d bg-bg dark:bg-bg-d" style={{ paddingTop: 10, paddingBottom: insets.bottom + 10 }}>
        <Text className="text-center text-[13px] font-medium text-sub dark:text-sub-d mb-2">
          {brush ? (brush === 'erase' ? 'Eraser — tap a square to clear' : 'Tap a square to place') : 'Pick a piece to place, or tap the board'}
        </Text>
        <View className="flex-row flex-wrap justify-between gap-y-1.5 mb-3">
          {PALETTE.map((pc) => {
            const active = brush === pc;
            return (
              <Pressable
                key={pc} onPress={() => setBrush((b) => (b === pc ? null : pc))}
                className={'w-[13%] aspect-square rounded-xl items-center justify-center border ' +
                  (active ? 'bg-sage/15 border-sage' : 'bg-card dark:bg-card-d border-line dark:border-line-d')}>
                <Glyph piece={pc} size={32} />
              </Pressable>
            );
          })}
          <Pressable
            onPress={() => setBrush((b) => (b === 'erase' ? null : 'erase'))}
            className={'w-[13%] aspect-square rounded-xl items-center justify-center border ' +
              (brush === 'erase' ? 'bg-sage/15 border-sage' : 'bg-card dark:bg-card-d border-line dark:border-line-d')}>
            <Icon name="eraser" size={20} color={C.sub} />
          </Pressable>
        </View>
        <PrimaryButton onPress={analyze} icon="search">Analyze</PrimaryButton>
      </View>
    </Screen>
  );
}
