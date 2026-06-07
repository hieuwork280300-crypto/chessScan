// IAP abstraction — STUBBED for Expo Go. Swap the bodies for RevenueCat
// (react-native-purchases) on an EAS dev build; the rest of the app calls this interface only.
//
// To wire real purchases later:
//   1. npx expo install react-native-purchases
//   2. Configure products in App Store Connect + Google Play Console (auto-renewable subs).
//   3. Purchases.configure({ apiKey }); fetch offerings; purchasePackage(); check entitlements.
//   4. Replace startTrial/restore/isSubscribed below. Needs a dev build (no IAP in Expo Go).

import { loadSubscribed, setSubscribed } from '@/lib/storage';

export interface Plan {
  id: string;
  title: string;
  priceLabel: string;       // e.g. "799.000đ per year"
  sublabel?: string;        // e.g. "then ..."
  trialDays?: number;
  badge?: string;           // "FREE"
  savePct?: number;         // 69
  oldPrice?: string;        // strikethrough
  highlight?: boolean;
}

// Pricing mirrors the reference funnel (VND). Real prices come from store offerings later.
export const PLANS: Plan[] = [
  {
    id: 'annual', title: '3-Day Trial', priceLabel: 'then 799.000đ per year',
    trialDays: 3, badge: 'FREE', savePct: 69, oldPrice: '2.548.000', highlight: true,
  },
  { id: 'weekly', title: 'Weekly Plan', priceLabel: '49.000đ per week' },
];

export const DEFAULT_PLAN_ID = 'annual';

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// Start the selected plan (free trial). STUB: simulates the StoreKit purchase sheet.
export async function startTrial(_planId: string): Promise<boolean> {
  await delay(900);
  await setSubscribed(true);
  return true;
}

export async function restorePurchases(): Promise<boolean> {
  await delay(700);
  return loadSubscribed();
}

export const isSubscribed = loadSubscribed;
