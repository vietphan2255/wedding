// Sizing math for the gallery's pin + scroll-scrub runway. Pure and unit-tested;
// the component feeds it the widest row's measured period (one full content cycle
// in px) and the viewport height, and gets back how much extra scroll runway the
// pinned phase should occupy.
import {
  GALLERY_SCRUB_RATIO,
  GALLERY_PIN_MIN_VH,
  GALLERY_PIN_MAX_VH,
} from './constants'

/**
 * Extra scroll distance (px) the gallery section pins for. Proportional to the
 * widest row's period (`ratio` converts row travel to scroll travel), clamped to
 * [minVh, maxVh] viewport-heights. A missing/invalid period (rows not measured
 * yet) falls back to the minimum, so the runway exists immediately and settles
 * once measurement lands.
 */
export function pinExtraPx(
  maxPeriodPx: number,
  viewportH: number,
  ratio: number = GALLERY_SCRUB_RATIO,
  minVh: number = GALLERY_PIN_MIN_VH,
  maxVh: number = GALLERY_PIN_MAX_VH,
): number {
  const vh = Number.isFinite(viewportH) && viewportH > 0 ? viewportH : 0
  const min = (vh * minVh) / 100
  const max = (vh * maxVh) / 100
  if (!Number.isFinite(maxPeriodPx) || maxPeriodPx <= 0) return Math.round(min)
  return Math.round(Math.min(max, Math.max(min, maxPeriodPx * ratio)))
}
