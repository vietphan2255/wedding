// Time conversion helpers used by the countdown breakdown.
export const MS_PER_SECOND = 1_000
export const MS_PER_MINUTE = 60_000
export const MS_PER_HOUR = 3_600_000
export const MS_PER_DAY = 86_400_000
export const MS_PER_WEEK = MS_PER_DAY * 7

// useSmoothScroll's idle detector — how long after the last user input or
// settled Lenis velocity we let the rAF loop stop. Lower = wakes more often
// (smoother, more battery); higher = sleeps sooner.
export const SMOOTH_SCROLL_IDLE_MS = 400

// Lenis target velocity below which we treat the page as idle and stop the
// rAF loop. Tuned with SMOOTH_SCROLL_IDLE_MS as a pair.
export const SMOOTH_SCROLL_IDLE_VELOCITY = 0.05

// Gallery marquee baseline drift per row, in px/sec. Sign flips per row so
// the two rows scroll in opposite directions.
export const GALLERY_BASE_VELOCITY = 50

// Minimum photos a line must have before the gallery honors the explicit
// Line 1 / Line 2 split. If either line has fewer, both rows fall back to a
// merged even/odd split so neither marquee looks sparse.
export const GALLERY_MIN_PER_LINE = 10

// Gallery pin + scroll-scrub: when the section top reaches the viewport top it
// pins (sticky) and further scroll scrubs both rows through exactly one content
// period. The extra scroll runway is proportional to the widest row's period —
// SCRUB_RATIO converts row px to scroll px (0.7 → rows travel ~1.4× scroll
// speed) — clamped between MIN/MAX viewport-heights so tiny galleries still get
// a felt pin and huge ones can't pin forever (they scrub faster instead).
export const GALLERY_SCRUB_RATIO = 0.7
export const GALLERY_PIN_MIN_VH = 120
export const GALLERY_PIN_MAX_VH = 320

// Lightbox Swiper tuning. THRESHOLD_DELTA is the Mousewheel module's
// per-event floor (NOT an accumulator): a deliberate touchpad flick peaks
// well above it while momentum-tail jitter and small nudges stay below, and
// Swiper's own animating-gate + debounce handle the rest of the tail. Never
// add thresholdTime — Swiper initializes its clock at mount, which would
// swallow the first flick right after the lightbox opens.
export const LIGHTBOX_WHEEL_THRESHOLD_DELTA = 40

// Lightbox slide transition duration; forced to 0 under prefers-reduced-motion
// (Swiper does not respect it natively).
export const LIGHTBOX_SLIDE_SPEED_MS = 300

// Lightbox pinch / double-tap zoom ceiling.
export const LIGHTBOX_ZOOM_MAX_RATIO = 3

// Gap between lightbox slides so neighbors never peek at the edges.
export const LIGHTBOX_SLIDE_GAP_PX = 24

// Screen-edge band (px) where the lightbox swallows touchstart so an iOS system
// swipe-back gesture can't hijack a horizontal Swiper drag into a browser
// back/forward navigation. Slightly wider than iOS's ~20px edge zone.
export const LIGHTBOX_EDGE_GUARD_PX = 24

// Right-sizing caps (longest edge, px) for gallery images. Decoded-image memory is
// width×height×4 bytes regardless of JPEG/WebP, so capping *dimensions* is what
// bounds it — the fix for the iOS WebKit (WKWebView) memory-termination reload that
// large galleries trigger. Marquee tiles are h-72 (288px) from the `md:` breakpoint
// up and h-48 (192px) below it, so the mobile cap keys off that same boundary; the
// lightbox caps to the device viewport (×DPR, capped at 2) up to LIGHTBOX_MAX_EDGE_CAP.
export const GALLERY_THUMB_MAX_EDGE = 720
export const GALLERY_THUMB_MAX_EDGE_MOBILE = 480
export const LIGHTBOX_MAX_EDGE_CAP = 1600

// Lightbox image windowing: only slides within this loop-aware distance of the
// current index keep their <img> mounted, bounding live decoded images to 2*R+1
// (~34MB at the 1600px cap) regardless of gallery size — with all N slides mounted,
// every photo paged past stayed decoded and 40+ photos jetsammed the iOS tab.
// Must be >= 2: the neighbor slide is visible mid-drag before slideChange fires,
// and one long drag can commit 2 slides.
export const LIGHTBOX_IMG_WINDOW_RADIUS = 2

// How long the startup loading gate waits for the RTDB `.info/connected` signal
// before showing its retry fallback. Healthy connections resolve in ~1–3s.
export const FIREBASE_CONNECT_TIMEOUT_MS = 12_000
