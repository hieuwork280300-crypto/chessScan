// TextLink — sage text button with optional trailing icon.

import { Pressable, Text } from 'react-native';
import { Icon, type IconName } from '@/components/Icon';
import { C } from '@/constants/colors';

interface Props {
  children: string;
  onPress?: () => void;
  icon?: IconName;
  className?: string;
}

export function TextLink({ children, onPress, icon, className = '' }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className={'flex-row items-center gap-1.5 min-h-[44px] px-1 active:opacity-60 ' + className}>
      <Text className="text-sage text-[16px] font-medium">{children}</Text>
      {icon && <Icon name={icon} size={18} strokeWidth={1.75} color={C.sage} />}
    </Pressable>
  );
}
