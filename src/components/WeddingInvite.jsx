import { MapPin, CalendarPlus } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { useWeddingConfig } from '../contexts/WeddingConfigContext'
import { useInvitedGuest } from '../contexts/InvitedGuestContext.jsx'
import { personalizeInvite } from '../lib/guests'
import { mapsSearchUrl, googleCalendarUrl, formatVnTime } from '../lib/calendar'
import { sanitizeGoogleMapsUrl } from '../lib/googleMapsUrl'
import FadeIn from './FadeIn.jsx'

// Formal "thiệp cưới" section, restyled after the cinelove thiep-cuoi-42
// "Lễ Thành Hôn" invitation: one self-contained card per ceremony, each with a
// vertical script title, the cursive couple names, the two families + hometowns,
// a banquet line, the signature THÁNG·DD·NĂM date block, the lunar date, and the
// venue. Rendered in the active theme tokens (no hard-coded red). Logistics
// (maps, calendar, dress) stay in CeremonyTimelineV2 — this is the announcement.
const CEREMONIES = ['vuquy', 'thanhhon']

// The config dates carry an explicit +07:00 offset; format in Vietnam time so the
// day / weekday never shift for visitors in other timezones.
const TZ = 'Asia/Ho_Chi_Minh'

function dateBits(iso) {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  const f = (opts) =>
    new Intl.DateTimeFormat('vi-VN', { ...opts, timeZone: TZ }).format(d)
  const monthNum = Number(
    new Intl.DateTimeFormat('vi-VN', { month: 'numeric', timeZone: TZ }).format(d),
  )
  return {
    day: f({ day: '2-digit' }),
    monthNum,
    year: f({ year: 'numeric' }),
    weekday: f({ weekday: 'long' }),
  }
}

// Stacked cursive ceremony title (e.g. Lễ / Vu / Quy) between two hairline rules.
function VerticalTitle({ name }) {
  const words = String(name).split(/\s+/).filter(Boolean)
  if (!words.length) return null
  return (
    <div className="flex flex-col items-center gap-2 shrink-0 text-accent">
      <span className="w-[2px] h-7 md:h-9 bg-line" aria-hidden />
      <div className="font-display font-medium text-lg md:text-3xl leading-[1.15] flex flex-col items-center">
        {words.map((w, i) => (
          <span key={i}>{w}</span>
        ))}
      </div>
      <span className="w-[2px] h-7 md:h-9 bg-line" aria-hidden />
    </div>
  )
}

function FamilyBlock({ label, father, mother, hometown }) {
  if (!father && !mother && !hometown) return null
  return (
    <div className="text-center max-w-[245px]">
      <p className="font-display text-sm sm:text-base md:text-lg text-ink">{label}</p>
      <div className="mt-2 space-y-1">
        {father ? (
          <p
            className="text-ink whitespace-nowrap"
            style={{ fontSize: 'clamp(0.7rem, 2.7vw, 1rem)' }}
          >
            Ông:{' '}
            <span className="text-ink uppercase font-bold font-display">{father}</span>
          </p>
        ) : null}
        {mother ? (
          <p
            className="text-ink whitespace-nowrap"
            style={{ fontSize: 'clamp(0.7rem, 2.7vw, 1rem)' }}
          >
            Bà:{' '}
            <span className="text-ink uppercase font-bold font-display">{mother}</span>
          </p>
        ) : null}
        {hometown ? (
          <p
            className="text-muted"
            style={{ fontSize: 'clamp(0.6rem, 2.4vw, 0.875rem)' }}
          >
            {hometown}
          </p>
        ) : null}
      </div>
    </div>
  )
}

// THÁNG | big-day | NĂM, with the month/year framed by hairline rules.
function BigDate({ monthLabel, day, yearLabel }) {
  const side =
    'flex-1 max-w-[9rem] flex items-center justify-center border-t-2 border-b-2 border-line py-2 text-center font-display text-base md:text-xl text-ink uppercase tracking-[0.08em] font-bold'
  return (
    <div className="flex items-stretch justify-center gap-3 md:gap-6">
      <div className={side}>{monthLabel}</div>
      <div className="shrink-0 self-center font-display text-6xl md:text-7xl leading-none text-accent font-extrabold">
        {day}
      </div>
      <div className={side}>{yearLabel}</div>
    </div>
  )
}

