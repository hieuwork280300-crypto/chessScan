// AsyncStorage wrapper — typed getters/setters. No screen touches AsyncStorage directly.

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DefaultColor, Lang, SavedGame, UserProfile } from '@/types/chess';

const KEYS = {
  lang: 'cs-language',
  profile: 'cs-profile',
  dark: 'cs-dark',
  onboarding: 'cs-onboarding-done',
  games: 'cs-saved-games',
  subscribed: 'cs-subscribed',
  quiz: 'cs-quiz',
} as const;

export const DEFAULT_PROFILE: UserProfile = { displayName: '', defaultColor: 'white' };

async function getJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const s = await AsyncStorage.getItem(key);
    return s ? (JSON.parse(s) as T) : fallback;
  } catch {
    return fallback;
  }
}
async function setJSON(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* no-op */
  }
}

// ── Language ──
export async function loadLang(): Promise<Lang> {
  try {
    const v = await AsyncStorage.getItem(KEYS.lang);
    return v === 'vi' ? 'vi' : 'en';
  } catch {
    return 'en';
  }
}
export const saveLang = (l: Lang) => AsyncStorage.setItem(KEYS.lang, l).catch(() => {});

// ── Dark mode ──
export async function loadDark(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(KEYS.dark)) === '1';
  } catch {
    return false;
  }
}
export const saveDark = (d: boolean) => AsyncStorage.setItem(KEYS.dark, d ? '1' : '0').catch(() => {});

// ── Profile ──
export async function loadProfile(): Promise<UserProfile> {
  const p = await getJSON<Partial<UserProfile>>(KEYS.profile, {});
  return { ...DEFAULT_PROFILE, ...p };
}
export const saveProfile = (p: UserProfile) => setJSON(KEYS.profile, p);

// ── Onboarding flag ──
export async function loadOnboardingDone(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(KEYS.onboarding)) === '1';
  } catch {
    return false;
  }
}
export const setOnboardingDone = () => AsyncStorage.setItem(KEYS.onboarding, '1').catch(() => {});

// ── Saved games ──
export const loadGames = () => getJSON<SavedGame[]>(KEYS.games, []);
export const saveGames = (g: SavedGame[]) => setJSON(KEYS.games, g);

// ── Subscription (stub now; backed by RevenueCat later) ──
export async function loadSubscribed(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(KEYS.subscribed)) === '1';
  } catch {
    return false;
  }
}
export const setSubscribed = (v: boolean) => AsyncStorage.setItem(KEYS.subscribed, v ? '1' : '0').catch(() => {});

// ── Onboarding quiz answers (kept for later personalization) ──
export const loadQuiz = () => getJSON<Record<string, string>>(KEYS.quiz, {});
export const saveQuiz = (a: Record<string, string>) => setJSON(KEYS.quiz, a);

export type { DefaultColor };
