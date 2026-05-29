import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

/**
 * Horizontal marquee with counter-motion parallax. Combines two layers:
 *  - An infinite linear scroll (CSS-style endless loop)
 *  - A scroll-driven horizontal shift (band drifts faster/opposite as the
 *    user scrolls past it on the page).
 *
 * Pass an array of `items` (strings or JSX) — they'll be tiled wide enough
 * that the loop never shows empty space.
 */
export default function MarqueeBand({
  items = [],
  reverse = false,
  className = '',
  itemClassName = 'font-display text-5xl md:text-7xl lg:text-8xl text-ink leading-none',
  separator = '✦',
  duration = 28,
}) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  // Counter-motion offset: shifts the band in the opposite direction of the
  // page scroll. As the band crosses the viewport, it appears to glide much
  // faster than the surrounding content.
  const offset = useTransform(
    scrollYProgress,
    [0, 1],
    reverse ? ['-15%', '15%'] : ['15%', '-15%'],
  )

  // Repeat items enough times that the loop never has a visible seam.
  const repeated = [...items, ...items, ...items, ...items, ...items, ...items]

  return (
    <div
      ref={ref}
      className={`overflow-hidden border-y border-line bg-surface py-6 md:py-9 ${className}`}
    >
      <motion.div style={{ x: offset }} className="will-change-transform">
        <motion.div
          className="flex gap-10 whitespace-nowrap will-change-transform"
          animate={{ x: reverse ? ['-50%', '0%'] : ['0%', '-50%'] }}
          transition={{
            duration,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {repeated.map((item, i) => (
            <span key={i} className={`${itemClassName} inline-flex items-center gap-10`}>
              {item}
              <span aria-hidden className="text-accent text-3xl md:text-4xl">
                {separator}
              </span>
            </span>
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}
