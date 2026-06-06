---
name: eas-build
description: EAS Build / Submit / Update and native-module gotchas for the Chess Scan app. Load when configuring eas.json or app.json, creating a dev build (required for react-native-stockfish), handling iOS/Android signing, OTA updates, or submitting to the App Store / Google Play.
---

# EAS Build Gotchas

Expo's cloud build service. You need it the moment a custom native module (Stockfish) enters — Expo Go can't load native code.

## When you need a dev build vs Expo Go

- **Expo Go**: JS + Expo SDK modules only (camera, image-picker, storage, svg). Weeks 1–2 UI work.
- **Dev build (development client)**: required once `react-native-stockfish` (or any non-Expo native dep) is installed. From then on, run `npx expo start --dev-client`, not the Expo Go QR.
- Signal: if a package has an `ios/`/`android/` folder or a config plugin that patches native code, Expo Go won't run it → dev build.

## eas.json profiles

```jsonc
{
  "cli": { "version": ">= 5.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": { "simulator": true },
      "channel": "development"
    },
    "preview": {
      "distribution": "internal",
      "channel": "preview"
    },
    "production": {
      "autoIncrement": true,
      "channel": "production"
    }
  },
  "submit": { "production": {} }
}
```
- `development` + `developmentClient: true` → the build that loads your local JS via `--dev-client`.
- `ios.simulator: true` makes a Simulator-installable build (no device provisioning) — fastest loop on a Mac.
- `preview` = internal testers (TestFlight-style / APK) without dev tooling.
- `production` = store builds; `autoIncrement` bumps build number.

## First-time setup

```bash
npm i -g eas-cli
eas login
eas build:configure          # generates eas.json, sets up credentials
eas build --profile development --platform ios      # ~10–20 min in cloud
```
- Let EAS manage credentials (recommended) — it creates signing certs/keys for you.
- Android: EAS generates a keystore; **back it up** (lose it = can't update the app on Play).
- iOS: needs an Apple Developer account ($99/yr) for device/TestFlight builds. Simulator builds don't.

## app.json essentials

```jsonc
{
  "expo": {
    "scheme": "chessscan",                 // required for expo-router deep links
    "ios": { "bundleIdentifier": "com.yourco.chessscan", "supportsTablet": true },
    "android": { "package": "com.yourco.chessscan" },
    "plugins": [
      "expo-router",
      ["expo-camera", { "cameraPermission": "Scan chess boards and score sheets." }],
      ["expo-image-picker", { "photosPermission": "Pick a chess photo from your library." }]
      // react-native-stockfish: add its config plugin here if it ships one
    ],
    "updates": { "url": "https://u.expo.dev/<project-id>" },
    "runtimeVersion": { "policy": "appVersion" }
  }
}
```
- `bundleIdentifier` / `package` are permanent once published — choose carefully.
- Permission strings live here (config plugins), NOT hand-edited in Info.plist (managed workflow regenerates native dirs).
- Bump `version` for store releases; build numbers via `autoIncrement`.

## Native module integration (react-native-stockfish)

1. `npm install react-native-stockfish`.
2. `eas build --profile development --platform ios` (and/or android) — CANNOT test in Expo Go.
3. Install the dev build on device/simulator, `npx expo start --dev-client`.
4. If the package lacks a config plugin and needs manual native edits → use `expo prebuild` (generates `ios/`/`android/`) or `patch-package`. Document any patch in the repo.
5. If it won't build (outdated, unmaintained), pivot to the Lichess Cloud Eval fallback (see `stockfish-engine`) — that needs no native build. Decide by Week 2 Day 10.

## EAS Update (OTA)

- Ships JS/asset changes without a store review: `eas update --branch production --message "..."`.
- Only JS/assets — native changes (new native module, permissions) still require a new build + store submit.
- `runtimeVersion` must match between the installed build and the update, or the update is ignored.

## EAS Submit (stores)

```bash
eas submit --profile production --platform ios       # → App Store Connect / TestFlight
eas submit --profile production --platform android    # → Play Console
```
- iOS: needs App Store Connect API key or app-specific password. TestFlight for the 5-tester beta (Week 6).
- Android: upload to Internal Testing track first; service-account JSON for automated submit.
- Store metadata (screenshots 6.7"+5.5", description, privacy policy URL, ToS) prepared in Weeks 9–10.

## Common pitfalls

- **Env vars**: `EXPO_PUBLIC_*` are embedded at build time — set them in EAS (`eas env` / `eas.json` `env`) for cloud builds; local `.env` only affects local bundling.
- Build fails on a native dep version mismatch → run `npx expo install --check` / `expo-doctor` before building.
- iOS build stuck on provisioning → let EAS manage credentials; don't mix manual + managed.
- Forgetting `--dev-client` after adding native code → app loads but the native module is `undefined`.
- Keystore/cert loss → keep EAS-managed or back up exports securely.
