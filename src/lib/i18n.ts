// i18n — EN/VI strings (ported from the prototype) + translator factory.

import type { Lang } from '@/types/chess';

export const TRANSLATIONS: Record<Lang, Record<string, string>> = {
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
    'settings.credits': 'Credits', 'settings.creditsValue': 'Pieces: Cburnett (CC BY-SA 3.0)',
    'settings.editName': 'Display name', 'settings.namePlaceholder': 'Your name', 'settings.done': 'Done',
    'save.title': 'Save game', 'save.savePosition': 'Save position',
    'save.gameTitle': 'Title', 'save.event': 'Event', 'save.site': 'Site', 'save.date': 'Date',
    'save.round': 'Round', 'save.white': 'White', 'save.black': 'Black', 'save.result': 'Result',
    'save.optional': 'optional', 'save.cancel': 'Cancel', 'save.save': 'Save game', 'save.savePos': 'Save',
    'save.required': '* Required', 'save.saved': 'Saved to your games.',
    'saved.positionScan': 'Position scan',
    'onb.next': 'Next', 'onb.getStarted': 'Get started',
    'onb1.title': 'Stuck on a tough move?',
    'onb1.body': 'Snap your board. See what to play — and why, in plain words.',
    'onb2.title': 'Or your handwritten score sheet.',
    'onb2.body': 'Photograph your moves and review the whole game, move by move.',
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
    'settings.credits': 'Ghi công', 'settings.creditsValue': 'Quân cờ: Cburnett (CC BY-SA 3.0)',
    'settings.editName': 'Tên hiển thị', 'settings.namePlaceholder': 'Tên của bạn', 'settings.done': 'Xong',
    'save.title': 'Lưu ván đấu', 'save.savePosition': 'Lưu thế cờ',
    'save.gameTitle': 'Tiêu đề', 'save.event': 'Giải đấu', 'save.site': 'Địa điểm', 'save.date': 'Ngày',
    'save.round': 'Vòng', 'save.white': 'Trắng', 'save.black': 'Đen', 'save.result': 'Kết quả',
    'save.optional': 'không bắt buộc', 'save.cancel': 'Hủy', 'save.save': 'Lưu ván', 'save.savePos': 'Lưu',
    'save.required': '* Bắt buộc', 'save.saved': 'Đã lưu vào ván đấu của bạn.',
    'saved.positionScan': 'Quét thế cờ',
    'onb.next': 'Tiếp', 'onb.getStarted': 'Bắt đầu',
    'onb1.title': 'Bí một nước khó?',
    'onb1.body': 'Chụp bàn cờ. Xem nên đi gì — và vì sao, bằng lời dễ hiểu.',
    'onb2.title': 'Hoặc biên bản viết tay của bạn.',
    'onb2.body': 'Chụp các nước đi và xem lại cả ván, từng nước một.',
  },
};

export type TFn = (key: string) => string;

export function makeT(lang: Lang): TFn {
  return (key) => TRANSLATIONS[lang]?.[key] || TRANSLATIONS.en[key] || key;
}
