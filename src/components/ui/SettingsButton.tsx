// SettingsButton — gear that routes to Settings.

import { router } from 'expo-router';
import { IconButton } from '@/components/ui/IconButton';

export function SettingsButton() {
  return <IconButton name="settings" label="Settings" onPress={() => router.push('/settings')} />;
}
