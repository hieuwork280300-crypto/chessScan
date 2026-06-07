// Onboarding welcome — value props + Get Started. Entry of the activation funnel.

import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Icon } from '@/components/Icon';
import { C } from '@/constants/colors';

const FEATURES = [
  { emoji: '🧠', title: 'AI-Powered Analysis', sub: 'Scan any position, get the best move instantly' },
  { emoji: '📈', title: 'Strategic Insights', sub: 'Review your games move by move with the engine' },
  { emoji: '🏆', title: 'Improve Your Game', sub: 'Elevate your chess skills to the next level' },
];

export default function Welcome() {
  return (
    <Screen>
      <View className="flex-1 px-7 justify-center">
        <View className="items-center">
          <View className="w-28 h-28 rounded-full bg-sage/15 items-center justify-center">
            <Text style={{ fontSize: 52, color: C.sage }}>♛</Text>
          </View>
          <Text className="mt-6 text-[34px] font-bold text-ink dark:text-ink-d">Chess Scan</Text>
          <Text className="mt-2 text-[16px] text-sub dark:text-sub-d">Master chess with AI analysis</Text>
        </View>

        <View className="mt-12 gap-6">
          {FEATURES.map((f) => (
            <View key={f.title} className="flex-row items-center gap-4">
              <View className="w-12 h-12 rounded-2xl bg-card dark:bg-card-d border border-line dark:border-line-d items-center justify-center">
                <Text style={{ fontSize: 24 }}>{f.emoji}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-[17px] font-bold text-ink dark:text-ink-d">{f.title}</Text>
                <Text className="text-[14px] text-sub dark:text-sub-d mt-0.5">{f.sub}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className="px-7 pb-6">
        <PrimaryButton onPress={() => router.push('/onboarding/quiz')} icon="arrowRight">Get Started</PrimaryButton>
      </View>
    </Screen>
  );
}
