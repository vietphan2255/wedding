// Canonical default config + small key/array helpers used by both the merge
// pipeline and the admin draft system. Lives in its own module so the
// WeddingConfigContext file stays focused on React subscription wiring.

import type { Common, CursorConfig, Faq, Gifts, Labels, MobileEffect, MobileEffectSlot, OrderedItem, WeddingConfig } from './configTypes'

// Seed one starter cursor config per wired section id (see CustomCursor +
// the data-cursor-id attributes in the section components). Empty image →
// nothing renders until the admin sets one; idle behaviors off. The
// `default-cursor-*` id prefix makes useFirebaseSlice assign a real Firebase
// push key on first save (same convention as faqs/story/gallery defaults).
export const DEFAULT_CURSORS: CursorConfig[] = (
  [
    ['hero', 'Hero'],
    ['countdown', 'Countdown'],
    ['story', 'Story'],
    ['gallery', 'Gallery'],
    ['ceremonies', 'Ceremonies'],
    ['rsvp', 'RSVP'],
    ['wishes', 'Wishes'],
    ['gifts', 'Gifts'],
    ['faq', 'FAQ'],
    ['invitation', 'Invitation'],
  ] as const
).map(([cursorId, name], i) => ({
  id: `default-cursor-${cursorId}`,
  cursorId,
  name,
  order: i,
  image: '',
  size: 56,
  style: '',
  idleSwap: false,
  idleZoom: false,
  idleDelay: 1.5,
  idleZoomLevels: 3,
}))

export const DEFAULT_GIFTS: Gifts = {
  enabled: true,
  bride: {
    bank: 'Vietcombank',
    holder: 'NGUYEN THI NGUYEN',
    account: '0123 4567 8901',
    // Falls back to the text card until public/qr/bride.png is added (or an
    // image URL is set in the admin).
    qrUrl: '/qr/bride.png',
  },
  groom: {
    bank: 'VietinBank',
    holder: 'PHAN QUOC VIET',
    account: '105678105298',
    qrUrl: '/qr/groom.png',
  },
}

// Both slot images empty by default → the effect is invisible until an admin
// uploads one (see resolveLeg in MobileEffect). Speed in px/sec, size = width.
const MOBILE_EFFECT_SLOT_DEFAULT: MobileEffectSlot = {
  image: '',
  size: 72,
  offset: 8,
  speed: 60,
  wait: 1.5,
  character: '',
  name: '',
  script: [],
}

export const DEFAULT_MOBILE_EFFECT: MobileEffect = {
  enabled: true,
  slotA: { ...MOBILE_EFFECT_SLOT_DEFAULT },
  slotB: { ...MOBILE_EFFECT_SLOT_DEFAULT },
}

// Coerce a stored value into a string[]. Firebase Realtime DB returns arrays as
// objects when keys aren't contiguous, so tolerate both shapes (used by the
// mobileEffect script lines on read and on admin save).
export function toLines(x: unknown): string[] {
  if (Array.isArray(x)) return x.filter((s): s is string => typeof s === 'string')
  if (x && typeof x === 'object')
    return Object.values(x as Record<string, unknown>).filter((s): s is string => typeof s === 'string')
  return []
}

