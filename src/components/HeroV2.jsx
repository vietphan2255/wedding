import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext.jsx'
import { useWeddingConfig } from '../contexts/WeddingConfigContext.jsx'
import { computeMosaic, useImageAspects, DEFAULT_AR } from '../lib/heroMosaic.js'
import SplitText from './fx/SplitText.jsx'
import Reveal from './fx/Reveal.jsx'
import Magnetic from './fx/Magnetic.jsx'

// Editorial hero: a config-driven photo mosaic with a roaming spotlight sits
// behind a line-revealed headline lockup. Each image keeps its own aspect
// ratio and is absolute-positioned by computeMosaic() so the photos tile the
// hero edge to edge like packed blocks. Images come from /admin → Hero
// (config.heroImages); falls back to the picsum mocks below.
const FALLBACK_SIZES = [
  [720, 900],
  [1200, 800],
  [900, 900],
  [800, 1200],
  [1100, 720],
  [900, 1100],
]
const FALLBACK_IMAGES = Array.from({ length: 12 }, (_, i) => {
  const [w, h] = FALLBACK_SIZES[i % FALLBACK_SIZES.length]
  return `https://picsum.photos/seed/vn-hero-${i + 1}/${w}/${h}`
})

const GAP = 8

const BASE_OPACITY = 0.32
const HIGHLIGHT_OPACITY = 1
const HIGHLIGHT_SCALE = 1.06

export default function HeroV2() {
  const { t } = useLanguage()
  const { config } = useWeddingConfig()
  const reduce = useReducedMotion()
  const ref = useRef(null)

  const tiles = useMemo(() => {
    const adminList = (config.heroImages || [])
      .map((s) => (typeof s === 'string' ? s.trim() : s))
      .filter(Boolean)
    return adminList.length > 0 ? adminList : FALLBACK_IMAGES
  }, [config.heroImages])

  const aspects = useImageAspects(tiles)
  const ready = tiles.every((src) => aspects[src] != null)

  // Measure the hero box so the mosaic can be solved in real pixels.
  const [size, setSize] = useState({ width: 0, height: 0 })
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize((s) => (s.width === width && s.height === height ? s : { width, height }))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const layout = useMemo(() => {
    if (!size.width || !size.height) return null
    const arr = tiles.map((src) => aspects[src] || DEFAULT_AR)
    return computeMosaic(arr, size.width, size.height, GAP)
  }, [tiles, aspects, size])

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  // Foreground text plane
  const yText = useTransform(scrollYProgress, [0, 1], ['0%', '-28%'])
  const scaleText = useTransform(scrollYProgress, [0, 1], [1, 0.5])
  const textOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0])
  // Background mosaic plane — moves slower + scales for depth separation. The
  // whole plane moves as one so the packed tiles never open gaps on scroll.
  const gridY = useTransform(scrollYProgress, [0, 1], ['0%', '-10%'])
  const gridScale = useTransform(scrollYProgress, [0, 1], [1, 1.08])

  const [highlightedIdx, setHighlightedIdx] = useState(-1)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (isHovered) return
    const count = tiles.length
    if (count <= 1) return
    let timeoutId
    const pickNext = () => {
      setHighlightedIdx((prev) => {
        let next = Math.floor(Math.random() * count)
        if (next === prev) next = (next + 1) % count
        return next
      })
      const delay = 2000 + Math.random() * 1000
      timeoutId = window.setTimeout(pickNext, delay)
    }
    const initialDelay = 1200 + Math.random() * 600
    timeoutId = window.setTimeout(pickNext, initialDelay)
    return () => window.clearTimeout(timeoutId)
  }, [isHovered, tiles.length])

  const handleEnter = (idx) => {
    setIsHovered(true)
    setHighlightedIdx(idx)
  }
  const handleLeave = () => setIsHovered(false)

  return (
    <section
      id="home"
      ref={ref}
      className="relative h-[100svh] w-full overflow-hidden film-grain bg-bg"
    >
      {/* Background mosaic plane */}
      <motion.div
        style={reduce ? undefined : { y: gridY, scale: gridScale }}
        className="absolute inset-0 will-change-transform"
      >
        {ready &&
          layout &&
          tiles.map((src, idx) => (
            <HeroTile
              key={idx}
              src={src}
              idx={idx}
              rect={layout[idx]}
              highlighted={highlightedIdx === idx}
              onEnter={() => handleEnter(idx)}
              onLeave={handleLeave}
            />
          ))}
      </motion.div>

      {/* Gradient overlay */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{ background: 'var(--hero-overlay)' }}
      />

      {/* Corner index */}
      <div className="absolute top-20 left-5 md:left-8 z-10 pointer-events-none">
        <p className="eyebrow text-ink/70">
          01 <span className="text-accent">—</span> {t('hero.saveTheDate')}
        </p>
      </div>

      {/* Foreground headline lockup */}
      <motion.div
        style={{ y: yText, opacity: textOpacity, scale: scaleText }}
        className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 pointer-events-none will-change-transform"
      >
        <SplitText
          as="p"
          text={t('hero.eyebrow')}
          className="eyebrow text-ink max-w-xs md:max-w-none"
          stagger={0.06}
          duration={0.7}
          y="120%"
        />

        <h1
          className="font-display mt-6 text-ink leading-[1.0]"
          style={{ fontSize: 'clamp(3rem, 12vw, 9.5rem)', fontFamily: "'Great Vibes', cursive", fontWeight: 900 }}
        >
          <Reveal delay={0.15} y="105%">
            <span className="block">Viet</span>
          </Reveal>
          <Reveal delay={0.3} y="105%">
            <span className="block font-script text-accent text-[0.62em] my-1">
              {t('hero.and')}
            </span>
          </Reveal>
          <Reveal delay={0.4} y="105%">
            <span className="block">Nguyen</span>
          </Reveal>
        </h1>

        <Reveal delay={0.7} className="mt-10">
          <span className="block font-display text-2xl md:text-4xl tracking-[0.18em] text-ink tabular-nums">
            {t('hero.datesShort')}
          </span>
        </Reveal>
      </motion.div>

      {/* Scroll cue */}
      <div className="absolute bottom-8 inset-x-0 z-10 flex justify-center pointer-events-none">
        <Magnetic className="pointer-events-auto">
          <motion.a
            href="#countdown"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.4 }}
            data-cursor="scroll"
            className="flex flex-col items-center gap-2 text-ink/80 hover:text-ink"
          >
            <span className="eyebrow">{t('hero.scroll')}</span>
            <motion.span
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ChevronDown size={20} />
            </motion.span>
          </motion.a>
        </Magnetic>
      </div>
    </section>
  )
}

function HeroTile({ src, idx, rect, highlighted, onEnter, onLeave }) {
  if (!rect) return null
  return (
    <motion.div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      data-cursor="view"
      style={{
        position: 'absolute',
        left: rect.x,
        top: rect.y,
        width: rect.w,
        height: rect.h,
        zIndex: highlighted ? 3 : 1,
      }}
      className="will-change-transform cursor-pointer"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{
          opacity: highlighted ? HIGHLIGHT_OPACITY : BASE_OPACITY,
          scale: highlighted ? HIGHLIGHT_SCALE : 1,
        }}
        transition={{
          duration: highlighted ? 0.5 : 0.8,
          ease: [0.22, 1, 0.36, 1],
          delay: highlighted ? 0 : idx * 0.03,
        }}
        className="w-full h-full overflow-hidden rounded-md"
      >
        <img
          src={src}
          alt=""
          loading="lazy"
          draggable={false}
          className="w-full h-full object-cover select-none"
        />
      </motion.div>
    </motion.div>
  )
}
