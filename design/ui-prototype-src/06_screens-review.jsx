// screens-review.jsx — unified Game Review (position + sheet modes).
// Interactive multi-PV: tap a line → it becomes selected; the move strip and board
// step through that line's continuation. Line 0 = engine BEST (position) / YOUR GAME (sheet).

const { useState, useRef, useEffect, useMemo } = React;

function qualityChip(q, active) {
  if (active) return 'bg-sage text-white';
  if (q === 'best') return 'bg-sage/15 text-sage border border-sage/30';
  if (q === 'inaccuracy') return 'bg-amber/15 text-amber border border-amber/30';
  if (q === 'mistake') return 'bg-amber/30 text-amber border border-amber/45';
  if (q === 'blunder') return 'bg-amber/55 text-[#6f4f14] dark:text-amber border border-amber/70';
  return 'bg-white dark:bg-[#1E2024] text-[#1A1A1A] dark:text-[#ECECEC] border border-[#ECE6DC] dark:border-[#2A2D31]';
}

// One interactive engine line: eval · dot · chevron · move · 8-move continuation.
function PVRow({ line, idx, selected, badge, onSelect }) {
  const moveNoFor = (i) => i % 2 === 0 ? i / 2 + 1 + '.' : '';
  const cont = line.plies.slice(1, 9).map((p) => p.san).join(' ');
  return (
    <button onClick={onSelect}
    className={'w-full text-left px-3 py-2.5 border-l-[3px] transition-colors ' + (
    selected ?
    'bg-sage/8 dark:bg-sage/15 border-sage' :
    'bg-white dark:bg-[#1E2024] border-transparent active:bg-black/[.03] dark:active:bg-white/[.04]')}>
      <div className="flex items-center gap-2.5">
        <span className={'w-[44px] shrink-0 text-[14px] font-bold tabular-nums ' + (line.evalCp >= 0 ? 'text-sage' : 'text-[#6B6B6B] dark:text-[#9C9C9C]')}>{fmtCp(line.evalCp)}</span>
        {selected ?
        <span className="w-3 h-3 shrink-0 rounded-full bg-sage" /> :
        <span className="w-3 h-3 shrink-0 rounded-full border-2 border-[#CFC6B4] dark:border-[#3a3d42]" />}
        <Icon name={selected ? 'chevronDown' : 'chevronRight'} size={15} className={'shrink-0 ' + (selected ? 'text-sage' : 'text-[#B7AE9D] dark:text-[#5d6065]')} />
        <span className={'shrink-0 text-[15px] font-bold tabular-nums ' + (selected ? 'text-sage' : 'text-[#1A1A1A] dark:text-[#ECECEC]')}>{line.plies[0].san}</span>
        {badge === 'best' && <span className="ml-auto shrink-0 text-[10px] font-bold uppercase tracking-wide text-sage bg-sage/12 dark:bg-sage/20 px-1.5 py-0.5 rounded">Best</span>}
        {badge === 'yourgame' && <span className="ml-auto shrink-0 text-[10px] font-bold uppercase tracking-wide text-amber bg-amber/15 px-1.5 py-0.5 rounded">Your game</span>}
      </div>
      <div className="mt-1 pl-[56px] text-[12.5px] tabular-nums text-[#6B6B6B] dark:text-[#9C9C9C] truncate">{cont} <span className="opacity-50">…</span></div>
    </button>);

}

function ActionBtn({ icon, label, onClick }) {
  return (
    <button onClick={onClick}
    className="h-11 rounded-2xl flex items-center justify-center gap-1.5 text-[13px] font-medium text-[#1A1A1A] dark:text-[#ECECEC] bg-white dark:bg-[#1E2024] border border-[#ECE6DC] dark:border-[#2A2D31] active:bg-black/5 dark:active:bg-white/5 transition-colors" style={{ fontSize: "12px" }}>
      <Icon name={icon} size={17} /> {label}
    </button>);

}

function NavBtn({ icon, label, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} aria-label={label}
    className="flex-1 h-11 rounded-2xl flex flex-col items-center justify-center gap-0.5 text-[#1A1A1A] dark:text-[#ECECEC] bg-white dark:bg-[#1E2024] border border-[#ECE6DC] dark:border-[#2A2D31] disabled:opacity-35 active:scale-95 transition-transform">
      <Icon name={icon} size={17} />
      <span className="text-[10px] font-medium leading-none">{label}</span>
    </button>);

}

