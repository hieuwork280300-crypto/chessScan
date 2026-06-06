// StubScreen — placeholder for screens not yet built. Header + back + note.

import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { IconButton } from '@/components/ui/IconButton';

export function StubScreen({ title, note }: { title: string; note?: string }) {
  return (
    <Screen>
      <View className="flex-row items-center px-3 pb-1">
        <IconButton name="chevronLeft" label="Back" onPress={() => router.back()} />
        <Text className="text-[17px] font-semibold text-ink dark:text-ink-d ml-1">{title}</Text>
      </View>
      <View className="flex-1 items-center justify-center px-8">
        <Text className="text-[15px] text-sub dark:text-sub-d text-center">{note ?? 'Coming soon.'}</Text>
      </View>
    </Screen>
  );
}
