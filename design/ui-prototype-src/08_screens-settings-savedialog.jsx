// screens-settings.jsx — Settings screen + Save Game dialog (+ small modals).

const { useState: useStateSet } = React;

// ── shared bits ──────────────────────────────────────────────────────────────
function SettingsButton({ go, variant }) {
  const overlay = variant === 'overlay';
  return (
    <button onClick={() => go('settings')} aria-label="Settings"
      className={'w-11 h-11 flex items-center justify-center rounded-full transition-colors ' +
        (overlay ? 'text-white bg-black/30 backdrop-blur-sm active:bg-black/50'
          : 'text-[#1A1A1A] dark:text-[#ECECEC] active:bg-black/5 dark:active:bg-white/10')}>
      <Icon name="settings" size={overlay ? 21 : 22} />
    </button>
  );
}

function Section({ title, children }) {
  return (
    <div className="mt-6 first:mt-2">
      <div className="px-1 pb-1.5 text-[12px] font-semibold uppercase tracking-wide text-[#9C9C9C]">{title}</div>
      <div className="rounded-[14px] overflow-hidden bg-white dark:bg-[#1E2024] border border-[#ECE6DC] dark:border-[#2A2D31] divide-y divide-[#F0EBE0] dark:divide-[#23262b]">
        {children}
      </div>
    </div>
  );
}

function Row({ label, value, sub, control, onClick, disabled }) {
  const Tag = onClick && !disabled ? 'button' : 'div';
  return (
    <Tag onClick={onClick && !disabled ? onClick : undefined}
      className={'w-full flex items-center gap-3 px-4 min-h-[52px] text-left ' +
        (onClick && !disabled ? 'active:bg-black/[.03] dark:active:bg-white/[.04] transition-colors ' : '') +
        (disabled ? 'opacity-55 ' : '')}>
      <div className="flex-1 min-w-0">
        <div className={'text-[15px] ' + (disabled ? 'text-[#9C9C9C]' : 'text-[#1A1A1A] dark:text-[#ECECEC]')}>{label}</div>
        {sub && <div className="text-[12px] text-[#9C9C9C] mt-0.5">{sub}</div>}
      </div>
      {control}
      {value != null && <span className="text-[14px] text-[#6B6B6B] dark:text-[#9C9C9C] tabular-nums">{value}</span>}
      {onClick && !disabled && <Icon name="chevronRight" size={16} className="text-[#C2B9A7] dark:text-[#5d6065] -mr-1" />}
    </Tag>
  );
}

function Toggle({ on, onChange }) {
  return (
    <button onClick={() => onChange(!on)} aria-label="Toggle" aria-pressed={on}
      className={'w-[46px] h-[28px] rounded-full p-0.5 transition-colors duration-200 ' + (on ? 'bg-sage' : 'bg-[#D8CFC0] dark:bg-[#3a3d42]')}>
      <div className={'w-[24px] h-[24px] rounded-full bg-white shadow transition-transform duration-200 ' + (on ? 'translate-x-[18px]' : 'translate-x-0')} />
    </button>
  );
}

