// Confirm Position — review/fix the recognized board, set side to move, then analyze.
// Tap-based editing: pick a palette piece (or eraser) to "paint" squares, or tap a piece
// then a destination to move it. (Drag is a later enhancement.)

import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
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
import { fenToPos } from '@/lib/board';
import { SCAN_FEN, GLYPH } from '@/constants/chess';
import { C } from '@/constants/colors';
import type { Position, Square } from '@/types/chess';

const PALETTE = ['wP', 'wN', 'wB', 'wR', 'wQ', 'wK', 'bP', 'bN', 'bB', 'bR', 'bQ', 'bK'] as const;
type Brush = (typeof PALETTE)[number] | 'erase';

function Glyph({ piece, size }: { piece: string; size: number }) {
  return (
    <Text
      style={{
        fontSize: size, lineHeight: size * 1.18, textAlign: 'center',
        color: piece[0] === 'w' ? '#F6F1E7' : '#2A2620',
        textShadowColor: piece[0] === 'w' ? 'rgba(0,0,0,.45)' : 'rgba(255,255,255,.18)',
        textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 1,
      }}>
      {GLYPH[piece[1]]}
    </Text>
  );
}

export default function ConfirmPosition() {
  const { dark } = useApp();
  const insets = useSafeAreaInsets();
  const [pos, setPos] = useState<Position>(() => fenToPos(SCAN_FEN));
  const [turn, setTurn] = useState<'w' | 'b'>('w');
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

  function analyze() {
    // FEN (posToFen(pos, turn)) will feed the engine once wired; mock review for now.
    router.push({ pathname: '/review', params: { mode: 'position' } });
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
                <Glyph piece={pc} size={24} />
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
