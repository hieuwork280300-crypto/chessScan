import '../global.css';

import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack, SplashScreen } from 'expo-router';
import {
  useFonts,
  Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold,
} from '@expo-google-fonts/inter';
import { Caveat_500Medium } from '@expo-google-fonts/caveat';

import { AppProvider, useApp } from '@/lib/AppContext';
import { EngineProvider } from '@/lib/engine/EngineProvider';
import { Toast } from '@/components/Toast';

SplashScreen.preventAutoHideAsync();

function RootStack() {
  const { ready } = useApp();

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;

  return (
    <>
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right', contentStyle: { backgroundColor: 'transparent' } }} />
      <Toast />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold,
    Caveat_500Medium,
  });

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <EngineProvider>
            <RootStack />
          </EngineProvider>
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
