// Confirm Sheet — review OCR'd moves, resolve flagged ones (ambiguous / illegal), then review.
// Cascade-aware in spirit: flagged moves get a top suggestion to accept. Mock flags for now.

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
import { GAME_PLIES, GAME_POSITIONS } from '@/lib/mockData';
import { C } from '@/constants/colors';

type Flag = { type: 'ambiguous' | 'illegal'; suggest: string };
const FLAGS: Record<number, Flag> = {
  3: { type: 'ambiguous', suggest: 'Nf6' },
  7: { type: 'illegal', suggest: 'Bc5' },
};

interface RowData { n: number; wIdx: number; bIdx: number }

export default function ConfirmSheet() {
  const { dark, t } = useApp();
  const insets = useSafeAreaInsets();
  const [cursor, setCursor] = useState(2);
  const [resolved, setResolved] = useState<Set<number>>(() => new Set());
  const [popup, setPopup] = useState<number | null>(null);

  const rows = useMemo<RowData[]>(() => {
    const out: RowData[] = [];
    for (let i = 0; i < GAME_PLIES.length; i += 2) out.push({ n: i / 2 + 1, wIdx: i, bIdx: i + 1 });
    return out;
  }, []);

  const unresolved = Object.keys(FLAGS).map(Number).filter((k) => !resolved.has(k));
  const popupFlag = popup != null ? FLAGS[popup] : null;

  function Cell({ idx }: { idx: number }) {
    const ply = GAME_PLIES[idx];
    if (!ply) return <View className="flex-1 min-h-[40px]" />;
    const flag = FLAGS[idx];
    const bad = flag && !resolved.has(idx);
    const active = cursor === idx;
    return (
      <Pressable
        onPress={() => { setCursor(idx); setPopup(bad ? idx : null); }}
        className={'flex-1 min-h-[40px] pl-3 pr-2 rounded-lg flex-row items-center ' +
          (active ? 'bg-sage/15' : bad ? 'bg-amber/10' : '')}>
        <Text className={'text-[16px] font-medium ' +
          (active ? 'text-sage' : 'text-ink dark:text-ink-d') +
          (bad && flag.type === 'illegal' ? ' underline' : '')}
          style={{ fontVariant: ['tabular-nums'] }}>
          {ply.san}
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
            position={GAME_POSITIONS[cursor + 1]} size={156} dark={dark}
            arrows={[{ from: GAME_PLIES[cursor].from, to: GAME_PLIES[cursor].to, width: 6 }]}
          />
        </View>
        <View className="flex-1">
          <Text className="text-[16px] font-semibold text-ink dark:text-ink-d">{GAME_PLIES[cursor].name}</Text>
          {unresolved.length > 0 ? (
            <View className="mt-1.5 flex-row items-start gap-1.5">
              <View className="w-2 h-2 rounded-full bg-amber mt-1.5" />
              <Text className="text-[13px] text-amber font-medium flex-1">
                {unresolved.length} move{unresolved.length > 1 ? 's' : ''} need your attention.
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
              <Cell idx={r.wIdx} />
              <Cell idx={r.bIdx} />
            </View>
          ))}
        </View>
        <View className="h-3" />
      </ScrollView>

      <View className="px-6 border-t border-line dark:border-line-d" style={{ paddingTop: 12, paddingBottom: insets.bottom + 10 }}>
        <PrimaryButton onPress={() => router.push({ pathname: '/review', params: { mode: 'sheet' } })} icon="play">Start review</PrimaryButton>
      </View>

      {/* suggestion popup */}
      <Modal visible={popup != null && !!popupFlag} transparent animationType="fade" onRequestClose={() => setPopup(null)}>
        <Pressable className="flex-1 items-center justify-center px-10" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }} onPress={() => setPopup(null)}>
          <Pressable onPress={() => {}} className="w-full rounded-2xl bg-card dark:bg-card-d border border-line dark:border-line-d p-4">
            <View className="flex-row items-center gap-1.5 mb-1.5">
              <Icon name="alertCircle" size={14} color={C.amber} />
              <Text className="text-[12px] font-semibold text-amber">
                {popupFlag?.type === 'illegal' ? "Doesn't fit the position" : 'Hard to read'}
              </Text>
            </View>
            <Text className="text-[14px] text-ink dark:text-ink-d leading-snug">
              This looks like <Text className="font-semibold">{popupFlag?.suggest}</Text>. Tap to use it.
            </Text>
            <View className="flex-row gap-2 mt-3">
              <Pressable
                onPress={() => { if (popup != null) setResolved((s) => new Set(s).add(popup)); setPopup(null); }}
                className="flex-1 h-10 rounded-lg bg-sage items-center justify-center">
                <Text className="text-white text-[13px] font-semibold">Accept {popupFlag?.suggest}</Text>
              </Pressable>
              <Pressable onPress={() => setPopup(null)} className="flex-1 h-10 rounded-lg border border-line dark:border-line-d items-center justify-center">
                <Text className="text-ink dark:text-ink-d text-[13px] font-medium">Edit manually</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}
