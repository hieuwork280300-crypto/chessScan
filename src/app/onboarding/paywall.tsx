// Paywall — monetization step (free-trial → auto-renew). Real Chess Scan Pro benefits.
// Purchases are STUBBED (lib/purchases) for Expo Go; swap to RevenueCat on a dev build.

import { useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Icon } from '@/components/Icon';
import { C, sub } from '@/constants/colors';
import { useApp } from '@/lib/AppContext';
import { PLANS, DEFAULT_PLAN_ID, startTrial, restorePurchases, type Plan } from '@/lib/purchases';
import { setOnboardingDone } from '@/lib/storage';

const BENEFITS = [
  { emoji: '🔍', title: 'Unlimited scans', sub: 'Scan as many positions & games as you like' },
  { emoji: '🧠', title: 'Full engine depth', sub: 'Deeper Stockfish analysis, all top lines' },
  { emoji: '📋', title: 'Full game review', sub: 'Import score sheets and replay every move' },
  { emoji: '💾', title: 'Save & export PGN', sub: 'Keep your games and share them anywhere' },
];

function PlanCard({ plan, selected, onPress }: { plan: Plan; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className={'rounded-2xl border-2 p-4 ' + (selected ? 'border-sage bg-sage/5' : 'border-line dark:border-line-d bg-card dark:bg-card-d')}>
      <View className="flex-row items-center">
        <View
          className="items-center justify-center mr-3.5"
          style={{ width: 24, height: 24, borderRadius: 12, ...(selected ? { backgroundColor: C.sage } : { borderWidth: 2, borderColor: '#D8CFC0' }) }}>
          {selected && <Icon name="check" size={14} strokeWidth={2.5} color={C.white} />}
        </View>
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="text-[17px] font-bold text-ink dark:text-ink-d">{plan.title}</Text>
            {plan.badge && (
              <View className="px-2 py-0.5 rounded-md bg-sage"><Text className="text-[10px] font-bold text-white tracking-wide">{plan.badge}</Text></View>
            )}
          </View>
          <Text className="text-[14px] text-sub dark:text-sub-d mt-0.5">{plan.priceLabel}</Text>
          {plan.oldPrice && (
            <Text className="text-[12px] text-sub dark:text-sub-d mt-0.5">
              <Text className="line-through">đ{plan.oldPrice}</Text>
            </Text>
          )}
        </View>
        {plan.savePct && (
          <View className="px-2.5 py-1 rounded-lg" style={{ backgroundColor: '#E5533C' }}>
            <Text className="text-[11px] font-bold text-white">SAVE {plan.savePct}%</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

export default function Paywall() {
  const { dark } = useApp();
  const [planId, setPlanId] = useState(DEFAULT_PLAN_ID);
  const [trialOn, setTrialOn] = useState(true);
  const [busy, setBusy] = useState(false);

  async function done() { await setOnboardingDone(); router.replace('/home'); }
  async function purchase() {
    if (busy) return;
    setBusy(true);
    try { if (await startTrial(planId)) await done(); } finally { setBusy(false); }
  }
  async function restore() {
    if (busy) return;
    setBusy(true);
    try { if (await restorePurchases()) await done(); } finally { setBusy(false); }
  }

  const annual = planId === 'annual';
  const cta = trialOn && annual ? 'Start My 3-Day Free Trial' : 'Continue';

  return (
    <Screen>
      {/* close (App Store requires a dismiss) */}
      <View className="flex-row justify-end px-3 pt-1">
        <Pressable onPress={done} className="w-10 h-10 items-center justify-center rounded-full active:bg-black/5 dark:active:bg-white/10">
          <Icon name="x" size={20} color={sub(dark)} />
        </Pressable>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 8 }}>
        <View className="items-center mt-2 mb-1">
          <View className="w-16 h-16 rounded-[22px] bg-sage items-center justify-center"
            style={{ shadowColor: C.sage, shadowOpacity: 0.3, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 6 }}>
            <Text style={{ fontSize: 30, color: '#fff' }}>♛</Text>
          </View>
        </View>
        <Text className="text-center text-ink dark:text-ink-d mt-3" style={{ fontSize: 27, lineHeight: 33, fontWeight: '700' }}>
          Unlock unlimited{'\n'}chess analysis
        </Text>
        <Text className="text-center text-sub dark:text-sub-d mt-2" style={{ fontSize: 15 }}>Free for 3 days · cancel anytime</Text>

        <View className="mt-7 gap-4">
          {BENEFITS.map((b) => (
            <View key={b.title} className="flex-row items-center gap-3.5">
              <View className="w-11 h-11 rounded-2xl bg-sage/12 items-center justify-center">
                <Text style={{ fontSize: 22 }}>{b.emoji}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-[16px] font-bold text-ink dark:text-ink-d">{b.title}</Text>
                <Text className="text-[13px] text-sub dark:text-sub-d mt-0.5">{b.sub}</Text>
              </View>
            </View>
          ))}
        </View>

        <View className="mt-8 gap-3">
          {PLANS.map((p) => <PlanCard key={p.id} plan={p} selected={planId === p.id} onPress={() => setPlanId(p.id)} />)}
        </View>

        <View className="mt-3 flex-row items-center justify-between px-4 h-14 rounded-2xl bg-card dark:bg-card-d border border-line dark:border-line-d">
          <Text className="text-[16px] font-medium text-ink dark:text-ink-d">Free Trial Enabled</Text>
          <Switch value={trialOn} onValueChange={setTrialOn} trackColor={{ true: C.sage, false: '#cfcabf' }} />
        </View>
      </ScrollView>

      <View className="px-6 pb-6 pt-3">
        <Pressable
          onPress={purchase} disabled={busy}
          className="w-full min-h-[56px] rounded-2xl bg-sage flex-row items-center justify-center gap-2"
          style={{ shadowColor: C.sage, shadowOpacity: 0.34, shadowRadius: 22, shadowOffset: { width: 0, height: 8 }, elevation: 6, opacity: busy ? 0.7 : 1 }}>
          {busy ? <ActivityIndicator color="#fff" /> : (
            <>
              <Text className="text-white text-[17px] font-bold">{cta}</Text>
              <Icon name="chevronRight" size={18} color={C.white} />
            </>
          )}
        </Pressable>
        <Text className="text-[12px] text-center text-sub dark:text-sub-d mt-2.5">
          {annual ? 'Then 799.000đ/year. ' : '49.000đ/week. '}Auto-renews until cancelled.
        </Text>

        <View className="flex-row items-center justify-center mt-2" style={{ gap: 20 }}>
          <Pressable onPress={restore} hitSlop={8}><Text className="text-[13px] text-sub dark:text-sub-d">Restore</Text></Pressable>
          <Text className="text-sub dark:text-sub-d">·</Text>
          <Pressable onPress={() => Linking.openURL('https://example.com/terms')} hitSlop={8}><Text className="text-[13px] text-sub dark:text-sub-d">Terms</Text></Pressable>
          <Text className="text-sub dark:text-sub-d">·</Text>
          <Pressable onPress={() => Linking.openURL('https://example.com/privacy')} hitSlop={8}><Text className="text-[13px] text-sub dark:text-sub-d">Privacy</Text></Pressable>
        </View>
      </View>
    </Screen>
  );
}
