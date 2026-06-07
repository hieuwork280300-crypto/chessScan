// Onboarding quiz — short, relevant to Chess Scan's users (scan positions / score sheets).
// Builds investment before the paywall; answers stored for later personalization.

import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Icon } from '@/components/Icon';
import { C, ink } from '@/constants/colors';
import { useApp } from '@/lib/AppContext';
import { saveQuiz } from '@/lib/storage';

interface Question { key: string; emoji: string; title: string; options: string[]; cta?: string }

const QUESTIONS: Question[] = [
  { key: 'level', emoji: '👋', title: "What's your chess level?",
    options: ['Complete beginner', 'I know the basics', 'Intermediate', 'Advanced / Expert'] },
  { key: 'where', emoji: '♟️', title: 'Where do you usually play?',
    options: ['Online (Chess.com / Lichess)', 'Over the board', 'In tournaments', 'Casual with friends'] },
  { key: 'scan', emoji: '📸', title: 'What will you scan most?',
    options: ['Positions to solve', 'Photos of real boards', 'Paper score sheets', 'Online screenshots'] },
  { key: 'goal', emoji: '🏆', title: "What's your main goal?", cta: "Let's start analyzing!",
    options: ['Find the best move', 'Review my games', 'Reach a higher rating', 'Learn tactics & patterns'] },
];

function Progress({ step, count }: { step: number; count: number }) {
  return (
    <View className="flex-row items-center">
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} className="flex-row items-center" style={{ flex: i < count - 1 ? 1 : 0 }}>
          <View className={'h-2 rounded-full ' + (i <= step ? 'w-2 bg-sage' : 'w-2 bg-[#D8CFC0] dark:bg-[#33373c]')} />
          {i < count - 1 && <View className={'flex-1 h-[3px] mx-1.5 rounded-full ' + (i < step ? 'bg-sage' : 'bg-[#E4DCCD] dark:bg-[#2a2d31]')} />}
        </View>
      ))}
    </View>
  );
}

export default function Quiz() {
  const { dark } = useApp();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const q = QUESTIONS[step];
  const selected = answers[q.key];
  const isLast = step === QUESTIONS.length - 1;

  function back() {
    if (step > 0) setStep(step - 1);
    else router.back();
  }
  function next() {
    if (!selected) return;
    if (isLast) {
      saveQuiz(answers);
      router.push('/onboarding/analyzing');
    } else {
      setStep(step + 1);
    }
  }

  return (
    <Screen>
      {/* header */}
      <View className="flex-row items-center px-2 pb-1">
        <Pressable onPress={back} className="flex-row items-center min-h-[44px] pr-3 active:opacity-60">
          <Icon name="chevronLeft" size={22} color={ink(dark)} />
          <Text className="text-[17px] text-ink dark:text-ink-d ml-1">Back</Text>
        </Pressable>
      </View>
      <View className="px-7 pt-2">
        <Progress step={step} count={QUESTIONS.length} />
      </View>

      {/* question */}
      <View className="flex-1 px-7 pt-10">
        <View className="items-center">
          <View className="w-16 h-16 rounded-full bg-sage/10 items-center justify-center">
            <Text style={{ fontSize: 34 }}>{q.emoji}</Text>
          </View>
        </View>
        <Text
          className="mt-5 text-center text-ink dark:text-ink-d"
          style={{ fontSize: 26, lineHeight: 32, fontWeight: '700' }}>
          {q.title}
        </Text>

        <View className="mt-9 gap-3.5">
          {q.options.map((opt) => {
            const active = selected === opt;
            return (
              <Pressable
                key={opt}
                onPress={() => setAnswers((a) => ({ ...a, [q.key]: opt }))}
                className={'flex-row items-center px-5 rounded-2xl border active:opacity-90 ' +
                  (active ? 'bg-sage border-sage' : 'bg-card dark:bg-card-d border-line dark:border-line-d')}
                style={[
                  { minHeight: 62 },
                  active
                    ? { shadowColor: C.sage, shadowOpacity: 0.3, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 4 }
                    : { shadowColor: '#3c2d14', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
                ]}>
                <Text
                  className={'flex-1 font-semibold ' + (active ? 'text-white' : 'text-ink dark:text-ink-d')}
                  style={{ fontSize: 17 }}>
                  {opt}
                </Text>
                {active && (
                  <View className="w-7 h-7 rounded-full bg-white items-center justify-center">
                    <Icon name="check" size={16} strokeWidth={2.5} color={C.sage} />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      <View className="px-7 pb-8">
        <PrimaryButton onPress={next} className={selected ? '' : 'opacity-40'}>
          {isLast ? (q.cta ?? 'Continue') : 'Next'}
        </PrimaryButton>
      </View>
    </Screen>
  );
}
