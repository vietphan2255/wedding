// Canonical wedding-config types. Mirrors the Firebase Realtime DB schema
// at /config — every slice has a corresponding key here. Adding a slice
// means updating both this file and DEFAULT_CONFIG in configDefaults.ts.

export interface Common {
  coupleNameLeft: string
  coupleNameRight: string
  coupleInitialLeft: string
  coupleInitialRight: string
  contactEmail: string
  dateDisplay: string
}

export interface Labels {
  en: Record<string, string>
  vi: Record<string, string>
}

export interface Dates {
  vuquyStart: string
  vuquyEnd: string
  thanhhonStart: string
  thanhhonEnd: string
  rsvpDeadline: string
}

export interface Music {
  enabled: boolean
  url: string
  title: string
  volume: number
}

export interface Venue {
  mapEmbed: string
}

export interface Venues {
  vuquy: Venue
  thanhhon: Venue
}

export interface BankAccount {
  bank: string
  holder: string
  account: string
  qrUrl: string
}

export interface Gifts {
  enabled: boolean
  bride: BankAccount
  groom: BankAccount
}

export interface OrderedItem {
  id: string
  order: number
}

export interface StoryItem extends OrderedItem {
  year: string
  title_en: string
  title_vi: string
  body_en: string
  body_vi: string
  img: string
  placeholder?: string
}

export interface Photo extends OrderedItem {
  src: string
  tall: boolean
  placeholder?: string
}

export interface Faq extends OrderedItem {
  question_en: string
  question_vi: string
  answer_en: string
  answer_vi: string
}

export interface Invitation {
  letterImage: string
}

export interface Effects {
  // GIF URL applied as the page cursor on `/` via a `data-cursor` attribute
  // on <main>. Empty string disables the GIF cursor and the page falls back
  // to the default ring + dot.
  cursorGif: string
}

// Visual config for the admin QR code generator. Kept flat (primitive fields
// only) so it round-trips through the `shallow` merge + Firebase cleanly. The
// string-literal unions mirror qr-code-styling's option values; the section
// maps these onto its Options object at render time.
export type QrDotStyle =
  | 'square'
  | 'rounded'
  | 'dots'
  | 'classy'
  | 'classy-rounded'
  | 'extra-rounded'
export type QrCornerSquareStyle = 'square' | 'dot' | 'extra-rounded'
export type QrCornerDotStyle = 'square' | 'dot'
export type QrErrorCorrection = 'L' | 'M' | 'Q' | 'H'
export type QrGradientType = 'linear' | 'radial'

export interface Qr {
  link: string // '' → falls back to the live site origin at render time
  fgColor: string
  bgColor: string
  useGradient: boolean
  gradientType: QrGradientType
  gradientColor1: string
  gradientColor2: string
  gradientRotation: number // degrees
  dotStyle: QrDotStyle
  cornerSquareStyle: QrCornerSquareStyle
  cornerDotStyle: QrCornerDotStyle
  errorCorrection: QrErrorCorrection
  margin: number
  logoUrl: string
  logoSize: number // 0–0.5 (fraction of the QR size)
}

export interface WeddingConfig {
  common: Common
  labels: Labels
  dates: Dates
  venues: Venues
  music: Music
  gifts: Gifts
  story: StoryItem[]
  gallery: Photo[]
  faqs: Faq[]
  invitation: Invitation
  effects: Effects
  qr: Qr
}

export type ConfigSource = 'default' | 'firebase' | 'draft'
