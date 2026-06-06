// state.jsx — app-wide state helpers: i18n (EN/VI), user profile (localStorage),
// and PGN seven-tag-roster generation. Loaded after chessboard, before screens.

// ── i18n ───────────────────────────────────────────────────────────────────
const TRANSLATIONS = {
  en: {
    'home.greeting': 'Saturday, June 5',
    'home.scanPosition': 'Scan a position', 'home.scanPositionSub': 'Get the best move',
    'home.scanSheet': 'Scan a score sheet', 'home.scanSheetSub': 'Review your game',
    'home.savedGames': 'Saved Games', 'home.all': 'All',
    'gameReview.save': 'Save', 'gameReview.share': 'Share', 'gameReview.exportPgn': 'Export PGN',
    'gameReview.newScan': 'New', 'gameReview.edit': 'Edit',
    'settings.title': 'Settings',
    'settings.profile': 'Profile', 'settings.displayName': 'Display name', 'settings.defaultColor': 'Default color',
    'settings.notSet': 'Not set', 'settings.white': 'White', 'settings.black': 'Black',
    'settings.preferences': 'Preferences', 'settings.darkMode': 'Dark mode', 'settings.language': 'Language',
    'settings.subscription': 'Subscription', 'settings.currentPlan': 'Current plan', 'settings.free': 'Free',
    'settings.upgradeToPro': 'Upgrade to Pro', 'settings.comingSoon': 'Coming soon',
    'settings.account': 'Account', 'settings.signIn': 'Sign in',
    'settings.about': 'About', 'settings.version': 'Version',
    'settings.terms': 'Terms of Service', 'settings.privacy': 'Privacy Policy', 'settings.contact': 'Contact',
    'settings.editName': 'Display name', 'settings.namePlaceholder': 'Your name', 'settings.done': 'Done',
    'save.title': 'Save game', 'save.savePosition': 'Save position',
    'save.gameTitle': 'Title', 'save.event': 'Event', 'save.site': 'Site', 'save.date': 'Date',
    'save.round': 'Round', 'save.white': 'White', 'save.black': 'Black', 'save.result': 'Result',
    'save.optional': 'optional', 'save.cancel': 'Cancel', 'save.save': 'Save game', 'save.savePos': 'Save',
    'save.required': '* Required', 'save.saved': 'Saved to your games.',
    'saved.positionScan': 'Position scan',
  },
  vi: {
    'home.greeting': 'Thứ Bảy, 5 tháng 6',
    'home.scanPosition': 'Quét thế cờ', 'home.scanPositionSub': 'Xem nước đi tốt nhất',
    'home.scanSheet': 'Quét biên bản', 'home.scanSheetSub': 'Xem lại ván đấu',
    'home.savedGames': 'Ván đã lưu', 'home.all': 'Tất cả',
    'gameReview.save': 'Lưu', 'gameReview.share': 'Chia sẻ', 'gameReview.exportPgn': 'Xuất PGN',
    'gameReview.newScan': 'Mới', 'gameReview.edit': 'Sửa',
    'settings.title': 'Cài đặt',
    'settings.profile': 'Hồ sơ', 'settings.displayName': 'Tên hiển thị', 'settings.defaultColor': 'Màu mặc định',
    'settings.notSet': 'Chưa đặt', 'settings.white': 'Trắng', 'settings.black': 'Đen',
    'settings.preferences': 'Tùy chọn', 'settings.darkMode': 'Chế độ tối', 'settings.language': 'Ngôn ngữ',
    'settings.subscription': 'Gói dịch vụ', 'settings.currentPlan': 'Gói hiện tại', 'settings.free': 'Miễn phí',
    'settings.upgradeToPro': 'Nâng cấp Pro', 'settings.comingSoon': 'Sắp ra mắt',
    'settings.account': 'Tài khoản', 'settings.signIn': 'Đăng nhập',
    'settings.about': 'Giới thiệu', 'settings.version': 'Phiên bản',
    'settings.terms': 'Điều khoản dịch vụ', 'settings.privacy': 'Chính sách bảo mật', 'settings.contact': 'Liên hệ',
    'settings.editName': 'Tên hiển thị', 'settings.namePlaceholder': 'Tên của bạn', 'settings.done': 'Xong',
    'save.title': 'Lưu ván đấu', 'save.savePosition': 'Lưu thế cờ',
    'save.gameTitle': 'Tiêu đề', 'save.event': 'Giải đấu', 'save.site': 'Địa điểm', 'save.date': 'Ngày',
    'save.round': 'Vòng', 'save.white': 'Trắng', 'save.black': 'Đen', 'save.result': 'Kết quả',
    'save.optional': 'không bắt buộc', 'save.cancel': 'Hủy', 'save.save': 'Lưu ván', 'save.savePos': 'Lưu',
    'save.required': '* Bắt buộc', 'save.saved': 'Đã lưu vào ván đấu của bạn.',
    'saved.positionScan': 'Quét thế cờ',
  },
};