export const DEFAULT_FAQS: Faq[] = [
  {
    id: 'default-faq-1',
    order: 0,
    question_vi: 'Quy định trang phục như thế nào?',
    answer_vi:
      'Lễ Vu Quy đón khách trong trang phục áo dài truyền thống. Lễ Thành Hôn là tiệc trang trọng — vest hoặc đầm cocktail là phù hợp.',
  },
  {
    id: 'default-faq-2',
    order: 1,
    question_vi: 'Có thể đưa các bé theo không?',
    answer_vi:
      'Tất nhiên! Các bé được chào đón ở cả hai buổi lễ. Vui lòng tính các bé trong số khách khi xác nhận.',
  },
  {
    id: 'default-faq-3',
    order: 2,
    question_vi: 'Địa điểm có chỗ đỗ xe không?',
    answer_vi:
      'Có — chỗ đỗ xe miễn phí tại cả hai địa điểm. Tiệc cưới có dịch vụ đưa đón xe.',
  },
  {
    id: 'default-faq-4',
    order: 3,
    question_vi: 'Có phát trực tiếp không?',
    answer_vi:
      'Có — link phát trực tiếp sẽ được chia sẻ tại đây gần ngày cưới cho khách không thể đến tham dự.',
  },
  {
    id: 'default-faq-5',
    order: 4,
    question_vi: 'Mình có thể chụp ảnh không?',
    answer_vi:
      'Bạn cứ tự nhiên chụp ảnh! Chỉ xin bạn ngồi yên trong lúc làm lễ để nhiếp ảnh gia có thể ghi lại trọn vẹn khoảnh khắc.',
  },
  {
    id: 'default-faq-6',
    order: 5,
    question_vi: 'Mình từ xa đến — nên ở khách sạn nào?',
    answer_vi:
      'Có nhiều khách sạn xinh xắn trong bán kính 10 phút từ tiệc cưới. Liên hệ tụi mình để nhận danh sách gợi ý.',
  },
]

export const DEFAULT_COMMON: Common = {
  coupleNameLeft: 'Viet',
  coupleNameRight: 'Nguyen',
  coupleInitialLeft: 'V',
  coupleInitialRight: 'N',
  contactEmail: 'hello@vietnguyen-wedding.com',
  dateDisplay: '26.07.2026  ·  02.08.2026',
}

export const DEFAULT_LABELS: Labels = { vi: {} }

