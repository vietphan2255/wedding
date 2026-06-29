import { useEffect, useMemo, useState } from 'react'
import { motion, useAnimationControls, useReducedMotion } from 'framer-motion'
import useIsPhone from '../hooks/useIsPhone'
import { useWeddingConfig } from '../contexts/WeddingConfigContext'
import { useLanguage } from '../contexts/LanguageContext'

// Px the MobileRsvpBar dock occupies from the viewport bottom (≈60–70px bar +
// its 12px bottom padding). The gift floats this far up PLUS the active leg's
// `offset`, so it clears the dock. Constant on purpose — deliberately NOT
// coupled to the dock's hide-on-RSVP state, so the gift never jumps when the
// dock comes and goes.
const DOCK_RESERVED = 72
// px/s floor so a bad/zero speed can't produce an Infinity duration.
const MIN_SPEED = 10

/**
 * Resolve which image + settings a travel leg uses, applying the single-image
 * mirror fallback. `dir` is 'A' (left→right) or 'B' (right→left). A leg prefers
 * its own slot's image; if that's empty it borrows the other slot's image,
 * horizontally mirrored, along with that slot's size/offset/speed/wait. Returns
 * null when neither slot has an image (effect off). Exported for unit tests.
 */
export function resolveLeg(dir, fg) {
  const own = dir === 'A' ? fg.slotA : fg.slotB
  const other = dir === 'A' ? fg.slotB : fg.slotA
  if ((own?.image || '').trim()) {
    return {
      src: own.image.trim(),
      flip: false,
      size: own.size,
      offset: own.offset,
      speed: own.speed,
      wait: own.wait,
    }
  }
  if ((other?.image || '').trim()) {
    return {
      src: other.image.trim(),
      flip: true,
      size: other.size,
      offset: other.offset,
      speed: other.speed,
      wait: other.wait,
    }
  }
  return null
}

/**
 * Mobile-only decorative gift that ping-pongs across the bottom lane, just above
 * the MobileRsvpBar dock. One sprite at a time: it enters off-left, crosses to
 * off-right, pauses, then returns, forever. Image/settings swap per leg.
 *
 * @param {{ onGiftClick?: () => void }} props `onGiftClick` opens the gift modal.
 */
export default function FloatingGift({ onGiftClick }) {
  const { config } = useWeddingConfig()
  const { t } = useLanguage()
  const reduce = useReducedMotion()
  const isPhone = useIsPhone()
  const controls = useAnimationControls()
  const [leg, setLeg] = useState('A') // which pass is currently on screen
  const [tabHidden, setTabHidden] = useState(false)
  const [geomKey, setGeomKey] = useState(0) // bump on resize → re-run the loop

  const fg = config.floatingGift
  const legA = useMemo(() => (fg ? resolveLeg('A', fg) : null), [fg])
  const legB = useMemo(() => (fg ? resolveLeg('B', fg) : null), [fg])

  // Mobile-only, OFF under prefers-reduced-motion, paused when the tab is
  // hidden, and needs ≥1 configured image (both legs resolve non-null iff at
  // least one image exists).
  const enabled =
    isPhone && !reduce && !tabHidden && fg?.enabled !== false && Boolean(legA && legB)

  // Pause/teardown when the tab is hidden (battery).
  useEffect(() => {
    if (typeof document === 'undefined') return
    const onVis = () => setTabHidden(document.hidden)
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  // Re-run the loop on viewport resize / orientation change (debounced) so the
  // off-screen math uses a fresh viewport width.
  useEffect(() => {
    if (typeof window === 'undefined') return
    let tm
    const onResize = () => {
      clearTimeout(tm)
      tm = setTimeout(() => setGeomKey((k) => k + 1), 150)
    }
    window.addEventListener('resize', onResize)
    return () => {
      clearTimeout(tm)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  // The ping-pong: an async while-loop driving useAnimationControls. The
  // discrete wait→cross→swap sequence maps 1:1 onto await sleep / await start.
  useEffect(() => {
    if (!enabled || !legA || !legB) return
    const vw = window.innerWidth
    let cancelled = false
    let timer
    const sleep = (ms) =>
      new Promise((res) => {
        timer = setTimeout(res, ms)
      })
    // Travel distance = viewport + element width (so it fully clears both edges).
    const durA = (vw + legA.size) / Math.max(MIN_SPEED, legA.speed)
    const durB = (vw + legB.size) / Math.max(MIN_SPEED, legB.speed)

    const run = async () => {
      while (!cancelled) {
        // Leg A: left → right. Park fully off the left (right edge at x=0).
        setLeg('A')
        controls.set({ x: -legA.size })
        await sleep(legA.wait * 1000)
        if (cancelled) return
        await controls.start({ x: vw, transition: { duration: durA, ease: 'linear' } })
        if (cancelled) return
        // Leg B: right → left. Park fully off the right (left edge at viewport right).
        setLeg('B')
        controls.set({ x: vw })
        await sleep(legB.wait * 1000)
        if (cancelled) return
        await controls.start({ x: -legB.size, transition: { duration: durB, ease: 'linear' } })
        if (cancelled) return
      }
    }
    run()
    return () => {
      cancelled = true
      clearTimeout(timer)
      controls.stop()
    }
  }, [enabled, legA, legB, geomKey, controls])

  if (!enabled || !legA || !legB) return null
  const active = leg === 'A' ? legA : legB

  return (
    <motion.div
      animate={controls}
      initial={{ x: -legA.size }} // parked off-left before the first frame
      className="md:hidden fixed left-0 z-[45] pointer-events-none will-change-transform"
      style={{ bottom: DOCK_RESERVED + (active.offset || 0) }}
    >
      {/* Only the sprite is a tap target; the lane stays pointer-events-none so
          it never blocks the dock or page content underneath. */}
      <button
        type="button"
        onClick={onGiftClick}
        aria-label={t('nav.gift')}
        className="pointer-events-auto block active:scale-95 transition-transform"
      >
        <img
          src={active.src}
          alt=""
          draggable={false}
          decoding="async"
          style={{
            width: active.size,
            height: 'auto',
            display: 'block',
            transform: active.flip ? 'scaleX(-1)' : undefined,
          }}
        />
      </button>
    </motion.div>
  )
}
