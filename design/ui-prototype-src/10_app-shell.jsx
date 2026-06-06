// app.jsx — shell: navigation, dark mode, toast, device frame + fit-to-viewport.

const { useState, useRef, useEffect, useMemo } = React;

const DEVICE_W = 390;
const DEVICE_H = 844;

function useFit(W, H) {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const f = () => {
      const s = Math.min(1, (window.innerWidth - 28) / W, (window.innerHeight - 44) / H);
      setScale(s > 0 ? s : 1);
    };
    f();
    window.addEventListener('resize', f);
    return () => window.removeEventListener('resize', f);
  }, [W, H]);
  return scale;
}

function App() {
  const [screen, setScreen] = useState('onb1');
  const [cameraMode, setCameraMode] = useState('board');
  const [reviewMode, setReviewMode] = useState('position');
  const [reviewTitle, setReviewTitle] = useState(null);
  const [settingsFrom, setSettingsFrom] = useState('home');
  const [dark, setDark] = useState(false);
  const [lang, setLangState] = useState(loadLang());
  const [profile, setProfileState] = useState(loadProfile());
  const [toastMsg, setToastMsg] = useState(null);
  const toastTimer = useRef(null);
  const scale = useFit(DEVICE_W, DEVICE_H);

  const t = useMemo(() => makeT(lang), [lang]);
  function setLang(l) { setLangState(l); saveLang(l); }
  function setProfile(updates) { setProfileState(p => { const np = { ...p, ...updates }; saveProfile(np); return np; }); }

  function go(next, opts = {}) {
    if (opts.mode) {
      if (next === 'camera') setCameraMode(opts.mode);
      if (next === 'gameReview') setReviewMode(opts.mode);
    }
    if (next === 'gameReview') setReviewTitle(opts.title || null);
    if (next === 'settings') setSettingsFrom(screen);
    setScreen(next);
  }
  function toast(msg) {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 2400);
  }
  const toggleDark = () => setDark(d => !d);
  const common = { dark, toggleDark, go, toast, t, lang, setLang, profile, setProfile };

  let view;
  switch (screen) {
    case 'onb1': view = <OnboardingScreen index={0} {...common} onNext={() => go('onb2')} />; break;
    case 'onb2': view = <OnboardingScreen index={1} {...common} onNext={() => go('home')} />; break;
    case 'home': view = <HomeScreen {...common} />; break;
    case 'camera': view = <CameraScreen {...common} mode={cameraMode} />; break;
    case 'confirmPos': view = <ConfirmPositionScreen {...common} />; break;
    case 'gameReview': view = <GameReviewScreen {...common} mode={reviewMode} initialTitle={reviewTitle} />; break;
    case 'confirmSheet': view = <ConfirmSheetScreen {...common} />; break;
    case 'settings': view = <SettingsScreen {...common} onBack={() => setScreen(settingsFrom)} />; break;
    case 'saved': view = <SavedGamesScreen {...common} toast={toast} />; break;
    default: view = <HomeScreen {...common} />;
  }

  return (
    <div style={{ width: DEVICE_W * scale, height: DEVICE_H * scale }}>
      <div style={{ width: DEVICE_W, height: DEVICE_H, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        <IOSDevice dark={dark} width={DEVICE_W} height={DEVICE_H}>
          <div className={dark ? 'dark' : ''} style={{ height: '100%' }}>
            <div key={screen} className="h-full">
              {view}
            </div>
            {toastMsg && (
              <div className="absolute left-1/2 z-[70] anim-fadein" style={{ bottom: 78 }}>
                <div className="-translate-x-1/2 px-4 py-2.5 rounded-full bg-[#1A1A1A] dark:bg-[#33373d] text-white text-[14px] font-medium shadow-[0_8px_24px_rgba(0,0,0,.3)] flex items-center gap-2 whitespace-nowrap">
                  <Icon name="check" size={16} strokeWidth={2} className="text-sage" />
                  {toastMsg}
                </div>
              </div>
            )}
          </div>
        </IOSDevice>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
