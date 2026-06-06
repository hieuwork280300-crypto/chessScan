// Game Review — unified screen for position + sheet. Interactive multi-PV: tap a line to
// select it; the move strip + board step through that line. Ported from the prototype.

import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';

import { Screen } from '@/components/ui/Screen';
import { IconButton } from '@/components/ui/IconButton';
import { SettingsButton } from '@/components/ui/SettingsButton';
import { Board } from '@/components/Board';
import { EvalBar } from '@/components/EvalBar';
import { Icon, type IconName } from '@/components/Icon';
import { SaveGameDialog, type SaveForm } from '@/components/SaveGameDialog';
import { useApp } from '@/lib/AppContext';
import { computeLinePositions, fmtCp } from '@/lib/board';
import { buildLines, startPosFor, GAME_PLIES } from '@/lib/mockData';
import { sharePGN, copyText } from '@/lib/share';
import { useEngine } from '@/lib/engine/EngineProvider';
import { STD_FEN, SCAN_FEN, STARTING_FEN } from '@/constants/chess';
import { C, ink, sub } from '@/constants/colors';
import type { MultiPVLine, Ply, ReviewMode } from '@/types/chess';

function qualityClasses(q: string | undefined, active: boolean): string {
  if (active) return 'bg-sage';
  if (q === 'best') return 'bg-sage/15 border border-sage/30';
  if (q === 'inaccuracy') return 'bg-amber/15 border border-amber/30';
  if (q === 'mistake') return 'bg-amber/30 border border-amber/45';
  return 'bg-card dark:bg-card-d border border-line dark:border-line-d';
}

function PVRow({ line, selected, badge, onSelect }: {
  line: MultiPVLine; selected: boolean; badge: 'best' | 'yourgame' | null; onSelect: () => void;
}) {
  const { dark } = useApp();
  const cont = line.plies.slice(1, 9).map((p) => p.san).join(' ');
  const evalPos = line.evalCp >= 0;
  return (
    <Pressable
      onPress={onSelect}
      className={'px-3 py-2.5 border-l-[3px] ' +
        (selected ? 'bg-sage/10 border-sage' : 'bg-card dark:bg-card-d border-transparent')}>
      <View className="flex-row items-center gap-2.5">
        <Text className={'w-[44px] text-[14px] font-bold ' + (evalPos ? 'text-sage' : 'text-sub dark:text-sub-d')} style={{ fontVariant: ['tabular-nums'] }}>
          {fmtCp(line.evalCp)}
        </Text>
        {selected
          ? <View className="w-3 h-3 rounded-full bg-sage" />
          : <View className="w-3 h-3 rounded-full border-2 border-[#CFC6B4] dark:border-[#3a3d42]" />}
        <Icon name={selected ? 'chevronDown' : 'chevronRight'} size={15} color={selected ? C.sage : (dark ? '#5d6065' : '#B7AE9D')} />
        <Text className={'text-[15px] font-bold ' + (selected ? 'text-sage' : 'text-ink dark:text-ink-d')} style={{ fontVariant: ['tabular-nums'] }}>
          {line.plies[0]?.san}
        </Text>
        {badge === 'best' && <View className="ml-auto bg-sage/15 px-1.5 py-0.5 rounded"><Text className="text-[10px] font-bold uppercase text-sage">Best</Text></View>}
        {badge === 'yourgame' && <View className="ml-auto bg-amber/15 px-1.5 py-0.5 rounded"><Text className="text-[10px] font-bold uppercase text-amber">Your game</Text></View>}
      </View>
      <Text numberOfLines={1} className="mt-1 pl-[56px] text-[12.5px] text-sub dark:text-sub-d" style={{ fontVariant: ['tabular-nums'] }}>{cont} …</Text>
    </Pressable>
  );
}

function NavBtn({ icon, label, onPress, disabled }: { icon: IconName; label: string; onPress: () => void; disabled: boolean }) {
  const { dark } = useApp();
  return (
    <Pressable
      onPress={onPress} disabled={disabled}
      className="flex-1 h-11 rounded-2xl items-center justify-center bg-card dark:bg-card-d border border-line dark:border-line-d"
      style={{ opacity: disabled ? 0.35 : 1 }}>
      <Icon name={icon} size={17} color={ink(dark)} />
      <Text className="text-[10px] font-medium text-ink dark:text-ink-d">{label}</Text>
    </Pressable>
  );
}

