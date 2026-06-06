// screens-saved.jsx — Saved Games library (screen 9): sort, filter, swipe actions, empty state.

const { useState: useStateSv, useRef: useRefSv } = React;

const SORTS = [
  { id: 'saved', label: 'Date saved' },
  { id: 'played', label: 'Date played' },
  { id: 'event', label: 'Event' },
  { id: 'players', label: 'Players' },
  { id: 'result', label: 'Result' },
];

function sortGames(list, sort) {
  const a = [...list];
  if (sort === 'saved') a.sort((x, y) => y.dateSaved - x.dateSaved);
  else if (sort === 'played') a.sort((x, y) => (y.datePlayed !== '\u2014') - (x.datePlayed !== '\u2014') || y.dateSaved - x.dateSaved);
  else if (sort === 'event') a.sort((x, y) => x.event.localeCompare(y.event));
  else if (sort === 'players') a.sort((x, y) => x.white.localeCompare(y.white));
  else if (sort === 'result') a.sort((x, y) => x.result.localeCompare(y.result));
  return a;
}

function formatGameSubtitle(game, t) {
  if (game.type === 'P') return t ? t('saved.positionScan') : 'Position scan';
  const parts = [];
  if (game.event) parts.push(game.event);
  if (game.white !== '\u2014' || game.black !== '\u2014') parts.push((game.white || '?') + ' vs ' + (game.black || '?'));
  if (game.result && game.result !== '\u2014') parts.push(game.result);
  return parts.join(' \u00b7 ');
}

