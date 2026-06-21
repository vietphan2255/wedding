import { useEffect, useRef, useState } from 'react'
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
  AnimatePresence,
} from 'framer-motion'
import { useWeddingConfig } from '../../contexts/WeddingConfigContext'
import cssStringToStyle from '../../lib/cssStringToStyle'

// A fixed follower cursor: a small precise dot plus a larger lagging ring.
//
// Three opt-in layers, resolved from the nearest ancestor on each move:
//  - `data-cursor="view|open|drag|…"` (a keyword) → ring + label state. Always
//    wins, so interactive UI keeps its affordance.
//  - `data-cursor-id="<id>"` → a per-section GIF cursor configured in the admin
//    (`config.cursors`): image, size, free-form CSS, and optional idle behaviors
//    (show-only-when-idle, progressive zoom-when-idle).
//  - `data-cursor="<url>"` on <main> → the global GIF cursor (effects.cursorGif),
//    used page-wide and as the fallback while a show-when-idle cursor waits.
//
// Self-disables on coarse pointers and reduced-motion, restoring the native
// cursor.

const isUrlLike = (v) =>
  typeof v === 'string' &&
  (v.startsWith('http://') ||
    v.startsWith('https://') ||
    v.startsWith('/') ||
    v.startsWith('data:'))

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n))

// Shared idle math for both per-section and global GIF cursors.
// idleCap = total idle steps: 1 reveal (if idleSwap) + one per zoom level (if idleZoom).
const idleCap = (c) =>
  (c.idleSwap ? 1 : 0) +
  (c.idleZoom ? Math.max(1, Math.round(Number(c.idleZoomLevels)) || 1) : 0)

// Given the elapsed idle steps, whether the GIF is revealed yet and at what scale.
const idleReveal = (c, step) => {
  const revealed = c.idleSwap ? step >= 1 : true
  let scale = 1
  if (revealed && c.idleZoom) {
    const levels = Math.max(1, Math.round(Number(c.idleZoomLevels)) || 1)
    const level = clamp(step - (c.idleSwap ? 1 : 0), 0, levels)
    scale = 1 + 0.5 * level
  }
  return { revealed, scale }
}

const NO_HOVER = { mode: 'none', label: '', cfg: null, globalUrl: '' }

