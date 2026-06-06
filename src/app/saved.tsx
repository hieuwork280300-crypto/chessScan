// Saved Games — library grid. Mock data for now (real persistence wired later).

import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';

import { Screen } from '@/components/ui/Screen';
import { IconButton } from '@/components/ui/IconButton';
import { Board } from '@/components/Board';
import { Icon } from '@/components/Icon';
import { useApp } from '@/lib/AppContext';
import { C } from '@/constants/colors';
import { SAVED_GAMES, savedBoard } from '@/lib/mockData';
import type { SavedGame } from '@/types/chess';

function GameCard({ game }: { game: SavedGame }) {
  const b = savedBoard(game);
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/review', params: { mode: game.type === 'P' ? 'position' : 'sheet', title: game.title } })}
      className="w-[47%] active:opacity-80">
      <View className="rounded-[12px] overflow-hidden border border-line dark:border-line-d relative">
        <Board position={b.pos} size={160} arrows={b.arrow ? [{ from: b.arrow[0], to: b.arrow[1], width: 4 }] : null} />
        <View className="absolute top-1.5 left-1.5 w-5 h-5 rounded-md items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}>
          <Icon name={game.type === 'P' ? 'image' : 'fileText'} size={12} strokeWidth={2} color={C.white} />
        </View>
      </View>
      <Text numberOfLines={1} className="mt-2 text-[13px] font-semibold text-ink dark:text-ink-d">{game.title}</Text>
      <Text className="text-[11px] text-sub dark:text-sub-d">{game.event} · {game.dateSavedLabel}</Text>
    </Pressable>
  );
}

export default function Saved() {
  const { t } = useApp();
  return (
    <Screen>
      <View className="flex-row items-center px-3 pb-1">
        <IconButton name="chevronLeft" label="Back" onPress={() => router.back()} />
        <Text className="text-[20px] font-bold text-ink dark:text-ink-d ml-1">{t('home.savedGames')}</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-4 pb-10">
        <View className="flex-row flex-wrap justify-between gap-y-5 mt-2">
          {SAVED_GAMES.map((g) => <GameCard key={g.id} game={g} />)}
        </View>
      </ScrollView>
    </Screen>
  );
}
