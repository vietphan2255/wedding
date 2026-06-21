import { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { useWeddingConfig } from '../contexts/WeddingConfigContext'
import useIsPhone from '../hooks/useIsPhone'
import HeroSlideshow from './HeroSlideshow'

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2400&q=80'

export default function Hero({
  flightSourceARef,
  flightMiddleRef,
  flightSourceBRef,
}) {
  const { t } = useLanguage()
  const { config } = useWeddingConfig()
  const reduce = useReducedMotion()
  const isPhone = useIsPhone()
  const calm = reduce || isPhone
  const ref = useRef(null)

  const nameLeft = config?.common?.coupleNameLeft || 'Viet'
  const nameRight = config?.common?.coupleNameRight || 'Nguyen'
  const heroImage = config?.hero?.image?.trim() || HERO_IMAGE
  const focalX = config?.hero?.focalX ?? 50
  const focalY = config?.hero?.focalY ?? 50
  // When the admin has configured a slideshow (at least one slide with an
  // image), cycle through it; otherwise fall back to the single hero image.
  const heroSlides = (config?.heroSlides ?? []).filter((s) => (s?.src || '').trim())

  // Split the date line into three pieces (vqDate, middle, year) so the
  // hero → countdown flight can lift the vqDate and year, fade the middle,
  // and merge them into the countdown's "26 July 2026" label. If the admin
  // edits the date string and removes the `·` separators, the regex won't
  // match — fall back to treating the whole string as vqDate so the flight
  // degrades gracefully instead of rendering an empty line.
  const datesText = t('hero.dates')
  const splitMatch = datesText.match(/^(.+?)(\s+·.+·\s+)(.+)$/)
  const vqDate = splitMatch ? splitMatch[1] : datesText
  const middle = splitMatch ? splitMatch[2] : ''
  const year = splitMatch ? splitMatch[3] : ''
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const yImg = useTransform(scrollYProgress, [0, 1], ['0%', '40%'])
  const scaleImg = useTransform(scrollYProgress, [0, 1], [1.05, 1.08])
  const yText = useTransform(scrollYProgress, [0, 1], ['0%', '-30%'])
  const scaleText = useTransform(scrollYProgress, [0, 1], [1, 0.45])
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0])

  // On phones / reduced-motion, bind the layers to static styles instead of the
  // per-frame scroll parallax, so the hero auto-snap renders cheaply (no
  // full-screen re-raster competing with the glide). Matches how the Ken-Burns
  // loop is already gated by `calm`.
  const imgStyle = calm ? { scale: 1.05 } : { y: yImg, scale: scaleImg }
  const textStyle = calm ? undefined : { y: yText, opacity, scale: scaleText }

  return (
    <section
      id="home"
      data-cursor-id="hero"
      ref={ref}
      className="relative h-[100svh] w-full overflow-hidden film-grain"
    >
      {/* Outer wrapper = scroll parallax (MotionValue-driven, gated by calm). */}
      <motion.div
        style={imgStyle}
        className={`absolute inset-0${calm ? '' : ' will-change-transform'}`}
      >
        {/* Inner wrapper = Ken-Burns keyframe loop (desktop only). Lives on its
            own element so it never fights the slide enter/exit transforms below
            or the parallax MotionValues above for the same axis. */}
        <motion.div
          className="absolute inset-0 motion-reduce:!animate-none"
          animate={
            calm
              ? undefined
              : {
                  scale: [1.05, 1.16, 1.05],
                  x: ['0%', '-2.5%', '0%'],
                  y: ['0%', '1.5%', '0%'],
                }
          }
          transition={
            calm ? undefined : { duration: 22, repeat: Infinity, ease: 'easeInOut' }
          }
        >
          {heroSlides.length > 0 ? (
            <HeroSlideshow slides={heroSlides} calm={calm} />
          ) : (
            <>
              <img
                src={heroImage}
                alt="Couple silhouette"
                decoding="async"
                fetchPriority="high"
                style={{ objectPosition: `${focalX}% ${focalY}%` }}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{ background: 'var(--hero-overlay)' }}
              />
            </>
          )}
        </motion.div>
      </motion.div>

      <motion.div
        style={textStyle}
        className={`relative z-10 h-full flex flex-col items-center justify-center text-center px-6${
          calm ? '' : ' will-change-transform'
        }`}
      >
        {/* Soft radial scrim, sized to the centered text, so the labels stay
            legible over any hero slide. -z-10 keeps it above the photo but
            beneath the text within this layer. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{ background: 'var(--hero-text-scrim)' }}
        />

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="eyebrow text-ink"
        >
          {t('hero.eyebrow')}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="font-display mt-6 text-ink leading-[1.0]"
          style={{
            fontSize: 'clamp(3rem, 12vw, 9.5rem)',
            fontFamily: "'Great Vibes', cursive",
            fontWeight: 900,
          }}
        >
          <span className="block">{nameLeft}</span>
          <span className="block font-script text-ink text-[0.65em] my-1">
            {t('hero.and')}
          </span>
          <span className="block">{nameRight}</span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-10 flex flex-col items-center gap-3"
        >
          <p className="eyebrow text-ink">{t('hero.saveTheDate')}</p>
          <p className="font-display text-lg md:text-xl tracking-wide text-ink">
            <motion.span
              ref={flightSourceARef}
              className="inline-block"
              animate={reduce ? undefined : { y: [0, -3, 0] }}
              transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
              style={{ willChange: 'transform' }}
            >
              {vqDate}
            </motion.span>
            <span ref={flightMiddleRef}>{middle}</span>
            <motion.span
              ref={flightSourceBRef}
              className="inline-block"
              animate={reduce ? undefined : { y: [0, -3, 0] }}
              transition={{
                duration: 3.6,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1.8,
              }}
              style={{ willChange: 'transform' }}
            >
              {year}
            </motion.span>
          </p>
        </motion.div>
      </motion.div>

      <div className="absolute bottom-8 inset-x-0 z-10 flex justify-center pointer-events-none">
        <motion.a
          href="#invitation"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.4 }}
          className="pointer-events-auto flex flex-col items-center gap-2 text-ink/80 hover:text-ink"
        >
          <span className="eyebrow">{t('hero.scroll')}</span>
          <motion.span
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown size={20} />
          </motion.span>
        </motion.a>
      </div>
    </section>
  )
}
