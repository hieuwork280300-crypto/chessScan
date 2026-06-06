// Onboarding — 2 pages (board scan + score-sheet scan). Ported from prototype.

import { useState } from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';

import { Screen } from '@/components/ui/Screen';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { TextLink } from '@/components/ui/TextLink';
import { PageDots } from '@/components/ui/PageDots';
import { SettingsButton } from '@/components/ui/SettingsButton';
import { Board } from '@/components/Board';
import { Icon } from '@/components/Icon';
import { useApp } from '@/lib/AppContext';
import { fenToPos } from '@/lib/board';
import { KT99_FEN } from '@/constants/chess';
import { C } from '@/constants/colors';
import { setOnboardingDone } from '@/lib/storage';

function BoardArt() {
  return (
    <View className="items-center justify-center h-[290px]">
      <View className="rounded-[26px] p-3 bg-card dark:bg-card-d border border-line dark:border-line-d"
        style={{ shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 46, shadowOffset: { width: 0, height: 22 }, elevation: 8 }}>
        <Board position={fenToPos(KT99_FEN)} size={214} arrows={[{ from: 'd1', to: 'd4', glow: true }]} />
        <View className="flex-row items-center gap-2 px-1 pt-2.5 pb-0.5">
          <View className="w-1.5 h-1.5 rounded-full bg-sage" />
          <Text className="text-[12px] font-semibold text-ink dark:text-ink-d">
            Rook takes d4 <Text className="font-medium text-sub dark:text-sub-d">— a rook sacrifice that wins.</Text>
          </Text>
        </View>
      </View>
    </View>
  );
}

function SheetArt() {
  const rows = [['1.', 'e4', 'e5'], ['2.', 'Nf3', 'Nc6'], ['3.', 'Bb5', 'a6'], ['4.', 'Ba4', 'Nf6']];
  const read = [['1', 'e4', 'e5'], ['2', 'Nf3', 'Nc6'], ['3', 'Bb5', 'a6']];
  return (
    <View className="items-center justify-center h-[290px]">
      <View
        className="w-[186px] bg-paper rounded-[10px] overflow-hidden border border-paper-line"
        style={{ transform: [{ rotate: '-6deg' }] }}>
        <Text className="px-4 pt-3 pb-1 text-[11px] text-paper-label font-semibold uppercase">Score sheet</Text>
        {rows.map((r, i) => (
          <View key={i} className="flex-row px-4 py-1 border-t border-dashed border-paper-line">
            <Text className="w-[26px] text-[12px] text-paper-label">{r[0]}</Text>
            <Text className="flex-1 font-hand text-[22px] text-paper-ink">{r[1]}</Text>
            <Text className="flex-1 font-hand text-[22px] text-paper-ink">{r[2]}</Text>
          </View>
        ))}
      </View>
      <View
        className="absolute right-2 bottom-3 w-[128px] rounded-[24px] p-3 bg-card dark:bg-card-d border border-line dark:border-line-d"
        style={{ shadowColor: '#000', shadowOpacity: 0.22, shadowRadius: 38, shadowOffset: { width: 0, height: 18 }, elevation: 8 }}>
        {read.map((r, i) => (
          <View key={i} className="flex-row gap-1 py-1">
            <Text className="w-4 text-[12px] text-sub dark:text-sub-d">{r[0]}</Text>
            <Text className="flex-1 text-[12px] font-medium text-ink dark:text-ink-d">{r[1]}</Text>
            <Text className="flex-1 text-[12px] font-medium text-ink dark:text-ink-d">{r[2]}</Text>
          </View>
        ))}
        <View className="mt-1.5 flex-row items-center gap-1.5">
          <Icon name="check" size={14} strokeWidth={2} color={C.sage} />
          <Text className="text-[11px] font-semibold text-sage">Read</Text>
        </View>
      </View>
    </View>
  );
}

export default function Onboarding() {
  const { t } = useApp();
  const [index, setIndex] = useState(0);

  function finish() {
    setOnboardingDone();
    router.replace('/home');
  }
  function next() {
    if (index === 0) setIndex(1);
    else finish();
  }

  const isFirst = index === 0;

  return (
    <Screen>
      <View className="flex-row justify-end px-3">
        <SettingsButton />
      </View>

      <View className="flex-1 justify-center px-7">
        {isFirst ? <BoardArt /> : <SheetArt />}
        <View className="mt-8">
          <Text className="text-[28px] leading-[33px] font-bold text-ink dark:text-ink-d">
            {t(isFirst ? 'onb1.title' : 'onb2.title')}
          </Text>
          <Text className="mt-3 text-[16px] leading-6 text-sub dark:text-sub-d">
            {t(isFirst ? 'onb1.body' : 'onb2.body')}
          </Text>
        </View>
      </View>

      <View className="px-7 pb-6">
        <PageDots index={index} />
        <View className="mt-6">
          {isFirst ? (
            <View className="flex-row justify-end">
              <TextLink onPress={next} icon="arrowRight">{t('onb.next')}</TextLink>
            </View>
          ) : (
            <PrimaryButton onPress={next}>{t('onb.getStarted')}</PrimaryButton>
          )}
        </View>
      </View>
    </Screen>
  );
}
