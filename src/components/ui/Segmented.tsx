// Segmented controls — ported from the prototype.
// Segmented: light track, white active pill (turn picker, settings).
// ResultSegmented: solid sage active (Save dialog result picker).

import { Pressable, Text, View } from 'react-native';

export interface SegOption<T extends string> {
  value: T;
  label: string;
  dot?: 'w' | 'b';
}

export function Segmented<T extends string>({ value, onChange, options, size = 'md' }: {
  value: T; onChange: (v: T) => void; options: SegOption<T>[]; size?: 'sm' | 'md';
}) {
  const minH = size === 'sm' ? 'min-h-[40px]' : 'min-h-[44px]';
  return (
    <View className="flex-row p-1 rounded-2xl bg-[#EFE9DE] dark:bg-[#23262b] gap-1">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value} onPress={() => onChange(o.value)}
            className={`flex-1 ${minH} rounded-xl flex-row items-center justify-center gap-2 ` +
              (active ? 'bg-white dark:bg-[#33373d]' : '')}>
            {o.dot && (
              <View className={'w-3.5 h-3.5 rounded-full border ' +
                (o.dot === 'w' ? 'bg-white border-[#c9bfa9]' : 'bg-[#2A2620] border-[#2A2620]')} />
            )}
            <Text className={'text-[15px] font-semibold ' +
              (active ? 'text-ink dark:text-ink-d' : 'text-sub dark:text-sub-d')}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function ResultSegmented({ value, onChange, options }: {
  value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <View className="flex-row gap-1 p-1 rounded-xl bg-[#EFE9DE] dark:bg-[#23262b]">
      {options.map((o) => {
        const active = o === value;
        return (
          <Pressable
            key={o} onPress={() => onChange(o)}
            className={'flex-1 h-10 rounded-lg items-center justify-center ' + (active ? 'bg-sage' : '')}>
            <Text className={'text-[14px] font-semibold ' + (active ? 'text-white' : 'text-sub dark:text-sub-d')}>{o}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
