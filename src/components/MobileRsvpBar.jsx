import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { useWeddingConfig } from '../contexts/WeddingConfigContext'

function pickEvent(config) {
  const now = Date.now()
  const vuquy = new Date(config.dates.vuquyStart).getTime()
  const thanhhon = new Date(config.dates.thanhhonStart).getTime()
  if (now < vuquy) return vuquy
  if (now < thanhhon) return thanhhon
  return null
}

export default function MobileRsvpBar() {
  const { t } = useLanguage()
  const { config } = useWeddingConfig()
  const [hidden, setHidden] = useState(false)

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
          className="md:hidden fixed bottom-0 inset-x-0 z-40 px-3 pb-3 pointer-events-none"
        >
          <div className="pointer-events-auto glass rounded-2xl shadow-xl flex items-center gap-3 pl-4 pr-2 py-2">
            <div className="flex-1 min-w-0">
              {days !== null ? (
                <>
                  <p className="font-display text-lg leading-tight tabular-nums">
                    {days}
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-muted">
                    {t('mobileRsvp.days')}
                  </p>
                </>
              ) : (
                <p className="font-display text-base leading-tight">
                  {(config?.common?.coupleNameLeft || 'Viet')} &amp;{' '}
                  {(config?.common?.coupleNameRight || 'Nguyen')}
                </p>
              )}
            </div>
            <a
              href="#rsvp"
              className="inline-flex items-center gap-2 rounded-full bg-ink text-bg px-5 py-3 text-xs tracking-[0.22em] uppercase font-medium shadow active:scale-95 transition-transform"
            >
              <Send size={14} />
              {t('mobileRsvp.cta')}
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