export default function CustomCursor() {
  const reduce = useReducedMotion()
  const { config } = useWeddingConfig()
  const [enabled, setEnabled] = useState(false)
  const [hidden, setHidden] = useState(true) // hide until first move / off-screen
  const [hover, setHover] = useState(NO_HOVER) // resolved nearest opt-in target
  const [idleStep, setIdleStep] = useState(0) // # of idleDelay ticks elapsed while still

  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const ringX = useSpring(x, { stiffness: 350, damping: 30, mass: 0.4 })
  const ringY = useSpring(y, { stiffness: 350, damping: 30, mass: 0.4 })

  // cursorId -> config, kept in a ref so the stable mousemove handler always
  // reads the latest admin config without re-binding the listener.
  const mapRef = useRef({})
  const hoverKeyRef = useRef('') // dedupes setHover so we only re-render on real changes
  const idleTimerRef = useRef(null)
  const effectsRef = useRef(config.effects) // latest global-cursor config for the bound handler

  useEffect(() => {
    const m = {}
    for (const c of config.cursors || []) {
      if (c && c.cursorId) m[c.cursorId] = c
    }
    mapRef.current = m
  }, [config.cursors])

  // Keep the latest global-cursor (effects) config in a ref so the once-bound
  // mousemove handler reads fresh idle settings without re-binding the listener.
  useEffect(() => {
    effectsRef.current = config.effects
  }, [config.effects])

  useEffect(() => {
    if (reduce) return
    const fine = window.matchMedia('(pointer: fine)').matches
    if (!fine) return
    setEnabled(true)
    document.documentElement.setAttribute('data-cursor-on', '')

    const stopIdle = () => {
      if (idleTimerRef.current) {
        clearInterval(idleTimerRef.current)
        idleTimerRef.current = null
      }
    }

    const onMove = (e) => {
      x.set(e.clientX)
      y.set(e.clientY)
      setHidden(false)

      const map = mapRef.current
      const el = e.target.closest?.('[data-cursor-id], [data-cursor]')
      let res = NO_HOVER
      if (el) {
        const kw = el.getAttribute('data-cursor')
        const cid = el.getAttribute('data-cursor-id')
        const cfg = cid ? map[cid] : null
        const globalUrl = () => {
          const g = e.target.closest?.('[data-cursor]')?.getAttribute('data-cursor') || ''
          return isUrlLike(g) ? g : ''
        }
        if (kw && !isUrlLike(kw)) {
          // Keyword opt-in (interactive UI) — always wins.
          res = {
            mode: 'keyword',
            label: el.getAttribute('data-cursor-label') || kw,
            cfg: null,
            globalUrl: '',
          }
        } else if (cfg && cfg.image) {
          // Configured per-section cursor. Capture the global url for the
          // show-when-idle fallback (shown while the mouse is still moving).
          res = { mode: 'section', label: '', cfg, globalUrl: globalUrl() }
        } else if (kw && isUrlLike(kw)) {
          res = { mode: 'global', label: '', cfg: null, globalUrl: kw }
        } else if (cid) {
          // data-cursor-id present but unconfigured / no image → global fallback.
          const g = globalUrl()
          res = g ? { mode: 'global', label: '', cfg: null, globalUrl: g } : NO_HOVER
        }
      }

      const key =
        res.mode +
        '|' +
        res.label +
        '|' +
        (res.cfg?.cursorId || '') +
        '|' +
        (res.cfg?.image || '') +
        '|' +
        res.globalUrl
      if (key !== hoverKeyRef.current) {
        hoverKeyRef.current = key
        setHover(res)
      }

      // Movement resets the idle progression. Re-arm the stepped timer only
      // when the hovered target — a per-section cursor or the global cursor —
      // opts into an idle behavior; it fires once per idleDelay until the cap
      // (reveal step + zoom levels) is reached.
      stopIdle()
      setIdleStep(0)
      const idleCfg =
        res.mode === 'section'
          ? res.cfg
          : res.mode === 'global'
            ? effectsRef.current
            : null
      if (idleCfg && (idleCfg.idleSwap || idleCfg.idleZoom)) {
        const delayMs = Math.max(50, (Number(idleCfg.idleDelay) || 1.5) * 1000)
        const cap = idleCap(idleCfg)
        idleTimerRef.current = setInterval(() => {
          setIdleStep((s) => {
            const next = s + 1
            if (next >= cap) stopIdle()
            return next > cap ? cap : next
          })
        }, delayMs)
      }
    }

    const onLeave = () => {
      setHidden(true)
      stopIdle()
      setIdleStep(0)
      hoverKeyRef.current = ''
      setHover(NO_HOVER)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseleave', onLeave)
    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
      stopIdle()
      document.documentElement.removeAttribute('data-cursor-on')
    }
  }, [reduce, x, y])

  if (!enabled) return null

  // Derive what to draw from the resolved hover + how long the mouse has idled.
  let active = false // keyword ring + label
  let label = ''
  let gifUrl = ''
  let gifSize = 56
  let gifStyle = {}
  let gifScale = 1

  if (hover.mode === 'keyword') {
    active = true
    label = hover.label
  } else if (hover.mode === 'section' && hover.cfg) {
    const cfg = hover.cfg
    const { revealed, scale } = idleReveal(cfg, idleStep)
    if (revealed) {
      gifUrl = cfg.image
      gifSize = Number(cfg.size) || 56
      gifStyle = cssStringToStyle(cfg.style)
      gifScale = scale
    } else if (hover.globalUrl) {
      gifUrl = hover.globalUrl // show-when-idle: global cursor while still moving
    }
  } else if (hover.mode === 'global') {
    const eff = config.effects || {}
    const { revealed, scale } = idleReveal(eff, idleStep)
    if (revealed) {
      gifUrl = hover.globalUrl
      gifScale = scale
    }
    // not revealed → gifUrl stays '' → gifMode false → the default ring + dot shows
  }

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

      {/* GIF cursor — follows precisely (no lag), centered on pointer; scale
          animates the progressive idle zoom. */}
      <motion.img
        key={gifUrl /* re-mount when URL changes so the GIF restarts */}
        src={gifUrl || undefined}
        alt=""
        draggable={false}
        className="absolute top-0 left-0 select-none"
        animate={{ scale: gifScale }}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
        style={{
          ...gifStyle,
          x,
          y,
          translateX: '-50%',
          translateY: '-50%',
          width: gifSize,
          height: gifSize,
          objectFit: gifStyle.objectFit || 'contain',
          willChange: 'transform',
          display: gifMode ? 'block' : 'none',
        }}
      />
    </div>
  )
}
