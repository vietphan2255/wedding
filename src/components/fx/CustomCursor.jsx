import { useEffect, useState } from 'react'
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
  AnimatePresence,
} from 'framer-motion'

// A fixed follower cursor: a small precise dot plus a larger lagging ring.
// Elements opt in to a richer state with `data-cursor="view|open|drag|…"`
// (optional `data-cursor-label` overrides the word).
//
// If the `data-cursor` value *looks like a URL*, the cursor renders that
// URL as a 56px GIF/img in place of the ring + label — used for the
// "GIF cursor" feature, where <main> carries `data-cursor={cursorGif}`
// page-wide and interactive children override with a keyword.
//
// Self-disables on coarse pointers and reduced-motion, restoring the
// native cursor.

const isUrlLike = (v) =>
  typeof v === 'string' &&
  (v.startsWith('http://') ||
    v.startsWith('https://') ||
    v.startsWith('/') ||
    v.startsWith('data:'))

export default function CustomCursor() {
  const reduce = useReducedMotion()
  const [enabled, setEnabled] = useState(false)
  const [active, setActive] = useState(false) // hovering a keyword opt-in
  const [label, setLabel] = useState('')
  const [gifUrl, setGifUrl] = useState('')
  const [hidden, setHidden] = useState(true) // hide until first move / off-screen

  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const ringX = useSpring(x, { stiffness: 350, damping: 30, mass: 0.4 })
  const ringY = useSpring(y, { stiffness: 350, damping: 30, mass: 0.4 })

  useEffect(() => {
    if (reduce) return
    const fine = window.matchMedia('(pointer: fine)').matches
    if (!fine) return
    setEnabled(true)
    document.documentElement.setAttribute('data-cursor-on', '')

    const onMove = (e) => {
      x.set(e.clientX)
      y.set(e.clientY)
      setHidden(false)
      const target = e.target.closest?.('[data-cursor]')
      const value = target?.getAttribute('data-cursor') || ''
      if (target && isUrlLike(value)) {
        setGifUrl(value)
        setActive(false)
        setLabel('')
      } else if (target && value) {
        setGifUrl('')
        setActive(true)
        setLabel(target.getAttribute('data-cursor-label') || value)
      } else {
        setGifUrl('')
        setActive(false)
        setLabel('')
      }
    }
    const onLeave = () => setHidden(true)

    window.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseleave', onLeave)
    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
      document.documentElement.removeAttribute('data-cursor-on')
    }
  }, [reduce, x, y])

  if (!enabled) return null

  const gifMode = gifUrl !== ''

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[200]"
      style={{ opacity: hidden ? 0 : 1, transition: 'opacity 0.25s' }}
    >
      {/* Lagging ring / label bubble — hidden while a GIF cursor is active. */}
      <motion.div
        className="absolute top-0 left-0 flex items-center justify-center rounded-full border border-accent text-[10px] uppercase tracking-[0.18em] text-accent"
        style={{ x: ringX, y: ringY, translateX: '-50%', translateY: '-50%' }}
        animate={{
          width: gifMode ? 0 : active ? 72 : 34,
          height: gifMode ? 0 : active ? 72 : 34,
          opacity: gifMode ? 0 : 1,
          backgroundColor: active
            ? 'color-mix(in srgb, var(--color-accent) 14%, transparent)'
            : 'rgba(0,0,0,0)',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      >
        <AnimatePresence>
          {!gifMode && active && label && (
            <motion.span
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.18 }}
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Precise dot — hidden while active OR in GIF mode. */}
      <motion.div
        className="absolute top-0 left-0 w-1.5 h-1.5 rounded-full bg-accent"
        style={{ x, y, translateX: '-50%', translateY: '-50%' }}
        animate={{ opacity: active || gifMode ? 0 : 1 }}
      />

      {/* GIF cursor — follows precisely (no lag), centered on pointer. */}
      <motion.img
        key={gifUrl /* re-mount when URL changes so the GIF restarts */}
        src={gifUrl || undefined}
        alt=""
        draggable={false}
        className="absolute top-0 left-0 select-none"
        style={{
          x,
          y,
          translateX: '-50%',
          translateY: '-50%',
          width: 56,
          height: 56,
          objectFit: 'contain',
          willChange: 'transform',
          display: gifMode ? 'block' : 'none',
        }}
      />
    </div>
  )
}
