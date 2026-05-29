import { useMemo } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

// 12 petals seeded with deterministic offsets so the layout is the same on
// every reload. Kept near the left/right edges so the centre of the page
// (where text lives) stays uncluttered.
const PETALS = [
  { leftPct: 4, delay: 0, drift: 30, size: 14, rotate: 10, dur: 22 },
  { leftPct: 9, delay: 6, drift: -20, size: 9, rotate: 200, dur: 25 },
  { leftPct: 15, delay: 12, drift: 40, size: 12, rotate: 90, dur: 28 },
  { leftPct: 22, delay: 3, drift: -30, size: 10, rotate: 60, dur: 24 },
  { leftPct: 30, delay: 14, drift: 25, size: 13, rotate: 150, dur: 30 },
  { leftPct: 42, delay: 8, drift: -15, size: 8, rotate: 220, dur: 26 },
  { leftPct: 58, delay: 16, drift: 35, size: 11, rotate: 30, dur: 27 },
  { leftPct: 70, delay: 2, drift: -40, size: 14, rotate: 110, dur: 23 },
  { leftPct: 78, delay: 10, drift: 20, size: 9, rotate: 80, dur: 29 },
  { leftPct: 85, delay: 5, drift: -25, size: 12, rotate: 180, dur: 25 },
  { leftPct: 92, delay: 18, drift: 30, size: 10, rotate: 240, dur: 27 },
  { leftPct: 96, delay: 4, drift: -10, size: 8, rotate: 50, dur: 24 },
]

function Petal({ leftPct, delay, drift, size, rotate, dur }) {
  return (
    <motion.span
      className="absolute pointer-events-none will-change-transform"
      style={{
        left: `${leftPct}%`,
        top: 0,
        width: size,
        height: size,
        borderRadius: '60% 40% 60% 40% / 50% 60% 40% 50%',
        background:
          'radial-gradient(circle at 35% 30%, color-mix(in srgb, var(--color-accent) 95%, white), color-mix(in srgb, var(--color-accent) 40%, transparent))',
        mixBlendMode: 'soft-light',
      }}
      initial={{ y: '-15vh', x: 0, rotate, opacity: 0 }}
      animate={{
        y: '120vh',
        x: drift,
        rotate: rotate + 360,
        opacity: [0, 0.7, 0.7, 0],
      }}
      transition={{
        duration: dur,
        delay,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  )
}

export default function ParallaxPetals() {
  // Subtle vertical parallax: the whole petal field drifts slightly upward
  // as the user scrolls, layering on top of the per-petal animation so the
  // effect feels deeper than a single plane.
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 4000], [0, -180])

  // useMemo so we don't re-create the array on every scroll-driven re-render
  const petals = useMemo(() => PETALS, [])

  return (
    <motion.div
      aria-hidden
      style={{ y }}
      className="hidden md:block fixed inset-0 z-[1] pointer-events-none overflow-hidden motion-reduce:hidden"
    >
      {petals.map((p, i) => (
        <Petal key={i} {...p} />
      ))}
    </motion.div>
  )
}
