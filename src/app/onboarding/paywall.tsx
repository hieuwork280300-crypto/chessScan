// Paywall — monetization step (free-trial → auto-renew). Premium, trust-building layout.
// Purchases are STUBBED (lib/purchases) for Expo Go; swap to RevenueCat on a dev build.

import { useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Icon } from '@/components/Icon';
import { C, sub } from '@/constants/colors';
import { useApp } from '@/lib/AppContext';
import { PLANS, DEFAULT_PLAN_ID, startTrial, restorePurchases, type Plan } from '@/lib/purchases';
import { setOnboardingDone } from '@/lib/storage';

const BENEFITS = [
  'Unlimited position & game scans',
  'Full-depth Stockfish, all top lines',
  'Review whole games from score sheets',
  'Save your games & export to PGN',
];

function PlanCard({ plan, selected, onPress, dark }: { plan: Plan; selected: boolean; onPress: () => void; dark: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        borderRadius: 18, borderWidth: 2, padding: 16, paddingTop: plan.ribbon ? 22 : 16,
        borderColor: selected ? C.sage : dark ? '#2A2D31' : '#E4DCCD',
        backgroundColor: selected ? (dark ? '#1b241f' : '#EEF3EF') : dark ? '#1E2024' : '#FFFFFF',
      }}>
      {plan.ribbon && (
        <View style={{ position: 'absolute', top: -11, left: 16, backgroundColor: C.sage, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 }}>
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 0.4 }}>{plan.ribbon}</Text>
        </View>
      )}
      <View className="flex-row items-center">
        <View
          className="items-center justify-center mr-3.5"
          style={{ width: 24, height: 24, borderRadius: 12, ...(selected ? { backgroundColor: C.sage } : { borderWidth: 2, borderColor: dark ? '#3a3d42' : '#D8CFC0' }) }}>
          {selected && <Icon name="check" size={14} strokeWidth={2.5} color={C.white} />}
        </View>
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="text-ink dark:text-ink-d" style={{ fontSize: 18, fontWeight: '700' }}>{plan.title}</Text>
            {plan.badge && (
              <View style={{ backgroundColor: dark ? '#2a3a31' : '#E0EAE2', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 }}>
                <Text style={{ color: C.sage, fontSize: 10, fontWeight: '800', letterSpacing: 0.3 }}>{plan.badge}</Text>
              </View>
            )}
          </View>
          <Text className="text-sub dark:text-sub-d mt-1" style={{ fontSize: 13.5 }}>{plan.priceLabel}</Text>
          {plan.oldPrice && (
            <Text className="text-sub dark:text-sub-d mt-0.5" style={{ fontSize: 12 }}>
              <Text style={{ textDecorationLine: 'line-through' }}>đ{plan.oldPrice}</Text>
              {plan.savePct ? `  ·  save ${plan.savePct}%` : ''}
            </Text>
          )}
        </View>
        {plan.monthly && (
          <View className="items-end">
            <Text className="text-ink dark:text-ink-d" style={{ fontSize: 15, fontWeight: '700' }}>{plan.monthly.split(' / ')[0]}</Text>
            <Text className="text-sub dark:text-sub-d" style={{ fontSize: 11 }}>/ month</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

export default function Paywall() {
  const { dark } = useApp();
  const [planId, setPlanId] = useState(DEFAULT_PLAN_ID);
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
  const cta = annual ? 'Start My 3-Day Free Trial' : 'Continue';

  return (
    <Screen>
      <View className="flex-row justify-end px-3 pt-1">
        <Pressable onPress={done} className="w-10 h-10 items-center justify-center rounded-full active:bg-black/5 dark:active:bg-white/10">
          <Icon name="x" size={20} color={sub(dark)} />
        </Pressable>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 8 }}>
        <View className="items-center mt-1">
          <View className="items-center justify-center" style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: C.sage, shadowColor: C.sage, shadowOpacity: 0.3, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 6 }}>
            <Text style={{ fontSize: 32, color: '#fff', marginTop: -2 }}>♛</Text>
          </View>
        </View>
        <Text className="text-center text-ink dark:text-ink-d mt-4" style={{ fontSize: 28, lineHeight: 34, fontWeight: '800' }}>
          Get unlimited{'\n'}chess analysis
        </Text>

        {/* benefits checklist */}
        <View className="mt-6 gap-3">
          {BENEFITS.map((b) => (
            <View key={b} className="flex-row items-center gap-3">
              <View className="items-center justify-center" style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: dark ? '#2a3a31' : '#E0EAE2' }}>
                <Icon name="check" size={14} strokeWidth={3} color={C.sage} />
              </View>
              <Text className="flex-1 text-ink dark:text-ink-d" style={{ fontSize: 15.5, fontWeight: '500' }}>{b}</Text>
            </View>
          ))}
        </View>

        {/* plans */}
        <View className="gap-3.5" style={{ marginTop: 30 }}>
          {PLANS.map((p) => <PlanCard key={p.id} plan={p} selected={planId === p.id} onPress={() => setPlanId(p.id)} dark={dark} />)}
        </View>

        {/* reassurance */}
        <View className="flex-row items-center justify-center gap-2 mt-5">
          <Icon name="check" size={15} strokeWidth={2.5} color={C.sage} />
          <Text className="text-sub dark:text-sub-d" style={{ fontSize: 13 }}>No payment now · cancel anytime</Text>
        </View>
      </ScrollView>

      {/* CTA + footer */}
      <View className="px-6 pb-6 pt-3">
        <Pressable
          onPress={purchase} disabled={busy}
          className="w-full flex-row items-center justify-center gap-2"
          style={{ minHeight: 56, borderRadius: 18, backgroundColor: C.sage, shadowColor: C.sage, shadowOpacity: 0.34, shadowRadius: 22, shadowOffset: { width: 0, height: 8 }, elevation: 6, opacity: busy ? 0.7 : 1 }}>
          {busy ? <ActivityIndicator color="#fff" /> : (
            <>
              <Text style={{ color: '#fff', fontSize: 17, fontWeight: '700' }}>{cta}</Text>
              <Icon name="chevronRight" size={18} color={C.white} />
            </>
          )}
        </Pressable>
        <Text className="text-center text-sub dark:text-sub-d mt-2.5" style={{ fontSize: 12 }}>
          {annual ? 'Then 799.000đ/year. ' : '49.000đ/week. '}Auto-renews until cancelled.
        </Text>

        <View className="flex-row items-center justify-center mt-2.5" style={{ gap: 8 }}>
          <Pressable onPress={restore} hitSlop={10} className="px-2 py-1"><Text className="text-sub dark:text-sub-d" style={{ fontSize: 12.5 }}>Restore</Text></Pressable>
          <Text className="text-sub dark:text-sub-d" style={{ fontSize: 12 }}>·</Text>
          <Pressable onPress={() => Linking.openURL('https://example.com/terms')} hitSlop={10} className="px-2 py-1"><Text className="text-sub dark:text-sub-d" style={{ fontSize: 12.5 }}>Terms</Text></Pressable>
          <Text className="text-sub dark:text-sub-d" style={{ fontSize: 12 }}>·</Text>
          <Pressable onPress={() => Linking.openURL('https://example.com/privacy')} hitSlop={10} className="px-2 py-1"><Text className="text-sub dark:text-sub-d" style={{ fontSize: 12.5 }}>Privacy</Text></Pressable>
        </View>
      </View>
    </Screen>
  );
}
