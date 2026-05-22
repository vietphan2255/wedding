import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function ParallaxImage({ src, alt = '', className = '', strength = 80, overlay = false }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], [-strength, strength])
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.15, 1.05, 1.15])

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.img
        src={src}
        alt={alt}
        loading="lazy"
        style={{ y, scale }}
        className="absolute inset-0 w-full h-full object-cover will-change-transform"
      />
      {overlay && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'var(--hero-overlay)' }}
        />
      )}
    </div>
  )
}
