// Home — two scan tiles + saved games rail. Ported from prototype.

import { useCallback, useState } from 'react';
import { ScrollView, Text, View, Pressable } from 'react-native';
import { router, useFocusEffect } from 'expo-router';

import { Screen } from '@/components/ui/Screen';
import { SettingsButton } from '@/components/ui/SettingsButton';
import { Board } from '@/components/Board';
import { Icon, type IconName } from '@/components/Icon';
import { useApp } from '@/lib/AppContext';
import { fenToPos } from '@/lib/board';
import { SCAN_FEN } from '@/constants/chess';
import { C } from '@/constants/colors';
import { boardForGame, loadGames, openGame } from '@/lib/games';
import type { SavedGame } from '@/types/chess';

function MiniSheetArt() {
  const rows = [['1', 'e4', 'e5'], ['2', 'Nf3', 'Nc6'], ['3', 'Bb5', '']];
  return (
    <View className="w-[72px] h-[72px] rounded-[8px] overflow-hidden bg-paper border border-paper-line">
      <Text className="px-2 pt-1.5 text-[6px] text-paper-label font-semibold uppercase">Score sheet</Text>
      {rows.map((r, i) => (
        <View key={i} className="flex-row px-2 border-t border-dashed border-paper-line">
          <Text className="w-[10px] text-[7px] text-paper-label">{r[0]}</Text>
          <Text className="flex-1 font-hand text-[12px] text-paper-ink">{r[1]}</Text>
          <Text className="flex-1 font-hand text-[12px] text-paper-ink">{r[2]}</Text>
        </View>
      ))}
    </View>
  );
}

function HomeTile({ icon, title, sub, art, onPress }: {
  icon: IconName; title: string; sub: string; art: React.ReactNode; onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-4 rounded-[20px] p-4 pl-5 bg-card dark:bg-card-d border border-line dark:border-line-d active:opacity-95"
      style={{ shadowColor: '#3c2d14', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 2 }, elevation: 1 }}>
      <View className="flex-1">
        <View className="w-11 h-11 rounded-2xl bg-sage/15 items-center justify-center">
          <Icon name={icon} size={22} color={C.sage} />
        </View>
        <Text className="mt-3.5 text-[20px] font-bold text-ink dark:text-ink-d">{title}</Text>
        <Text className="mt-0.5 text-[14px] text-sub dark:text-sub-d">{sub}</Text>
      </View>
      <View className="rounded-[10px] overflow-hidden border border-line dark:border-line-d">{art}</View>
    </Pressable>
  );
}

function TypeChip({ type }: { type: 'P' | 'S' }) {
  return (
    <View className="absolute top-1.5 left-1.5 w-5 h-5 rounded-md items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}>
      <Icon name={type === 'P' ? 'image' : 'fileText'} size={12} strokeWidth={2} color={C.white} />
    </View>
  );
}

function SavedThumb({ game }: { game: SavedGame }) {
  const b = boardForGame(game);
  return (
    <Pressable onPress={() => openGame(game)} className="w-[88px] active:opacity-70">
      <View className="rounded-[10px] overflow-hidden border border-line dark:border-line-d">
        <Board position={b.pos} size={88} arrows={b.arrow ? [{ from: b.arrow[0], to: b.arrow[1], width: 4 }] : null} />
        <TypeChip type={game.type} />
      </View>
      <Text numberOfLines={1} className="mt-2 text-[12px] font-semibold text-ink dark:text-ink-d">{game.title}</Text>
      <Text className="text-[11px] text-sub dark:text-sub-d">{game.dateSavedLabel}</Text>
    </Pressable>
  );
}

export default function Home() {
  const { t } = useApp();
  const [games, setGames] = useState<SavedGame[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadGames().then((g) => { if (active) setGames(g); });
      return () => { active = false; };
    }, []),
  );

  return (
    <Screen>
      <View className="flex-row items-center justify-between px-5 pb-1">
        <View>
          <Text className="text-[13px] font-medium text-sage">{t('home.greeting')}</Text>
          <Text className="text-[26px] font-bold text-ink dark:text-ink-d">Chess Scan</Text>
        </View>
        <SettingsButton />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-8">
        <View className="gap-3.5 mt-2">
          <HomeTile
            icon="scan" title={t('home.scanPosition')} sub={t('home.scanPositionSub')}
            art={<Board position={fenToPos(SCAN_FEN)} size={72} arrows={[{ from: 'd3', to: 'd4', width: 4, glow: true }]} />}
            onPress={() => router.push({ pathname: '/camera', params: { mode: 'board' } })}
          />
          <HomeTile
            icon="sheet" title={t('home.scanSheet')} sub={t('home.scanSheetSub')}
            art={<MiniSheetArt />}
            onPress={() => router.push({ pathname: '/camera', params: { mode: 'sheet' } })}
          />
        </View>

        <View className="mt-8">
          <Pressable onPress={() => router.push('/saved')} className="flex-row items-center justify-between mb-3">
            <Text className="text-[14px] font-semibold text-ink dark:text-ink-d">{t('home.savedGames')}</Text>
            <View className="flex-row items-center gap-1">
              <Text className="text-[13px] font-medium text-sage">{t('home.all')}</Text>
              <Icon name="arrowRight" size={16} strokeWidth={1.75} color={C.sage} />
            </View>
          </Pressable>
          {games.length === 0 ? (
            <View className="rounded-[14px] border border-dashed border-line dark:border-line-d px-4 py-6 items-center">
              <Icon name="bookmark" size={22} color={C.sub} />
              <Text className="mt-2 text-[13px] text-sub dark:text-sub-d text-center">
                No saved games yet. Scan a position or game, then tap Save.
              </Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-4">
              {games.map((g) => <SavedThumb key={g.id} game={g} />)}
            </ScrollView>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}
