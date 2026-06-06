// EvalBar — vertical evaluation bar (no numbers). Sage fills from the bottom = White's share.

import { View } from 'react-native';
import { whiteShare } from '@/lib/board';

interface Props {
  cp: number;
  scoreMate?: number;
  height?: number;
  dark?: boolean;
}

export function EvalBar({ cp, scoreMate, height = 320, dark }: Props) {
  const pct = whiteShare(cp, scoreMate);
  return (
    <View
      style={{
        width: 16, height, borderRadius: 6, overflow: 'hidden',
        backgroundColor: dark ? '#2b2a26' : '#E7DECC',
        borderWidth: 1, borderColor: dark ? '#3a3833' : '#cdbf9f',
      }}>
      <View style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: `${pct}%`, backgroundColor: '#5C7A6B' }} />
      <View style={{ position: 'absolute', left: 0, width: '100%', height: 1, top: '50%', backgroundColor: dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.25)' }} />
    </View>
  );
}
