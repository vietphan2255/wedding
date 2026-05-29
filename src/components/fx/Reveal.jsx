import { motion, useReducedMotion } from 'framer-motion'

// Single clip-mask reveal: the child rises from an overflow-hidden box (the
// classic editorial "wipe up" reveal) when scrolled into view.
//
// IMPORTANT: the in-view trigger lives on the OUTER (untransformed) box and
// drives the inner element via variants. If `whileInView` lived on the
// transformed element itself, its IntersectionObserver would watch the
// displaced position (y can be 105% of a tall image), so it would never
// register as on-screen and the element would stay hidden.
export default function Reveal({
  children,
  className = '',
  innerClassName = '',
  delay = 0,
  duration = 0.9,
  y = '105%',
  once = true,
}) {
  const reduce = useReducedMotion()

  if (reduce) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.span
      className={`block overflow-hidden ${className}`}
      style={{ paddingBottom: '0.12em', marginBottom: '-0.12em' }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-10% 0px' }}
    >
      <motion.span
        className={`block ${innerClassName}`}
        variants={{
          hidden: { y, opacity: 0 },
          visible: {
            y: '0%',
            opacity: 1,
            transition: { duration, delay, ease: [0.22, 1, 0.36, 1] },
          },
        }}
        style={{ willChange: 'transform, opacity' }}
      >
        {children}
      </motion.span>
    </motion.span>
  )
}
