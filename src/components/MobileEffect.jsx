import { useEffect, useMemo, useState } from 'react'
import { motion, useAnimationControls, useReducedMotion } from 'framer-motion'
import useIsPhone from '../hooks/useIsPhone'
import { useWeddingConfig } from '../contexts/WeddingConfigContext'
import CharacterScriptModal from './CharacterScriptModal.jsx'

// Px the MobileRsvpBar dock occupies from the viewport bottom (≈60–70px bar +
// its 12px bottom padding). The gift floats this far up PLUS the active leg's
// `offset`, so it clears the dock. Constant on purpose — deliberately NOT
// coupled to the dock's hide-on-RSVP state, so the gift never jumps when the
// dock comes and goes.
const DOCK_RESERVED = 72
// px/s floor so a bad/zero speed can't produce an Infinity duration.
const MIN_SPEED = 10

/**
 * Resolve which sprite + settings + modal content a travel leg uses, applying
 * the single-image mirror fallback. `dir` is 'A' (left→right) or 'B'
 * (right→left). A leg prefers its own slot's image; if that's empty it borrows
 * the other slot's image, horizontally mirrored, along with that slot's
 * settings AND its character/name/script. The modal `character` falls back to
 * the flying sprite when no separate portrait is set. Returns null when neither
 * slot has an image (effect off). Exported for unit tests.
 */
export function resolveLeg(dir, fg) {
  const own = dir === 'A' ? fg.slotA : fg.slotB
  const other = dir === 'A' ? fg.slotB : fg.slotA
  const fromSlot = (slot, flip) => ({
    src: slot.image.trim(),
    flip,
    size: slot.size,
    offset: slot.offset,
    speed: slot.speed,
    wait: slot.wait,
    // Character-script modal content (shown on tap).
    character: (slot.character || '').trim() || slot.image.trim(),
    name: (slot.name || '').trim(),
    script: Array.isArray(slot.script) ? slot.script : [],
  })
  if ((own?.image || '').trim()) return fromSlot(own, false)
  if ((other?.image || '').trim()) return fromSlot(other, true)
  return null
}

/**
 * Mobile-only decorative effect: a sprite that ping-pongs across the bottom
 * lane, just above the MobileRsvpBar dock. One sprite at a time: it enters
 * off-left, crosses to off-right, pauses, then returns, forever. Image/settings
 * swap per leg. Tapping the sprite opens a character-script modal configured for
 * that leg's slot.
 */
export default function MobileEffect() {
  const { config } = useWeddingConfig()
  const reduce = useReducedMotion()
  const isPhone = useIsPhone()
  const controls = useAnimationControls()
  const [leg, setLeg] = useState('A') // which pass is currently on screen
  const [tabHidden, setTabHidden] = useState(false)
  const [geomKey, setGeomKey] = useState(0) // bump on resize → re-run the loop
  // Snapshot of the leg that was tapped, driving the character-script modal.
  const [modal, setModal] = useState(null)

  const fg = config.mobileEffect
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
    <>
      <motion.div
        animate={controls}
        initial={{ x: -legA.size }} // parked off-left before the first frame
        className="md:hidden fixed left-0 z-[45] pointer-events-none will-change-transform"
        style={{ bottom: DOCK_RESERVED + (active.offset || 0) }}
      >
        {/* Only the sprite is a tap target; the lane stays pointer-events-none so
            it never blocks the dock or page content underneath. Tapping opens the
            character-script modal for the tapped leg's slot. */}
        <button
          type="button"
          onClick={() =>
            setModal({ image: active.character, name: active.name, lines: active.script })
          }
          aria-label={active.name || 'Open message'}
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

      <CharacterScriptModal
        open={Boolean(modal)}
        image={modal?.image}
        name={modal?.name}
        lines={modal?.lines || []}
        onClose={() => setModal(null)}
      />
    </>
  )
}
