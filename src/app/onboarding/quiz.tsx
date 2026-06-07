// Onboarding quiz — 4 single-select questions with a connected progress indicator.
// Answers are stored (for later personalization) and the funnel proceeds to the paywall.

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
  { key: 'level', emoji: '👋', title: "What's your current chess skill level?",
    options: ['Complete beginner', 'I know the basics', 'Intermediate player', 'Advanced/Expert'] },
  { key: 'frequency', emoji: '⏰', title: 'How often do you play chess?',
    options: ['Daily', 'Few times a week', 'Occasionally', 'Just starting out'] },
  { key: 'improve', emoji: '🎯', title: 'What do you want to improve most?',
    options: ['Opening theory', 'Middle game tactics', 'Endgame technique', 'Overall strategy'] },
  { key: 'goal', emoji: '🏆', title: "What's your main chess goal?", cta: "Let's start analyzing!",
    options: ['Beat my friends', 'Reach a higher rating', 'Learn for fun', 'Compete in tournaments'] },
];

function Progress({ step, count }: { step: number; count: number }) {
  return (
    <View className="flex-row items-center px-2">
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} className="flex-row items-center" style={{ flex: i < count - 1 ? 1 : 0 }}>
          <View className={'w-3.5 h-3.5 rounded-full ' + (i <= step ? 'bg-sage' : 'bg-[#D8CFC0] dark:bg-[#33373c]')} />
          {i < count - 1 && <View className={'flex-1 h-[2px] mx-1 ' + (i < step ? 'bg-sage' : 'bg-[#D8CFC0] dark:bg-[#33373c]')} />}
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
      router.push('/onboarding/paywall');
    } else {
      setStep(step + 1);
    }
  }

  return (
    <Screen>
      <View className="flex-row items-center px-2 pb-2">
        <Pressable onPress={back} className="flex-row items-center min-h-[44px] pr-3 active:opacity-60">
          <Icon name="chevronLeft" size={22} color={ink(dark)} />
          <Text className="text-[17px] text-ink dark:text-ink-d ml-1">Back</Text>
        </Pressable>
      </View>

      <View className="px-6 pt-2">
        <Progress step={step} count={QUESTIONS.length} />
      </View>

      <View className="flex-1 px-6 pt-8">
        <Text className="text-[44px] text-center">{q.emoji}</Text>
        <Text className="mt-4 text-[26px] font-bold text-center text-ink dark:text-ink-d leading-8">{q.title}</Text>

        <View className="mt-8 gap-3">
          {q.options.map((opt) => {
            const active = selected === opt;
            return (
              <Pressable
                key={opt}
                onPress={() => setAnswers((a) => ({ ...a, [q.key]: opt }))}
                className={'flex-row items-center min-h-[60px] px-5 rounded-2xl border ' +
                  (active ? 'bg-sage border-sage' : 'bg-card dark:bg-card-d border-line dark:border-line-d')}>
                <Text className={'flex-1 text-[17px] font-medium ' + (active ? 'text-white' : 'text-ink dark:text-ink-d')}>{opt}</Text>
                {active && (
                  <View className="w-6 h-6 rounded-full bg-white items-center justify-center">
                    <Icon name="check" size={15} strokeWidth={2.5} color={C.sage} />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      <View className="px-6 pb-6">
        <PrimaryButton onPress={next} className={selected ? '' : 'opacity-40'}>
          {isLast ? (q.cta ?? 'Continue') : 'Next'}
        </PrimaryButton>
      </View>
    </Screen>
  );
}
