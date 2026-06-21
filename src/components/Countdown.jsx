import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { useWeddingConfig } from '../contexts/WeddingConfigContext'
import { useInvitedGuest } from '../contexts/InvitedGuestContext.jsx'
import {
  MS_PER_SECOND,
  MS_PER_MINUTE,
  MS_PER_HOUR,
  MS_PER_DAY,
  MS_PER_WEEK,
} from '../lib/constants'
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
  const targetMs = target.getTime()
  const nowMs = Date.now()
  if (nowMs >= targetMs) {
    return { mo: 0, w: 0, d: 0, h: 0, m: 0, s: 0 }
  }
  const now = new Date(nowMs)
  let mo =
    (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth())
  const probe = new Date(now)
  probe.setMonth(probe.getMonth() + mo)
  if (probe.getTime() > targetMs) {
    mo -= 1
    probe.setMonth(probe.getMonth() - 1)
  }
  let rem = targetMs - probe.getTime()
  const w = Math.floor(rem / MS_PER_WEEK)
  rem -= w * MS_PER_WEEK
  const d = Math.floor(rem / MS_PER_DAY)
  rem -= d * MS_PER_DAY
  const h = Math.floor(rem / MS_PER_HOUR)
  rem -= h * MS_PER_HOUR
  const m = Math.floor(rem / MS_PER_MINUTE)
  rem -= m * MS_PER_MINUTE
  const s = Math.floor(rem / MS_PER_SECOND)
  return { mo, w, d, h, m, s }
}

export default function Countdown({
  flightTargetRef,
  flightTargetARef,
  flightTargetBRef,
}) {
  const { t } = useLanguage()
  const { config } = useWeddingConfig()
  const { found, party } = useInvitedGuest()
  const reduce = useReducedMotion()
  const calm = reduce
  const upcomingEvents = useMemo(() => pickUpcomingEvents(config.dates), [config.dates])
  const [index, setIndex] = useState(0)

  // Personalized link: open the countdown on the ceremony this guest is invited
  // to (once, when it resolves). The prev/next nav still lets them switch.
  const appliedInviteRef = useRef(false)
  useEffect(() => {
    if (appliedInviteRef.current || !found || party === 'both') return
    const i = upcomingEvents.findIndex((e) => e.key === party)
    if (i >= 0) {
      setIndex(i)
      appliedInviteRef.current = true
    }
  }, [found, party, upcomingEvents])
  const safeIndex =
    upcomingEvents.length === 0
      ? 0
      : ((index % upcomingEvents.length) + upcomingEvents.length) % upcomingEvents.length
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

  // Split the formatted date into the day+month chunk, the literal that
  // precedes the year, and the year — so FlyingDate can land its two clones
  // on each chunk's actual rendered position rather than approximating from
  // the source widths (which use a different display serif font).
  const dateParts = useMemo(() => {
    if (!current) return null
    const fmt = new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
    const parts = fmt.formatToParts(current.date)
    let before = ''
    let separator = ''
    let yearText = ''
    let yearReached = false
    for (const p of parts) {
      if (p.type === 'year') {
        yearText = p.value
        yearReached = true
        continue
      }
      if (yearReached) continue
      before += p.value
    }
    // Move trailing whitespace/literal off `before` into `separator` so the
    // day+month span ends right after the month text.
    const trailing = before.match(/[\s\p{P}]+$/u)
    if (trailing) {
      separator = trailing[0]
      before = before.slice(0, -trailing[0].length)
    }
    return { before, separator, yearText }
  }, [current])

  const dateLabel = dateParts
    ? `${dateParts.before}${dateParts.separator}${dateParts.yearText}`
    : ''

  const showNav = upcomingEvents.length > 1
  const goPrev = () =>
    setIndex((i) => (i - 1 + upcomingEvents.length) % upcomingEvents.length)
  const goNext = () => setIndex((i) => (i + 1) % upcomingEvents.length)

  return (
    <section
      id="countdown"
      data-cursor-id="countdown"
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
          <p
            ref={flightTargetRef}
            className="mt-1 text-sm md:text-base text-muted tracking-wide"
          >
            {dateParts ? (
              <>
                <span ref={flightTargetARef}>{dateParts.before}</span>
                <span>{dateParts.separator}</span>
                <span ref={flightTargetBRef}>{dateParts.yearText}</span>
              </>
            ) : (
              dateLabel
            )}
          </p>
        </ParallaxFade>

        {current ? (
          <ParallaxFade strength={60} className="block">
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
              {(now.mo >= 1
                ? [
                    [now.mo, t('countdown.months')],
                    [now.w, t('countdown.weeks')],
                    [now.d, t('countdown.days')],
                    [now.h, t('countdown.hours')],
                  ]
                : now.w >= 1
                  ? [
                      [now.w, t('countdown.weeks')],
                      [now.d, t('countdown.days')],
                      [now.h, t('countdown.hours')],
                      [now.m, t('countdown.minutes')],
                    ]
                  : [
                      [now.d, t('countdown.days')],
                      [now.h, t('countdown.hours')],
                      [now.m, t('countdown.minutes')],
                      [now.s, t('countdown.seconds')],
                    ]
              ).map(([n, lbl], i) => {
                const drift = [
                  {
                    y: [0, -6, 4, -3, 0],
                    x: [0, 3, -2, 4, 0],
                    rotate: [0, 1.2, -0.8, 1, 0],
                    duration: 6.5,
                  },
                  {
                    y: [0, 5, -4, 3, 0],
                    x: [0, -3, 2, -4, 0],
                    rotate: [0, -1, 1.2, -0.6, 0],
                    duration: 7.2,
                  },
                  {
                    y: [0, -4, 5, -3, 0],
                    x: [0, 4, -3, 2, 0],
                    rotate: [0, 0.8, -1.4, 0.6, 0],
                    duration: 8,
                  },
                  {
                    y: [0, 4, -5, 3, 0],
                    x: [0, -2, 3, -3, 0],
                    rotate: [0, -1.2, 0.6, -1, 0],
                    duration: 6.8,
                  },
                ][i]
                return (
                  <motion.div
                    key={i}
                    animate={
                      calm ? undefined : { y: drift.y, x: drift.x, rotate: drift.rotate }
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
