// SaveGameDialog — bottom-sheet modal with the PGN Seven Tag Roster. Ported from prototype.
// White + Black sit side-by-side (equal width). Title is the only required field.

import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ResultSegmented } from '@/components/ui/Segmented';
import { useApp } from '@/lib/AppContext';
import { formatPGNDate } from '@/lib/pgn';
import { C } from '@/constants/colors';
import type { Result } from '@/types/chess';

export interface SaveForm {
  title: string; event: string; site: string; date: string;
  round: string; white: string; black: string; result: Result;
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <View className="mt-4">
      <Text className="text-[14px] font-medium text-sub dark:text-sub-d">
        {label}{required && <Text className="text-sage"> *</Text>}
      </Text>
      <View className="mt-2">{children}</View>
    </View>
  );
}

function Input(props: React.ComponentProps<typeof TextInput>) {
  const { dark } = useApp();
  return (
    <TextInput
      {...props}
      placeholderTextColor={dark ? '#5d6065' : '#B7AE9D'}
      className="w-full h-11 px-4 rounded-lg bg-card dark:bg-card-d border border-[#E5E0D5] dark:border-line-d text-[16px] text-ink dark:text-ink-d"
    />
  );
}

export function SaveGameDialog({ visible, isPosition, defaultTitle, onSave, onCancel }: {
  visible: boolean; isPosition: boolean; defaultTitle: string;
  onSave: (form: SaveForm) => void; onCancel: () => void;
}) {
  const { t, profile } = useApp();
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState<SaveForm>(() => ({
    title: defaultTitle || '', event: '', site: '', date: formatPGNDate(new Date()), round: '',
    white: profile.defaultColor === 'white' ? profile.displayName : '',
    black: profile.defaultColor === 'black' ? profile.displayName : '',
    result: '*',
  }));
  const set = <K extends keyof SaveForm>(k: K, v: SaveForm[K]) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <Pressable className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onPress={onCancel}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Pressable
            onPress={() => {}}
            className="rounded-t-[22px] bg-bg dark:bg-bg-d border-t border-line dark:border-line-d"
            style={{ maxHeight: '92%' }}>
            <View className="pt-3 pb-2 items-center">
              <View className="w-9 h-1 rounded-full bg-[#D8CFC0] dark:bg-[#33373c]" />
            </View>
            <ScrollView className="px-5" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text className="text-[19px] font-bold text-ink dark:text-ink-d">
                {isPosition ? t('save.savePosition') : t('save.title')}
              </Text>
              <Text className="text-[12px] text-sub dark:text-sub-d mt-0.5">{t('save.required')}</Text>

              <Field label={t('save.gameTitle')} required>
                <Input value={form.title} onChangeText={(v) => set('title', v)} />
              </Field>
              <Field label={t('save.event')}>
                <Input value={form.event} onChangeText={(v) => set('event', v)} placeholder="Tuesday rapid" />
              </Field>
              <Field label={t('save.site')}>
                <Input value={form.site} onChangeText={(v) => set('site', v)} placeholder="Local chess club" />
              </Field>
              <Field label={t('save.date')}>
                <Input value={form.date} onChangeText={(v) => set('date', v)} placeholder="2026.06.05" />
              </Field>
              <Field label={t('save.round')}>
                <Input value={form.round} onChangeText={(v) => set('round', v)} placeholder="1" />
              </Field>

              <View className="flex-row gap-3 mt-4">
                <View className="flex-1">
                  <Text className="text-[14px] font-medium text-sub dark:text-sub-d">{t('save.white')}</Text>
                  <View className="mt-2"><Input value={form.white} onChangeText={(v) => set('white', v)} /></View>
                </View>
                <View className="flex-1">
                  <Text className="text-[14px] font-medium text-sub dark:text-sub-d">{t('save.black')}</Text>
                  <View className="mt-2"><Input value={form.black} onChangeText={(v) => set('black', v)} /></View>
                </View>
              </View>

              <Field label={t('save.result')}>
                <ResultSegmented value={form.result} onChange={(v) => set('result', v as Result)} options={['1-0', '½-½', '0-1', '*']} />
              </Field>
              <View className="h-3" />
            </ScrollView>

            <View
              className="px-5 pt-3 flex-row gap-3 border-t border-line dark:border-line-d"
              style={{ paddingBottom: insets.bottom + 12 }}>
              <Pressable onPress={onCancel} className="flex-1 h-12 rounded-2xl border border-line dark:border-line-d items-center justify-center">
                <Text className="text-[15px] font-medium text-ink dark:text-ink-d">{t('save.cancel')}</Text>
              </Pressable>
              <Pressable
                onPress={() => form.title.trim() && onSave(form)}
                className="flex-1 h-12 rounded-2xl bg-sage items-center justify-center"
                style={{ opacity: form.title.trim() ? 1 : 0.5 }}>
                <Text className="text-[15px] font-semibold text-white">{t('save.save')}</Text>
              </Pressable>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}
