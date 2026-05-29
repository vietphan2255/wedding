import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../contexts/LanguageContext.jsx'
import { useWeddingConfig } from '../contexts/WeddingConfigContext.jsx'
import FloatingHearts from './fx/FloatingHearts.jsx'

const STORAGE_KEY = 'vn-invitation-opened'

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
    }, 2400)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={handleOpen}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          aria-label={t('invitation.tap')}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-bg text-ink film-grain cursor-pointer focus:outline-none"
        >
          <div className="w-[min(92vw,520px)] aspect-[3/2] relative">
            {letter && (
              <motion.div
                initial={{ x: '-50%', y: 0, opacity: 0 }}
                animate={
                  open
                    ? { x: '-50%', y: '-54%', opacity: 1 }
                    : { x: '-50%', y: 0, opacity: 0 }
                }
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: open ? 0.45 : 0 }}
                className="absolute left-1/2 bottom-0 w-[78%] aspect-[4/5] rounded-md overflow-hidden pointer-events-none"
                style={{
                  background: 'var(--color-surface)',
                  boxShadow: '0 30px 70px -28px rgba(0,0,0,0.5)',
                  zIndex: 0,
                }}
                aria-hidden
              >
                <img
                  src={letter}
                  alt=""
                  draggable={false}
                  className="w-full h-full object-cover select-none"
                />
              </motion.div>
            )}
            <motion.div
              animate={open ? { scale: 1.15, opacity: 0 } : { scale: 1, opacity: 1 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: open ? 0.5 : 0 }}
              className="absolute inset-0"
            >
              {/* Envelope body */}
              <div className="absolute inset-0 rounded-md bg-surface border border-line shadow-[0_30px_80px_-30px_rgba(0,0,0,0.45)] overflow-hidden">
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
                  <p className="eyebrow">{t('invitation.eyebrow')}</p>
                  <p className="font-script text-5xl md:text-6xl text-accent mt-3">
                    Viet &amp; Nguyen
                  </p>
                  <p className="font-display text-sm mt-4">{t('invitation.line')}</p>
                  <p className="eyebrow mt-2">26.07 · 02.08 · 2026</p>
                </div>
                {/* Bottom flaps decoration */}
                <div
                  className="absolute inset-x-0 bottom-0 h-1/2"
                  style={{
                    background:
                      'linear-gradient(to top right, var(--color-surface) 50%, transparent 50%), linear-gradient(to top left, var(--color-surface) 50%, transparent 50%)',
                    backgroundSize: '50% 100%',
                    backgroundPosition: 'left bottom, right bottom',
                    backgroundRepeat: 'no-repeat',
                    opacity: 0.5,
                  }}
                />
              </div>

              {/* Top flap that flips open */}
              <motion.div
                animate={open ? { rotateX: -180 } : { rotateX: 0 }}
                transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
                style={{
                  transformOrigin: 'top',
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'hidden',
                }}
                className="absolute inset-x-0 top-0 h-1/2"
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(to bottom right, var(--color-accent) 50%, transparent 50%), linear-gradient(to bottom left, var(--color-accent) 50%, transparent 50%)',
                    backgroundSize: '50% 100%',
                    backgroundPosition: 'left top, right top',
                    backgroundRepeat: 'no-repeat',
                  }}
                />
                {/* Foil-stamp monogram on the flap */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-script text-3xl md:text-4xl text-bg drop-shadow">
                    V &amp; N
                  </span>
                </div>
              </motion.div>

              {/* Wax-seal hint at the meeting point */}
              <motion.span
                animate={open ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-accent text-bg shadow-lg grid place-items-center text-[10px] tracking-[0.2em] uppercase pointer-events-none"
                aria-hidden
              >
                v&amp;n
              </motion.span>
            </motion.div>

            <FloatingHearts active={open} className="z-[5]" />
          </div>

          <motion.span
            initial={{ opacity: 0 }}
            animate={open ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="absolute bottom-10 inset-x-0 text-center eyebrow text-muted"
          >
            {t('invitation.tap')}
          </motion.span>
        </motion.button>
      )}
    </AnimatePresence>
  )
}
