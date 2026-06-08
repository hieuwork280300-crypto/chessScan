# RevenueCat (IAP) — setup checklist

The app code is wired (`src/lib/purchases.ts`). It runs the **stub** in Expo Go and the **real**
RevenueCat flow on a dev/prod build once API keys are set. To make real purchases work, do this
once (requires the owner's developer accounts — an agent can't do these steps):

## 1. Accounts & products
- [ ] **Apple Developer Program** ($99/yr) → App Store Connect: create the app record
      (bundle id `com.chessscan.app`), then **Subscriptions** → a subscription group with two
      auto-renewable products, e.g. `chessscan_yearly` (with a 3-day free intro offer) and
      `chessscan_weekly`. Fill pricing, localizations, sign the Paid Apps agreement.
- [ ] **Google Play Console** ($25 one-time) → create the app (`com.chessscan.app`) →
      **Monetize → Subscriptions**: `chessscan_yearly` (+ free-trial offer) and `chessscan_weekly`.
- [ ] **RevenueCat** (free tier): create a project → add the iOS app (App Store shared secret) and
      Android app (Play service-account JSON).

## 2. RevenueCat config
- [ ] **Entitlement** named **`pro`** (matches `ENTITLEMENT_ID` in `purchases.ts`).
- [ ] **Products**: import `chessscan_yearly` + `chessscan_weekly`, attach both to `pro`.
- [ ] **Offering** = `default` (the code reads `offerings.current`); add packages **Annual** and
      **Weekly** (RevenueCat package types `$rc_annual` / `$rc_weekly`).
- [ ] Copy the **public SDK keys** (Project → API keys): one for Apple, one for Google.

## 3. App env
- [ ] In `.env`: `EXPO_PUBLIC_RC_IOS_KEY=…` and `EXPO_PUBLIC_RC_ANDROID_KEY=…`
      (also add them to EAS: `eas env:create` / the `env` block, so cloud builds get them).

## 4. Build (IAP can't run in Expo Go)
- [ ] `eas build --profile development --platform ios` (and/or android) → install the dev build.
- [ ] `npx expo start --dev-client` and open the dev build (NOT Expo Go).

## 5. Test in sandbox
- [ ] iOS: create a **Sandbox Apple ID** (App Store Connect → Users & Access → Sandbox) and sign
      in on the device when prompted. Trials/renewals run on an accelerated sandbox clock.
- [ ] Android: add your Google account as a **license tester** in Play Console.
- [ ] Run the paywall → Start Free Trial → confirm the StoreKit/Play sheet appears and that
      `pro` becomes active (the app navigates to Home).

## Notes
- Display prices in the paywall currently come from the hardcoded `PLANS` fallback. To show real
  store-localized prices, read them from `Purchases.getOfferings()` and map onto the cards
  (a small follow-up; the purchase itself already uses the real package).
- Gate premium features on `isSubscribed()` (or check the `pro` entitlement) wherever you add
  Pro-only limits later.
- Prices `799.000đ`/`49.000đ` in the code are placeholders — the real charge is whatever you set
  in App Store Connect / Play Console.
