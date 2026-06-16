// Canonical default config + small key/array helpers used by both the merge
// pipeline and the admin draft system. Lives in its own module so the
// WeddingConfigContext file stays focused on React subscription wiring.

import type { Common, Faq, Gifts, Labels, OrderedItem, WeddingConfig } from './configTypes'

export const DEFAULT_GIFTS: Gifts = {
  enabled: true,
  bride: {
    bank: 'Vietcombank',
    holder: 'NGUYEN THI NGUYEN',
    account: '0123 4567 8901',
    qrUrl: '',
  },
  groom: {
    bank: 'Techcombank',
    holder: 'PHAN VIET',
    account: '9876 5432 1098',
    qrUrl: '',
  },
}

export const DEFAULT_FAQS: Faq[] = [
  {
    id: 'default-faq-1',
    order: 0,
    question_en: 'What is the dress code?',
    question_vi: 'Quy định trang phục như thế nào?',
    answer_en:
      'Lễ Vu Quy welcomes traditional Áo dài. Lễ Thành Hôn is formal — suits and cocktail dresses are perfect.',
    answer_vi:
      'Lễ Vu Quy đón khách trong trang phục áo dài truyền thống. Lễ Thành Hôn là tiệc trang trọng — vest hoặc đầm cocktail là phù hợp.',
  },
  {
    id: 'default-faq-2',
    order: 1,
    question_en: 'Can I bring children?',
    question_vi: 'Có thể đưa các bé theo không?',
    answer_en:
      'Of course! Children are welcome at both ceremonies. Please include them in your RSVP guest count.',
    answer_vi:
      'Tất nhiên! Các bé được chào đón ở cả hai buổi lễ. Vui lòng tính các bé trong số khách khi xác nhận.',
  },
  {
    id: 'default-faq-3',
    order: 2,
    question_en: 'Is there parking at the venues?',
    question_vi: 'Địa điểm có chỗ đỗ xe không?',
    answer_en:
      'Yes — free parking is available at both venues. Valet service will be available for the reception.',
    answer_vi:
      'Có — chỗ đỗ xe miễn phí tại cả hai địa điểm. Tiệc cưới có dịch vụ đưa đón xe.',
  },
  {
    id: 'default-faq-4',
    order: 3,
    question_en: 'Will there be a livestream?',
    question_vi: 'Có phát trực tiếp không?',
    answer_en:
      'Yes — a livestream link will be shared here closer to the date for guests who cannot join us in person.',
    answer_vi:
      'Có — link phát trực tiếp sẽ được chia sẻ tại đây gần ngày cưới cho khách không thể đến tham dự.',
  },
  {
    id: 'default-faq-5',
    order: 4,
    question_en: 'Can I take photos?',
    question_vi: 'Mình có thể chụp ảnh không?',
    answer_en:
      'Yes, please do! We only ask that you stay seated during the ceremonies and let our photographers have the front rows.',
    answer_vi:
      'Bạn cứ tự nhiên chụp ảnh! Chỉ xin bạn ngồi yên trong lúc làm lễ để nhiếp ảnh gia có thể ghi lại trọn vẹn khoảnh khắc.',
  },
  {
    id: 'default-faq-6',
    order: 5,
    question_en: 'Where should I stay if I am from out of town?',
    question_vi: 'Mình từ xa đến — nên ở khách sạn nào?',
    answer_en:
      'There are several lovely hotels within 10 minutes of the reception venue. Reach out and we will share a list.',
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

export const DEFAULT_LABELS: Labels = { en: {}, vi: {} }

export const DEFAULT_CONFIG: WeddingConfig = {
  common: DEFAULT_COMMON,
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
      title_en: 'First met',
      title_vi: 'Lần đầu gặp gỡ',
      body_en:
        'A mutual friend introduced us at a tiny café in District 1. Two iced coffees and four hours of conversation later, we both knew.',
      body_vi:
        'Một người bạn chung giới thiệu tụi mình trong một quán cà phê nhỏ ở Quận 1. Hai ly cà phê đá và bốn tiếng đồng hồ trò chuyện, cả hai đều đã biết.',
      img: 'https://picsum.photos/seed/vn-story-1/900/1100',
      placeholder: '',
      order: 0,
    },
    {
      id: 'default-2',
      year: '2021',
      title_en: 'First trip together',
      title_vi: 'Chuyến đi đầu tiên',
      body_en:
        'Đà Lạt in the rain — borrowed umbrellas, a shared raincoat, and the kind of laughter that turns strangers into family.',
      body_vi:
        'Đà Lạt trong cơn mưa — một chiếc dù mượn, một chiếc áo mưa chung, và tiếng cười biến người lạ thành gia đình.',
      img: 'https://picsum.photos/seed/vn-story-2/900/1100',
      placeholder: '',
      order: 1,
    },
    {
      id: 'default-3',
      year: '2024',
      title_en: 'The proposal',
      title_vi: 'Lời cầu hôn',
      body_en:
        'On a quiet rooftop with the city humming below, the answer was yes before the question was finished.',
      body_vi:
        'Trên một sân thượng yên tĩnh giữa lòng thành phố, câu trả lời đã có trước khi câu hỏi kịp kết thúc.',
      img: 'https://picsum.photos/seed/vn-story-3/900/1100',
      placeholder: '',
      order: 2,
    },
    {
      id: 'default-4',
      year: '2025',
      title_en: 'Lễ Đính Hôn',
      title_vi: 'Lễ Đính Hôn',
      body_en:
        'Surrounded by family, tea, and red envelopes — a promise made official under the eyes of our ancestors.',
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
  invitation: { letterImage: '' },
  effects: { cursorGif: '' },
  qr: {
    link: '',
    fgColor: '#1a1a1a',
    bgColor: '#ffffff',
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
