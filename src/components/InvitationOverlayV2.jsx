import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../contexts/LanguageContext.jsx'
import { useWeddingConfig } from '../contexts/WeddingConfigContext.jsx'
import EnvelopeIntro from './EnvelopeIntro.jsx'

const STORAGE_KEY = 'vn-invitation-opened'

function Petal({ delay, x, drift, size, rotate }) {
  return (
    <motion.span
      initial={{ y: '-10vh', x, opacity: 0, rotate }}
      animate={{
        y: '110vh',
        x: x + drift,
        opacity: [0, 1, 1, 0],
        rotate: rotate + 240,
      }}
      transition={{
        duration: 14 + (size % 5),
        delay,
        repeat: Infinity,
        ease: 'linear',
      }}
      className="absolute top-0 left-1/2 pointer-events-none"
      style={{
        width: size,
        height: size,
        borderRadius: '60% 40% 60% 40% / 50% 60% 40% 50%',
        background:
          'radial-gradient(circle at 35% 30%, color-mix(in srgb, var(--color-accent) 90%, white), color-mix(in srgb, var(--color-accent) 50%, transparent))',
        filter: 'blur(0.3px)',
        opacity: 0.55,
      }}
      aria-hidden
    />
  )
}

export default function InvitationOverlay() {
  const { t } = useLanguage()
  const { config } = useWeddingConfig()
  const letter = (config.invitation?.letterImage || '').trim()
  const [visible, setVisible] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (sessionStorage.getItem(STORAGE_KEY) === '1') return
    setVisible(true)
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const handleOpen = () => {
    if (open) return
    setOpen(true)
    window.setTimeout(() => {
      sessionStorage.setItem(STORAGE_KEY, '1')
      setVisible(false)
      document.body.style.overflow = ''
    }, 3000)
  }

  const petals = useMemo(
    () => [
      { delay: 0, x: -180, drift: 40, size: 10, rotate: 10 },
      { delay: 2, x: 140, drift: -60, size: 8, rotate: 200 },
      { delay: 4, x: -60, drift: 80, size: 12, rotate: 90 },
      { delay: 6, x: 220, drift: -90, size: 9, rotate: 150 },
      { delay: 1.5, x: -240, drift: 30, size: 7, rotate: 60 },
      { delay: 3.5, x: 60, drift: -40, size: 11, rotate: 250 },
    ],
    [],
  )

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={handleOpen}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          aria-label={t('invitation.tap')}
          className="fixed inset-0 z-[100] flex items-center justify-center text-ink film-grain cursor-pointer focus:outline-none overflow-hidden"
          style={{
            background:
              'radial-gradient(ellipse at center, color-mix(in srgb, var(--color-surface) 70%, var(--color-bg)) 0%, var(--color-bg) 60%, color-mix(in srgb, var(--color-bg) 70%, black) 100%)',
          }}
        >
          {/* Ambient floating petals */}
          <div className="absolute inset-0 pointer-events-none">
            {petals.map((p, i) => (
              <Petal key={i} {...p} />
            ))}
          </div>

          {/* Soft glow halo behind envelope */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="absolute w-[640px] h-[640px] max-w-[90vw] max-h-[90vw] rounded-full pointer-events-none"
            style={{
              background:
                'radial-gradient(circle, color-mix(in srgb, var(--color-accent) 30%, transparent) 0%, transparent 65%)',
              filter: 'blur(20px)',
            }}
            aria-hidden
          />

          <EnvelopeIntro open={open} letterImage={letter} />

          {/* Bottom tap hint */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={open ? { opacity: 0 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="absolute bottom-10 inset-x-0 flex flex-col items-center gap-3"
          >
            <motion.span
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              className="eyebrow text-muted"
            >
              {t('invitation.tap')}
            </motion.span>
            <motion.span
              animate={{ y: [0, 6, 0], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-px h-6 bg-accent"
              aria-hidden
            />
          </motion.div>
        </motion.button>
      )}
    </AnimatePresence>
  )
}
