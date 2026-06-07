// Onboarding welcome — Chess Scan's real value props (scan position / scan score sheet /
// real engine). Entry of the activation funnel.

import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { C } from '@/constants/colors';

const FEATURES = [
  { emoji: '📸', title: 'Scan any position', sub: 'Photo, screenshot, or paper board → the best move in seconds' },
  { emoji: '📋', title: 'Scan your score sheet', sub: 'Snap a handwritten game and review it move by move' },
  { emoji: '🧠', title: 'Real engine analysis', sub: 'Stockfish shows the top lines and the evaluation' },
];

export default function Welcome() {
  return (
    <Screen>
      <View className="flex-1 px-7 justify-center">
        {/* hero */}
        <View className="items-center mb-12">
          <View
            className="w-24 h-24 rounded-[28px] bg-sage items-center justify-center"
            style={{ shadowColor: C.sage, shadowOpacity: 0.35, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 8 }}>
            <Text style={{ fontSize: 46, color: '#fff', marginTop: -4 }}>♛</Text>
          </View>
          <Text className="mt-6 text-ink dark:text-ink-d" style={{ fontSize: 30, fontWeight: '700' }}>Chess Scan</Text>
          <Text className="mt-2 text-sub dark:text-sub-d text-center" style={{ fontSize: 16, lineHeight: 22 }}>Scan any board. Get the best move in seconds.</Text>
        </View>

        {/* features */}
        <View className="gap-4">
          {FEATURES.map((f) => (
            <View
              key={f.title}
              className="flex-row items-center gap-4 p-4 rounded-2xl bg-card dark:bg-card-d border border-line dark:border-line-d"
              style={{ shadowColor: '#3c2d14', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 1 }}>
              <View className="w-12 h-12 rounded-2xl bg-sage/12 items-center justify-center">
                <Text style={{ fontSize: 24 }}>{f.emoji}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-[16px] font-bold text-ink dark:text-ink-d">{f.title}</Text>
                <Text className="text-[13px] text-sub dark:text-sub-d mt-0.5" style={{ lineHeight: 18 }}>{f.sub}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className="px-7 pb-8">
        <PrimaryButton onPress={() => router.push('/onboarding/quiz')} icon="arrowRight">Get Started</PrimaryButton>
      </View>
    </Screen>
  );
}
