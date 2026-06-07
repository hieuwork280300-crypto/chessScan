// Paywall — the funnel's monetization step. Free-trial → auto-renew model.
// Purchases are STUBBED (lib/purchases) for Expo Go; swap to RevenueCat on a dev build.

import { useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Icon, type IconName } from '@/components/Icon';
import { C, sub } from '@/constants/colors';
import { useApp } from '@/lib/AppContext';
import { PLANS, DEFAULT_PLAN_ID, startTrial, restorePurchases, type Plan } from '@/lib/purchases';
import { setOnboardingDone } from '@/lib/storage';

const FEATURES: { icon: IconName; title: string; sub: string }[] = [
  { icon: 'scan', title: 'AI Chess Analysis', sub: 'Advanced AI analyzes your positions and moves' },
  { icon: 'fileText', title: 'Strategic Insights', sub: 'Personalized recommendations to improve your game' },
  { icon: 'play', title: 'Real-time Analysis', sub: 'Instant position evaluation and move suggestions' },
];

function PlanCard({ plan, selected, onPress }: { plan: Plan; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className={'rounded-2xl border p-4 ' + (selected ? 'border-sage bg-sage/8' : 'border-line dark:border-line-d bg-card dark:bg-card-d')}>
      <View className="flex-row items-center">
        <View className="flex-1">
          <Text className="text-[18px] font-bold text-ink dark:text-ink-d">{plan.title}</Text>
          {plan.priceLabel && <Text className="text-[14px] text-sub dark:text-sub-d mt-0.5">{plan.priceLabel}</Text>}
          {(plan.oldPrice || plan.savePct) && (
            <View className="flex-row items-center gap-2 mt-1">
              {plan.oldPrice && <Text className="text-[13px] text-sub dark:text-sub-d line-through">đ{plan.oldPrice}</Text>}
              {plan.savePct && <Text className="text-[13px] font-bold text-ink dark:text-ink-d">SAVE {plan.savePct}%</Text>}
            </View>
          )}
        </View>
        <View className="items-end gap-1.5">
          {plan.badge && (
            <View className="px-2 py-1 rounded-md bg-[#33373d]"><Text className="text-[11px] font-bold text-white">{plan.badge}</Text></View>
          )}
          {plan.savePct && (
            <View className="px-2 py-1 rounded-md" style={{ backgroundColor: '#E5533C' }}>
              <Text className="text-[11px] font-bold text-white">SAVE {plan.savePct}%</Text>
            </View>
          )}
          <View className={'w-6 h-6 rounded-full items-center justify-center ' + (selected ? 'bg-sage' : 'border-2 border-[#CFC6B4] dark:border-[#3a3d42]')}>
            {selected && <Icon name="check" size={14} strokeWidth={2.5} color={C.white} />}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export default function Paywall() {
  const { dark } = useApp();
  const [planId, setPlanId] = useState(DEFAULT_PLAN_ID);
  const [trialOn, setTrialOn] = useState(true);
  const [busy, setBusy] = useState(false);

  async function complete(toHome: () => void) {
    await setOnboardingDone();
    toHome();
  }
  async function purchase() {
    if (busy) return;
    setBusy(true);
    try {
      const ok = await startTrial(planId);
      if (ok) await complete(() => router.replace('/home'));
    } finally {
      setBusy(false);
    }
  }
  async function restore() {
    if (busy) return;
    setBusy(true);
    try {
      const ok = await restorePurchases();
      if (ok) await complete(() => router.replace('/home'));
    } finally {
      setBusy(false);
    }
  }
  function dismiss() {
    // App Store compliance: allow closing the paywall into the app (no entitlement).
    complete(() => router.replace('/home'));
  }

  const annual = planId === 'annual';
  const cta = trialOn && annual ? 'Start Your 3-Day Free Trial' : 'Subscribe Now';

  return (
    <Screen>
      <View className="flex-row justify-end px-3">
        <Pressable onPress={dismiss} className="w-11 h-11 items-center justify-center rounded-full active:bg-black/5 dark:active:bg-white/10">
          <Icon name="x" size={20} color={sub(dark)} />
        </Pressable>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <Text className="text-[30px] font-bold text-center text-ink dark:text-ink-d leading-9 mt-2">
          Unlock Your Chess Mastery Today
        </Text>

        <View className="mt-7 gap-5">
          {FEATURES.map((f) => (
            <View key={f.title} className="flex-row items-start gap-3">
              <View className="w-9 h-9 rounded-xl bg-sage/15 items-center justify-center mt-0.5">
                <Icon name={f.icon} size={19} color={C.sage} />
              </View>
              <View className="flex-1">
                <Text className="text-[17px] font-bold text-ink dark:text-ink-d">{f.title}</Text>
                <Text className="text-[14px] text-sub dark:text-sub-d mt-0.5">{f.sub}</Text>
              </View>
            </View>
          ))}
        </View>

        <View className="mt-8 gap-3">
          {PLANS.map((p) => (
            <PlanCard key={p.id} plan={p} selected={planId === p.id} onPress={() => setPlanId(p.id)} />
          ))}
        </View>

        <View className="mt-3 flex-row items-center justify-between px-4 h-14 rounded-2xl bg-card dark:bg-card-d border border-line dark:border-line-d">
          <Text className="text-[16px] text-ink dark:text-ink-d">Free Trial Enabled</Text>
          <Switch value={trialOn} onValueChange={setTrialOn} trackColor={{ true: C.sage, false: '#cfcabf' }} />
        </View>
        <View className="h-3" />
      </ScrollView>

      <View className="px-6 pb-6 pt-2">
        <Pressable
          onPress={purchase} disabled={busy}
          className="w-full min-h-[54px] rounded-2xl bg-sage flex-row items-center justify-center gap-2"
          style={{ shadowColor: C.sage, shadowOpacity: 0.34, shadowRadius: 22, shadowOffset: { width: 0, height: 8 }, elevation: 6, opacity: busy ? 0.7 : 1 }}>
          {busy ? <ActivityIndicator color="#fff" /> : (
            <>
              <Text className="text-white text-[17px] font-semibold">{cta}</Text>
              <Icon name="chevronRight" size={18} color={C.white} />
            </>
          )}
        </Pressable>

        <Pressable onPress={restore} className="mt-3 h-10 flex-row items-center justify-center gap-1.5 active:opacity-60">
          <Icon name="rotate" size={15} color={sub(dark)} />
          <Text className="text-[14px] text-sub dark:text-sub-d">Restore Purchases</Text>
        </Pressable>
        <View className="flex-row items-center justify-center gap-2">
          <Pressable onPress={() => Linking.openURL('https://example.com/terms')}><Text className="text-[13px] text-sub dark:text-sub-d">Terms of Use</Text></Pressable>
          <Text className="text-sub dark:text-sub-d">·</Text>
          <Pressable onPress={() => Linking.openURL('https://example.com/privacy')}><Text className="text-[13px] text-sub dark:text-sub-d">Privacy Policy</Text></Pressable>
        </View>
      </View>
    </Screen>
  );
}
