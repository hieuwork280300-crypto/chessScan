// App-wide context: dark mode, language, profile, toast. Loads from AsyncStorage once.
// Screens read this instead of prop-drilling (the prototype passed these as `common`).

import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useColorScheme } from 'nativewind';
import { makeT, type TFn } from '@/lib/i18n';
import {
  DEFAULT_PROFILE, loadDark, loadLang, loadProfile, saveDark, saveLang, saveProfile,
} from '@/lib/storage';
import type { Lang, UserProfile } from '@/types/chess';

interface AppCtx {
  ready: boolean;
  dark: boolean;
  toggleDark: () => void;
  lang: Lang;
  setLang: (l: Lang) => void;
  t: TFn;
  profile: UserProfile;
  setProfile: (updates: Partial<UserProfile>) => void;
  toast: (msg: string) => void;
  toastMsg: string | null;
}

const Ctx = createContext<AppCtx | null>(null);

export function useApp(): AppCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used within <AppProvider>');
  return v;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { setColorScheme } = useColorScheme();
  const [ready, setReady] = useState(false);
  const [dark, setDark] = useState(false);
  const [lang, setLangState] = useState<Lang>('en');
  const [profile, setProfileState] = useState<UserProfile>(DEFAULT_PROFILE);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    (async () => {
      const [d, l, p] = await Promise.all([loadDark(), loadLang(), loadProfile()]);
      setDark(d);
      setColorScheme(d ? 'dark' : 'light');
      setLangState(l);
      setProfileState(p);
      setReady(true);
    })();
  }, [setColorScheme]);

  const t = useMemo(() => makeT(lang), [lang]);

  function toggleDark() {
    setDark((d) => {
      const next = !d;
      setColorScheme(next ? 'dark' : 'light');
      saveDark(next);
      return next;
    });
  }
  function setLang(l: Lang) {
    setLangState(l);
    saveLang(l);
  }
  function setProfile(updates: Partial<UserProfile>) {
    setProfileState((p) => {
      const np = { ...p, ...updates };
      saveProfile(np);
      return np;
    });
  }
  function toast(msg: string) {
    setToastMsg(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 2400);
  }

  const value: AppCtx = {
    ready, dark, toggleDark, lang, setLang, t, profile, setProfile, toast, toastMsg,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
