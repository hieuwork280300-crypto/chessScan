// Camera — live preview, capture or pick from gallery, then recognize → confirm screen.
// Recognition is mocked until a Gemini key is wired (see lib/recognition.ts).

import { useRef, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';

import { Icon } from '@/components/Icon';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { recognizePosition, recognizeScoreSheet } from '@/lib/recognition';
import { C } from '@/constants/colors';

function CornerFrame() {
  const corner = 'absolute w-7 h-7 border-white/90';
  return (
    <View className="absolute inset-0 items-center justify-center" pointerEvents="none">
      <View className="w-[78%] aspect-square relative">
        <View className={corner + ' top-0 left-0 border-t-[3px] border-l-[3px] rounded-tl-md'} />
        <View className={corner + ' top-0 right-0 border-t-[3px] border-r-[3px] rounded-tr-md'} />
        <View className={corner + ' bottom-0 left-0 border-b-[3px] border-l-[3px] rounded-bl-md'} />
        <View className={corner + ' bottom-0 right-0 border-b-[3px] border-r-[3px] rounded-br-md'} />
      </View>
    </View>
  );
}

export default function Camera() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isSheet = mode === 'sheet';
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [busy, setBusy] = useState(false);

  async function recognizeAndGo(uri?: string) {
    setBusy(true);
    try {
      if (isSheet) { await recognizeScoreSheet(uri); router.replace('/confirm-sheet'); }
      else { await recognizePosition(uri); router.replace('/confirm-position'); }
    } finally {
      setBusy(false);
    }
  }

  async function capture() {
    if (busy) return;
    const photo = await cameraRef.current?.takePictureAsync({ quality: 0.7 });
    await recognizeAndGo(photo?.uri);
  }

  async function pickGallery() {
    if (busy) return;
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', quality: 0.7 });
    if (!res.canceled) await recognizeAndGo(res.assets[0]?.uri);
  }

  // permission states
  if (!permission) {
    return <View className="flex-1 bg-[#0c0d0f] items-center justify-center"><ActivityIndicator color="#fff" /></View>;
  }
  if (!permission.granted) {
    return (
      <View className="flex-1 bg-[#0c0d0f] items-center justify-center px-8" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
        <Icon name="camera" size={40} color="#fff" />
        <Text className="text-white text-[17px] font-semibold mt-4 text-center">Camera access needed</Text>
        <Text className="text-white/60 text-[14px] mt-2 text-center">Allow camera to scan boards and score sheets.</Text>
        <View className="h-5" />
        {permission.canAskAgain ? (
          <PrimaryButton onPress={requestPermission}>Allow camera</PrimaryButton>
        ) : (
          <PrimaryButton onPress={() => Linking.openSettings()}>Open Settings</PrimaryButton>
        )}
        <Pressable onPress={() => router.back()} className="mt-3 h-11 px-6 items-center justify-center">
          <Text className="text-white/70 text-[15px]">Use the gallery instead</Text>
        </Pressable>
        <Pressable onPress={pickGallery} className="mt-1 h-11 px-6 items-center justify-center">
          <Text className="text-sage text-[15px] font-semibold">Pick a photo</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#0c0d0f]">
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />
      <View className="absolute inset-0">
        <CornerFrame />

        {/* top bar */}
        <View className="flex-row items-center justify-between px-3" style={{ paddingTop: insets.top + 4 }}>
          <Pressable onPress={() => router.back()} className="w-11 h-11 rounded-full items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
            <Icon name="x" size={20} color="#fff" />
          </Pressable>
          <View className="px-4 py-2 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
            <Text className="text-white text-[14px] font-medium">
              {isSheet ? 'Frame the score sheet' : 'Frame the board'}
            </Text>
          </View>
          <View className="w-11" />
        </View>

        {/* bottom controls */}
        <View className="absolute left-0 right-0 flex-row items-center justify-around px-8" style={{ bottom: insets.bottom + 20 }}>
          <Pressable onPress={pickGallery} className="w-12 h-12 rounded-full items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
            <Icon name="image" size={22} color="#fff" />
          </Pressable>
          <Pressable onPress={capture} className="w-[76px] h-[76px] rounded-full bg-white items-center justify-center active:opacity-80">
            <View className="w-[62px] h-[62px] rounded-full bg-white items-center justify-center" style={{ borderWidth: 3, borderColor: '#0c0d0f' }}>
              <Icon name="camera" size={26} strokeWidth={1.75} color="#0c0d0f" />
            </View>
          </Pressable>
          <View className="w-12" />
        </View>
      </View>

      {busy && (
        <View className="absolute inset-0 items-center justify-center" style={{ backgroundColor: 'rgba(8,9,11,0.7)' }}>
          <ActivityIndicator color={C.sage} size="large" />
          <Text className="text-white text-[15px] font-medium mt-3">Recognizing…</Text>
        </View>
      )}
    </View>
  );
}
