import { Calendar, Clock, MapPin, Shirt } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext.jsx'
import FadeIn from './FadeIn.jsx'
import ParallaxImage from './ParallaxImage.jsx'

function buildIcs({ title, start, end, location, description }) {
  const fmt = (d) =>
    d
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '')
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Viet Nguyen Wedding//EN',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@viet-nguyen-wedding`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${title}`,
    `LOCATION:${location}`,
    `DESCRIPTION:${description}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\n')
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`
}

const EVENTS = [
  {
    key: 'vuquy',
    img: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1600&q=80',
    start: new Date('2026-07-26T09:00:00+07:00'),
    end: new Date('2026-07-26T12:00:00+07:00'),
  },
  {
    key: 'thanhhon',
    img: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1600&q=80',
    start: new Date('2026-08-02T18:00:00+07:00'),
    end: new Date('2026-08-02T22:00:00+07:00'),
  },
]

export default function Events() {
  const { t } = useLanguage()
  return (
    <section id="events" className="section-padding relative bg-bg overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <FadeIn className="text-center max-w-2xl mx-auto">
          <p className="eyebrow">{t('events.eyebrow')}</p>
          <h2 className="font-display mt-3 text-4xl md:text-6xl">
            {t('events.title')}
          </h2>
          <div className="divider-leaf my-6">
            <span className="font-script text-2xl">v &amp; n</span>
          </div>
          <p className="text-muted">{t('events.subtitle')}</p>
        </FadeIn>

        <div className="mt-14 grid md:grid-cols-2 gap-7 md:gap-10">
          {EVENTS.map((e, i) => {
            const ics = buildIcs({
              title: `${t(`events.${e.key}.name`)} — Viet & Nguyen`,
              start: e.start,
              end: e.end,
              location: t(`events.${e.key}.venue`),
              description: t(`events.${e.key}.subtitle`),
            })
            return (
              <FadeIn key={e.key} delay={i * 0.1} y={30}>
                <article className="group relative h-full overflow-hidden rounded-3xl bg-surface">
                  <ParallaxImage
                    src={e.img}
                    strength={60}
                    className="h-72"
                    overlay
                  />
                  <div className="relative p-7 md:p-9">
                    <p className="eyebrow text-accent">
                      {t(`events.${e.key}.subtitle`)}
                    </p>
                    <h3 className="font-display text-4xl md:text-5xl mt-2">
                      {t(`events.${e.key}.name`)}
                    </h3>
                    <ul className="mt-7 space-y-3.5 text-sm md:text-base">
                      <li className="flex items-start gap-3">
                        <Calendar
                          size={18}
                          className="mt-1 text-accent shrink-0"
                        />
                        <span>{t(`events.${e.key}.date`)}</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Clock
                          size={18}
                          className="mt-1 text-accent shrink-0"
                        />
                        <span>{t(`events.${e.key}.time`)}</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <MapPin
                          size={18}
                          className="mt-1 text-accent shrink-0"
                        />
                        <span>{t(`events.${e.key}.venue`)}</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Shirt
                          size={18}
                          className="mt-1 text-accent shrink-0"
                        />
                        <span>{t(`events.${e.key}.dress`)}</span>
                      </li>
                    </ul>
                    <a
                      href={ics}
                      download={`${e.key}.ics`}
                      className="btn-ghost mt-8"
                    >
                      <Calendar size={16} />
                      {t('events.addCalendar')}
                    </a>
                  </div>
                </article>
              </FadeIn>
            )
          })}
        </div>
      </div>
    </section>
  )
}
