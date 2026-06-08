// Onboarding quiz — tapping an answer gives press feedback and auto-advances; each new
// question fades + slides in (RN Animated, no worklets). → analyzing → paywall.

import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Icon } from '@/components/Icon';
import { C, ink } from '@/constants/colors';
import { useApp } from '@/lib/AppContext';
import { saveQuiz } from '@/lib/storage';

interface Question { key: string; emoji: string; title: string; options: string[] }

const QUESTIONS: Question[] = [
  { key: 'level', emoji: '👋', title: "What's your chess level?",
    options: ['Complete beginner', 'I know the basics', 'Intermediate', 'Advanced / Expert'] },
  { key: 'where', emoji: '♟️', title: 'Where do you usually play?',
    options: ['Online (Chess.com / Lichess)', 'Over the board', 'In tournaments', 'Casual with friends'] },
  { key: 'scan', emoji: '📸', title: 'What will you scan most?',
    options: ['Positions to solve', 'Photos of real boards', 'Paper score sheets', 'Online screenshots'] },
  { key: 'goal', emoji: '🏆', title: "What's your main goal?",
    options: ['Find the best move', 'Review my games', 'Reach a higher rating', 'Learn tactics & patterns'] },
];

function Progress({ step, count, dark }: { step: number; count: number; dark: boolean }) {
  return (
    <View className="flex-row" style={{ gap: 7 }}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: i <= step ? C.sage : dark ? '#2a2d31' : '#E4DCCD' }} />
      ))}
    </View>
  );
}

function Option({ label, active, onPress, disabled }: { label: string; active: boolean; onPress: () => void; disabled: boolean }) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      className={'flex-row items-center px-5 border ' +
        (active ? 'bg-sage border-sage' : 'bg-card dark:bg-card-d border-line dark:border-line-d')}
      style={({ pressed }) => ({
        minHeight: 62,
        borderRadius: 16,
        transform: [{ scale: pressed ? 0.985 : 1 }],
        // identical, subtle shadow in both states so shape stays consistent
        shadowColor: '#3c2d14',
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      })}>
      <Text className={'flex-1 font-semibold ' + (active ? 'text-white' : 'text-ink dark:text-ink-d')} style={{ fontSize: 17 }}>
        {label}
      </Text>
      {active && (
        <View className="w-7 h-7 rounded-full bg-white items-center justify-center">
          <Icon name="check" size={16} strokeWidth={2.5} color={C.sage} />
        </View>
      )}
    </Pressable>
  );
}

export default function Quiz() {
  const { dark } = useApp();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [picked, setPicked] = useState<string | null>(null);
  const advancing = useRef(false);
  const anim = useRef(new Animated.Value(1)).current;

  const q = QUESTIONS[step];
  const isLast = step === QUESTIONS.length - 1;

  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, { toValue: 1, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [step, anim]);

  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [26, 0] });

  function back() {
    if (advancing.current) return;
    if (step > 0) { const ps = step - 1; setStep(ps); setPicked(answers[QUESTIONS[ps].key] ?? null); }
    else router.back();
  }

  function choose(opt: string) {
    if (advancing.current) return;
    advancing.current = true;
    setPicked(opt);
    const nextAnswers = { ...answers, [q.key]: opt };
    setAnswers(nextAnswers);
    setTimeout(() => {
      // slide current out, then swap + slide in (handled by the step effect)
      Animated.timing(anim, { toValue: 0, duration: 180, easing: Easing.in(Easing.cubic), useNativeDriver: true }).start(() => {
        advancing.current = false;
        if (isLast) {
          saveQuiz(nextAnswers);
          router.push('/onboarding/analyzing');
        } else {
          setStep((s) => s + 1);
          setPicked(null);
        }
      });
    }, 240);
  }

  return (
    <Screen>
      <View className="flex-row items-center px-2 pb-1">
        <Pressable onPress={back} className="flex-row items-center min-h-[44px] pr-3 active:opacity-60">
          <Icon name="chevronLeft" size={22} color={ink(dark)} />
          <Text className="text-[17px] text-ink dark:text-ink-d ml-1">Back</Text>
        </Pressable>
      </View>
      <View className="px-7 pt-2">
        <Progress step={step} count={QUESTIONS.length} dark={dark} />
        <Text className="mt-2 text-sub dark:text-sub-d" style={{ fontSize: 13 }}>Step {step + 1} of {QUESTIONS.length}</Text>
      </View>

      <Animated.View style={{ flex: 1, paddingHorizontal: 28, paddingTop: 40, opacity: anim, transform: [{ translateX }] }}>
        <View className="items-center">
          <View className="w-16 h-16 rounded-full bg-sage/10 items-center justify-center">
            <Text style={{ fontSize: 34 }}>{q.emoji}</Text>
          </View>
        </View>
        <Text className="mt-5 text-center text-ink dark:text-ink-d" style={{ fontSize: 26, lineHeight: 32, fontWeight: '700' }}>
          {q.title}
        </Text>

        <View className="mt-9 gap-3.5">
          {q.options.map((opt) => (
            <Option key={opt} label={opt} active={picked === opt} disabled={advancing.current} onPress={() => choose(opt)} />
          ))}
        </View>
      </Animated.View>
    </Screen>
  );
}