export const DEFAULT_CONFIG: WeddingConfig = {
  common: DEFAULT_COMMON,
  hero: { image: '', focalX: 50, focalY: 50 },
  // Empty by default — the hero shows the single `hero.image` until an admin
  // adds slides (see HeroSlidesSection). `kind: 'list'` keeps the fallback.
  heroSlides: [],
  labels: DEFAULT_LABELS,
  dates: {
    vuquyStart: '2026-07-26T09:00:00+07:00',
    vuquyEnd: '2026-07-26T12:00:00+07:00',
    thanhhonStart: '2026-08-02T18:00:00+07:00',
    thanhhonEnd: '2026-08-02T22:00:00+07:00',
    rsvpDeadline: '2026-06-30',
  },
  venues: {
    vuquy: { mapEmbed: '' },
    thanhhon: { mapEmbed: '' },
  },
  story: [
    {
      id: 'default-1',
      year: '2019',
      title_vi: 'Lần đầu gặp gỡ',
      body_vi:
        'Một người bạn chung giới thiệu tụi mình trong một quán cà phê nhỏ ở Quận 1. Hai ly cà phê đá và bốn tiếng đồng hồ trò chuyện, cả hai đều đã biết.',
      img: 'https://picsum.photos/seed/vn-story-1/900/1100',
      placeholder: '',
      order: 0,
    },
    {
      id: 'default-2',
      year: '2021',
      title_vi: 'Chuyến đi đầu tiên',
      body_vi:
        'Đà Lạt trong cơn mưa — một chiếc dù mượn, một chiếc áo mưa chung, và tiếng cười biến người lạ thành gia đình.',
      img: 'https://picsum.photos/seed/vn-story-2/900/1100',
      placeholder: '',
      order: 1,
    },
    {
      id: 'default-3',
      year: '2024',
      title_vi: 'Lời cầu hôn',
      body_vi:
        'Trên một sân thượng yên tĩnh giữa lòng thành phố, câu trả lời đã có trước khi câu hỏi kịp kết thúc.',
      img: 'https://picsum.photos/seed/vn-story-3/900/1100',
      placeholder: '',
      order: 2,
    },
    {
      id: 'default-4',
      year: '2025',
      title_vi: 'Lễ Đính Hôn',
      body_vi:
        'Bên gia đình, trà sen và những phong bao đỏ — một lời hứa chính thức dưới sự chứng giám của tổ tiên.',
      img: 'https://picsum.photos/seed/vn-story-4/900/1100',
      placeholder: '',
      order: 3,
    },
  ],
  music: {
    enabled: false,
    url: '',
    title: '',
    volume: 0.4,
  },
  gallery: Array.from({ length: 12 }, (_, i) => ({
    id: `default-${i + 1}`,
    src:
      i % 5 === 0
        ? `https://picsum.photos/seed/vn-gallery-${i + 1}/900/1300`
        : i % 3 === 0
        ? `https://picsum.photos/seed/vn-gallery-${i + 1}/1300/900`
        : `https://picsum.photos/seed/vn-gallery-${i + 1}/1000/1000`,
    tall: i % 5 === 0,
    placeholder: '',
    order: i,
  })),
  gifts: DEFAULT_GIFTS,
  faqs: DEFAULT_FAQS,
  invitation: {
    letterImage: '',
    letterFocalX: 50,
    letterFocalY: 50,
    groomFullName: '',
    brideFullName: '',
    groomFather: 'Ông Phan Văn Hùng',
    groomMother: 'Bà Trần Thị Lan',
    groomHometown: 'TP. Hà Nội',
    brideFather: 'Ông Nguyễn Văn Minh',
    brideMother: 'Bà Lê Thị Hồng',
    brideHometown: 'TP. Điện Biên',
    message_vi:
      'Trân trọng kính mời quý khách đến chung vui cùng gia đình chúng tôi trong ngày lễ thành hôn của hai con.',
    vuquyLunar: 'Nhằm ngày 12 tháng 6 năm Bính Ngọ (Âm lịch)',
    vuquyAddress: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    thanhhonLunar: 'Nhằm ngày 19 tháng 6 năm Bính Ngọ (Âm lịch)',
    thanhhonAddress: '456 Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh',
  },
  effects: {
    cursorGif: '',
    idleSwap: false,
    idleZoom: false,
    idleDelay: 1.5,
    idleZoomLevels: 3,
    petalsEnabled: true,
    petalShape: 'petal',
    petalCount: 12,
    petalSpeed: 1,
    petalColor: '',
  },
  mobileEffect: DEFAULT_MOBILE_EFFECT,
  cursors: DEFAULT_CURSORS,
  qr: {
    link: '',
    fgColor: '#1a1a1a',
    bgColor: '#ffffff',
    bgTransparent: false,
    useGradient: false,
    gradientType: 'linear',
    gradientColor1: '#b76e79',
    gradientColor2: '#1a1a1a',
    gradientRotation: 0,
    dotStyle: 'rounded',
    cornerSquareStyle: 'extra-rounded',
    cornerDotStyle: 'dot',
    errorCorrection: 'Q',
    margin: 8,
    logoUrl: '',
    logoSize: 0.4,
  },
}

export function sortByOrder<T extends OrderedItem>(list: T[]): T[] {
  return [...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

export function toArray<T>(node: Record<string, T> | null | undefined): Array<T & { id: string }> {
  if (!node) return []
  return Object.entries(node).map(([id, value]) => ({ id, ...(value as T) }))
}

// Firebase Realtime Database rejects '.' / '#' / '$' / '[' / ']' / '/' in
// keys, so label i18n keys like 'hero.eyebrow' get persisted with dots
// replaced by '__'. We decode on read so the in-memory dict still uses the
// canonical i18n key shape.
export function encodeLabelKey(k: string): string {
  return k.replace(/\./g, '__')
}

export function decodeLabelKey(k: string): string {
  return k.replace(/__/g, '.')
}

export function decodeLabelMap(node: unknown): Record<string, string> {
  if (!node || typeof node !== 'object') return {}
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
    if (typeof v === 'string') out[decodeLabelKey(k)] = v
  }
  return out
}
