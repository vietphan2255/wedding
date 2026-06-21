import { AnimatePresence, motion } from 'framer-motion'
import useHeroSlideshow from '../hooks/useHeroSlideshow'

// Entrance/exit defs, keyed to the variant names in useHeroSlideshow. `animate`
// is the neutral resting state; enter (initial→animate) and exit only differ by
// opacity plus a small transform, so the outgoing and incoming layers overlap
// smoothly. The pan variants keep scale ≥ 1.06 so the ±3% slide never reveals an
// empty edge. The exiting image keeps the variant it entered with (AnimatePresence
// snapshots its props), so each swap mixes one random enter with the prior exit.
const VARIANTS = {
  crossfade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  zoomIn: {
    initial: { opacity: 0, scale: 1.12 },
    animate: { opacity: 1, scale: 1.05 },
    exit: { opacity: 0, scale: 1.0 },
  },
  zoomOut: {
    initial: { opacity: 0, scale: 1.0 },
    animate: { opacity: 1, scale: 1.05 },
    exit: { opacity: 0, scale: 1.12 },
  },
  panLeft: {
    initial: { opacity: 0, x: '3%', scale: 1.06 },
    animate: { opacity: 1, x: '0%', scale: 1.06 },
    exit: { opacity: 0, x: '-3%', scale: 1.06 },
  },
  panRight: {
    initial: { opacity: 0, x: '-3%', scale: 1.06 },
    animate: { opacity: 1, x: '0%', scale: 1.06 },
    exit: { opacity: 0, x: '3%', scale: 1.06 },
  },
}

const TRANSITION = { duration: 1.4, ease: [0.4, 0, 0.2, 1] }

// Cycling hero background. Stacks absolutely-positioned image layers under a
// single overlay so swaps never flash. Uses the default (overlapping)
// AnimatePresence mode — NOT `mode="wait"`, which would blank the hero between
// slides — and `initial={false}` so the first slide doesn't animate in on load.
export default function HeroSlideshow({ slides, calm = false }) {
  const { slide, index, variant } = useHeroSlideshow(slides, { calm })
  if (!slide) return null

  const v = VARIANTS[variant] || VARIANTS.crossfade
  const focalX = slide.focalX ?? 50
  const focalY = slide.focalY ?? 50

  return (
    <>
      <AnimatePresence initial={false}>
        <motion.img
          key={slide.id ?? index}
          src={slide.src}
          alt=""
          decoding="async"
          fetchPriority="high"
          variants={v}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={TRANSITION}
          style={{ objectPosition: `${focalX}% ${focalY}%` }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>
      <div
        className="absolute inset-0"
        style={{ background: 'var(--hero-overlay)' }}
      />
    </>
  )
}
