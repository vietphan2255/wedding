import { useRef, useState } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'

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

  // Only promote to a compositor layer while the image is in the viewport.
  const inView = useInView(ref, { margin: '0px 0px 200px 0px' })
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
            filter: 'blur(10px)',
            opacity: loaded ? 0 : 1,
            transition: 'opacity 500ms ease-out',
          }}
        />
      )}
      <motion.img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        style={{ y, scale }}
        onLoad={() => setLoaded(true)}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
          inView ? 'will-change-transform' : ''
        } ${loaded || !hasPlaceholder ? 'opacity-100' : 'opacity-0'}`}
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
