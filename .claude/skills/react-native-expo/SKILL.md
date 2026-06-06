---
name: react-native-expo
description: React Native + Expo SDK 50 patterns and gotchas for the Chess Scan app. Load when building screens, wiring expo-router navigation, requesting camera/photo permissions, using Expo modules (camera, image-picker, image, file-system, secure-store, async-storage), handling Expo Go vs dev build, or debugging RN-specific layout/render issues.
---

# React Native + Expo Patterns

Stack: RN 0.73, Expo SDK 50, expo-router 3.4, TypeScript strict. Managed workflow → dev build only when a native module forces it (Stockfish).

## expo-router (file-based navigation)

- Routes live in `app/`. File name = route segment. `_layout.tsx` defines a Stack/Tabs for its folder.
- Groups in parens `(onboarding)`, `(tabs)` organize without adding a URL segment.
- Dynamic route: `app/game/[id].tsx` → read with `const { id } = useLocalSearchParams<{ id: string }>()`.
- Navigate: `import { router } from 'expo-router'; router.push('/scan/capture?type=position')`.
  Pass params via query string or `router.push({ pathname: '/game/[id]', params: { id } })`.
- Typed routes: enable `experiments.typedRoutes` in app.json for autocomplete on hrefs.
- `<Link href="...">` for declarative nav; `router.back()` to pop.
- Root `app/_layout.tsx` mounts global providers (Theme, Language, Profile) around `<Slot />` or `<Stack />`.

### First-launch / onboarding gate
Read `onboarding-completed` from AsyncStorage in root layout; redirect with `<Redirect href="/(onboarding)/intro" />` until set. Render a splash/null while the flag loads to avoid a flash.

## Permissions (camera + photos)

- Declare in `app.json` via the config plugin, NOT raw Info.plist:
  ```json
  ["expo-camera", { "cameraPermission": "Scan chess boards and score sheets." }],
  ["expo-image-picker", { "photosPermission": "Pick a chess photo from your library." }]
  ```
- Request at runtime with the hook: `const [perm, requestPerm] = useCameraPermissions()`.
- Always handle denial: show an "Open Settings" button → `Linking.openSettings()`. Never assume granted.
- `expo-camera` works in **Expo Go**. `react-native-stockfish` does NOT → needs a dev build.

## Camera + image pipeline (Scan Capture)

```ts
import { CameraView, useCameraPermissions } from 'expo-camera';
// capture
const photo = await cameraRef.current?.takePictureAsync({ quality: 0.7, base64: false });
// resize BEFORE base64 to cut Gemini cost/latency
import * as ImageManipulator from 'expo-image-manipulator';
const out = await ImageManipulator.manipulateAsync(
  photo.uri,
  [{ resize: { width: 1024 } }],
  { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
);
// out.base64 → recognizePosition(out.base64)
```
- Gallery: `expo-image-picker` `launchImageLibraryAsync({ mediaTypes: 'images', quality: 0.7 })`.
- Strip the `data:image/jpeg;base64,` prefix — Gemini wants raw base64.

## Storage

- `@react-native-async-storage/async-storage` for profile/games/settings (JSON.stringify arrays/objects).
- `expo-secure-store` for anything sensitive (not needed v1 without auth; reserve for tokens in v2).
- Wrap all reads/writes in `lib/storage.ts` with typed getters/setters + try/catch. Never call AsyncStorage from a screen directly.

## Layout / styling gotchas

- No CSS — `StyleSheet.create`, flexbox only (default `flexDirection: 'column'`).
- Use `SafeAreaView` / `useSafeAreaInsets` (react-native-safe-area-context) for notch/home-bar padding.
- Text MUST be inside `<Text>`; bare strings in a `<View>` crash.
- `KeyboardAvoidingView` for the Save dialog inputs (`behavior="padding"` iOS, `"height"` Android).
- Dimensions: prefer flex + `%`; for the board use `Dimensions.get('window').width` minus padding, keep it square (`aspectRatio: 1`).
- Images: use `expo-image` (`<Image>`) for caching/perf, not RN core Image.

## Expo Go vs Dev Build

- Expo Go: instant testing of JS + Expo SDK modules (camera, picker, storage). Use for Weeks 1–2 UI.
- Dev build (EAS): required once `react-native-stockfish` (or any custom native) is added. See `eas-build` skill.
- After adding a native module, `npx expo start --dev-client` (not the Expo Go QR).

## Performance

- `React.memo` the board + move-strip rows; they re-render on every ply change otherwise.
- `useCallback` for `onMove`/nav handlers passed to memoized children.
- `FlatList` (not `.map` in ScrollView) for the saved-games list.
- Avoid inline object/array literals in props on hot paths (breaks memo).

## Common pitfalls

- `process.env.EXPO_PUBLIC_*` is inlined at build time — restart the dev server after editing `.env`.
- Async state set after unmount → guard with an `isMounted` ref or AbortController.
- expo-router needs `"scheme"` in app.json for deep links and the `main` entry set to `expo-router/entry`.
