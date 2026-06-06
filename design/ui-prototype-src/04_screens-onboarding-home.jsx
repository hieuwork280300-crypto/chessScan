// screens-onboarding.jsx — shared UI tokens + Onboarding 1/2 + Home.

const SAFE_TOP = 54;
const SAFE_BOTTOM = 30;

const T = {
  bg: 'bg-[#FAF7F2] dark:bg-[#16181B]',
  ink: 'text-[#1A1A1A] dark:text-[#ECECEC]',
  sub: 'text-[#6B6B6B] dark:text-[#9C9C9C]',
  card: 'bg-white dark:bg-[#1E2024]',
  border: 'border-[#ECE6DC] dark:border-[#2A2D31]',
};

function PrimaryButton({ children, onClick, icon, className = '' }) {
  return (
    <button onClick={onClick}
      className={'w-full min-h-[52px] rounded-2xl bg-sage text-white text-[16px] font-semibold ' +
        'flex items-center justify-center gap-2 active:scale-[.985] transition-transform duration-200 ease-out ' +
        'shadow-[0_8px_22px_rgba(92,122,107,.34)] ' + className}>
      {icon && <Icon name={icon} size={19} strokeWidth={1.75} />}
      {children}
    </button>
  );
}

function TextLink({ children, onClick, className = '', icon }) {
  return (
    <button onClick={onClick}
      className={'inline-flex items-center gap-1.5 text-sage text-[16px] font-medium min-h-[44px] px-1 ' +
        'active:opacity-60 transition-opacity ' + className}>
      {children}
      {icon && <Icon name={icon} size={18} strokeWidth={1.75} />}
    </button>
  );
}

function DarkToggle({ dark, onToggle }) {
  return (
    <button onClick={onToggle} aria-label="Toggle dark mode"
      className="w-11 h-11 -mr-1.5 flex items-center justify-center rounded-full text-[#1A1A1A] dark:text-[#ECECEC] active:bg-black/5 dark:active:bg-white/10 transition-colors">
      <Icon name={dark ? 'sun' : 'moon'} size={21} />
    </button>
  );
}

function IconButton({ name, onClick, label, size = 21, className = '' }) {
  return (
    <button onClick={onClick} aria-label={label}
      className={'w-11 h-11 flex items-center justify-center rounded-full active:bg-black/5 dark:active:bg-white/10 transition-colors ' + className}>
      <Icon name={name} size={size} />
    </button>
  );
}

// ── Onboarding shared chrome ──
function PageDots({ index, count = 2 }) {
  return (
    <div className="flex items-center gap-2 justify-center">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={'h-1.5 rounded-full transition-all duration-200 ' +
          (i === index ? 'w-6 bg-sage' : 'w-1.5 bg-[#D8CFC0] dark:bg-[#33373c]')} />
      ))}
    </div>
  );
}

