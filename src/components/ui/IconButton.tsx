// IconButton + DarkToggle — round 44px tap targets.

import { Pressable } from 'react-native';
import { Icon, type IconName } from '@/components/Icon';
import { useApp } from '@/lib/AppContext';
import { ink } from '@/constants/colors';

interface IconButtonProps {
  name: IconName;
  onPress?: () => void;
  label?: string;
  size?: number;
  color?: string;
  className?: string;
}

export function IconButton({ name, onPress, label, size = 21, color, className = '' }: IconButtonProps) {
  const { dark } = useApp();
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={label}
      className={'w-11 h-11 items-center justify-center rounded-full active:bg-black/5 dark:active:bg-white/10 ' + className}>
      <Icon name={name} size={size} color={color ?? ink(dark)} />
    </Pressable>
  );
}

export function DarkToggle() {
  const { dark, toggleDark } = useApp();
  return <IconButton name={dark ? 'sun' : 'moon'} onPress={toggleDark} label="Toggle dark mode" />;
}
