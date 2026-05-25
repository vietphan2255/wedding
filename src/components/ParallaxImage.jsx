import { useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function ParallaxImage({
  src,
  placeholder = '',
  alt = '',
  className = '',
  strength = 80,
  overlay = false,
}) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], [-strength, strength])
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.15, 1.05, 1.15])

  const [loaded, setLoaded] = useState(false)
  const hasPlaceholder = Boolean(placeholder)

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      {hasPlaceholder && (
        <div
          aria-hidden
          className="absolute inset-0 bg-cover bg-center scale-110"
          style={{
            backgroundImage: `url(${placeholder})`,
            filter: 'blur(20px)',
            opacity: loaded ? 0 : 1,
            transition: 'opacity 500ms ease-out',
          }}
        />
      )}
      <motion.img
        src={src}
        alt={alt}
        loading="lazy"
        style={{ y, scale }}
        onLoad={() => setLoaded(true)}
        className={`absolute inset-0 w-full h-full object-cover will-change-transform transition-opacity duration-500 ${
          loaded || !hasPlaceholder ? 'opacity-100' : 'opacity-0'
        }`}
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
