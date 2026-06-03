import { useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext.jsx'
import { useWeddingConfig } from '../contexts/WeddingConfigContext.jsx'
import ParallaxFade from './ParallaxFade.jsx'

function pickUpcomingEvents(dates) {
  const events = [
    { key: 'vuquy', date: new Date(dates.vuquyStart) },
    { key: 'thanhhon', date: new Date(dates.thanhhonStart) },
  ]
  const now = Date.now()
  return events.filter((e) => now < e.date.getTime())
}

function diff(target) {
  const ms = Math.max(0, target.getTime() - Date.now())
  return {
    d: Math.floor(ms / 86400000),
    h: Math.floor((ms / 3600000) % 24),
    m: Math.floor((ms / 60000) % 60),
    s: Math.floor((ms / 1000) % 60),
  }
}

export default function Countdown() {
  const { t, lang } = useLanguage()
  const { config } = useWeddingConfig()
  const reduce = useReducedMotion()
  const calm = reduce
  const upcomingEvents = useMemo(
    () => pickUpcomingEvents(config.dates),
    [config.dates],
  )
  const [index, setIndex] = useState(0)
  const safeIndex =
    upcomingEvents.length === 0
      ? 0
      : ((index % upcomingEvents.length) + upcomingEvents.length) %
        upcomingEvents.length
  const current = upcomingEvents[safeIndex] ?? null
  const [now, setNow] = useState(() => diff(current?.date ?? new Date()))

  useEffect(() => {
    if (!current) return
    setNow(diff(current.date))
    const id = setInterval(() => setNow(diff(current.date)), 1000)
    return () => clearInterval(id)
  }, [current])

  const label = current
    ? current.key === 'vuquy'
      ? t('events.vuquy.name')
      : t('events.thanhhon.name')
    : ''

  const dateLabel = current
    ? new Intl.DateTimeFormat(lang === 'vi' ? 'vi-VN' : 'en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }).format(current.date)
    : ''

  const showNav = upcomingEvents.length > 1
  const goPrev = () =>
    setIndex((i) => (i - 1 + upcomingEvents.length) % upcomingEvents.length)
  const goNext = () =>
    setIndex((i) => (i + 1) % upcomingEvents.length)

  return (
    <section
      id="countdown"
      className="section-padding relative bg-surface text-ink overflow-hidden"
    >
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, margin: '-15%' }}
        transition={{ type: 'spring', stiffness: 110, damping: 11, mass: 0.9 }}
        className="max-w-5xl mx-auto px-6 text-center will-change-transform"
      >
        <ParallaxFade strength={30}>
          <p className="eyebrow">{t('countdown.eyebrow')}</p>
          <h2 className="font-display mt-3 text-3xl md:text-5xl">
            {current ? t('countdown.titleNext') : ''}
          </h2>
          {current && (
            <div className="mt-3 flex items-center justify-center gap-3 md:gap-5">
              {showNav && (
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label={t('countdown.prevEvent')}
                  className="p-1.5 rounded-full glass text-ink/80 hover:text-ink hover:bg-white/10 transition"
                >
                  <ChevronLeft size={18} />
                </button>
              )}
              <motion.p
                key={current.key}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="font-display text-2xl md:text-3xl text-accent"
              >
                {label}
              </motion.p>
              {showNav && (
                <button
                  type="button"
                  onClick={goNext}
                  aria-label={t('countdown.nextEvent')}
                  className="p-1.5 rounded-full glass text-ink/80 hover:text-ink hover:bg-white/10 transition"
                >
                  <ChevronRight size={18} />
                </button>
              )}
            </div>
          )}
          <p className="mt-1 text-sm md:text-base text-muted tracking-wide">
            {dateLabel}
          </p>
        </ParallaxFade>

        {current ? (
          <ParallaxFade strength={60} className="block">
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
              {[
                [now.d, t('countdown.days')],
                [now.h, t('countdown.hours')],
                [now.m, t('countdown.minutes')],
                [now.s, t('countdown.seconds')],
              ].map(([n, lbl], i) => {
                const drift = [
                  { y: [0, -6, 4, -3, 0], x: [0, 3, -2, 4, 0], rotate: [0, 1.2, -0.8, 1, 0], duration: 6.5 },
                  { y: [0, 5, -4, 3, 0], x: [0, -3, 2, -4, 0], rotate: [0, -1, 1.2, -0.6, 0], duration: 7.2 },
                  { y: [0, -4, 5, -3, 0], x: [0, 4, -3, 2, 0], rotate: [0, 0.8, -1.4, 0.6, 0], duration: 8 },
                  { y: [0, 4, -5, 3, 0], x: [0, -2, 3, -3, 0], rotate: [0, -1.2, 0.6, -1, 0], duration: 6.8 },
                ][i]
                return (
                  <motion.div
                    key={i}
                    animate={
                      calm
                        ? undefined
                        : { y: drift.y, x: drift.x, rotate: drift.rotate }
                    }
                    transition={
                      calm
                        ? undefined
                        : {
                            duration: drift.duration,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: i * 0.4,
                          }
                    }
                    className="glass rounded-2xl py-6 md:py-9 flex flex-col items-center will-change-transform shadow-[0_22px_50px_-18px_color-mix(in_srgb,var(--color-ink)_30%,transparent),0_6px_14px_-4px_color-mix(in_srgb,var(--color-ink)_18%,transparent)]"
                  >
                    <span className="font-display text-4xl md:text-6xl tabular-nums">
                      {String(n).padStart(2, '0')}
                    </span>
                    <span className="eyebrow mt-2 text-[10px]">{lbl}</span>
                  </motion.div>
                )
              })}
            </div>
          </ParallaxFade>
        ) : (
          <ParallaxFade strength={30}>
            <p className="mt-10 font-display text-2xl text-accent">
              {t('countdown.passed')}
            </p>
          </ParallaxFade>
        )}
      </motion.div>
    </section>
  )
}
