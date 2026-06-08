// IAP via RevenueCat — real on a dev/prod build with API keys, STUB in Expo Go (so the
// onboarding funnel still runs without a native build). The rest of the app calls this
// interface only and never touches RevenueCat directly.
//
// Real path activates when ALL of these are true:
//   • running in a dev/standalone build (not Expo Go), and
//   • EXPO_PUBLIC_RC_IOS_KEY / EXPO_PUBLIC_RC_ANDROID_KEY are set.
// Otherwise it falls back to the AsyncStorage stub (marks subscribed locally).

import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { loadSubscribed, setSubscribed } from '@/lib/storage';

// RevenueCat entitlement id (configure this in the RevenueCat dashboard).
const ENTITLEMENT_ID = 'pro';

const IS_EXPO_GO = Constants.executionEnvironment === 'storeClient';
const RC_KEY = Platform.select({
  ios: process.env.EXPO_PUBLIC_RC_IOS_KEY,
  android: process.env.EXPO_PUBLIC_RC_ANDROID_KEY,
});

// Conditionally load the native SDK; never imported in Expo Go (would throw).
// reason: native module is absent in Expo Go, so it must be required lazily.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Purchases: any = null;
if (!IS_EXPO_GO) {
  try {
    Purchases = require('react-native-purchases').default;
  } catch {
    Purchases = null;
  }
}

let configured = false;
async function ensureConfigured(): Promise<boolean> {
  if (IS_EXPO_GO || !Purchases || !RC_KEY) return false;
  if (!configured) {
    Purchases.configure({ apiKey: RC_KEY });
    configured = true;
  }
  return true;
}

export const REAL_IAP_AVAILABLE = !IS_EXPO_GO && !!RC_KEY;

export interface Plan {
  id: string;
  title: string;
  priceLabel: string;
  monthly?: string;
  trialDays?: number;
  badge?: string;
  ribbon?: string;
  savePct?: number;
  oldPrice?: string;
}

// Display fallback (used in Expo Go / before offerings load). Real prices come from the
// store via RevenueCat offerings on a dev build.
export const PLANS: Plan[] = [
  { id: 'annual', title: 'Yearly', priceLabel: 'then 799.000đ / year', monthly: '~66.500đ / month',
    trialDays: 3, badge: '3-DAY FREE TRIAL', ribbon: 'BEST VALUE', savePct: 69, oldPrice: '2.548.000' },
  { id: 'weekly', title: 'Weekly', priceLabel: '49.000đ / week' },
];

export const DEFAULT_PLAN_ID = 'annual';

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function hasPro(customerInfo: any): boolean {
  return !!customerInfo?.entitlements?.active?.[ENTITLEMENT_ID];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function packageForPlan(planId: string): Promise<any | null> {
  const offerings = await Purchases.getOfferings();
  const offering = offerings?.current;
  if (!offering) return null;
  if (planId === 'weekly') return offering.weekly ?? null;
  return offering.annual ?? offering.monthly ?? null;
}

// Returns true if the user ends up entitled (purchased / already had it).
export async function startTrial(planId: string): Promise<boolean> {
  if (!(await ensureConfigured())) {
    await delay(900); // stub: simulate the StoreKit sheet
    await setSubscribed(true);
    return true;
  }
  try {
    const pkg = await packageForPlan(planId);
    if (!pkg) return false;
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return hasPro(customerInfo);
  } catch (e) {
    // user cancelled the StoreKit sheet → not an error to surface
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((e as any)?.userCancelled) return false;
    throw e;
  }
}

export async function restorePurchases(): Promise<boolean> {
  if (!(await ensureConfigured())) {
    await delay(700);
    return loadSubscribed();
  }
  const customerInfo = await Purchases.restorePurchases();
  return hasPro(customerInfo);
}

export async function isSubscribed(): Promise<boolean> {
  if (!(await ensureConfigured())) return loadSubscribed();
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return hasPro(customerInfo);
  } catch {
    return false;
  }
}
