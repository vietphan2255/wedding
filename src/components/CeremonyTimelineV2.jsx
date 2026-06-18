import { useRef, useState } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useReducedMotion } from 'framer-motion'
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
import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { useWeddingConfig } from '../contexts/WeddingConfigContext'
import ParallaxImage from './ParallaxImage.jsx'
import DressIcon from './icons/DressIcons.jsx'
import SplitText from './fx/SplitText.jsx'
import Reveal from './fx/Reveal.jsx'
import Magnetic from './fx/Magnetic.jsx'
import SectionSubtitle from './SectionSubtitle.jsx'

const ENGAGEMENT_IMG =
  'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1600&q=80'

const ROWS = [
  { key: 'engagement', kind: 'engagement', img: ENGAGEMENT_IMG },
  {
    key: 'vuquy',
    kind: 'ceremony',
    dressKind: 'aodai',
    img: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1600&q=80',
  },
  {
    key: 'thanhhon',
    kind: 'ceremony',
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
  const reduce = useReducedMotion()
  const railRef = useRef(null)
  const [openKey, setOpenKey] = useState(null)
  const [openMapKey, setOpenMapKey] = useState(null)

  const toggle = (key) => setOpenKey((k) => (k === key ? null : key))
  const toggleMap = (key) => setOpenMapKey((k) => (k === key ? null : key))

  const { scrollYProgress } = useScroll({
    target: railRef,
    offset: ['start center', 'end center'],
  })
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <section
      id="ceremonies"
      className="section-padding relative bg-bg overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto">
          <p className="eyebrow">{t('timeline.eyebrow')}</p>
          <SplitText
            as="h2"
            text={t('timeline.title')}
            className="font-display mt-3 text-4xl md:text-6xl text-center"
          />
          <SectionSubtitle text={t('timeline.subhead')} />
          <div className="divider-leaf my-6">
            <span className="font-script text-2xl">{t('timeline.divider')}</span>
          </div>
          <p className="text-muted">{t('timeline.subtitle')}</p>
        </div>

        <div ref={railRef} className="mt-20 relative">
          {/* Centre rail: faint track + drawn accent line */}
          <div
            aria-hidden
            className="hidden md:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-line"
          />
          <motion.div
            aria-hidden
            style={{ scaleY: reduce ? 1 : lineScale }}
            className="hidden md:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-accent origin-top"
          />

          <ul className="space-y-20 md:space-y-32">
            {ROWS.map((row, i) => (
              <EventRow
                key={row.key}
                row={row}
                index={i}
                total={ROWS.length}
                t={t}
                config={config}
                isOpen={openKey === row.key}
                isMapOpen={openMapKey === row.key}
                onToggle={() => toggle(row.key)}
                onToggleMap={() => toggleMap(row.key)}
              />
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

function EventRow({ row, index, total, t, config, isOpen, isMapOpen, onToggle, onToggleMap }) {
  const isLeft = index % 2 === 0
  const numeral = String(index + 1).padStart(2, '0')
  const totalStr = String(total).padStart(2, '0')
  const isEngagement = row.kind === 'engagement'

  // i18n key roots differ: engagement uses timeline.engagement.*, ceremonies
  // use events.{key}.*
  const name = isEngagement
    ? t('timeline.engagement.name')
    : t(`events.${row.key}.name`)
  const subtitle = isEngagement
    ? t('timeline.engagement.subtitle')
    : t(`events.${row.key}.subtitle`)

  return (
    <li className="relative grid md:grid-cols-2 gap-8 md:gap-16 items-center">
      {/* Centre node dot */}
      <span
        aria-hidden
        className="hidden md:block absolute top-10 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-accent ring-4 ring-bg z-20"
      />

      {/* Image side */}
      <div className={`relative z-10 ${isLeft ? 'md:order-1' : 'md:order-2'}`}>
        {isEngagement ? (
          <Link to="/engagement" data-cursor="open" aria-label={name} className="group block">
            <Reveal className="rounded-3xl">
              <div className="relative">
                <ParallaxImage src={row.img} strength={60} className="aspect-[5/4] rounded-3xl" overlay />
                <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-bg/85 backdrop-blur px-3 py-1 text-[10px] tracking-[0.22em] uppercase text-accent border border-accent/30">
                  <CheckCircle2 size={11} />
                  {t('timeline.alreadyCelebrated')}
                </span>
                <span className="absolute inset-0 flex items-center justify-center bg-ink/45 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="inline-flex items-center gap-2 rounded-full bg-accent text-bg px-5 py-2.5 text-[12px] tracking-[0.22em] uppercase font-medium">
                    {t('timeline.engagement.explore')}
                    <ArrowUpRight size={14} />
                  </span>
                </span>
              </div>
            </Reveal>
          </Link>
        ) : (
          <Reveal className="rounded-3xl">
            <div data-cursor="view">
              <ParallaxImage src={row.img} strength={60} className="aspect-[5/4] rounded-3xl" overlay />
            </div>
          </Reveal>
        )}
      </div>

      {/* Content side */}
      <div className={`relative z-10 ${isLeft ? 'md:order-2' : 'md:order-1'}`}>
        <p className="ghost-numeral !opacity-100 font-display text-6xl md:text-8xl text-accent/25 leading-none">
          {numeral}
          <span className="text-2xl md:text-3xl align-top text-accent/20"> / {totalStr}</span>
        </p>

        <p className="eyebrow text-accent mt-4">{subtitle}</p>
        <Reveal delay={0.05}>
          <span className="block font-display text-3xl md:text-5xl mt-1">
            {name}
          </span>
        </Reveal>

        {isEngagement ? (
          <>
            <p className="mt-4 flex items-center gap-2 text-sm">
              <Calendar size={16} className="text-accent shrink-0" />
              <span>{t('timeline.engagement.date')}</span>
            </p>
            <p className="text-muted text-sm leading-relaxed mt-4 max-w-md">
              {t('timeline.engagement.body')}
            </p>
            <Magnetic className="inline-block mt-6">
              <Link to="/engagement" data-cursor="open" className="btn-ghost">
                {t('timeline.engagement.explore')}
                <ArrowUpRight size={15} />
              </Link>
            </Magnetic>
          </>
        ) : (
          <CeremonyDetails
            t={t}
            eventKey={row.key}
            dressKind={row.dressKind}
            mapEmbed={config.venues?.[row.key]?.mapEmbed || ''}
            start={new Date(config.dates[`${row.key}Start`])}
            end={new Date(config.dates[`${row.key}End`])}
            name={name}
            subtitle={subtitle}
            isOpen={isOpen}
            isMapOpen={isMapOpen}
            onToggle={onToggle}
            onToggleMap={onToggleMap}
          />
        )}
      </div>
    </li>
  )
}

function CeremonyDetails({
  t,
  eventKey,
  dressKind,
  mapEmbed,
  start,
  end,
  name,
  subtitle,
  isOpen,
  isMapOpen,
  onToggle,
  onToggleMap,
}) {
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
    <>
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
        data-cursor="open"
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
                <Magnetic className="inline-block">
                  <button
                    type="button"
                    onClick={onToggleMap}
                    aria-expanded={isMapOpen}
                    data-cursor="open"
                    className="btn-ghost"
                  >
                    <MapIcon size={15} />
                    {isMapOpen ? t('timeline.hideMap') : t('timeline.showMap')}
                  </button>
                </Magnetic>
              )}
              <Magnetic className="inline-block">
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="open"
                  className="btn-ghost"
                >
                  <MapPinned size={15} />
                  {t('timeline.openMap')}
                </a>
              </Magnetic>
              <Magnetic className="inline-block">
                <a href={icsUrl} download={`${eventKey}.ics`} data-cursor="open" className="btn-ghost">
                  <Calendar size={15} />
                  {t('timeline.addCalendar')}
                </a>
              </Magnetic>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