function MiniSeg({ options, value, onChange }) {
  return (
    <div className="flex p-1 rounded-xl bg-[#EFE9DE] dark:bg-[#23262b] gap-1">
      {options.map(o => {
        const active = o.value === value;
        return (
          <button key={o.value} onClick={() => onChange(o.value)}
            className={'flex-1 min-h-[40px] px-2 rounded-lg text-[14px] font-semibold tabular-nums transition-all ' +
              (active ? 'bg-white dark:bg-[#33373d] text-[#1A1A1A] dark:text-[#ECECEC] shadow-[0_1px_4px_rgba(0,0,0,.1)]' : 'text-[#6B6B6B] dark:text-[#9C9C9C]')}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Settings screen ──────────────────────────────────────────────────────────
function SettingsScreen({ dark, toggleDark, go, t, lang, setLang, profile, setProfile, onBack }) {
  const [editName, setEditName] = useStateSet(false);
  const [nameDraft, setNameDraft] = useStateSet(profile.displayName);

  function commitName() { setProfile({ displayName: nameDraft.trim() }); setEditName(false); }

  return (
    <div className={'h-full w-full flex flex-col relative ' + T.bg}>
      <div className="flex items-center gap-1 px-2" style={{ paddingTop: SAFE_TOP }}>
        <IconButton name="chevronLeft" label="Back" onClick={onBack} className="text-[#1A1A1A] dark:text-[#ECECEC]" />
        <div className={'text-[17px] font-bold ' + T.ink}>{t('settings.title')}</div>
      </div>

      <div className="flex-1 overflow-y-auto no-sb px-5" style={{ paddingBottom: SAFE_BOTTOM + 12 }}>
        <Section title={t('settings.profile')}>
          <Row label={t('settings.displayName')} value={profile.displayName || t('settings.notSet')}
            onClick={() => { setNameDraft(profile.displayName); setEditName(true); }} />
          <Row label={t('settings.defaultColor')}
            control={<MiniSeg value={profile.defaultColor}
              onChange={(v) => setProfile({ defaultColor: v })}
              options={[{ value: 'white', label: t('settings.white') }, { value: 'black', label: t('settings.black') }]} />} />
        </Section>

        <Section title={t('settings.preferences')}>
          <Row label={t('settings.darkMode')} control={<Toggle on={dark} onChange={toggleDark} />} />
          <Row label={t('settings.language')}
            control={<MiniSeg value={lang} onChange={setLang}
              options={[{ value: 'en', label: 'EN' }, { value: 'vi', label: 'VI' }]} />} />
        </Section>

        <Section title={t('settings.subscription')}>
          <Row label={t('settings.currentPlan')} value={t('settings.free')} />
          <Row label={t('settings.upgradeToPro')} sub={t('settings.comingSoon')} disabled />
        </Section>

        <Section title={t('settings.account')}>
          <Row label={t('settings.signIn')} sub={t('settings.comingSoon')} disabled />
        </Section>

        <Section title={t('settings.about')}>
          <Row label={t('settings.version')} value="1.0.0" />
          <Row label={t('settings.terms')} onClick={() => {}} />
          <Row label={t('settings.privacy')} onClick={() => {}} />
          <Row label={t('settings.contact')} onClick={() => {}} />
        </Section>
      </div>

      {/* edit display-name modal */}
      {editName && (
        <div className="absolute inset-0 z-50 flex items-end" onClick={() => setEditName(false)}>
          <div className="absolute inset-0 bg-black/35" />
          <div className="relative w-full rounded-t-[20px] bg-[#FAF7F2] dark:bg-[#16181B] border-t border-[#ECE6DC] dark:border-[#2A2D31] p-5"
            style={{ paddingBottom: SAFE_BOTTOM + 16 }} onClick={(e) => e.stopPropagation()}>
            <div className="w-9 h-1 rounded-full bg-[#D8CFC0] dark:bg-[#33373c] mx-auto mb-4" />
            <label className="text-[13px] font-semibold text-[#6B6B6B] dark:text-[#9C9C9C]">{t('settings.editName')}</label>
            <input autoFocus value={nameDraft} onChange={(e) => setNameDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') commitName(); }}
              placeholder={t('settings.namePlaceholder')}
              className="w-full mt-2 h-12 px-3.5 rounded-xl bg-white dark:bg-[#1E2024] border border-[#ECE6DC] dark:border-[#2A2D31] text-[16px] text-[#1A1A1A] dark:text-[#ECECEC] outline-none focus:border-sage" />
            <button onClick={commitName} className="w-full mt-3 h-12 rounded-2xl bg-sage text-white text-[16px] font-semibold">{t('settings.done')}</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Save Game dialog ──────────────────────────────────────────────────────────
function DlgField({ label, required, flush, children }) {
  return (
    <label className={'block ' + (flush ? 'mt-0' : 'mt-4 first:mt-0')}>
      <span className="text-[14px] font-medium text-[#6B6B6B] dark:text-[#9C9C9C]">{label}{required && <span className="text-sage"> *</span>}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

// Result picker — selected option is solid sage with white text (per save-dialog spec).
function ResultSeg({ value, onChange, options }) {
  return (
    <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-[#EFE9DE] dark:bg-[#23262b]">
      {options.map(o => {
        const active = o === value;
        return (
          <button key={o} type="button" onClick={() => onChange(o)}
            className={'h-10 rounded-lg text-[14px] font-semibold tabular-nums transition-colors ' +
              (active ? 'bg-sage text-white shadow-[0_1px_4px_rgba(92,122,107,.35)]' : 'text-[#6B6B6B] dark:text-[#9C9C9C] active:bg-black/[.04] dark:active:bg-white/[.05]')}>
            {o}
          </button>
        );
      })}
    </div>
  );
}

function dlgInputCls() {
  return 'w-full h-11 px-4 rounded-lg bg-white dark:bg-[#1E2024] border border-[#E5E0D5] dark:border-[#2A2D31] text-[16px] text-[#1A1A1A] dark:text-[#ECECEC] outline-none focus:border-sage';
}

function SaveGameDialog({ t, profile, isPosition, defaultTitle, onSave, onCancel }) {
  const [form, setForm] = useStateSet(() => ({
    title: defaultTitle || '',
    event: '', site: '', date: formatPGNDate(new Date()), round: '',
    white: profile.defaultColor === 'white' ? profile.displayName : '',
    black: profile.defaultColor === 'black' ? profile.displayName : '',
    result: '*',
  }));
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="absolute inset-0 z-[60] flex items-end" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative w-full rounded-t-[22px] bg-[#FAF7F2] dark:bg-[#16181B] border-t border-[#ECE6DC] dark:border-[#2A2D31] flex flex-col"
        style={{ maxHeight: '92%' }} onClick={(e) => e.stopPropagation()}>
        <div className="pt-3 pb-2 shrink-0">
          <div className="w-9 h-1 rounded-full bg-[#D8CFC0] dark:bg-[#33373c] mx-auto" />
        </div>
        <div className="px-5 overflow-y-auto no-sb flex-1 min-h-0" style={{ paddingBottom: 8 }}>
          <h2 className={'text-[19px] font-bold ' + T.ink}>{t('save.title')}</h2>
          <p className="text-[12px] text-[#9C9C9C] mt-0.5">{t('save.required')}</p>

          <DlgField label={t('save.gameTitle')} required>
            <input value={form.title} onChange={(e) => set('title', e.target.value)} className={dlgInputCls()} />
          </DlgField>

          <DlgField label={t('save.event')}>
            <input value={form.event} onChange={(e) => set('event', e.target.value)} placeholder="Tuesday rapid" className={dlgInputCls()} />
          </DlgField>
          <DlgField label={t('save.site')}>
            <input value={form.site} onChange={(e) => set('site', e.target.value)} placeholder="Local chess club" className={dlgInputCls()} />
          </DlgField>
          <DlgField label={t('save.date')}>
            <input type="date" value={isoFromPGNDate(form.date)} onChange={(e) => set('date', pgnDateFromISO(e.target.value))} className={dlgInputCls()} />
          </DlgField>
          <DlgField label={t('save.round')}>
            <input value={form.round} onChange={(e) => set('round', e.target.value)} placeholder="1" className={dlgInputCls()} />
          </DlgField>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <DlgField label={t('save.white')} flush>
              <input value={form.white} onChange={(e) => set('white', e.target.value)} className={dlgInputCls()} />
            </DlgField>
            <DlgField label={t('save.black')} flush>
              <input value={form.black} onChange={(e) => set('black', e.target.value)} className={dlgInputCls()} />
            </DlgField>
          </div>
          <DlgField label={t('save.result')}>
            <ResultSeg value={form.result} onChange={(v) => set('result', v)}
              options={['1-0', '½-½', '0-1', '*']} />
          </DlgField>
        </div>
        <div className="px-5 pt-3 flex gap-3 shrink-0 border-t border-[#ECE6DC] dark:border-[#2A2D31] mt-2" style={{ paddingBottom: SAFE_BOTTOM + 12 }}>
          <button onClick={onCancel} className="flex-1 h-12 rounded-2xl border border-[#ECE6DC] dark:border-[#2A2D31] text-[15px] font-medium text-[#1A1A1A] dark:text-[#ECECEC]">{t('save.cancel')}</button>
          <button onClick={() => onSave(form)} className="flex-1 h-12 rounded-2xl bg-sage text-white text-[15px] font-semibold">{t('save.save')}</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { SettingsButton, SettingsScreen, SaveGameDialog, Toggle, MiniSeg, ResultSeg });
