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
  title_vi: string
  body_vi: string
  img: string
  placeholder?: string
}

export interface Photo extends OrderedItem {
  src: string
  tall: boolean
  // Which gallery marquee row this photo belongs to. Missing or !== 2 ⇒ Line 1,
  // so photos saved before this field existed fall back to the first row.
  line?: 1 | 2
  placeholder?: string
}

export interface Faq extends OrderedItem {
  question_vi: string
  answer_vi: string
}

export interface Invitation {
  letterImage: string
  // Focal point (0–100, % of the image) for the envelope letter crop. Default
  // 50/50 = centered, matching pre-focal-point behavior.
  letterFocalX: number
  letterFocalY: number
  // Full formal names shown only on the invitation card (fall back to common short names).
  groomFullName: string
  brideFullName: string
  // Families (Nhà Trai / Nhà Gái) — parents announced on the formal invite.
  groomFather: string
  groomMother: string
  groomHometown: string
  brideFather: string
  brideMother: string
  brideHometown: string
  // Formal invite sentence.
  message_vi: string
  // Per-ceremony lunar date + full street address. Venue *name* is reused from
  // the existing bilingual `events.{vuquy,thanhhon}.venue` labels.
  vuquyLunar: string
  vuquyAddress: string
  thanhhonLunar: string
  thanhhonAddress: string
}

// Shape of the decorative floating particles in ParallaxPetals. 'petal' is the
// original organic blob (default; preserves the existing look).
export type PetalShape =
  | 'petal'
  | 'circle'
  | 'heart'
  | 'bubble'
  | 'star'
  | 'snowflake'

export interface Effects {
  // GIF URL applied as the page cursor on `/` via a `data-cursor` attribute
  // on <main>. Empty string disables the GIF cursor and the page falls back
  // to the default ring + dot.
  cursorGif: string
  // Idle behaviors for the global GIF cursor — same semantics as CursorConfig's
  // per-section idle. No-ops unless cursorGif is set.
  idleSwap: boolean // show the GIF only once the pointer sits still; while moving, the default ring + dot shows
  idleZoom: boolean // progressively zoom the GIF the longer the pointer stays idle
  idleDelay: number // seconds of no-movement per idle step (shared by both toggles)
  idleZoomLevels: number // number of zoom steps when idleZoom is on (each +0.5×, capped)
  // Floating decorative shapes (ParallaxPetals). Defaults reproduce the legacy
  // 12 sage-green petals exactly.
  petalsEnabled: boolean // master on/off (keeps shape/count/speed/color when off)
  petalShape: PetalShape // which icon floats
  petalCount: number // how many float at once (integer, clamped 0..60)
  petalSpeed: number // drift speed multiplier; 1 = legacy speed, >1 faster
  petalColor: string // hex like '#e58aa0'; '' = use the theme accent color
}

// One travel pass of the mobile FloatingGift effect. Slot A is the left→right
// pass ("enters from left"); slot B is the right→left pass ("enters from
// right"). An empty `image` means that direction is unconfigured — the runtime
// reuses the other slot's image, horizontally mirrored. Both empty ⇒ the effect
// renders nothing.
export interface FloatingGiftSlot {
  image: string // Cloudinary URL ('' = this direction not configured)
  size: number // rendered WIDTH in px (height auto by aspect ratio)
  offset: number // px gap between the image bottom and the dock top
  speed: number // travel speed in px/sec (viewport-width independent)
  wait: number // pause off-screen at the edge before entering, in seconds
}

// Mobile-only decorative gift that ping-pongs across the bottom lane, just above
// the MobileRsvpBar dock. Mirrors the Gifts slice shape (top-level `enabled` +
// two nested children) so it gets the same per-field default merge.
export interface FloatingGift {
  enabled: boolean // master on/off (keeps images/settings when off)
  slotA: FloatingGiftSlot // left → right
  slotB: FloatingGiftSlot // right → left
}

// Per-section GIF cursor. Elements carry `data-cursor-id="<cursorId>"`; the
// cursor overlay looks up the matching config and renders its GIF (sized +
// styled) while the pointer is over that element. Coexists with `effects
// .cursorGif` (the page-wide default) — a section's id wins within its area.
export interface CursorConfig extends OrderedItem {
  // `id` (Firebase push key) + `order` come from OrderedItem.
  cursorId: string // matches the data-cursor-id attribute in markup (e.g. "gallery")
  name: string // admin-friendly label
  image: string // GIF/PNG URL ('' = nothing renders for this id)
  size: number // rendered px (square)
  style: string // free-form inline CSS applied to the cursor <img>
  // Idle behaviors — both off by default (cursor shows immediately on hover).
  idleSwap: boolean // show ONLY when idle; while moving, fall back to the global/default cursor
  idleZoom: boolean // progressively zoom up the longer the mouse stays idle
  idleDelay: number // seconds of no-movement per idle step (shared by both toggles)
  idleZoomLevels: number // number of zoom steps when idleZoom is on (each +0.5×, capped)
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
  bgTransparent: boolean // true → transparent background (ignores bgColor)
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

export interface Hero {
  image: string // Hero background image URL; '' → built-in default photo
  // Focal point (0–100, % of the image) used as `object-position` for the
  // full-screen `object-cover` crop. Default 50/50 = centered.
  focalX: number
  focalY: number
}

// One slide in the hero background slideshow. When `heroSlides` is non-empty the
// hero cycles through these (sorted by `priority`, ascending) with randomized
// in/out transitions instead of showing the single `hero.image`; an empty list
// falls back to that single image.
export interface HeroSlide extends OrderedItem {
  // `id` (Firebase push key) + `order` (admin list position) come from OrderedItem.
  src: string // image URL ('' = skipped at render)
  priority: number // play order, ascending (lower shows earlier); loops
  durationSeconds: number // how long this slide is held before advancing
  // Per-slide focal point (0–100, % of the image) for the full-screen
  // `object-cover` crop. Default 50/50 = centered.
  focalX: number
  focalY: number
  placeholder?: string
}

export interface WeddingConfig {
  common: Common
  hero: Hero
  heroSlides: HeroSlide[]
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
  floatingGift: FloatingGift
  cursors: CursorConfig[]
  qr: Qr
}

export type ConfigSource = 'default' | 'firebase' | 'draft'