function InvitationCard({
  ceremonyKey,
  t,
  coupleLeft,
  coupleRight,
  inv,
  dateISO,
  endISO,
  highlighted,
}) {
  const name = t(`events.${ceremonyKey}.name`)
  const venue = t(`events.${ceremonyKey}.venue`)
  // Time comes from the same admin datetime as the date, so the two never drift.
  const time = formatVnTime(dateISO)
  const lunar = inv[`${ceremonyKey}Lunar`] || ''
  const address = inv[`${ceremonyKey}Address`] || ''
  // Both the venue name and address open Google Maps. Prefer the admin-configured
  // Maps link for this ceremony; fall back to a search over the address/venue text
  // when it is unset or invalid, so legacy records keep their existing link.
  const configuredMapUrl = sanitizeGoogleMapsUrl(inv[`${ceremonyKey}MapsUrl`])
  const mapUrl =
    configuredMapUrl || (address || venue ? mapsSearchUrl(address || venue) : null)
  const bits = dateBits(dateISO)
  const monthLabel = bits ? `Tháng ${bits.monthNum}` : ''
  const yearLabel = bits ? `Năm ${bits.year}` : ''

  return (
    <div
      className={`relative h-full rounded-3xl border bg-bg/60 backdrop-blur px-4 sm:px-6 py-8 sm:py-10 md:px-8 md:py-14 transition shadow-xl border-line hover:shadow-accent hover:scale-105`}
      style={{ transition: 'all 0.25s ease-in-out' }}
    >
      {/* "Thiệp của bạn" badge — only on the ceremony this guest is invited to */}
      {highlighted ? (
        <span className="absolute top-4 right-4 z-10 inline-flex items-center rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-accent">
          {t('invite.yourCard')}
        </span>
      ) : null}
      {/* Top — vertical title + cursive couple names */}
      <div className="flex items-center justify-center gap-3 sm:gap-5 md:gap-10">
        <VerticalTitle name={name} />
        <div className="font-display font-extralight text-muted text-center leading-[1.1] min-w-0">
          <div
            className="whitespace-nowrap"
            style={{ fontSize: 'clamp(1.25rem, 5.5vw, 2.25rem)' }}
          >
            {ceremonyKey === 'vuquy' ? coupleRight : coupleLeft}
          </div>
          <div
            className="my-1 md:my-2"
            style={{ fontSize: 'clamp(1.1rem, 3vw, 1.875rem)' }}
          >
            &amp;
          </div>
          <div
            className="whitespace-nowrap"
            style={{ fontSize: 'clamp(1.25rem, 5.5vw, 2.25rem)' }}
          >
            {ceremonyKey === 'vuquy' ? coupleLeft : coupleRight}
          </div>
        </div>
      </div>

      {/* Two families */}
      <div className="mt-8 md:mt-10 grid grid-cols-2 gap-2 sm:gap-4 md:gap-6 max-w-[40rem] mx-auto">
        {ceremonyKey === 'vuquy' ? (
          <FamilyBlock
            label={t('invite.familyBride')}
            father={inv.brideFather}
            mother={inv.brideMother}
            hometown={inv.brideHometown}
          />
        ) : null}
        <FamilyBlock
          label={t('invite.familyGroom')}
          father={inv.groomFather}
          mother={inv.groomMother}
          hometown={inv.groomHometown}
        />
        {ceremonyKey === 'vuquy' ? null : (
          <FamilyBlock
            label={t('invite.familyBride')}
            father={inv.brideFather}
            mother={inv.brideMother}
            hometown={inv.brideHometown}
          />
        )}
      </div>

      {/* Banquet line */}
      <div className="mt-10 text-center">
        <p className="font-display text-lg md:text-2xl text-ink uppercase tracking-[0.08em] font-bold ">
          {t('invite.banquet')} {name}
        </p>
        {bits ? (
          <p className="text-xs md:text-sm text-muted mt-2 uppercase tracking-[0.18em] font-semibold">
            {t('invite.atTime')} {time} · {bits.weekday}
          </p>
        ) : null}
      </div>

      {/* Big date */}
      {bits ? (
        <div className="mt-6 max-w-md mx-auto">
          <BigDate monthLabel={monthLabel} day={bits.day} yearLabel={yearLabel} />
        </div>
      ) : null}

      {/* Lunar date */}
      {lunar ? (
        <p className="mt-5 text-center font-display text-lg md:text-xl text-accent">
          {lunar}
        </p>
      ) : null}

      {/* Venue — name + address both deep-link to Google Maps */}
      <div className="mt-8 text-center">
        <p className="eyebrow">{t('invite.venueLabel')}</p>
        <p className="font-display text-xl md:text-2xl text-ink mt-2 font-bold">
          {mapUrl ? (
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            >
              {venue}
            </a>
          ) : (
            venue
          )}
        </p>
        {address ? (
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1.5 inline-flex items-center justify-center gap-1.5 rounded-sm text-sm text-muted hover:text-accent transition-colors underline decoration-line decoration-1 underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          >
            <MapPin size={14} className="shrink-0" />
            {address}
          </a>
        ) : null}
      </div>

      {/* Add to calendar — opens Google Calendar prefilled from the admin datetime */}
      {bits && endISO ? (
        <div className="mt-8 flex justify-center">
          <a
            href={googleCalendarUrl({
              title: `${name} — ${coupleLeft} & ${coupleRight}`,
              start: new Date(dateISO),
              end: new Date(endISO),
              location: address || venue,
              details: lunar,
            })}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[12px] tracking-[0.18em] uppercase text-accent font-bold hover:text-ink transition-colors"
          >
            <CalendarPlus size={15} className="font-bold" />
            {t('timeline.addCalendar')}
          </a>
        </div>
      ) : null}
    </div>
  )
}

