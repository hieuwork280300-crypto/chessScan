// Screen — full-height themed background with safe-area padding.
// Replaces the prototype's fixed SAFE_TOP/SAFE_BOTTOM with real insets.

import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  children: ReactNode;
  edges?: { top?: boolean; bottom?: boolean };
  className?: string;
}

export function Screen({ children, edges = { top: true, bottom: true }, className = '' }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View
      className={'flex-1 bg-bg dark:bg-bg-d ' + className}
      style={{
        paddingTop: edges.top ? insets.top : 0,
        paddingBottom: edges.bottom ? insets.bottom : 0,
      }}>
      {children}
    </View>
  );
}
