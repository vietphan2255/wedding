import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  ChevronDown,
  MapPinned,
  ArrowUpRight,
  Map as MapIcon,
} from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext.jsx'
import { useWeddingConfig } from '../contexts/WeddingConfigContext.jsx'
import FadeIn from './FadeIn.jsx'
import ParallaxImage from './ParallaxImage.jsx'
import DressIcon from './icons/DressIcons.jsx'

const ENGAGEMENT_IMG =
  'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1600&q=80'

const CEREMONIES = [
  {
    key: 'vuquy',
    dressKind: 'aodai',
    img: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1600&q=80',
  },
  {
    key: 'thanhhon',
    dressKind: 'formal',
    img: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1600&q=80',
  },
]

function buildIcs({ title, start, end, location, description }) {
  const fmt = (d) =>
    d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
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

function mapsSearchUrl(query) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    query,
  )}`
}

export default function CeremonyTimeline() {
  const { t } = useLanguage()
  const { config } = useWeddingConfig()
  const [openKey, setOpenKey] = useState(null)
  const [openMapKey, setOpenMapKey] = useState(null)

  const toggle = (key) => setOpenKey((k) => (k === key ? null : key))
  const toggleMap = (key) => setOpenMapKey((k) => (k === key ? null : key))

  return (
    <section
      id="ceremonies"
      className="section-padding relative bg-bg overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-6">
        <FadeIn className="text-center max-w-2xl mx-auto">
          <p className="eyebrow">{t('timeline.eyebrow')}</p>
          <h2 className="font-display mt-3 text-4xl md:text-6xl">
            {t('timeline.title')}
          </h2>
          <div className="divider-leaf my-6">
            <span className="font-script text-2xl">v &amp; n</span>
          </div>
          <p className="text-muted">{t('timeline.subtitle')}</p>
        </FadeIn>

        <div className="mt-14 grid md:grid-cols-3 gap-6 md:gap-7">
          <EngagementCard t={t} />
          {CEREMONIES.map((c, i) => (
            <CeremonyCard
              key={c.key}
              t={t}
              eventKey={c.key}
              img={c.img}
              dressKind={c.dressKind}
              mapEmbed={config.venues?.[c.key]?.mapEmbed || ''}
              start={new Date(config.dates[`${c.key}Start`])}
              end={new Date(config.dates[`${c.key}End`])}
              isOpen={openKey === c.key}
              isMapOpen={openMapKey === c.key}
              onToggle={() => toggle(c.key)}
              onToggleMap={() => toggleMap(c.key)}
              delay={(i + 1) * 0.08}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function EngagementCard({ t }) {
  return (
    <FadeIn>
      <a
        href="/engagement"
        aria-label={t('timeline.engagement.name')}
        className="group block h-full"
      >
        <motion.article
          whileHover={{ y: -6 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
          className="relative h-full overflow-hidden rounded-3xl bg-surface border border-line group-hover:border-accent/40 group-hover:shadow-[0_18px_40px_-20px_var(--color-accent)] transition-colors"
        >
          <div className="relative">
            <ParallaxImage src={ENGAGEMENT_IMG} strength={40} className="h-56" overlay />
            <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-bg/85 backdrop-blur px-3 py-1 text-[10px] tracking-[0.22em] uppercase text-accent border border-accent/30">
              <CheckCircle2 size={11} />
              {t('timeline.alreadyCelebrated')}
            </span>
          </div>
          <div className="p-7">
            <p className="eyebrow text-accent">
              {t('timeline.engagement.subtitle')}
            </p>
            <h3 className="font-display text-3xl md:text-4xl mt-2">
              {t('timeline.engagement.name')}
            </h3>
            <p className="mt-4 flex items-center gap-2 text-sm">
              <Calendar size={16} className="text-accent shrink-0" />
              <span>{t('timeline.engagement.date')}</span>
            </p>
            <p className="text-muted text-sm leading-relaxed mt-5">
              {t('timeline.engagement.body')}
            </p>
          </div>

          <div className="absolute inset-0 flex items-center justify-center bg-ink/55 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <span className="inline-flex items-center gap-2 rounded-full bg-accent text-bg px-5 py-2.5 text-[12px] tracking-[0.22em] uppercase font-medium shadow-lg translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              {t('timeline.engagement.explore')}
              <ArrowUpRight size={14} />
            </span>
          </div>
        </motion.article>
      </a>
    </FadeIn>
  )
}

function CeremonyCard({
  t,
  eventKey,
  img,
  dressKind,
  mapEmbed,
  start,
  end,
  isOpen,
  isMapOpen,
  onToggle,
  onToggleMap,
  delay,
}) {
  const name = t(`events.${eventKey}.name`)
  const subtitle = t(`events.${eventKey}.subtitle`)
  const date = t(`events.${eventKey}.date`)
  const time = t(`events.${eventKey}.time`)
  const venue = t(`events.${eventKey}.venue`)
  const dress = t(`events.${eventKey}.dress`)
  const mapUrl = mapsSearchUrl(venue)
  const icsUrl = buildIcs({
    title: `${name} — Viet & Nguyen`,
    start,
    end,
    location: venue,
    description: subtitle,
  })

  return (
    <FadeIn delay={delay}>
      <motion.article
        whileHover={{ y: -6 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        className="group relative h-full overflow-hidden rounded-3xl bg-surface border border-line hover:border-accent/40 hover:shadow-[0_18px_40px_-20px_var(--color-accent)] transition-colors"
      >
        <div className="relative">
          <ParallaxImage src={img} strength={60} className="h-56" overlay />
        </div>
        <div className="p-7">
          <p className="eyebrow text-accent">{subtitle}</p>
          <h3 className="font-display text-3xl md:text-4xl mt-2">{name}</h3>

          <ul className="mt-5 space-y-2.5 text-sm">
            <li className="flex items-start gap-2.5">
              <Calendar size={16} className="text-accent shrink-0 mt-0.5" />
              <span>{date}</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Clock size={16} className="text-accent shrink-0 mt-0.5" />
              <span>{time}</span>
            </li>
          </ul>

          <button
            type="button"
            onClick={onToggle}
            aria-expanded={isOpen}
            className="mt-5 inline-flex items-center gap-1.5 text-[12px] tracking-[0.18em] uppercase text-ink/80 hover:text-accent transition-colors"
          >
            {isOpen ? t('timeline.hideDetails') : t('timeline.showDetails')}
            <motion.span
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.25 }}
              className="inline-flex"
            >
              <ChevronDown size={14} />
            </motion.span>
          </button>

          <AnimatePresence initial={false}>
            {isOpen && (
              <motion.div
                key="details"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <ul className="mt-5 space-y-2.5 text-sm border-t border-line pt-5">
                  <li className="flex items-start gap-2.5">
                    <MapPin size={16} className="text-accent shrink-0 mt-0.5" />
                    <span>{venue}</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-accent shrink-0 mt-0.5">
                      <DressIcon kind={dressKind} size={16} />
                    </span>
                    <span>{dress}</span>
                  </li>
                </ul>

                <AnimatePresence initial={false}>
                  {isMapOpen && mapEmbed && (
                    <motion.div
                      key="mapEmbed"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden mt-5"
                    >
                      <div className="rounded-2xl overflow-hidden border border-line aspect-[16/10]">
                        <iframe
                          title={`${name} map`}
                          src={mapEmbed}
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          allowFullScreen
                          className="w-full h-full border-0"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mt-5 flex flex-wrap gap-2">
                  {mapEmbed && (
                    <button
                      type="button"
                      onClick={onToggleMap}
                      aria-expanded={isMapOpen}
                      className="btn-ghost"
                    >
                      <MapIcon size={15} />
                      {isMapOpen ? t('timeline.hideMap') : t('timeline.showMap')}
                    </button>
                  )}
                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost"
                  >
                    <MapPinned size={15} />
                    {t('timeline.openMap')}
                  </a>
                  <a
                    href={icsUrl}
                    download={`${eventKey}.ics`}
                    className="btn-ghost"
                  >
                    <Calendar size={15} />
                    {t('timeline.addCalendar')}
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.article>
    </FadeIn>
  )
}
