import { useLocalSearchParams } from 'expo-router';
import { StubScreen } from '@/components/ui/StubScreen';

export default function Review() {
  const { title } = useLocalSearchParams<{ mode?: string; title?: string }>();
  return <StubScreen title={title ?? 'Game review'} note="Unified game review — next build step." />;
}
