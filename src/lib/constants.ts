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
