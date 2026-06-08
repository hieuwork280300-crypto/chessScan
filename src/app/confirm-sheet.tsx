// Confirm Sheet — review the recognized game (validated by chess.js). Uncertain OCR = amber,
// illegal = red with legal suggestions (cascade-aware: only the first illegal is real). Once
// no unresolved illegal moves remain, start the review.

import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { Screen } from '@/components/ui/Screen';
import { TextLink } from '@/components/ui/TextLink';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SettingsButton } from '@/components/ui/SettingsButton';
import { Board } from '@/components/Board';
import { Icon } from '@/components/Icon';
import { useApp } from '@/lib/AppContext';
import { computeLinePositions, fenToPos } from '@/lib/board';
import { STD_FEN } from '@/constants/chess';
import { GAME_PLIES } from '@/lib/mockData';
import { getScan } from '@/lib/scanStore';
import { C } from '@/constants/colors';
import type { MoveCell } from '@/lib/validation';
import type { Ply } from '@/types/chess';

// When opened without a scan (e.g. deep link), build a demo from the mock game.
function fallbackCells(plies: Ply[]): MoveCell[] {
  const cells: MoveCell[] = [];
  let n = 1;
  let side: 'w' | 'b' = 'w';
  for (const p of plies) {
    const uncertain = (n === 2 && side === 'w') || (n === 4 && side === 'b');
    cells.push({ moveNumber: n, side, san: p.san, flag: uncertain ? 'uncertain' : 'ok' });
    if (side === 'w') side = 'b';
    else { side = 'w'; n += 1; }
  }
  return cells;
}

interface ICell extends MoveCell { idx: number }
interface Row { n: number; w?: ICell; b?: ICell }