// Demo art: the app's read-out of a genuinely hard position (Kasparov's 1999 rook sacrifice).
function BoardArt() {
  return (
    <div className="relative w-full h-[290px] flex items-center justify-center">
      <div className="anim-popin rounded-[26px] p-3 bg-white dark:bg-[#1E2024] border border-[#ECE6DC] dark:border-[#2A2D31] shadow-[0_22px_46px_rgba(0,0,0,.20)]">
        <Board position={fenToPos(KT99_FEN)} size={214}
          arrows={[{ from: 'd1', to: 'd4', glow: true }]} />
        <div className="flex items-center gap-2 px-1 pt-2.5 pb-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-sage shrink-0" />
          <span className="text-[12px] font-semibold text-[#1A1A1A] dark:text-[#ECECEC] leading-tight">
            Rook takes d4 <span className="font-medium text-[#6B6B6B] dark:text-[#9C9C9C]">— a rook sacrifice that wins.</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function SheetArt() {
  const rows = [['1.', 'e4', 'e5'], ['2.', 'Nf3', 'Nc6'], ['3.', 'Bb5', 'a6'], ['4.', 'Ba4', 'Nf6']];
  return (
    <div className="relative w-full h-[290px] flex items-center justify-center">
      <div style={{ transform: 'rotate(-6deg)', filter: 'drop-shadow(0 22px 26px rgba(70,50,20,.26))' }}
        className="relative w-[186px] bg-[#FCFAF4] rounded-[10px] overflow-hidden border border-[#EadFC9]">
        <div className="px-4 pt-3 pb-1 text-[11px] tracking-wide text-[#9a8e74] font-semibold uppercase">Score sheet</div>
        {rows.map((r, i) => (
          <div key={i} className="grid grid-cols-[26px_1fr_1fr] items-baseline px-4 py-1 border-t border-dashed border-[#e7dcc4]">
            <span className="text-[12px] text-[#aa9c80] font-sans">{r[0]}</span>
            <span className="font-hand text-[22px] text-[#33312b]">{r[1]}</span>
            <span className="font-hand text-[22px] text-[#33312b]">{r[2]}</span>
          </div>
        ))}
        <div className="absolute left-0 right-0 h-[34px] top-[96px] bg-gradient-to-b from-sage/0 via-sage/25 to-sage/0" />
        <div className="absolute left-0 right-0 h-[2px] top-[112px] bg-sage/80" />
      </div>
      <div className="absolute right-2 bottom-3 anim-popin" style={{ animationDelay: '.15s' }}>
        <div className="w-[128px] rounded-[24px] p-3 bg-white dark:bg-[#1E2024] border border-[#ECE6DC] dark:border-[#2A2D31] shadow-[0_18px_38px_rgba(0,0,0,.22)]">
          {[['1', 'e4', 'e5'], ['2', 'Nf3', 'Nc6'], ['3', 'Bb5', 'a6']].map((r, i) => (
            <div key={i} className="grid grid-cols-[16px_1fr_1fr] gap-1 py-1 text-[12px] tabular-nums">
              <span className="text-[#9C9C9C]">{r[0]}</span>
              <span className="font-medium text-[#1A1A1A] dark:text-[#ECECEC]">{r[1]}</span>
              <span className="font-medium text-[#1A1A1A] dark:text-[#ECECEC]">{r[2]}</span>
            </div>
          ))}
          <div className="mt-1.5 flex items-center gap-1.5 text-sage">
            <Icon name="check" size={14} strokeWidth={2} />
            <span className="text-[11px] font-semibold">Read</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function OnboardingScreen({ index, dark, toggleDark, go, onNext }) {
  const content = index === 0
    ? { art: <BoardArt />, title: 'Stuck on a tough move?',
        body: 'Snap your board. See what to play \u2014 and why, in plain words.' }
    : { art: <SheetArt />, title: 'Or your handwritten score sheet.',
        body: 'Photograph your moves and review the whole game, move by move.' };
  return (
    <div className={'h-full w-full flex flex-col ' + T.bg}>
      <div className="flex justify-end px-3" style={{ paddingTop: SAFE_TOP }}>
        <SettingsButton go={go} />
      </div>
      <div className="flex-1 flex flex-col justify-center px-7">
        {content.art}
        <div className="mt-8">
          <h1 className={'text-[28px] leading-[1.18] font-bold tracking-[-0.01em] ' + T.ink} style={{ textWrap: 'balance' }}>
            {content.title}
          </h1>
          <p className={'mt-3 text-[16px] leading-[1.5] ' + T.sub} style={{ textWrap: 'pretty' }}>
            {content.body}
          </p>
        </div>
      </div>
      <div className="px-7" style={{ paddingBottom: SAFE_BOTTOM + 14 }}>
        <PageDots index={index} />
        <div className="mt-6">
          {index === 0 ? (
            <div className="flex justify-end">
              <TextLink onClick={onNext} icon="arrowRight">Next</TextLink>
            </div>
          ) : (
            <PrimaryButton onClick={onNext}>Get started</PrimaryButton>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Home (screen 3) ──
function MiniSheetArt() {
  const rows = [['1', 'e4', 'e5'], ['2', 'Nf3', 'Nc6'], ['3', 'Bb5', '']];
  return (
    <div className="w-[72px] h-[72px] rounded-[8px] overflow-hidden bg-[#FCFAF4] border border-[#EadFC9] shrink-0 relative">
      <div className="px-2 pt-1.5 pb-0.5 text-[6px] tracking-wide text-[#9a8e74] font-semibold uppercase">Score sheet</div>
      {rows.map((r, i) => (
        <div key={i} className="grid grid-cols-[10px_1fr_1fr] items-baseline px-2 py-px border-t border-dashed border-[#e7dcc4]">
          <span className="text-[7px] text-[#aa9c80]">{r[0]}</span>
          <span className="font-hand text-[12px] leading-none text-[#33312b]">{r[1]}</span>
          <span className="font-hand text-[12px] leading-none text-[#33312b]">{r[2]}</span>
        </div>
      ))}
      <div className="absolute left-0 right-0 h-[2px] top-[44px] bg-sage/70" />
    </div>
  );
}

function HomeTile({ icon, title, sub, art, onClick }) {
  return (
    <button onClick={onClick}
      className="group w-full text-left rounded-[20px] p-4 pl-5 bg-white dark:bg-[#1E2024] border border-[#ECE6DC] dark:border-[#2A2D31] shadow-[0_2px_10px_rgba(60,45,20,.05)] active:scale-[.99] transition-transform duration-200 ease-out flex items-center gap-4">
      <div className="flex-1 min-w-0">
        <div className="w-11 h-11 rounded-2xl bg-sage/12 dark:bg-sage/20 flex items-center justify-center text-sage">
          <Icon name={icon} size={22} />
        </div>
        <div className={'mt-3.5 text-[20px] font-bold leading-tight ' + T.ink}>{title}</div>
        <div className={'mt-0.5 text-[14px] ' + T.sub}>{sub}</div>
      </div>
      <div className="shrink-0 rounded-[10px] overflow-hidden border border-[#ECE6DC] dark:border-[#2A2D31]">
        {art}
      </div>
    </button>
  );
}

function TypeChip({ type }) {
  return (
    <span className="absolute top-1.5 left-1.5 w-5 h-5 rounded-md bg-black/55 backdrop-blur-sm text-white flex items-center justify-center" title={type === 'P' ? 'Position scan' : 'Score-sheet scan'}>
      <Icon name={type === 'P' ? 'image' : 'fileText'} size={12} strokeWidth={2} />
    </span>
  );
}

function SavedThumb({ game, onClick }) {
  const b = savedBoard(game);
  return (
    <button onClick={onClick} className="flex flex-col items-start gap-2 active:opacity-70 transition-opacity w-[88px] shrink-0">
      <div className="relative rounded-[10px] overflow-hidden border border-[#ECE6DC] dark:border-[#2A2D31]">
        <Board position={b.pos} size={88} arrows={b.arrow ? [{ from: b.arrow[0], to: b.arrow[1], width: 4 }] : null} />
        <TypeChip type={game.type} />
      </div>
      <div className="px-0.5 w-full">
        <div className={'text-[12px] font-semibold leading-tight truncate ' + T.ink}>{game.title}</div>
        <div className={'text-[11px] ' + T.sub}>{game.dateSavedLabel}</div>
      </div>
    </button>
  );
}

function HomeScreen({ dark, toggleDark, go, t }) {
  return (
    <div className={'h-full w-full flex flex-col ' + T.bg}>
      <div className="flex items-center justify-between px-5 pb-1" style={{ paddingTop: SAFE_TOP }}>
        <div>
          <div className="text-[13px] font-medium text-sage tracking-wide">{t('home.greeting')}</div>
          <h1 className={'text-[26px] font-bold tracking-[-0.01em] ' + T.ink}>Chess Scan</h1>
        </div>
        <SettingsButton go={go} />
      </div>

      <div className="flex-1 overflow-y-auto no-sb px-5" style={{ paddingBottom: SAFE_BOTTOM }}>
        <div className="flex flex-col gap-3.5 mt-2">
          <HomeTile icon="scan" title={t('home.scanPosition')} sub={t('home.scanPositionSub')}
            art={<Board position={fenToPos(KT99_FEN)} size={72} arrows={[{ from: 'd1', to: 'd4', width: 4, glow: true }]} />}
            onClick={() => go('camera', { mode: 'board' })} />
          <HomeTile icon="sheet" title={t('home.scanSheet')} sub={t('home.scanSheetSub')}
            art={<MiniSheetArt />}
            onClick={() => go('camera', { mode: 'sheet' })} />
        </div>

        <div className="mt-8">
          <button onClick={() => go('saved')} className="w-full flex items-center justify-between mb-3 group">
            <span className={'text-[14px] font-semibold ' + T.ink}>{t('home.savedGames')}</span>
            <span className="flex items-center gap-1 text-sage text-[13px] font-medium">
              {t('home.all')} <Icon name="arrowRight" size={16} strokeWidth={1.75} />
            </span>
          </button>
          <div className="flex gap-4 overflow-x-auto no-sb -mx-1 px-1 pb-1">
            {SAVED_GAMES.map(g => (
              <SavedThumb key={g.id} game={g} onClick={() => go('gameReview', { mode: g.type === 'P' ? 'position' : 'sheet', title: g.title })} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  SAFE_TOP, SAFE_BOTTOM, T, PrimaryButton, TextLink, DarkToggle, IconButton,
  PageDots, OnboardingScreen, HomeScreen, TypeChip,
});
