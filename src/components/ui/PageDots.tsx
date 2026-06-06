// PageDots — onboarding progress indicator.

import { View } from 'react-native';

export function PageDots({ index, count = 2 }: { index: number; count?: number }) {
  return (
    <View className="flex-row items-center justify-center gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          className={
            'h-1.5 rounded-full ' +
            (i === index ? 'w-6 bg-sage' : 'w-1.5 bg-[#D8CFC0] dark:bg-[#33373c]')
          }
        />
      ))}
    </View>
  );
}