export default function ConfirmSheet() {
  const { dark } = useApp();
  const insets = useSafeAreaInsets();

  const { plies, cells } = useMemo(() => {
    const s = getScan();
    const p = s?.mode === 'sheet' && s.plies?.length ? s.plies : GAME_PLIES;
    const c = s?.mode === 'sheet' && s.cells?.length ? s.cells : fallbackCells(p);
    return { plies: p, cells: c };
  }, []);

  const positions = useMemo(() => computeLinePositions(fenToPos(STD_FEN), plies), [plies]);
  const rows = useMemo<Row[]>(() => {
    const map = new Map<number, Row>();
    cells.forEach((c, idx) => {
      const row = map.get(c.moveNumber) ?? { n: c.moveNumber };
      row[c.side] = { ...c, idx };
      map.set(c.moveNumber, row);
    });
    return [...map.values()];
  }, [cells]);

  const [cursor, setCursor] = useState(() => Math.max(0, plies.length - 1));
  const [resolved, setResolved] = useState<Set<number>>(() => new Set());
  const [popupIdx, setPopupIdx] = useState<number | null>(null);

  const needsAttention = cells.filter((c, i) => c.flag !== 'ok' && !resolved.has(i));
  const hasIllegal = cells.some((c, i) => c.flag === 'invalid' && !resolved.has(i));
  const popupCell = popupIdx != null ? cells[popupIdx] : null;
  const cursorPly = plies[Math.min(cursor, plies.length - 1)];

  function Cell({ cell }: { cell?: ICell }) {
    if (!cell) return <View className="flex-1 min-h-[40px]" />;
    const bad = cell.flag !== 'ok' && !resolved.has(cell.idx);
    const illegal = cell.flag === 'invalid' && !resolved.has(cell.idx);
    const legal = cell.idx < plies.length;
    const active = legal && cursor === cell.idx;
    return (
      <Pressable
        onPress={() => {
          if (illegal) setPopupIdx(cell.idx);
          else if (legal) { setCursor(cell.idx); setPopupIdx(null); }
        }}
        className={'flex-1 min-h-[40px] pl-3 pr-2 rounded-lg flex-row items-center ' +
          (active ? 'bg-sage/15' : bad ? 'bg-amber/10' : '')}>
        <Text
          className={'text-[16px] font-medium ' + (active ? 'text-sage' : 'text-ink dark:text-ink-d') + (illegal ? ' underline' : '')}
          style={{ fontVariant: ['tabular-nums'] }}>
          {cell.san}
        </Text>
        {bad && <View className="ml-auto w-2 h-2 rounded-full bg-amber" />}
      </Pressable>
    );
  }

  return (
    <Screen edges={{ top: true, bottom: false }}>
      <View className="flex-row items-center justify-between px-2">
        <TextLink onPress={() => router.back()} className="px-1">Retake</TextLink>
        <Text className="text-[16px] font-semibold text-ink dark:text-ink-d">Check the moves</Text>
        <SettingsButton />
      </View>

      {/* live board + status */}
      <View className="flex-row items-center gap-4 px-6 pt-1 pb-3">
        <View className="rounded-[8px] overflow-hidden border border-line dark:border-line-d">
          <Board
            position={positions[Math.min(cursor + 1, positions.length - 1)]} size={156} dark={dark}
            arrows={cursorPly ? [{ from: cursorPly.from, to: cursorPly.to, width: 6 }] : null}
          />
        </View>
        <View className="flex-1">
          <Text className="text-[16px] font-semibold text-ink dark:text-ink-d">{cursorPly?.name ?? cursorPly?.san ?? '—'}</Text>
          {needsAttention.length > 0 ? (
            <View className="mt-1.5 flex-row items-start gap-1.5">
              <View className="w-2 h-2 rounded-full bg-amber mt-1.5" />
              <Text className="text-[13px] text-amber font-medium flex-1">
                {needsAttention.length} move{needsAttention.length > 1 ? 's' : ''} need your attention.
              </Text>
            </View>
          ) : (
            <View className="mt-1.5 flex-row items-center gap-1.5">
              <Icon name="check" size={15} strokeWidth={2} color={C.sage} />
              <Text className="text-[13px] text-sub dark:text-sub-d flex-1">All clear — tap any move to jump there.</Text>
            </View>
          )}
        </View>
      </View>

      {/* move grid */}
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="flex-row px-1 pb-1">
          <Text className="w-[28px] text-[12px] font-semibold uppercase text-sub dark:text-sub-d">#</Text>
          <Text className="flex-1 px-3 text-[12px] font-semibold uppercase text-sub dark:text-sub-d">White</Text>
          <Text className="flex-1 px-3 text-[12px] font-semibold uppercase text-sub dark:text-sub-d">Black</Text>
        </View>
        <View className="rounded-[12px] border border-line dark:border-line-d bg-card dark:bg-card-d">
          {rows.map((r, i) => (
            <View key={r.n} className={'flex-row items-center px-2 py-1 ' + (i ? 'border-t border-[#F0EBE0] dark:border-[#23262b]' : '')}>
              <Text className="w-[28px] text-center text-[14px] text-sub dark:text-sub-d" style={{ fontVariant: ['tabular-nums'] }}>{r.n}</Text>
              <Cell cell={r.w} />
              <Cell cell={r.b} />
            </View>
          ))}
        </View>
        <View className="h-3" />
      </ScrollView>

      <View className="px-6 border-t border-line dark:border-line-d" style={{ paddingTop: 12, paddingBottom: insets.bottom + 10 }}>
        <PrimaryButton
          onPress={() => router.push({ pathname: '/review', params: { mode: 'sheet' } })}
          icon="play"
          className={hasIllegal ? 'opacity-40' : ''}>
          Start review
        </PrimaryButton>
      </View>

      {/* suggestion popup */}
      <Modal visible={popupIdx != null && !!popupCell} transparent animationType="fade" onRequestClose={() => setPopupIdx(null)}>
        <Pressable className="flex-1 items-center justify-center px-10" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }} onPress={() => setPopupIdx(null)}>
          <Pressable onPress={() => {}} className="w-full rounded-2xl bg-card dark:bg-card-d border border-line dark:border-line-d p-4">
            <View className="flex-row items-center gap-1.5 mb-1.5">
              <Icon name="alertCircle" size={14} color={C.amber} />
              <Text className="text-[12px] font-semibold text-amber">Doesn’t fit the position</Text>
            </View>
            <Text className="text-[14px] text-ink dark:text-ink-d leading-snug">
              “{popupCell?.san}” isn’t legal here.{popupCell?.suggest?.length ? ' Did you mean:' : ''}
            </Text>
            <View className="flex-row flex-wrap gap-2 mt-3">
              {(popupCell?.suggest ?? []).map((s) => (
                <Pressable
                  key={s}
                  onPress={() => { if (popupIdx != null) setResolved((r) => new Set(r).add(popupIdx)); setPopupIdx(null); }}
                  className="h-10 px-4 rounded-lg bg-sage items-center justify-center">
                  <Text className="text-white text-[13px] font-semibold">{s}</Text>
                </Pressable>
              ))}
              <Pressable onPress={() => setPopupIdx(null)} className="h-10 px-4 rounded-lg border border-line dark:border-line-d items-center justify-center">
                <Text className="text-ink dark:text-ink-d text-[13px] font-medium">Edit manually</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}
