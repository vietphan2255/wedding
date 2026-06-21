import { useMemo } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useWeddingConfig } from '../contexts/WeddingConfigContext'

// Clamp bounds shared with the admin Effects section. Count is capped so a
// stray config value can't spawn hundreds of infinite animations; speed is
// kept > 0 so `dur / speed` can never divide by zero.
const COUNT_MAX = 60
const SPEED_MIN = 0.1
const SPEED_MAX = 3

// Tiny deterministic PRNG (mulberry32). Not crypto — just stable visual jitter
// so the field is identical on every reload (and hydration-safe). Never use
// Math.random() here.
function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Generate `count` particles. Each index is seeded from itself so growing the
// count only appends new particles — the existing ones keep identical params
// (no reshuffle when the admin nudges the count). Ranges mirror the legacy
// hand-tuned 12-petal array.
function makePetals(count) {
  const n = Math.max(0, Math.min(COUNT_MAX, Math.floor(count) || 0))
  return Array.from({ length: n }, (_, i) => {
    const r = mulberry32(i * 2654435761 + 0x9e3779b9)
    return {
      leftPct: +(r() * 96 + 2).toFixed(2), // 2..98%
      size: Math.round(r() * 7 + 8), // 8..15px
      drift: Math.round(r() * 80 - 40), // -40..40px lateral
      rotate: Math.round(r() * 360),
      dur: +(r() * 8 + 22).toFixed(2), // 22..30s fall time
      delay: +(r() * 18).toFixed(2), // 0..18s stagger
    }
  })
}

// Filled silhouettes used as CSS masks, so the same gradient fill (and chosen
// colour) shows through the shape. Only the alpha matters; the SVG fill/stroke
// colour is irrelevant. The snowflake is one arm rotated six times.
const HEART_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 29'%3E%3Cpath d='M16 29s-13-8.4-13-17.1C3 6.5 6.9 3 11.2 3 13.6 3 15.4 4.4 16 5.6 16.6 4.4 18.4 3 20.8 3 25.1 3 29 6.5 29 11.9 29 20.6 16 29 16 29z' fill='%23000'/%3E%3C/svg%3E"
const STAR_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 .587l3.668 7.431 8.2 1.192-5.934 5.784 1.401 8.169L12 18.896l-7.335 3.867 1.401-8.169L.132 8.21l8.2-1.192z' fill='%23000'/%3E%3C/svg%3E"
const SNOWFLAKE_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cg fill='none' stroke='%23000' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 12L12 2.5M12 6L9.5 3.5M12 6L14.5 3.5'/%3E%3Cpath d='M12 12L12 2.5M12 6L9.5 3.5M12 6L14.5 3.5' transform='rotate(60 12 12)'/%3E%3Cpath d='M12 12L12 2.5M12 6L9.5 3.5M12 6L14.5 3.5' transform='rotate(120 12 12)'/%3E%3Cpath d='M12 12L12 2.5M12 6L9.5 3.5M12 6L14.5 3.5' transform='rotate(180 12 12)'/%3E%3Cpath d='M12 12L12 2.5M12 6L9.5 3.5M12 6L14.5 3.5' transform='rotate(240 12 12)'/%3E%3Cpath d='M12 12L12 2.5M12 6L9.5 3.5M12 6L14.5 3.5' transform='rotate(300 12 12)'/%3E%3C/g%3E%3C/svg%3E"

function maskStyle(svg) {
  return {
    borderRadius: 0,
    WebkitMaskImage: `url("${svg}")`,
    maskImage: `url("${svg}")`,
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
    WebkitMaskSize: 'contain',
    maskSize: 'contain',
    WebkitMaskPosition: 'center',
    maskPosition: 'center',
  }
}

// Per-shape style delta. The shared gradient + soft-light blend stay; only the
// silhouette (border-radius / mask) and the glassy bubble override differ.
// `accent` is the resolved colour token (a hex or `var(--color-accent)`).
function shapeStyle(shape, accent) {
  switch (shape) {
    case 'circle':
      return { borderRadius: '50%' }
    case 'bubble':
      return {
        borderRadius: '50%',
        background: `radial-gradient(circle at 30% 25%, rgba(255,255,255,0.9), color-mix(in srgb, ${accent} 35%, transparent) 60%, transparent 75%)`,
        boxShadow: `inset 0 0 4px rgba(255,255,255,0.5), 0 0 6px color-mix(in srgb, ${accent} 40%, transparent)`,
        mixBlendMode: 'screen', // reads well on both light and dark themes
      }
    case 'heart':
      return maskStyle(HEART_SVG)
    case 'star':
      return maskStyle(STAR_SVG)
    case 'snowflake':
      return maskStyle(SNOWFLAKE_SVG)
    case 'petal':
    default:
      return { borderRadius: '60% 40% 60% 40% / 50% 60% 40% 50%' }
  }
}

function Petal({ leftPct, delay, drift, size, rotate, dur, shape, speed, accent }) {
  const baseBg = `radial-gradient(circle at 35% 30%, color-mix(in srgb, ${accent} 95%, white), color-mix(in srgb, ${accent} 40%, transparent))`
  return (
    <motion.span
      className="absolute pointer-events-none will-change-transform"
      style={{
        left: `${leftPct}%`,
        top: 0,
        width: size,
        height: size,
        background: baseBg,
        mixBlendMode: 'soft-light',
        // Spread last so bubble's own background/blend override the shared ones.
        ...shapeStyle(shape, accent),
      }}
      initial={{ y: '-15vh', x: 0, rotate, opacity: 0 }}
      animate={{
        y: '120vh',
        x: drift,
        rotate: rotate + 360,
        opacity: [0, 0.7, 0.7, 0],
      }}
      transition={{
        duration: dur / speed, // speed clamped > 0 by the caller
        delay,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  )
}

export default function ParallaxPetals() {
  // Subtle vertical parallax: the whole field drifts slightly upward as the
  // user scrolls, layering on top of the per-petal animation.
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 4000], [0, -180])

  // Shape / count / speed / colour are admin-configurable (Effects section).
  // Defaults reproduce the legacy 12 sage-green petals.
  const { config } = useWeddingConfig()
  const eff = config.effects
  const enabled = eff?.petalsEnabled !== false
  const shape = eff?.petalShape ?? 'petal'
  const count = eff?.petalCount ?? 12
  const speed = Math.min(SPEED_MAX, Math.max(SPEED_MIN, Number(eff?.petalSpeed) || 1))
  const accent = (eff?.petalColor || '').trim() || 'var(--color-accent)'

  // Re-seed positions only when the count changes (not on speed/colour/scroll);
  // speed + colour flow in as props and are picked up without a rebuild.
  const petals = useMemo(() => makePetals(count), [count])

  if (!enabled || petals.length === 0) return null

  return (
    <motion.div
      aria-hidden
      style={{ y }}
      className="hidden md:block fixed inset-0 z-[1] pointer-events-none overflow-hidden motion-reduce:hidden"
    >
      {petals.map((p, i) => (
        // Key by shape so switching shapes remounts each span (restarts cleanly
        // from opacity:0 instead of mid-fall morphing).
        <Petal key={`${shape}-${i}`} {...p} shape={shape} speed={speed} accent={accent} />
      ))}
    </motion.div>
  )
}
