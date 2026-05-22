import { useEffect, useMemo, useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext.jsx'
import FadeIn from './FadeIn.jsx'

const VUQUY = new Date('2026-07-26T09:00:00+07:00')
const THANHHON = new Date('2026-08-02T18:00:00+07:00')

function pickEvent() {
  const now = Date.now()
  if (now < VUQUY.getTime()) return { date: VUQUY, key: 'vuquy' }
  if (now < THANHHON.getTime()) return { date: THANHHON, key: 'thanhhon' }
  return null
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
  const upcoming = useMemo(() => pickEvent(), [])
  const [now, setNow] = useState(diff(upcoming?.date ?? new Date()))

  useEffect(() => {
    if (!upcoming) return
    const id = setInterval(() => setNow(diff(upcoming.date)), 1000)
    return () => clearInterval(id)
  }, [upcoming])

  const label =
    upcoming?.key === 'vuquy'
      ? t('events.vuquy.name')
      : upcoming?.key === 'thanhhon'
      ? t('events.thanhhon.name')
      : ''

  const dateLabel = upcoming
    ? new Intl.DateTimeFormat(lang === 'vi' ? 'vi-VN' : 'en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }).format(upcoming.date)
    : ''

  return (
    <section
      id="countdown"
      className="section-padding relative bg-surface text-ink overflow-hidden"
    >
      <div className="max-w-5xl mx-auto px-6 text-center">
        <FadeIn>
          <p className="eyebrow">{t('countdown.eyebrow')}</p>
          <h2 className="font-display mt-3 text-3xl md:text-5xl">
            {upcoming ? t('countdown.titleNext') : ''}
          </h2>
          {upcoming && (
            <p className="font-display text-2xl md:text-3xl text-accent mt-3">
              {label}
            </p>
          )}
          <p className="mt-1 text-sm md:text-base text-muted tracking-wide">
            {dateLabel}
          </p>
        </FadeIn>

        {upcoming ? (
          <FadeIn delay={0.15}>
            <div className="mt-12 grid grid-cols-4 gap-2 sm:gap-5">
              {[
                [now.d, t('countdown.days')],
                [now.h, t('countdown.hours')],
                [now.m, t('countdown.minutes')],
                [now.s, t('countdown.seconds')],
              ].map(([n, lbl], i) => (
                <div
                  key={i}
                  className="glass rounded-2xl py-6 md:py-9 flex flex-col items-center"
                >
                  <span className="font-display text-4xl md:text-6xl tabular-nums">
                    {String(n).padStart(2, '0')}
                  </span>
                  <span className="eyebrow mt-2 text-[10px]">{lbl}</span>
                </div>
              ))}
            </div>
          </FadeIn>
        ) : (
          <FadeIn delay={0.15}>
            <p className="mt-10 font-display text-2xl text-accent">
              {t('countdown.passed')}
            </p>
          </FadeIn>
        )}
      </div>
    </section>
  )
}
