// Toast — bottom-center pill with a sage check. Driven by AppContext.toastMsg.

import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/Icon';
import { useApp } from '@/lib/AppContext';
import { C } from '@/constants/colors';

export function Toast() {
  const { toastMsg } = useApp();
  const insets = useSafeAreaInsets();
  if (!toastMsg) return null;
  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', left: 0, right: 0, bottom: insets.bottom + 24, alignItems: 'center' }}>
      <View className="flex-row items-center gap-2 px-4 py-2.5 rounded-full bg-[#1A1A1A] dark:bg-[#33373d]">
        <Icon name="check" size={16} strokeWidth={2} color={C.sage} />
        <Text className="text-white text-[14px] font-medium">{toastMsg}</Text>
      </View>
    </View>
  );
}
