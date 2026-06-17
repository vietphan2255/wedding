import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Send, Heart, Music, Pause } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { useWeddingConfig } from '../contexts/WeddingConfigContext'
import useIsPhone from '../hooks/useIsPhone'
import useInterval from '../hooks/useInterval'

const MUSIC_STORAGE_KEY = 'vn-music-playing'
const MUSIC_MUTED_KEY = 'vn-music-muted'
// Safety cap so the autostart poller can't run forever if play() never succeeds.
const MAX_AUTOSTART_TRIES = 20

export default function FloatingDock() {
  const { t } = useLanguage()
  const hasInteracted = useHasInteracted()
  const onHome =
    typeof window !== 'undefined' &&
    (window.location.pathname === '/' || window.location.pathname === '')
  const rsvpHref = onHome ? '#rsvp' : '/#rsvp'
  const wishesHref = onHome ? '#wishes' : '/#wishes'

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col-reverse gap-3 items-end">
      <MusicButton hasInteracted={hasInteracted} />
      <DockButton href={wishesHref} label={t('nav.wishes')}>
        <Heart size={18} />
      </DockButton>
      <DockButton href={rsvpHref} label={t('nav.rsvp')}>
        <Send size={18} />
      </DockButton>
    </div>
  )
}

// True once the visitor has interacted with the page (pointer/touch/key) — the
// gesture browsers require before audio can play. Tracked in the always-mounted
// dock so it captures the envelope tap even before the config (and the music
// button) finish loading from Firebase.
function useHasInteracted() {
  const [interacted, setInteracted] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined' || interacted) return
    const onFirst = () => setInteracted(true)
    const opts = { passive: true }
    window.addEventListener('pointerdown', onFirst, opts)
    window.addEventListener('touchstart', onFirst, opts)
    window.addEventListener('keydown', onFirst, opts)
    return () => {
      window.removeEventListener('pointerdown', onFirst)
      window.removeEventListener('touchstart', onFirst)
      window.removeEventListener('keydown', onFirst)
    }
  }, [interacted])
  return interacted
}

function DockButton({ href, label, children }) {
  return (
    <div className="group relative flex items-center">
      <span className="hidden sm:block absolute right-full mr-3 px-2.5 py-1 rounded-md bg-ink text-bg text-[11px] tracking-[0.18em] uppercase whitespace-nowrap opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 -translate-x-1 group-hover:translate-x-0 group-focus-within:translate-x-0 transition-all duration-200 pointer-events-none">
        {label}
      </span>
      <a
        href={href}
        aria-label={label}
        title={label}
        className="w-12 h-12 rounded-full bg-accent text-bg shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
      >
        {children}
      </a>
    </div>
  )
}

function MusicButton({ hasInteracted }) {
  const { config } = useWeddingConfig()
  const music = config.music || {}
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [attempts, setAttempts] = useState(0)

  const enabled = Boolean(music.enabled && music.url)
  const muted =
    typeof window !== 'undefined' && localStorage.getItem(MUSIC_MUTED_KEY) === '1'

  // Start playback (play-only — never pauses). Resolves quietly when the browser
  // blocks it; the poller below retries until it's allowed.
  const start = () => {
    const el = audioRef.current
    if (!el) return
    el.volume = clampVolume(music.volume)
    el.play()
      .then(() => {
        setPlaying(true)
        sessionStorage.setItem(MUSIC_STORAGE_KEY, '1')
      })
      .catch(() => {})
  }

  // Keep the live volume in sync with the admin setting.
  useEffect(() => {
    const el = audioRef.current
    if (el) el.volume = clampVolume(music.volume)
  }, [music.volume])

  // Immediate attempt on mount — succeeds for visitors the browser already
  // trusts (returning guests / a prior session). Blocked attempts fall through
  // to the gesture-gated poller below. Honours a previous mute.
  useEffect(() => {
    if (!enabled || muted) return
    start()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, music.url])

  // Resilient autostart: once the guest has interacted (the gesture browsers
  // require to allow audio — e.g. the envelope tap), retry play() until it
  // sticks, then stop. This survives the async config load — the music button
  // often mounts only after Firebase responds, i.e. after the tap, so a
  // one-shot handler would miss it; the poller doesn't.
  useInterval(
    () => {
      setAttempts((n) => n + 1)
      start()
    },
    enabled && hasInteracted && !playing && !muted && attempts < MAX_AUTOSTART_TRIES
      ? 500
      : null,
  )

  if (!enabled) return null

  const toggle = async () => {
    const el = audioRef.current
    if (!el) return
    if (playing) {
      el.pause()
      setPlaying(false)
      sessionStorage.setItem(MUSIC_STORAGE_KEY, '0')
      localStorage.setItem(MUSIC_MUTED_KEY, '1')
    } else {
      try {
        await el.play()
        setPlaying(true)
        sessionStorage.setItem(MUSIC_STORAGE_KEY, '1')
        localStorage.setItem(MUSIC_MUTED_KEY, '0')
      } catch (err) {
        console.warn('[music] play() blocked', err)
        setPlaying(false)
      }
    }
  }

  return (
    <div className="group relative flex items-center">
      <span className="hidden sm:block absolute right-full mr-3 px-2.5 py-1 rounded-md bg-ink text-bg text-[11px] tracking-[0.18em] uppercase whitespace-nowrap opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200 pointer-events-none">
        {music.title || (playing ? 'Pause' : 'Play')}
      </span>
      <audio
        ref={audioRef}
        src={music.url}
        loop
        preload="none"
        onEnded={() => setPlaying(false)}
        onPause={() => setPlaying(false)}
      />
      <button
        type="button"
        onClick={toggle}
        data-music-toggle="true"
        aria-label={playing ? 'Pause background music' : 'Play background music'}
        className="w-12 h-12 rounded-full bg-accent text-bg shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
      >
        <AnimatePresence mode="wait" initial={false}>
          {playing ? (
            <motion.span
              key="bars"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.2 }}
              className="flex items-end gap-[3px] h-4"
              aria-hidden
            >
              <Bar delay={0} />
              <Bar delay={0.15} />
              <Bar delay={0.3} />
            </motion.span>
          ) : (
            <motion.span
              key="music"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.2 }}
              className="inline-flex"
            >
              <Music size={18} />
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </div>
  )
}

function Bar({ delay }) {
  const reduce = useReducedMotion()
  const isPhone = useIsPhone()
  if (reduce || isPhone) {
    return (
      <span className="w-[3px] bg-bg rounded-full block" style={{ height: '60%' }} />
    )
  }
  return (
    <motion.span
      className="w-[3px] bg-bg rounded-full"
      animate={{ height: ['25%', '100%', '25%'] }}
      transition={{
        duration: 0.9,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
      style={{ height: '25%' }}
    />
  )
}

function clampVolume(v) {
  const n = Number(v)
  if (!Number.isFinite(n)) return 0.4
  return Math.min(1, Math.max(0, n))
}
