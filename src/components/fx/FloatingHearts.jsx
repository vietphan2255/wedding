import { motion } from 'framer-motion'

// Hearts that burst upward out of the envelope when it opens. Driven by the
// `active` prop so the parent can tie it to its open state. Renders into an
// absolutely-positioned layer; place inside the envelope's relative wrapper.
const HEARTS = [
  { x: -118, size: 18, delay: 0.0, drift: -34, rise: 380 },
  { x: -58, size: 13, delay: 0.32, drift: 22, rise: 440 },
  { x: 4, size: 22, delay: 0.14, drift: -12, rise: 500 },
  { x: 66, size: 15, delay: 0.48, drift: 30, rise: 420 },
  { x: 126, size: 20, delay: 0.22, drift: -24, rise: 460 },
  { x: 34, size: 11, delay: 0.6, drift: 16, rise: 400 },
]

function Heart({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  )
}

export default function FloatingHearts({ active = false, className = '' }) {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`} aria-hidden>
      {HEARTS.map((h, i) => (
        <motion.span
          key={i}
          className="absolute text-accent will-change-transform"
          style={{ left: '50%', top: '62%', marginLeft: h.x - h.size / 2 }}
          initial={{ opacity: 0, y: 0, x: 0, scale: 0.4 }}
          animate={
            active
              ? {
                  opacity: [0, 1, 1, 0],
                  y: -h.rise,
                  x: h.drift,
                  scale: [0.4, 1, 1, 0.9],
                  rotate: [0, h.drift > 0 ? 12 : -12, 0],
                }
              : { opacity: 0, y: 0, x: 0, scale: 0.4 }
          }
          transition={
            active
              ? { duration: 2.4, ease: 'easeOut', delay: 0.6 + h.delay }
              : { duration: 0.2 }
          }
        >
          <Heart size={h.size} />
        </motion.span>
      ))}
    </div>
  )
}
