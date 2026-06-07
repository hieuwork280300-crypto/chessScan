// Onboarding interstitial — "building your personalized plan". Animated progress + a
// checklist that ticks through, personalized from the quiz answers, then → paywall.
// (Pure UX/conversion step; no real computation.)

import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Icon } from '@/components/Icon';
import { C } from '@/constants/colors';
import { useApp } from '@/lib/AppContext';
import { loadQuiz } from '@/lib/storage';

const STEPS = [
  'Reviewing your skill level',
  'Tuning engine analysis depth',
  'Personalizing recommendations',
  'Preparing your plan',
];
const STEP_MS = 650;

export default function Analyzing() {
  const { dark } = useApp();
  const [doneCount, setDoneCount] = useState(0);
  const [level, setLevel] = useState<string | null>(null);
  const progress = useRef(new Animated.Value(0)).current;
  const pct = useRef(new Animated.Value(0)).current;
  const [pctText, setPctText] = useState(0);

  useEffect(() => {
    loadQuiz().then((q) => setLevel(q.level ?? null));

    Animated.timing(progress, {
      toValue: 1,
      duration: STEPS.length * STEP_MS,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: false,
    }).start();

    const id = pct.addListener(({ value }) => setPctText(Math.round(value)));
    Animated.timing(pct, { toValue: 100, duration: STEPS.length * STEP_MS, easing: Easing.inOut(Easing.cubic), useNativeDriver: false }).start();

    const timers = STEPS.map((_, i) => setTimeout(() => setDoneCount(i + 1), STEP_MS * (i + 1)));
    const go = setTimeout(() => router.replace('/onboarding/paywall'), STEPS.length * STEP_MS + 500);

    return () => {
      pct.removeListener(id);
      timers.forEach(clearTimeout);
      clearTimeout(go);
    };
  }, [pct, progress]);

  const width = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <Screen>
      <View className="flex-1 px-8 justify-center">
        <View className="items-center mb-10">
          <Text className="text-ink dark:text-ink-d" style={{ fontSize: 52, fontWeight: '800' }}>{pctText}%</Text>
          <Text className="mt-3 text-center text-ink dark:text-ink-d" style={{ fontSize: 22, fontWeight: '700' }}>
            Building your{'\n'}personalized plan
          </Text>
          {level && (
            <Text className="mt-2 text-center text-sub dark:text-sub-d" style={{ fontSize: 14 }}>
              Tailored for “{level}”
            </Text>
          )}
        </View>

        {/* progress bar */}
        <View style={{ height: 10, borderRadius: 999, overflow: 'hidden', backgroundColor: dark ? '#2a2d31' : '#E4DCCD' }}>
          <Animated.View style={{ height: 10, width, backgroundColor: C.sage, borderRadius: 999 }} />
        </View>

        {/* checklist */}
        <View className="mt-8 gap-3.5">
          {STEPS.map((s, i) => {
            const done = i < doneCount;
            const active = i === doneCount;
            return (
              <View key={s} className="flex-row items-center gap-3">
                <View
                  className="items-center justify-center"
                  style={{
                    width: 26, height: 26, borderRadius: 13,
                    ...(done ? { backgroundColor: C.sage } : { borderWidth: 2, borderColor: active ? C.sage : '#D8CFC0' }),
                  }}>
                  {done && <Icon name="check" size={15} strokeWidth={2.5} color={C.white} />}
                </View>
                <Text
                  className={done || active ? 'text-ink dark:text-ink-d' : 'text-sub dark:text-sub-d'}
                  style={{ fontSize: 16, fontWeight: done || active ? '600' : '400' }}>
                  {s}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </Screen>
  );
}