export default function WeddingInvite() {
  const { t } = useLanguage()
  const { config } = useWeddingConfig()
  const { found, party, invitationName } = useInvitedGuest()
  const common = config.common || {}
  const inv = config.invitation || {}
  const dates = config.dates || {}

  // Formal full names are invitation-only; fall back to the shared short names so the
  // hero, footer, navbar and intro envelope are untouched.
  const coupleLeft = inv.groomFullName || common.coupleNameLeft || 'Viet'
  const coupleRight = inv.brideFullName || common.coupleNameRight || 'Nguyen'
  // Address the message to the invited guest ("…quý khách…" → "…<invitation name>…");
  // visitors with no/unknown invite keep the generic salutation.

  // For a guest invited to one ceremony, lead with (and highlight) their card;
  // the other stays visible. 'both' / no invite keeps the default order.
  const highlightKey = found && party !== 'both' ? party : null
  const ceremonies = highlightKey
    ? [highlightKey, ...CEREMONIES.filter((k) => k !== highlightKey)]
    : CEREMONIES

  return (
    <section
      id="invitation"
      data-cursor-id="invitation"
      className="section-padding relative bg-surface overflow-hidden film-grain"
    >
      <div className="max-w-2xl lg:max-w-7xl mx-auto px-2">
        <FadeIn className="text-center max-w-2xl mx-auto">
          <p className="eyebrow text-bold">{t('invitation.eyebrow')}</p>
          <p
            className="mt-4 leading-relaxed font-script text-3xl font-semibold text-accent"
            style={{ letterSpacing: '1px' }}
          >
            {found ? invitationName : ''}
          </p>
        </FadeIn>

        <div className="mt-10 grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-10 items-stretch">
          {ceremonies.map((key, i) => (
            <FadeIn key={key} delay={i * 0.2} className="h-full">
              <InvitationCard
                ceremonyKey={key}
                t={t}
                coupleLeft={coupleLeft}
                coupleRight={coupleRight}
                inv={inv}
                dateISO={dates[`${key}Start`]}
                endISO={dates[`${key}End`]}
                highlighted={key === highlightKey}
              />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