function ActionBtn({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  const { dark } = useApp();
  return (
    <Pressable onPress={onPress} className="h-11 flex-1 rounded-2xl flex-row items-center justify-center gap-1.5 bg-card dark:bg-card-d border border-line dark:border-line-d">
      <Icon name={icon} size={17} color={ink(dark)} />
      <Text className="text-[12px] font-medium text-ink dark:text-ink-d">{label}</Text>
    </Pressable>
  );
}

const BOARD = 300;

export default function Review() {
  const { t, dark, toast, profile } = useApp();
  const params = useLocalSearchParams<{ mode?: string; title?: string }>();
  const mode: ReviewMode = params.mode === 'sheet' ? 'sheet' : 'position';
  const isSheet = mode === 'sheet';
  const insets = useSafeAreaInsets();

  const startPos = useMemo(() => startPosFor(mode), [mode]);
  const { analyze } = useEngine();

  // Lines start as the mock (instant), then get replaced by real engine output.
  const [lines, setLines] = useState<MultiPVLine[]>(() => buildLines(mode));
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLines(buildLines(mode));
    setAnalyzing(true);
    (async () => {
      try {
        const fen = isSheet ? STARTING_FEN : `${SCAN_FEN} w - - 0 1`;
        const res = await analyze(fen, { multipv: 3, depth: 16 });
        if (cancelled || !res.lines.length) return;
        if (isSheet) {
          setLines([{ evalCp: 0, badge: 'yourgame', plies: GAME_PLIES }, ...res.lines.slice(0, 2)]);
        } else {
          setLines(res.lines.slice(0, 3).map((l, i) => (i === 0 ? { ...l, badge: 'best' } : l)));
        }
      } catch {
        /* keep mock lines */
      } finally {
        if (!cancelled) setAnalyzing(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const [sel, setSel] = useState(0);
  const [ply, setPly] = useState(0);
  const [title, setTitle] = useState(params.title || (isSheet ? 'Club game · Jun 5' : 'Position scan · Jun 5'));
  const [editing, setEditing] = useState(false);
  const [showSave, setShowSave] = useState(false);
  const [meta, setMeta] = useState<SaveForm | null>(null);

  const stripRef = useRef<ScrollView>(null);
  const chipX = useRef<number[]>([]);

  const line = lines[Math.min(sel, lines.length - 1)];
  const plies: Ply[] = line.plies;
  const positions = useMemo(() => computeLinePositions(startPos, plies), [startPos, plies]);
  const safePly = Math.min(ply, plies.length);
  const boardPos = positions[safePly];

  const boardCp = line.badge === 'yourgame'
    ? (safePly > 0 ? GAME_PLIES[safePly - 1].evalCp ?? 0 : 15)
    : line.evalCp;

  const arrowMove = safePly > 0 ? plies[safePly - 1] : plies[0];
  const arrows = arrowMove ? [{ from: arrowMove.from, to: arrowMove.to, glow: sel === 0, color: C.sage, opacity: 0.9 }] : null;
  const lastMove = safePly > 0 ? plies[safePly - 1] : null;

  function selectLine(i: number) {
    if (i !== sel) { setSel(i); setPly(0); }
  }
  function goPly(p: number) {
    const np = Math.max(0, Math.min(plies.length, p));
    setPly(np);
    const x = chipX.current[np - 1];
    if (x != null) stripRef.current?.scrollTo({ x: Math.max(0, x - 120), animated: true });
  }

  function buildGame(form?: SaveForm | null) {
    return {
      id: 'tmp', type: (isSheet ? 'S' : 'P') as 'S' | 'P', title,
      event: form?.event, site: form?.site, date: form?.date, round: form?.round,
      white: form?.white, black: form?.black, result: form?.result,
      plies: isSheet ? GAME_PLIES : [], startFen: isSheet ? STD_FEN : SCAN_FEN,
    };
  }

  function onSaveConfirm(form: SaveForm) {
    setMeta(form);
    if (form.title) setTitle(form.title);
    setShowSave(false);
    toast(t('save.saved'));
  }
  async function exportPgn() {
    const ok = await sharePGN(buildGame(meta), isSheet ? 'chess-scan-game.pgn' : 'chess-scan-position.pgn');
    toast(ok ? 'Exported as PGN.' : 'Could not export.');
  }
  async function share() {
    await copyText(isSheet ? title : SCAN_FEN);
    toast(isSheet ? 'Link copied to share.' : 'FEN copied to share.');
  }

  return (
    <Screen edges={{ top: true, bottom: false }}>
      {/* header */}
      <View className="flex-row items-center justify-between px-2 gap-1">
        <IconButton name="chevronLeft" label="Back" onPress={() => router.back()} />
        {editing ? (
          <TextInput
            autoFocus value={title} onChangeText={setTitle}
            onBlur={() => setEditing(false)} onSubmitEditing={() => setEditing(false)}
            className="flex-1 text-[15px] font-semibold text-center text-ink dark:text-ink-d border-b-2 border-sage"
          />
        ) : (
          <Pressable onPress={() => setEditing(true)} className="flex-1 flex-row items-center justify-center gap-1.5">
            <Text numberOfLines={1} className="text-[15px] font-semibold text-ink dark:text-ink-d">{title}</Text>
            <Icon name="pencil" size={12} color={sub(dark)} />
          </Pressable>
        )}
        <SettingsButton />
      </View>

      {/* board + eval bar */}
      <View className="flex-row items-center justify-center gap-2.5 px-3 pt-2">
        <EvalBar cp={boardCp} height={BOARD} dark={dark} />
        <Board position={boardPos} size={BOARD} arrows={arrows} dark={dark} lastMove={lastMove} />
      </View>

      {/* move strip + nav */}
      <View className="px-4 pt-2.5">
        <ScrollView ref={stripRef} horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-1.5 py-0.5 px-1">
          {plies.map((p, i) => {
            const active = safePly === i + 1;
            const num = i % 2 === 0 ? `${i / 2 + 1}.` : '';
            return (
              <Pressable
                key={i} onLayout={(e) => { chipX.current[i] = e.nativeEvent.layout.x; }}
                onPress={() => goPly(i + 1)}
                className={'min-h-[32px] px-2.5 rounded-lg flex-row items-center gap-1 ' + qualityClasses(isSheet ? p.quality : undefined, active)}>
                {num ? <Text className={'text-[13px] ' + (active ? 'text-white/70' : 'text-ink/50 dark:text-ink-d/50')} style={{ fontVariant: ['tabular-nums'] }}>{num}</Text> : null}
                <Text className={'text-[13px] font-medium ' + (active ? 'text-white' : 'text-ink dark:text-ink-d')} style={{ fontVariant: ['tabular-nums'] }}>{p.san}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <View className="flex-row items-center gap-2 mt-2">
          <NavBtn icon="skipBack" label="Start" onPress={() => goPly(0)} disabled={safePly === 0} />
          <NavBtn icon="chevronLeft" label="Prev" onPress={() => goPly(safePly - 1)} disabled={safePly === 0} />
          <NavBtn icon="chevronRight" label="Next" onPress={() => goPly(safePly + 1)} disabled={safePly === plies.length} />
          <NavBtn icon="skipForward" label="End" onPress={() => goPly(plies.length)} disabled={safePly === plies.length} />
        </View>
      </View>

      {/* multi-PV */}
      <ScrollView className="flex-1 px-4 pt-3" showsVerticalScrollIndicator={false}>
        {analyzing && (
          <View className="flex-row items-center gap-2 pb-2 px-1">
            <ActivityIndicator size="small" color={C.sage} />
            <Text className="text-[12px] text-sub dark:text-sub-d">Analyzing…</Text>
          </View>
        )}
        <View className="rounded-[12px] overflow-hidden border border-line dark:border-line-d">
          {lines.map((l, i) => (
            <View key={i} className={i ? 'border-t border-[#F0EBE0] dark:border-[#23262b]' : ''}>
              <PVRow line={l} selected={sel === i} badge={i === 0 ? (l.badge || 'best') : null} onSelect={() => selectLine(i)} />
            </View>
          ))}
        </View>
        <View className="h-3" />
      </ScrollView>

      {/* bottom actions */}
      <View className="px-4 flex-row gap-2 border-t border-line dark:border-line-d" style={{ paddingTop: 10, paddingBottom: insets.bottom + 10 }}>
        {isSheet ? (
          <>
            <ActionBtn icon="bookmark" label={t('gameReview.save')} onPress={() => setShowSave(true)} />
            <ActionBtn icon="share" label={t('gameReview.share')} onPress={share} />
            <ActionBtn icon="fileDown" label={t('gameReview.exportPgn')} onPress={exportPgn} />
          </>
        ) : (
          <>
            <ActionBtn icon="scan" label={t('gameReview.newScan')} onPress={() => router.push({ pathname: '/camera', params: { mode: 'board' } })} />
            <ActionBtn icon="pencil" label={t('gameReview.edit')} onPress={() => router.push('/confirm-position')} />
            <ActionBtn icon="bookmark" label={t('gameReview.save')} onPress={() => setShowSave(true)} />
            <ActionBtn icon="share" label={t('gameReview.share')} onPress={share} />
          </>
        )}
      </View>

      <SaveGameDialog
        visible={showSave} isPosition={!isSheet} defaultTitle={title}
        onSave={onSaveConfirm} onCancel={() => setShowSave(false)}
      />
    </Screen>
  );
}
