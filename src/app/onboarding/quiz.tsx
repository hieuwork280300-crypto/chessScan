// Onboarding quiz — selectable cards (icon + title + description, sage tick when chosen),
// no radio dots. Tap a card to select, then Continue. Each step slides in (RN Animated).

import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Icon } from '@/components/Icon';
import { C, ink } from '@/constants/colors';
import { useApp } from '@/lib/AppContext';
import { saveQuiz } from '@/lib/storage';

interface Opt { icon: string; label: string; desc: string }
interface Question { key: string; emoji: string; title: string; subtitle: string; options: Opt[] }

const QUESTIONS: Question[] = [
  {
    key: 'level', emoji: '👋', title: "What's your chess level?", subtitle: 'This helps us personalize your experience.',
    options: [
      { icon: '🌱', label: 'Complete beginner', desc: "I'm new to chess and learning the game." },
      { icon: '♟️', label: 'I know the basics', desc: 'I know how the pieces move and the rules.' },
      { icon: '📈', label: 'Intermediate', desc: 'I play regularly and understand basic strategies.' },
      { icon: '👑', label: 'Advanced / Expert', desc: 'I have a strong rating and deep understanding.' },
    ],
  },
  {
    key: 'where', emoji: '♟️', title: 'Where do you usually play?', subtitle: "We'll tailor your analysis to your games.",
    options: [
      { icon: '🌐', label: 'Online', desc: 'Chess.com, Lichess and other apps.' },
      { icon: '♟️', label: 'Over the board', desc: 'Real boards at home or a club.' },
      { icon: '🏆', label: 'In tournaments', desc: 'Rated, competitive games.' },
      { icon: '👥', label: 'Casual with friends', desc: 'Relaxed games, just for fun.' },
    ],
  },
  {
    key: 'scan', emoji: '📸', title: 'What will you scan most?', subtitle: "We'll optimize the scanner for you.",
    options: [
      { icon: '🧩', label: 'Positions to solve', desc: 'Find the best move in a position.' },
      { icon: '📷', label: 'Photos of real boards', desc: 'Snap a physical chess board.' },
      { icon: '📝', label: 'Paper score sheets', desc: 'Digitize handwritten games.' },
      { icon: '🖥️', label: 'Online screenshots', desc: 'Capture positions from a screen.' },
    ],
  },
  {
    key: 'goal', emoji: '🏆', title: "What's your main goal?", subtitle: "We'll focus on what matters to you.",
    options: [
      { icon: '🎯', label: 'Find the best move', desc: 'Instant engine recommendations.' },
      { icon: '🔁', label: 'Review my games', desc: 'Learn from every move you make.' },
      { icon: '📈', label: 'Reach a higher rating', desc: 'Train and climb the ranks.' },
      { icon: '🧠', label: 'Learn tactics & patterns', desc: 'Master key chess ideas.' },
    ],
  },
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

function Card({ opt, active, onPress, dark }: { opt: Opt; active: boolean; onPress: () => void; dark: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      className={'w-full flex-row items-center ' +
        (active ? 'border-2 border-sage bg-sage/10' : 'border border-line dark:border-line-d bg-card dark:bg-card-d')}
      style={({ pressed }) => ({
        borderRadius: 18,
        paddingVertical: 16,
        paddingHorizontal: 16,
        transform: [{ scale: pressed ? 0.99 : 1 }],
        shadowColor: '#000',
        shadowOpacity: dark ? 0.35 : 0.05,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
      })}>
      {/* icon tile */}
      <View
        style={{
          width: 58, height: 58, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
          backgroundColor: active ? (dark ? '#23332a' : '#E3EDE5') : dark ? '#23262b' : '#F4F1EA',
        }}>
        <Text style={{ fontSize: 30 }}>{opt.icon}</Text>
      </View>
      {/* text — title and subtitle with clear spacing */}
      <View style={{ flex: 1, marginLeft: 16, marginRight: 8 }}>
        <Text className="text-ink dark:text-ink-d" style={{ fontSize: 20, lineHeight: 23, fontWeight: '800' }}>{opt.label}</Text>
        <Text className="text-sub dark:text-sub-d" style={{ fontSize: 15, lineHeight: 20, marginTop: 6 }} numberOfLines={2}>{opt.desc}</Text>
      </View>
      {/* check (only when selected) */}
      {active && (
        <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: C.sage, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="check" size={18} strokeWidth={3} color={C.white} />
        </View>
      )}
    </Pressable>
  );
}

export default function Quiz() {
  const { dark } = useApp();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const anim = useRef(new Animated.Value(1)).current;

  const q = QUESTIONS[step];
  const isLast = step === QUESTIONS.length - 1;
  const picked = answers[q.key];

  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, { toValue: 1, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [step, anim]);

  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [26, 0] });

  function back() {
    if (step > 0) setStep(step - 1);
    else router.back();
  }
  function cont() {
    if (!picked) return;
    Animated.timing(anim, { toValue: 0, duration: 170, easing: Easing.in(Easing.cubic), useNativeDriver: true }).start(() => {
      if (isLast) {
        saveQuiz(answers);
        router.push('/onboarding/analyzing');
      } else {
        setStep((s) => s + 1);
      }
    });
  }

  return (
    <Screen edges={{ top: true, bottom: false }}>
      <View className="flex-row items-center px-2 pb-1">
        <Pressable onPress={back} className="flex-row items-center min-h-[44px] pr-3 active:opacity-60">
          <Icon name="chevronLeft" size={22} color={ink(dark)} />
          <Text className="text-[17px] text-ink dark:text-ink-d ml-1">Back</Text>
        </Pressable>
      </View>
      <View className="px-6 pt-2">
        <Progress step={step} count={QUESTIONS.length} dark={dark} />
        <Text className="mt-2 text-sub dark:text-sub-d" style={{ fontSize: 13 }}>Step {step + 1} of {QUESTIONS.length}</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 16, paddingBottom: 16 }}>
        <Animated.View style={{ opacity: anim, transform: [{ translateX }] }}>
          <View className="items-center">
            <View className="w-16 h-16 rounded-full bg-sage/10 items-center justify-center">
              <Text style={{ fontSize: 32 }}>{q.emoji}</Text>
            </View>
            <Text className="mt-4 text-center text-ink dark:text-ink-d" style={{ fontSize: 28, lineHeight: 34, fontWeight: '800' }}>{q.title}</Text>
            <Text className="mt-2.5 text-center text-sub dark:text-sub-d" style={{ fontSize: 16, lineHeight: 22 }}>{q.subtitle}</Text>
          </View>

          <View className="mt-7" style={{ gap: 14 }}>
            {q.options.map((opt) => (
              <Card key={opt.label} opt={opt} active={picked === opt.label} dark={dark} onPress={() => setAnswers((a) => ({ ...a, [q.key]: opt.label }))} />
            ))}
          </View>
        </Animated.View>
      </ScrollView>

      <View className="px-6 pt-2" style={{ paddingBottom: 24 }}>
        <PrimaryButton onPress={cont} className={picked ? '' : 'opacity-40'}>Continue</PrimaryButton>
      </View>
    </Screen>
  );
}
