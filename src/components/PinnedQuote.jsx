import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useLanguage } from '../contexts/LanguageContext.jsx'

// A single word with scroll-driven opacity. Has to be its own component so
// `useTransform` is called at the top level of a component (rules of hooks).
function Word({ word, scrollYProgress, start, end }) {
  const opacity = useTransform(scrollYProgress, [start, end], [0.12, 1])
  const y = useTransform(scrollYProgress, [start, end], [12, 0])
  return (
    <motion.span
      style={{ opacity, y }}
      className="inline-block mr-[0.32em] will-change-transform"
    >
      {word}
    </motion.span>
  )
}

export default function PinnedQuote() {
  const { t } = useLanguage()
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const quote = t('pinned.quote')
  const attribution = t('pinned.attribution')
  const words = quote.split(/\s+/).filter(Boolean)

  // Distribute word reveals across the middle 60 % of the scroll range so
  // there's lead-in space at the top and tail-out at the bottom.
  const REVEAL_START = 0.2
  const REVEAL_END = 0.7
  const step = (REVEAL_END - REVEAL_START) / Math.max(1, words.length)

  // Subtle ornament parallax — the script flourish and attribution drift in
  // counter-direction to the words above.
  const flourishY = useTransform(scrollYProgress, [0, 1], [60, -60])
  const attrOpacity = useTransform(
    scrollYProgress,
    [REVEAL_END, REVEAL_END + 0.08],
    [0, 1],
  )

  return (
    <section
      ref={ref}
      aria-label="A pause between chapters"
      className="relative bg-bg"
      style={{ height: '180vh' }}
    >
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        <motion.span
          aria-hidden
          style={{ y: flourishY }}
          className="absolute -top-10 left-1/2 -translate-x-1/2 font-script text-[18vw] md:text-[12vw] text-accent/10 leading-none select-none"
        >
          &amp;
        </motion.span>

        <div className="relative z-10 px-6 max-w-5xl text-center">
          <p
            className="font-display text-3xl md:text-5xl lg:text-6xl leading-[1.25] text-ink"
            style={{ wordSpacing: '0.05em' }}
          >
            {words.map((word, i) => {
              const start = REVEAL_START + i * step
              const end = start + step + 0.04
              return (
                <Word
                  key={i}
                  word={word}
                  scrollYProgress={scrollYProgress}
                  start={start}
                  end={Math.min(end, 1)}
                />
              )
            })}
          </p>

          <motion.p
            style={{ opacity: attrOpacity }}
            className="mt-10 eyebrow text-muted"
          >
            {attribution}
          </motion.p>
        </div>
      </div>
    </section>
  )
}