function GameReviewScreen({ dark, toggleDark, go, toast, mode = 'position', initialTitle, t, profile }) {
  const isSheet = mode === 'sheet';
  const BOARD = 300;

  const lines = useMemo(() => buildLines(mode), [mode]);
  const startPos = useMemo(() => startPosFor(mode), [mode]);

  const [sel, setSel] = useState(0); // selected line index
  const [ply, setPly] = useState(0); // position within selected line
  const [title, setTitle] = useState(initialTitle || (isSheet ? 'Club game \u00b7 Jun 5' : 'Position scan \u00b7 Jun 5'));
  const [editing, setEditing] = useState(false);
  const [showSave, setShowSave] = useState(false);
  const [meta, setMeta] = useState(null);

  function onSaveConfirm(form) {
    setMeta(form);
    if (form.title) setTitle(form.title);
    setShowSave(false);
    toast(t && t('save.saved') || 'Saved to your games.');
  }
  function exportPgn() {
    const pgn = buildPGN({
      title, event: meta && meta.event, site: meta && meta.site,
      date: meta && meta.date || formatPGNDate(new Date()),
      round: meta && meta.round, white: meta && meta.white, black: meta && meta.black,
      result: meta && meta.result || '*',
      plies: isSheet ? GAME_PLIES : [], startFen: isSheet ? STD_FEN : SCAN_FEN
    });
    downloadText(isSheet ? 'chess-scan-game.pgn' : 'chess-scan-position.pgn', pgn);
    toast('Exported as PGN.');
  }

  const stripRef = useRef(null);
  const chipRefs = useRef([]);

  const line = lines[Math.min(sel, lines.length - 1)];
  const plies = line.plies;
  const positions = useMemo(() => computeLinePositions(startPos, plies), [startPos, plies]);
  const safePly = Math.min(ply, plies.length);
  const boardPos = positions[safePly];

  // eval bar: your-game line tracks per-ply eval; engine lines use the line score.
  const boardCp = line.badge === 'yourgame' ?
  safePly > 0 ? GAME_PLIES[safePly - 1].evalCp ?? 0 : 15 :
  line.evalCp;

  // arrow: at start, preview the line's first move; while navigating, mark the last move.
  const arrowMove = safePly > 0 ? plies[safePly - 1] : plies[0];
  const arrows = [{ from: arrowMove.from, to: arrowMove.to, glow: sel === 0, color: '#5C7A6B', opacity: 0.9 }];
  const lastMove = safePly > 0 ? plies[safePly - 1] : null;

  function selectLine(i) {if (i !== sel) {setSel(i);setPly(0);}}

  useEffect(() => {
    const el = chipRefs.current[safePly - 1],wrap = stripRef.current;
    if (el && wrap) wrap.scrollTo({ left: el.offsetLeft - wrap.clientWidth / 2 + el.clientWidth / 2, behavior: 'smooth' });
  }, [safePly, sel]);

  return (
    <div className={'h-full w-full flex flex-col overflow-hidden relative ' + T.bg}>
      {/* header */}
      <div className="flex items-center justify-between px-2 gap-1" style={{ paddingTop: SAFE_TOP }}>
        <IconButton name="chevronLeft" label="Back" onClick={() => go(isSheet ? 'confirmSheet' : 'confirmPos')} className="text-[#1A1A1A] dark:text-[#ECECEC] shrink-0" />
        {editing ?
        <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)}
        onBlur={() => setEditing(false)}
        onKeyDown={(e) => {if (e.key === 'Enter' || e.key === 'Escape') setEditing(false);}}
        className="flex-1 min-w-0 text-[15px] font-semibold text-center bg-transparent border-b-2 border-sage outline-none text-[#1A1A1A] dark:text-[#ECECEC]" /> :

        <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 min-w-0">
            <span className={'text-[15px] font-semibold truncate ' + T.ink}>{title}</span>
            <Icon name="pencil" size={12} className="text-[#9C9C9C] shrink-0" />
          </button>
        }
        <SettingsButton go={go} />
      </div>

      {/* board + eval bar */}
      <div className="flex items-center justify-center gap-2.5 px-3 pt-2 shrink-0">
        <EvalBar cp={boardCp} height={BOARD} />
        <Board position={boardPos} size={BOARD} arrows={arrows} dark={dark} lastMove={lastMove} />
      </div>

      {/* move strip (selected line) + nav — both modes */}
      <div className="px-4 pt-2.5 shrink-0">
        <div className="relative">
          <div ref={stripRef} className="flex gap-1.5 overflow-x-auto no-sb py-0.5 px-1">
            {plies.map((p, i) => {
              const active = safePly === i + 1;
              const num = i % 2 === 0 ? i / 2 + 1 + '.' : '';
              return (
                <button key={i} ref={(el) => chipRefs.current[i] = el} onClick={() => setPly(i + 1)}
                className={'shrink-0 min-h-[32px] px-2.5 rounded-lg text-[13px] font-medium tabular-nums flex items-center gap-1 transition-colors ' + qualityChip(line.badge === 'yourgame' ? p.quality : undefined, active)}>
                  {num && <span className={active ? 'opacity-70' : 'opacity-50'}>{num}</span>}{p.san}
                </button>);

            })}
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-[#FAF7F2] dark:from-[#16181B] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-[#FAF7F2] dark:from-[#16181B] to-transparent" />
        </div>
        <div className="flex items-center gap-2 mt-2">
          <NavBtn icon="skipBack" label="Start" onClick={() => setPly(0)} disabled={safePly === 0} />
          <NavBtn icon="chevronLeft" label="Prev" onClick={() => setPly((p) => Math.max(0, p - 1))} disabled={safePly === 0} />
          <NavBtn icon="chevronRight" label="Next" onClick={() => setPly((p) => Math.min(plies.length, p + 1))} disabled={safePly === plies.length} />
          <NavBtn icon="skipForward" label="End" onClick={() => setPly(plies.length)} disabled={safePly === plies.length} />
        </div>
      </div>

      {/* interactive multi-PV */}
      <div className="flex-1 overflow-y-auto no-sb px-4 pt-3 min-h-0">
        <div className="rounded-[12px] overflow-hidden border border-[#ECE6DC] dark:border-[#2A2D31] divide-y divide-[#F0EBE0] dark:divide-[#23262b]">
          {lines.map((l, i) =>
          <PVRow key={i} line={l} idx={i} selected={sel === i}
          badge={i === 0 ? l.badge || 'best' : null}
          onSelect={() => selectLine(i)} />
          )}
        </div>
        <div className="h-3" />
      </div>

      {/* bottom actions — differ by mode */}
      {isSheet ?
      <div className="px-4 grid grid-cols-3 gap-2 border-t border-[#ECE6DC] dark:border-[#2A2D31]"
      style={{ paddingBottom: SAFE_BOTTOM + 10, paddingTop: 10 }}>
          <ActionBtn icon="bookmark" label={t('gameReview.save')} onClick={() => setShowSave(true)} />
          <ActionBtn icon="share" label={t('gameReview.share')} onClick={() => toast('Link copied to share.')} />
          <ActionBtn icon="fileDown" label={t('gameReview.exportPgn')} onClick={exportPgn} />
        </div> :

      <div className="px-4 grid grid-cols-4 gap-2 border-t border-[#ECE6DC] dark:border-[#2A2D31]"
      style={{ paddingBottom: SAFE_BOTTOM + 10, paddingTop: 10 }}>
          <ActionBtn icon="scan" label={t('gameReview.newScan')} onClick={() => go('camera', { mode: 'board' })} />
          <ActionBtn icon="pencil" label={t('gameReview.edit')} onClick={() => go('confirmPos')} />
          <ActionBtn icon="bookmark" label={t('gameReview.save')} onClick={() => setShowSave(true)} />
          <ActionBtn icon="share" label={t('gameReview.share')} onClick={() => toast('FEN copied to share.')} />
        </div>
      }

      {showSave &&
      <SaveGameDialog t={t} profile={profile} isPosition={!isSheet} defaultTitle={title}
      onSave={onSaveConfirm} onCancel={() => setShowSave(false)} />
      }
    </div>);

}

Object.assign(window, { GameReviewScreen, qualityChip });