function SwipeRow({ game, t, onOpen, onExport, onDelete }) {
  const [tx, setTx] = useStateSv(0);
  const stateRef = useRefSv({ open: false, startX: 0, moved: false });
  const b = savedBoard(game);
  const REVEAL = 152;

  function down(e) {
    if (e.target.closest('[data-action]')) return;
    const st = stateRef.current;
    st.startX = e.clientX; st.moved = false; st.cur = st.open ? -REVEAL : 0;
    const move = (ev) => {
      const dx = ev.clientX - st.startX;
      if (Math.abs(dx) > 5) st.moved = true;
      let nx = (st.open ? -REVEAL : 0) + dx;
      nx = Math.max(-REVEAL, Math.min(0, nx));
      st.cur = nx; setTx(nx);
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      if (!st.moved) { if (st.open) { st.open = false; setTx(0); } else { onOpen(); } return; }
      const shouldOpen = st.cur < -REVEAL / 2;
      st.open = shouldOpen; setTx(shouldOpen ? -REVEAL : 0);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }

  return (
    <div className="relative rounded-[12px] overflow-hidden">
      <div className="absolute inset-y-0 right-0 flex">
        <button data-action onClick={onExport}
          className="w-[76px] flex flex-col items-center justify-center gap-1 bg-sage text-white text-[12px] font-medium">
          <Icon name="download" size={20} /> Export
        </button>
        <button data-action onClick={onDelete}
          className="w-[76px] flex flex-col items-center justify-center gap-1 bg-[#3a3d42] text-white text-[12px] font-medium">
          <Icon name="trash" size={20} /> Delete
        </button>
      </div>
      <div onPointerDown={down}
        className="relative flex items-center gap-3 p-3 bg-white dark:bg-[#1E2024] border border-[#ECE6DC] dark:border-[#2A2D31] active:bg-black/[.02]"
        style={{ transform: `translateX(${tx}px)`, transition: 'transform .22s cubic-bezier(0.16,1,0.3,1)', touchAction: 'pan-y' }}>
        <div className="relative rounded-[8px] overflow-hidden border border-[#ECE6DC] dark:border-[#2A2D31] shrink-0">
          <Board position={b.pos} size={60} arrows={b.arrow ? [{ from: b.arrow[0], to: b.arrow[1], width: 3 }] : null} />
          <TypeChip type={game.type} />
        </div>
        <div className="flex-1 min-w-0">
          <div className={'text-[15px] font-semibold leading-tight truncate ' + T.ink}>{game.title}</div>
          <div className={'text-[13px] mt-0.5 truncate ' + T.sub}>
            {formatGameSubtitle(game, t)}
          </div>
        </div>
        <Icon name="chevronRight" size={18} className="text-[#C9BFA9] dark:text-[#3a3d42] shrink-0" />
      </div>
    </div>
  );
}

function SavedGamesScreen({ dark, toggleDark, go, toast, t }) {
  const [games, setGames] = useStateSv(SAVED_GAMES);
  const [sort, setSort] = useStateSv('saved');
  const [filter, setFilter] = useStateSv('all');
  const [menu, setMenu] = useStateSv(false);

  const filtered = sortGames(games.filter(g => filter === 'all' || g.type === filter), sort);
  const chips = [{ id: 'all', label: 'All' }, { id: 'P', label: 'Position' }, { id: 'S', label: 'Score sheet' }];

  return (
    <div className={'h-full w-full flex flex-col relative ' + T.bg}>
      <div className="flex items-center justify-between px-2" style={{ paddingTop: SAFE_TOP }}>
        <TextLink onClick={() => go('home')} className="px-2"><Icon name="chevronLeft" size={18} strokeWidth={1.75} /> Home</TextLink>
        <div className={'text-[16px] font-semibold ' + T.ink}>Saved Games</div>
        <div className="flex items-center">
          <IconButton name="search" label="Search" />
          <SettingsButton go={go} />
        </div>
      </div>

      {/* scrim behind the sort dropdown */}
      {menu && <div className="absolute inset-0 z-30 bg-black/30 anim-fadein" onClick={() => setMenu(false)} />}

      {/* row 1: sort dropdown */}
      <div className="px-5 pt-1">
        <div className={'relative inline-block ' + (menu ? 'z-40' : 'z-10')}>
          <button onClick={() => setMenu(m => !m)}
            className="flex items-center gap-1.5 h-9 px-3 rounded-full bg-white dark:bg-[#1E2024] border border-[#ECE6DC] dark:border-[#2A2D31] text-[13px] font-medium text-[#1A1A1A] dark:text-[#ECECEC]">
            <Icon name="arrowUpDown" size={15} className="text-[#9C9C9C]" />
            {SORTS.find(s => s.id === sort).label}
            <Icon name="chevronDown" size={14} className={'text-[#9C9C9C] transition-transform ' + (menu ? 'rotate-180' : '')} />
          </button>
          {menu && (
            <div className="anim-fadein absolute top-11 left-0 w-48 rounded-xl bg-white dark:bg-[#1E2024] border border-[#ECE6DC] dark:border-[#2A2D31] shadow-[0_12px_30px_rgba(0,0,0,.18)] overflow-hidden z-40">
              {SORTS.map(s => (
                <button key={s.id} onClick={() => { setSort(s.id); setMenu(false); }}
                  className={'w-full text-left px-4 py-2.5 text-[14px] flex items-center justify-between ' +
                    (s.id === sort ? 'text-sage font-semibold' : 'text-[#1A1A1A] dark:text-[#ECECEC]')}>
                  {s.label}{s.id === sort && <Icon name="check" size={15} strokeWidth={2} />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* row 2: filter chips */}
      <div className="px-5 pt-3 pb-2 flex items-center gap-1.5 overflow-x-auto no-sb">
        {chips.map(c => (
          <button key={c.id} onClick={() => setFilter(c.id)}
            className={'h-9 px-3.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors ' +
              (filter === c.id ? 'bg-sage text-white' : 'bg-white dark:bg-[#1E2024] border border-[#ECE6DC] dark:border-[#2A2D31] text-[#6B6B6B] dark:text-[#9C9C9C]')}>
            {c.label}
          </button>
        ))}
      </div>

      {/* list / empty state */}
      <div className="flex-1 overflow-y-auto no-sb px-5" style={{ paddingBottom: SAFE_BOTTOM + 8 }} onClick={() => menu && setMenu(false)}>
        {filtered.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-6 -mt-10">
            <div className="w-20 h-20 rounded-3xl bg-sage/10 dark:bg-sage/20 flex items-center justify-center text-sage mb-4">
              <Icon name="bookmark" size={34} />
            </div>
            <div className={'text-[17px] font-semibold ' + T.ink}>Nothing saved yet</div>
            <p className={'text-[14px] mt-1.5 leading-snug ' + T.sub} style={{ textWrap: 'pretty' }}>
              Anything you analyze can be saved here. Try scanning your first board.
            </p>
            <div className="mt-5 w-full max-w-[220px]">
              <PrimaryButton onClick={() => go('camera', { mode: 'board' })} icon="camera">Scan now</PrimaryButton>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {filtered.map(g => (
              <SwipeRow key={g.id} game={g} t={t}
                onOpen={() => go('gameReview', { mode: g.type === 'P' ? 'position' : 'sheet', title: g.title })}
                onExport={() => toast('Exported as PGN.')}
                onDelete={() => { setGames(gs => gs.filter(x => x.id !== g.id)); toast('Game removed.'); }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { SavedGamesScreen });
