import { useEffect, useMemo, useRef, useState } from 'react'
import { galleryImageUrl, viewportMaxEdge } from '../lib/galleryImageUrl'

const DEFAULT_DURATION = 6 // seconds, when a slide omits/zeros its duration
const MIN_DURATION = 2 // floor so a typo can't strobe the hero

// Rich entrance variants picked at random per transition (visual defs live in
// HeroSlideshow). Exported so the component and picker share one source of truth.
export const RICH_VARIANTS = ['crossfade', 'zoomIn', 'zoomOut', 'panLeft', 'panRight']

function pickVariant(prev) {
  const v = RICH_VARIANTS[Math.floor(Math.random() * RICH_VARIANTS.length)]
  if (v !== prev || RICH_VARIANTS.length < 2) return v
  // Re-roll against the others so the same transition never plays back-to-back.
  const others = RICH_VARIANTS.filter((x) => x !== prev)
  return others[Math.floor(Math.random() * others.length)]
}

// Drives the hero background slideshow: advances through `slides` (sorted by
// `priority` ascending, `order` breaking ties), holding each for its own
// `durationSeconds`, and hands back a fresh random transition variant per
// change. Pauses while the tab is hidden, preloads the next image, and forces a
// plain crossfade when `calm` (mobile / reduced-motion). Returns the current
// slide plus the variant its entrance should use.
export default function useHeroSlideshow(slides, { calm = false } = {}) {
  // Playback order = priority asc; `order` (admin list position) breaks ties.
  // Drop blank-URL rows so the hero never flashes an empty frame.
  const ordered = useMemo(
    () =>
      [...(slides || [])]
        .filter((s) => s && (s.src || '').trim())
        .sort(
          (a, b) =>
            (Number(a.priority) || 0) - (Number(b.priority) || 0) ||
            (a.order ?? 0) - (b.order ?? 0),
        ),
    [slides],
  )

  const [index, setIndex] = useState(0)
  const [variant, setVariant] = useState('crossfade')
  const [hidden, setHidden] = useState(false)
  const variantRef = useRef('crossfade')
  variantRef.current = variant

  const count = ordered.length

  // Keep the index in range when the admin removes slides live.
  useEffect(() => {
    if (index > count - 1) setIndex(0)
  }, [count, index])

  // Pause cycling while the tab is backgrounded (no burst of skipped slides).
  useEffect(() => {
    if (typeof document === 'undefined') return
    const onVis = () => setHidden(document.hidden)
    onVis()
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  const safeIndex = count ? Math.min(index, count - 1) : 0
  const current = ordered[safeIndex]
  const active = count > 1 && !hidden
  const duration = Math.max(
    MIN_DURATION,
    Number(current?.durationSeconds) || DEFAULT_DURATION,
  )

  // One timeout, re-armed on every index change → each slide gets its own dwell
  // time and only one image decodes at a time.
  useEffect(() => {
    if (!active) return
    const t = setTimeout(() => {
      setVariant(calm ? 'crossfade' : pickVariant(variantRef.current))
      setIndex((i) => (i + 1) % count)
    }, duration * 1000)
    return () => clearTimeout(t)
  }, [active, safeIndex, duration, count, calm])

  // Preload the upcoming image so the swap never pops in. Sized through the same
  // viewport cap as HeroSlideshow's render URL — the strings must match exactly
  // or the preload warms the wrong cache entry.
  const nextSrc = count > 1 ? ordered[(safeIndex + 1) % count]?.src : null
  useEffect(() => {
    if (!nextSrc) return
    const img = new Image()
    img.decoding = 'async'
    img.src = galleryImageUrl(nextSrc, viewportMaxEdge())
  }, [nextSrc])

  return {
    slide: current,
    index: safeIndex,
    variant: calm ? 'crossfade' : variant,
  }
}
