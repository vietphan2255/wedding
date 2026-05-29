import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion'

// Wraps a child so it's gently pulled toward the pointer while hovered, then
// springs back on leave. No-op on coarse pointers / reduced-motion.
export default function Magnetic({
  children,
  strength = 0.35,
  className = '',
}) {
  const reduce = useReducedMotion()
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 250, damping: 18, mass: 0.3 })
  const sy = useSpring(y, { stiffness: 250, damping: 18, mass: 0.3 })

  const fine =
    typeof window !== 'undefined' &&
    window.matchMedia('(pointer: fine)').matches

  if (reduce || !fine) {
    return <span className={className}>{children}</span>
  }

  const onMove = (e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const relX = e.clientX - (rect.left + rect.width / 2)
    const relY = e.clientY - (rect.top + rect.height / 2)
    x.set(relX * strength)
    y.set(relY * strength)
  }
  const reset = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.span
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{ x: sx, y: sy, display: 'inline-block' }}
      className={className}
    >
      {children}
    </motion.span>
  )
}
