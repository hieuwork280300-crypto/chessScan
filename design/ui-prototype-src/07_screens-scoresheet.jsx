// screens-scoresheet.jsx — Confirm score sheet (screen 7). Active error-checking surface.

const { useState } = React;

function moveRows() {
  const rows = [];
  for (let i = 0; i < GAME_PLIES.length; i += 2) {
    rows.push({ n: i / 2 + 1, w: GAME_PLIES[i], wIdx: i, b: GAME_PLIES[i + 1], bIdx: i + 1 });
  }
  return rows;
}
const ROWS = moveRows();

// Deliberately-flagged OCR reads for the mock.
const FLAGS = {
  3: { type: 'ambiguous', suggest: 'Nf6' },
  7: { type: 'illegal', suggest: 'Bc5' },
};

function ConfirmSheetScreen({ dark, toggleDark, go }) {
  const [cursor, setCursor] = useState(2);
  const [resolved, setResolved] = useState(() => new Set());
  const [popup, setPopup] = useState(null);

  const unresolvedCount = Object.keys(FLAGS).filter(k => !resolved.has(+k)).length;

  function Cell({ ply, idx }) {
    if (!ply) return <div className="min-h-[40px]" />;
    const flag = FLAGS[idx];
    const bad = flag && !resolved.has(idx);
    const active = cursor === idx;
    const side = idx % 2 === 0 ? 'left-0' : 'right-0';
    return (
      <div className="relative">
        <button
          onClick={() => { setCursor(idx); setPopup(p => (bad ? (p === idx ? null : idx) : null)); }}
          className={'group relative w-full min-h-[40px] pl-3 pr-2 rounded-lg flex items-center gap-1 text-[16px] font-medium tabular-nums transition-colors ' +
            (active ? 'bg-sage/12 dark:bg-sage/20 text-sage'
              : bad ? 'bg-amber/10' + ' text-[#1A1A1A] dark:text-[#ECECEC]'
                : 'text-[#1A1A1A] dark:text-[#ECECEC] active:bg-black/5 dark:active:bg-white/5')}>
          <span className={bad && flag.type === 'illegal' ? 'underline decoration-dashed decoration-amber underline-offset-4' : ''}>{ply.san}</span>
          <Icon name="pencil" size={11} className="ml-auto text-[#9C9C9C] opacity-0 group-hover:opacity-100 transition-opacity" />
          {bad && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber" />}
        </button>
        {popup === idx && bad && (
          <div className={'anim-fadein absolute top-full mt-1.5 z-40 w-52 rounded-xl bg-white dark:bg-[#1E2024] border border-[#ECE6DC] dark:border-[#2A2D31] shadow-[0_14px_34px_rgba(0,0,0,.22)] p-3 text-left ' + side}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Icon name="alertCircle" size={14} className="text-amber" />
              <span className="text-[12px] font-semibold text-amber">{flag.type === 'illegal' ? "Doesn't fit the position" : 'Hard to read'}</span>
            </div>
            <p className="text-[13px] leading-snug text-[#1A1A1A] dark:text-[#ECECEC]">This looks like <span className="font-semibold">{flag.suggest}</span>. Tap to use that.</p>
            <div className="flex gap-2 mt-2.5">
              <button onClick={(e) => { e.stopPropagation(); setResolved(s => new Set(s).add(idx)); setPopup(null); }}
                className="flex-1 h-9 rounded-lg bg-sage text-white text-[12px] font-semibold">Accept {flag.suggest}</button>
              <button onClick={(e) => { e.stopPropagation(); setPopup(null); }}
                className="flex-1 h-9 rounded-lg border border-[#ECE6DC] dark:border-[#2A2D31] text-[#1A1A1A] dark:text-[#ECECEC] text-[12px] font-medium">Edit manually</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={'h-full w-full flex flex-col relative ' + T.bg}>
      {popup !== null && <div className="absolute inset-0 z-30" onClick={() => setPopup(null)} />}

      <div className="flex items-center justify-between px-2" style={{ paddingTop: SAFE_TOP }}>
        <TextLink onClick={() => go('camera', { mode: 'sheet' })} className="px-2"><Icon name="chevronLeft" size={18} strokeWidth={1.75} /> Retake</TextLink>
        <div className={'text-[16px] font-semibold ' + T.ink}>Check the moves</div>
        <SettingsButton go={go} />
      </div>

      {/* live board + status */}
      <div className="flex items-center gap-4 px-6 pt-1 pb-3">
        <div className="rounded-[8px] overflow-hidden border border-[#ECE6DC] dark:border-[#2A2D31] shrink-0">
          <Board position={GAME_POSITIONS[cursor + 1]} size={156}
            arrows={[{ from: GAME_PLIES[cursor].from, to: GAME_PLIES[cursor].to, width: 6 }]} dark={dark} />
        </div>
        <div className="flex-1 min-w-0">
          <div className={'text-[16px] font-semibold leading-tight ' + T.ink}>{GAME_PLIES[cursor].name}</div>
          {unresolvedCount > 0 ? (
            <div className="mt-1.5 flex items-start gap-1.5 text-[13px]">
              <span className="w-2 h-2 rounded-full bg-amber mt-1 shrink-0" />
              <span className="text-amber font-medium">{unresolvedCount} move{unresolvedCount > 1 ? 's' : ''} need your attention.</span>
            </div>
          ) : (
            <div className="mt-1.5 flex items-center gap-1.5 text-[13px]">
              <Icon name="check" size={15} strokeWidth={2} className="text-sage shrink-0" />
              <span className={T.sub}>All clear — tap any move to jump there.</span>
            </div>
          )}
        </div>
      </div>

      {/* move grid */}
      <div className="flex-1 overflow-y-auto no-sb px-6">
        <div className="flex items-center justify-between px-1 pb-1.5">
          <span className="text-[12px] font-semibold uppercase tracking-wide text-[#9C9C9C]">Recognized moves</span>
          <div className="flex items-center gap-1 text-[12px] text-[#9C9C9C]">
            <span className="w-5 h-5 flex items-center justify-center opacity-30"><Icon name="chevronLeft" size={14} /></span>
            <span className="tabular-nums">Page 1 of 2</span>
            <span className="w-5 h-5 flex items-center justify-center"><Icon name="chevronRight" size={14} /></span>
          </div>
        </div>
        <div className="grid grid-cols-[28px_1fr_1fr] items-center gap-x-1 text-[12px] font-semibold uppercase tracking-wide text-[#9C9C9C] pb-1 px-1">
          <span>#</span><span className="px-3">White</span><span className="px-3">Black</span>
        </div>
        <div className="rounded-[12px] border border-[#ECE6DC] dark:border-[#2A2D31] bg-white dark:bg-[#1E2024]">
          {ROWS.map((r, i) => (
            <div key={r.n} className={'grid grid-cols-[28px_1fr_1fr] items-center gap-x-1 px-2 py-1 ' +
              (i ? 'border-t border-[#F0EBE0] dark:border-[#23262b]' : '')}>
              <span className="text-[14px] tabular-nums text-[#9C9C9C] text-center">{r.n}</span>
              <Cell ply={r.w} idx={r.wIdx} />
              <Cell ply={r.b} idx={r.bIdx} />
            </div>
          ))}
        </div>
        <div className="h-3" />
      </div>

      <div className="px-6 border-t border-[#ECE6DC] dark:border-[#2A2D31]" style={{ paddingBottom: SAFE_BOTTOM + 10, paddingTop: 12 }}>
        <PrimaryButton onClick={() => go('gameReview', { mode: 'sheet' })} icon="play">Start review</PrimaryButton>
      </div>
    </div>
  );
}

Object.assign(window, { ConfirmSheetScreen });
