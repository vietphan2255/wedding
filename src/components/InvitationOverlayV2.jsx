import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../contexts/LanguageContext.jsx'
import { useWeddingConfig } from '../contexts/WeddingConfigContext.jsx'
import FloatingHearts from './fx/FloatingHearts.jsx'

const STORAGE_KEY = 'vn-invitation-opened'

function Flourish({ className = '' }) {
  return (
    <svg
      viewBox="0 0 120 12"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M2 6 H46" />
      <path d="M118 6 H74" />
      <path d="M52 6 c2 -3 6 -3 8 0 s6 3 8 0" />
      <circle cx="60" cy="6" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  )
}

function CornerOrnament({ className = '' }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="0.8"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M2 14 V2 H14" />
      <path d="M6 6 Q14 6 14 14" />
      <circle cx="6" cy="6" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  )
}

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
    }, 2200)
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

          <motion.div
            initial={{ y: 30, opacity: 0, scale: 0.94 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="w-[min(92vw,540px)] relative"
            style={{ perspective: '1400px' }}
          >
            {/* Letter card behind envelope */}
            <motion.div
              initial={{ x: '-50%', y: 0, opacity: 0 }}
              animate={
                open
                  ? { x: '-50%', y: '-58%', opacity: 1, transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.6 } }
                  : { x: '-50%', y: 0, opacity: 0 }
              }
              className={`absolute left-1/2 bottom-0 rounded-md overflow-hidden pointer-events-none ${
                letter ? 'w-[80%] aspect-[4/5]' : 'w-[92%] aspect-[3/2.2]'
              }`}
              style={{
                background: letter
                  ? 'var(--color-surface)'
                  : 'linear-gradient(180deg, color-mix(in srgb, var(--color-bg) 96%, white) 0%, var(--color-bg) 100%)',
                boxShadow:
                  '0 30px 60px -25px rgba(0,0,0,0.35), 0 1px 0 color-mix(in srgb, var(--color-line) 60%, transparent) inset',
                zIndex: 0,
              }}
              aria-hidden
            >
              {letter ? (
                <img
                  src={letter}
                  alt=""
                  draggable={false}
                  className="w-full h-full object-cover select-none"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
                  <p className="eyebrow text-accent">{t('invitation.eyebrow')}</p>
                  <Flourish className="w-24 h-3 mt-3 text-accent/70" />
                  <p className="font-script text-5xl md:text-6xl text-accent mt-2 leading-tight">
                    Viet &amp; Nguyen
                  </p>
                  <p className="font-display italic text-base md:text-lg mt-3 text-muted">
                    {t('invitation.line')}
                  </p>
                  <Flourish className="w-24 h-3 mt-3 text-accent/70" />
                  <p className="eyebrow mt-3 text-ink/70">26.07 · 02.08 · 2026</p>
                </div>
              )}
            </motion.div>

            {/* Envelope */}
            <div className="relative w-full aspect-[3/2]">
              {/* Envelope body */}
              <div
                className="absolute inset-0 rounded-md overflow-hidden border"
                style={{
                  background:
                    'linear-gradient(135deg, color-mix(in srgb, var(--color-surface) 96%, white) 0%, var(--color-surface) 50%, color-mix(in srgb, var(--color-surface) 88%, black) 100%)',
                  borderColor: 'color-mix(in srgb, var(--color-line) 70%, transparent)',
                  boxShadow:
                    '0 40px 90px -30px rgba(0,0,0,0.55), 0 1px 0 color-mix(in srgb, var(--color-bg) 60%, transparent) inset',
                }}
              >
                {/* Inner ornamental frame */}
                <div
                  className="absolute inset-3 rounded-sm pointer-events-none"
                  style={{
                    border: '1px solid color-mix(in srgb, var(--color-accent) 50%, transparent)',
                    boxShadow:
                      'inset 0 0 0 3px var(--color-surface), inset 0 0 0 4px color-mix(in srgb, var(--color-accent) 25%, transparent)',
                  }}
                  aria-hidden
                />

                {/* Corner ornaments */}
                <CornerOrnament className="absolute top-4 left-4 w-5 h-5 text-accent/80" />
                <CornerOrnament className="absolute top-4 right-4 w-5 h-5 text-accent/80 -scale-x-100" />
                <CornerOrnament className="absolute bottom-4 left-4 w-5 h-5 text-accent/80 -scale-y-100" />
                <CornerOrnament className="absolute bottom-4 right-4 w-5 h-5 text-accent/80 -scale-100" />

                {/* Bottom V-flaps (subtle) */}
                <div
                  className="absolute inset-x-0 bottom-0 h-[55%] pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(to top right, color-mix(in srgb, var(--color-surface) 92%, black) 49.5%, transparent 50%), linear-gradient(to top left, color-mix(in srgb, var(--color-surface) 92%, black) 49.5%, transparent 50%)',
                    backgroundSize: '50% 100%',
                    backgroundPosition: 'left bottom, right bottom',
                    backgroundRepeat: 'no-repeat',
                    opacity: 0.7,
                  }}
                />
                <div
                  className="absolute left-1/2 bottom-0 -translate-x-1/2 w-px h-[55%] pointer-events-none"
                  style={{ background: 'color-mix(in srgb, var(--color-line) 50%, transparent)' }}
                />
              </div>

              {/* Top flap — flips open */}
              <motion.div
                animate={
                  open
                    ? { rotateX: -175, transition: { duration: 1.1, ease: [0.65, 0, 0.35, 1] } }
                    : { rotateX: 0 }
                }
                style={{
                  transformOrigin: 'top',
                  transformStyle: 'preserve-3d',
                  zIndex: open ? 1 : 3,
                }}
                className="absolute inset-x-0 top-0 h-1/2"
              >
                {/* Flap front */}
                <div
                  className="absolute inset-0"
                  style={{
                    backfaceVisibility: 'hidden',
                    background:
                      'linear-gradient(to bottom right, color-mix(in srgb, var(--color-accent) 95%, black) 49.5%, transparent 50%), linear-gradient(to bottom left, color-mix(in srgb, var(--color-accent) 95%, black) 49.5%, transparent 50%)',
                    backgroundSize: '50% 100%',
                    backgroundPosition: 'left top, right top',
                    backgroundRepeat: 'no-repeat',
                    filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.18))',
                  }}
                />
                {/* Flap inner crease shine */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backfaceVisibility: 'hidden',
                    background:
                      'linear-gradient(to bottom right, transparent 49%, color-mix(in srgb, white 22%, transparent) 50%, transparent 51%), linear-gradient(to bottom left, transparent 49%, color-mix(in srgb, white 22%, transparent) 50%, transparent 51%)',
                    backgroundSize: '50% 100%',
                    backgroundPosition: 'left top, right top',
                    backgroundRepeat: 'no-repeat',
                    mixBlendMode: 'overlay',
                  }}
                />
                {/* Foil monogram */}
                <div
                  className="absolute inset-0 flex items-start justify-center pt-3"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <span
                    className="font-script text-2xl md:text-3xl"
                    style={{
                      color: 'color-mix(in srgb, var(--color-bg) 90%, white)',
                      textShadow: '0 1px 1px rgba(0,0,0,0.25)',
                    }}
                  >
                    V &amp; N
                  </span>
                </div>
              </motion.div>

              {/* Wax seal */}
              <motion.div
                initial={{ x: '-50%', y: '-50%', scale: 0.6, opacity: 0 }}
                animate={
                  open
                    ? { x: '-50%', y: '-50%', scale: 0, opacity: 0 }
                    : { x: '-50%', y: '-50%', scale: 1, opacity: 1 }
                }
                transition={
                  open
                    ? { duration: 0.35 }
                    : { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.5 }
                }
                className="absolute left-1/2 top-1/2 pointer-events-none"
                style={{ zIndex: 4 }}
                aria-hidden
              >
                <div
                  className="w-16 h-16 md:w-[72px] md:h-[72px] rounded-full grid place-items-center relative"
                  style={{
                    background:
                      'radial-gradient(circle at 32% 28%, color-mix(in srgb, var(--color-accent) 80%, white) 0%, var(--color-accent) 45%, color-mix(in srgb, var(--color-accent) 55%, black) 100%)',
                    boxShadow:
                      '0 8px 16px -6px rgba(0,0,0,0.55), inset 0 1px 1px color-mix(in srgb, white 30%, transparent), inset 0 -2px 4px color-mix(in srgb, black 25%, transparent)',
                  }}
                >
                  {/* Scalloped edge */}
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background:
                        'repeating-conic-gradient(from 0deg, color-mix(in srgb, var(--color-accent) 55%, black) 0deg 12deg, transparent 12deg 24deg)',
                      maskImage:
                        'radial-gradient(circle, transparent 70%, black 71%, black 78%, transparent 79%)',
                      WebkitMaskImage:
                        'radial-gradient(circle, transparent 70%, black 71%, black 78%, transparent 79%)',
                      opacity: 0.5,
                    }}
                  />
                  <span
                    className="font-script text-2xl md:text-[26px] relative"
                    style={{
                      color: 'color-mix(in srgb, var(--color-bg) 92%, white)',
                      textShadow: '0 1px 1px rgba(0,0,0,0.4)',
                    }}
                  >
                    V&amp;N
                  </span>
                </div>
              </motion.div>
            </div>

            <FloatingHearts active={open} className="z-[5]" />
          </motion.div>

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
