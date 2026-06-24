import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Heart, Gift } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { useWeddingConfig } from '../contexts/WeddingConfigContext'
import { useMusic, MusicGlyph } from '../contexts/MusicContext'

function pickEvent(config) {
  const now = Date.now()
  const vuquy = new Date(config.dates.vuquyStart).getTime()
  const thanhhon = new Date(config.dates.thanhhonStart).getTime()
  if (now < vuquy) return vuquy
  if (now < thanhhon) return thanhhon
  return null
}

// Phone-only bottom tab bar (the desktop FloatingDock is hidden on phones). One
// row: countdown-days block, then equal Wish / RSVP / Music tabs.
const tabClass =
  'flex-1 flex flex-col items-center justify-center gap-1 rounded-xl py-1.5 px-1 text-ink/80 hover:text-ink hover:bg-ink/5 active:scale-95 transition'
const tabLabelClass =
  'text-[10px] uppercase tracking-[0.14em] leading-none whitespace-nowrap'

/** @param {{ onGiftClick?: () => void }} props `onGiftClick` opens the gift modal. */
export default function MobileRsvpBar({ onGiftClick }) {
  const { t } = useLanguage()
  const { config } = useWeddingConfig()
  const { enabled: musicEnabled, playing, toggle } = useMusic()
  const [hidden, setHidden] = useState(false)
  const giftsEnabled = config.gifts?.enabled !== false

  const target = useMemo(() => pickEvent(config), [config])
  const days = target
    ? Math.max(0, Math.ceil((target - Date.now()) / 86400000))
    : null

  useEffect(() => {
    const section = document.getElementById('rsvp')
    if (!section || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      ([entry]) => setHidden(entry.isIntersecting),
      { rootMargin: '0px 0px -40% 0px' },
    )
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  return (
    <AnimatePresence>
      {!hidden && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 180, damping: 24 }}
          className="md:hidden fixed bottom-0 inset-x-0 z-40 px-3 pb-3 pointer-events-none bg-transparent"
        >
          <div className="pointer-events-auto glass rounded-2xl shadow-xl flex items-stretch gap-1.5 px-2 py-2 bg-opacity-40">
            {/* Countdown days (or couple names once both events have passed) */}
            <div className="flex flex-col items-center justify-center px-2 min-w-[3.25rem] shrink-0">
              {days !== null ? (
                <>
                  <span className="font-display text-xl leading-none tabular-nums">
                    {days}
                  </span>
                  <span className="text-[9px] uppercase tracking-[0.16em] text-muted mt-1 leading-none">
                    {t('mobileRsvp.days')}
                  </span>
                </>
              ) : (
                <span className="font-display text-sm leading-tight text-center">
                  {config?.common?.coupleNameLeft || 'Viet'} &amp;{' '}
                  {config?.common?.coupleNameRight || 'Nguyen'}
                </span>
              )}
            </div>

            <span className="w-px self-stretch bg-line/70 shrink-0" aria-hidden />

            {/* Equal action tabs */}
            <a href="#wishes" className={tabClass} aria-label={t('nav.wishes')}>
              <Heart size={18} />
            </a>
            <a href="#rsvp" className={tabClass} aria-label={t('nav.rsvp')}>
              <Send size={18} />
            </a>
            {giftsEnabled && onGiftClick && (
              <button
                type="button"
                onClick={onGiftClick}
                className={tabClass}
                aria-label={t('nav.gift')}
              >
                <Gift size={18} />
              </button>
            )}
            {musicEnabled && (
              <button
                type="button"
                onClick={toggle}
                data-music-toggle="true"
                aria-label={playing ? 'Pause background music' : 'Play background music'}
                className={tabClass}
              >
                <span className="h-[18px] flex items-center justify-center">
                  <MusicGlyph playing={playing} />
                </span>
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
