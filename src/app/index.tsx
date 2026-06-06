// Entry gate — route to onboarding on first launch, else home.

import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { loadOnboardingDone } from '@/lib/storage';

export default function Index() {
  const [done, setDone] = useState<boolean | null>(null);

  useEffect(() => {
    loadOnboardingDone().then(setDone);
  }, []);

  if (done === null) return null;
  return <Redirect href={done ? '/home' : '/onboarding'} />;
}
