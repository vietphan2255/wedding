import { useLanguage } from '../contexts/LanguageContext'
import { useWeddingConfig } from '../contexts/WeddingConfigContext'
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
  const f = (opts) => new Intl.DateTimeFormat('vi-VN', { ...opts, timeZone: TZ }).format(d)
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
    <div className="flex flex-col items-center gap-2 shrink-0 text-accent absolute top-8 left-4">
      <span className="w-px h-7 md:h-9 bg-line" aria-hidden />
      <div className="font-script-vn font-extrabold text-2xl md:text-3xl leading-[1.15] flex flex-col items-center">
        {words.map((w, i) => (
          <span key={i}>{w}</span>
        ))}
      </div>
      <span className="w-px h-7 md:h-9 bg-line" aria-hidden />
    </div>
  )
}

function FamilyBlock({ label, father, mother, hometown }) {
  if (!father && !mother && !hometown) return null
  return (
    <div className="text-center">
      <p className="font-display text-sm sm:text-base md:text-lg text-ink">{label}</p>
      <div className="mt-2 space-y-1">
        {father ? (
          <p className="text-ink whitespace-nowrap" style={{ fontSize: 'clamp(0.7rem, 2.7vw, 1rem)' }}>
            Ông: <span className="text-ink uppercase font-semibold">{father}</span>
          </p>
        ) : null}
        {mother ? (
          <p className="text-ink whitespace-nowrap" style={{ fontSize: 'clamp(0.7rem, 2.7vw, 1rem)' }}>
            Bà: <span className="text-ink uppercase font-semibold">{mother}</span>
          </p>
        ) : null}
        {hometown ? <p className="text-muted text-sm">{hometown}</p> : null}
      </div>
    </div>
  )
}

// THÁNG | big-day | NĂM, with the month/year framed by hairline rules.
function BigDate({ monthLabel, day, yearLabel }) {
  const side =
    'flex-1 max-w-[9rem] flex items-center justify-center border-t border-b border-line py-2 text-center font-display text-base md:text-xl text-ink uppercase tracking-[0.08em] font-bold'
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

function InvitationCard({ ceremonyKey, t, coupleLeft, coupleRight, inv, dateISO }) {
  const name = t(`events.${ceremonyKey}.name`)
  const venue = t(`events.${ceremonyKey}.venue`)
  const time = t(`events.${ceremonyKey}.time`)
  const lunar = inv[`${ceremonyKey}Lunar`] || ''
  const address = inv[`${ceremonyKey}Address`] || ''
  const bits = dateBits(dateISO)
  const monthLabel = bits ? `Tháng ${bits.monthNum}` : ''
  const yearLabel = bits ? `Năm ${bits.year}` : ''

  return (
    <div className="relative h-full rounded-3xl border border-line bg-bg/60 backdrop-blur px-4 sm:px-8 py-8 sm:py-10 md:px-12 md:py-14">
      {/* Top — vertical title + cursive couple names */}
      <div className="flex items-center justify-center gap-3 sm:gap-5 md:gap-10">
        <VerticalTitle name={name} />
        <div
          style={{ fontFamily: 'Alex Brush, cursive' }}
          className="font-extrabold text-muted text-center leading-[1.1] min-w-0"
        >
          <div
            className="whitespace-nowrap"
            style={{ fontSize: 'clamp(1.4rem, 7vw, 3rem)' }}
          >
            {coupleLeft}
          </div>
          <div
            className="my-1 md:my-2"
            style={{ fontSize: 'clamp(1.1rem, 4vw, 1.875rem)' }}
          >
            &amp;
          </div>
          <div
            className="whitespace-nowrap"
            style={{ fontSize: 'clamp(1.4rem, 7vw, 3rem)' }}
          >
            {coupleRight}
          </div>
        </div>
      </div>

      {/* Two families */}
      <div className="mt-8 md:mt-10 grid grid-cols-2 gap-2 sm:gap-4 md:gap-6 max-w-[40rem] mx-auto">
        <FamilyBlock
          label={t('invite.familyGroom')}
          father={inv.groomFather}
          mother={inv.groomMother}
          hometown={inv.groomHometown}
        />
        <FamilyBlock
          label={t('invite.familyBride')}
          father={inv.brideFather}
          mother={inv.brideMother}
          hometown={inv.brideHometown}
        />
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
        <p className="mt-5 text-center font-script-vn text-xl md:text-2xl text-accent font-bold">
          {lunar}
        </p>
      ) : null}

      {/* Venue */}
      <div className="mt-8 text-center">
        <p className="eyebrow">{t('invite.venueLabel')}</p>
        <p className="font-display text-xl md:text-2xl text-ink mt-2 font-bold">
          {venue}
        </p>
        {address ? <p className="text-sm text-muted mt-1.5">{address}</p> : null}
      </div>
    </div>
  )
}

export default function WeddingInvite() {
  const { t } = useLanguage()
  const { config } = useWeddingConfig()
  const common = config.common || {}
  const inv = config.invitation || {}
  const dates = config.dates || {}

  // Formal full names are invitation-only; fall back to the shared short names so the
  // hero, footer, navbar and intro envelope are untouched.
  const coupleLeft = inv.groomFullName || common.coupleNameLeft || 'Viet'
  const coupleRight = inv.brideFullName || common.coupleNameRight || 'Nguyen'
  const message = inv.message_vi || ''

  return (
    <section
      id="invitation"
      data-cursor-id="invitation"
      className="section-padding relative bg-surface overflow-hidden film-grain"
    >
      <div className="max-w-2xl lg:max-w-7xl mx-auto px-2">
        <FadeIn className="text-center max-w-2xl mx-auto">
          <p className="eyebrow">{t('invitation.eyebrow')}</p>
          {message ? (
            <p className="text-muted mt-4 leading-relaxed">{message}</p>
          ) : null}
        </FadeIn>

        <div className="mt-10 grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-10 items-stretch">
          {CEREMONIES.map((key, i) => (
            <FadeIn key={key} delay={i * 0.2} className="h-full">
              <InvitationCard
                ceremonyKey={key}
                t={t}
                coupleLeft={coupleLeft}
                coupleRight={coupleRight}
                inv={inv}
                dateISO={dates[`${key}Start`]}
              />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
