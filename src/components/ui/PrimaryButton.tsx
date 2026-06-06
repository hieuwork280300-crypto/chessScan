// PrimaryButton — full-width sage CTA with optional leading icon. Ported from prototype.

import { Pressable, Text, View } from 'react-native';
import { Icon, type IconName } from '@/components/Icon';
import { C } from '@/constants/colors';

interface Props {
  children: string;
  onPress?: () => void;
  icon?: IconName;
  className?: string;
}

export function PrimaryButton({ children, onPress, icon, className = '' }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className={
        'w-full min-h-[52px] rounded-2xl bg-sage flex-row items-center justify-center gap-2 ' +
        'active:opacity-90 ' + className
      }
      style={{
        shadowColor: C.sage, shadowOpacity: 0.34, shadowRadius: 22,
        shadowOffset: { width: 0, height: 8 }, elevation: 6,
      }}>
      {icon && <Icon name={icon} size={19} strokeWidth={1.75} color={C.white} />}
      <View>
        <Text className="text-white text-[16px] font-semibold">{children}</Text>
      </View>
    </Pressable>
  );
}
