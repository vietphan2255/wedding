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

// How long the startup loading gate waits for the RTDB `.info/connected` signal
// before showing its retry fallback. Healthy connections resolve in ~1–3s.
export const FIREBASE_CONNECT_TIMEOUT_MS = 12_000
