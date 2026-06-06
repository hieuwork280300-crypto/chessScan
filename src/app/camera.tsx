import { useLocalSearchParams } from 'expo-router';
import { StubScreen } from '@/components/ui/StubScreen';

export default function Camera() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  return <StubScreen title="Scan" note={`Camera capture (${mode === 'sheet' ? 'score sheet' : 'board'}) — next build step.`} />;
}
