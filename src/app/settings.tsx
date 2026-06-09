// Settings — profile, preferences (dark/language), subscription/account placeholders, about.

import { Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';

import { Screen } from '@/components/ui/Screen';
import { IconButton } from '@/components/ui/IconButton';
import { Icon } from '@/components/Icon';
import { useApp } from '@/lib/AppContext';
import { C, sub } from '@/constants/colors';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mt-6">
      <Text className="px-5 pb-2 text-[12px] font-semibold tracking-wide uppercase text-sub dark:text-sub-d">{title}</Text>
      <View className="mx-4 rounded-2xl bg-card dark:bg-card-d border border-line dark:border-line-d overflow-hidden">
        {children}
      </View>
    </View>
  );
}

function Row({ label, value, right, onPress, last }: {
  label: string; value?: string; right?: React.ReactNode; onPress?: () => void; last?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={'flex-row items-center px-4 min-h-[52px] active:bg-black/5 dark:active:bg-white/5 ' + (last ? '' : 'border-b border-line dark:border-line-d')}>
      <Text className="flex-1 text-[16px] text-ink dark:text-ink-d">{label}</Text>
      {value && <Text className="text-[15px] text-sub dark:text-sub-d mr-1">{value}</Text>}
      {right}
    </Pressable>
  );
}

export default function Settings() {
  const { t, dark, toggleDark, lang, setLang, profile } = useApp();
  return (
    <Screen>
      <View className="flex-row items-center px-3 pb-1">
        <IconButton name="chevronLeft" label="Back" onPress={() => router.back()} />
        <Text className="text-[20px] font-bold text-ink dark:text-ink-d ml-1">{t('settings.title')}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-10">
        <Section title={t('settings.profile')}>
          <Row label={t('settings.displayName')} value={profile.displayName || t('settings.notSet')}
            right={<Icon name="chevronRight" size={18} color={sub(dark)} />} />
          <Row label={t('settings.defaultColor')}
            value={profile.defaultColor === 'white' ? t('settings.white') : t('settings.black')}
            right={<Icon name="chevronRight" size={18} color={sub(dark)} />} last />
        </Section>

        <Section title={t('settings.preferences')}>
          <Row label={t('settings.darkMode')}
            right={<Switch value={dark} onValueChange={toggleDark} trackColor={{ true: C.sage, false: '#cfcabf' }} />} />
          <Row label={t('settings.language')} value={lang === 'en' ? 'EN' : 'VI'}
            onPress={() => setLang(lang === 'en' ? 'vi' : 'en')}
            right={<Icon name="chevronRight" size={18} color={sub(dark)} />} last />
        </Section>

        <Section title={t('settings.subscription')}>
          <Row label={t('settings.currentPlan')} value={t('settings.free')} />
          <Row label={t('settings.upgradeToPro')} value={t('settings.comingSoon')} last />
        </Section>

        <Section title={t('settings.account')}>
          <Row label={t('settings.signIn')} value={t('settings.comingSoon')} last />
        </Section>

        <Section title={t('settings.about')}>
          <Row label={t('settings.version')} value="1.0.0" />
          <Row label={t('settings.terms')} right={<Icon name="chevronRight" size={18} color={sub(dark)} />} />
          <Row label={t('settings.privacy')} right={<Icon name="chevronRight" size={18} color={sub(dark)} />} />
          <Row label={t('settings.contact')} right={<Icon name="chevronRight" size={18} color={sub(dark)} />} />
          <Row label={t('settings.credits')} value={t('settings.creditsValue')} last />
        </Section>
      </ScrollView>
    </Screen>
  );
}