function makeT(lang) {
  return (key) => (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) || TRANSLATIONS.en[key] || key;
}

const LANG_KEY = 'cs-language';
function loadLang() { try { return localStorage.getItem(LANG_KEY) || 'en'; } catch { return 'en'; } }
function saveLang(l) { try { localStorage.setItem(LANG_KEY, l); } catch {} }

// ── Profile (localStorage, no auth) ──────────────────────────────────────────
const DEFAULT_PROFILE = { displayName: '', defaultColor: 'white' };
const PROFILE_KEY = 'cs-profile';
function loadProfile() {
  try { const s = localStorage.getItem(PROFILE_KEY); return s ? { ...DEFAULT_PROFILE, ...JSON.parse(s) } : { ...DEFAULT_PROFILE }; }
  catch { return { ...DEFAULT_PROFILE }; }
}
function saveProfile(p) { try { localStorage.setItem(PROFILE_KEY, JSON.stringify(p)); } catch {} }

// ── PGN (Seven Tag Roster) ───────────────────────────────────────────────────
function formatPGNDate(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd}`;
}
function isoFromPGNDate(s) { return (s || '').replace(/\./g, '-'); }
function pgnDateFromISO(s) { return (s || '').replace(/-/g, '.'); }
function escapeTag(v) { return String(v == null ? '' : v).replace(/\\/g, '\\\\').replace(/"/g, '\\"'); }

function formatMoveList(plies, result) {
  let out = '';
  for (let i = 0; i < plies.length; i++) {
    if (i % 2 === 0) out += `${i / 2 + 1}. ${plies[i].san} `;
    else out += `${plies[i].san} `;
  }
  return (out + (result || '*')).trim();
}

// game: { title, event, site, date, round, white, black, result, plies, startFen }
function buildPGN(game) {
  const tags = [
    `[Event "${escapeTag(game.event || '?')}"]`,
    `[Site "${escapeTag(game.site || '?')}"]`,
    `[Date "${game.date || formatPGNDate(new Date())}"]`,
    `[Round "${escapeTag(game.round || '-')}"]`,
    `[White "${escapeTag(game.white || '?')}"]`,
    `[Black "${escapeTag(game.black || '?')}"]`,
    `[Result "${game.result || '*'}"]`,
  ];
  if (game.startFen && game.startFen !== STD_FEN) {
    tags.push(`[FEN "${game.startFen}"]`);
    tags.push(`[SetUp "1"]`);
  }
  tags.push(`[Generator "Chess Scan App v1.0"]`);
  const body = formatMoveList(game.plies || [], game.result || '*');
  return tags.join('\n') + '\n\n' + body + '\n';
}

function downloadText(filename, text) {
  try {
    const blob = new Blob([text], { type: 'application/x-chess-pgn' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (e) { /* no-op in sandbox */ }
}

Object.assign(window, {
  TRANSLATIONS, makeT, loadLang, saveLang,
  loadProfile, saveProfile, DEFAULT_PROFILE,
  formatPGNDate, isoFromPGNDate, pgnDateFromISO, buildPGN, downloadText,
});

// ── PHASE 3 (deferred) — Auth/login ──────────────────────────────────────────
// Build when 50+ active users request cross-device sync. Stack: Firebase Auth
// (email + Google + Apple) + Firestore. Migrate localStorage profile/games on first
// sign-in; resolve localStorage↔Firestore conflicts; cache for offline. Est. 3–5 days.
//
// ── PHASE 4 (deferred) — Subscription ────────────────────────────────────────
// Build when there's signal of willingness to pay. Stack: Stripe Checkout + Customer
// Portal + serverless webhooks; store status in Firestore. Free (10 scans/day, local
// save) vs Pro ($4.99/mo: unlimited scans, cloud sync, premium themes). Gate features
// on subscription.status === 'active'. Est. 3–5 days.
