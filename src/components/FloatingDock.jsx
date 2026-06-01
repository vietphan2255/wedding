import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Send, Heart, Music, Pause } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext.jsx'
import { useWeddingConfig } from '../contexts/WeddingConfigContext.jsx'
import useIsPhone from '../hooks/useIsPhone.js'

const MUSIC_STORAGE_KEY = 'vn-music-playing'
const MUSIC_MUTED_KEY = 'vn-music-muted'

export default function FloatingDock() {
  const { t } = useLanguage()
  const onHome =
    typeof window !== 'undefined' &&
    (window.location.pathname === '/' || window.location.pathname === '')
  const rsvpHref = onHome ? '#rsvp' : '/#rsvp'
  const wishesHref = onHome ? '#wishes' : '/#wishes'

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col-reverse gap-3 items-end">
      <MusicButton />
      <DockButton href={wishesHref} label={t('nav.wishes')}>
        <Heart size={18} />
      </DockButton>
      <DockButton href={rsvpHref} label={t('nav.rsvp')}>
        <Send size={18} />
      </DockButton>
    </div>
  )
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

function MusicButton() {
  const { config } = useWeddingConfig()
  const music = config.music || {}
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)

  const enabled = Boolean(music.enabled && music.url)

  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    el.volume = clampVolume(music.volume)
  }, [music.volume])

  useEffect(() => {
    if (!enabled) return
    const el = audioRef.current
    if (!el) return
    el.volume = clampVolume(music.volume)
    const wasPlaying = sessionStorage.getItem(MUSIC_STORAGE_KEY) === '1'
    if (wasPlaying) {
      el.play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false))
    }
  }, [enabled, music.url])

  // Auto-start on first user interaction by querying the dock button and
  // synthesising a click. Routing through the real click handler keeps a
  // single source of truth for play/pause + localStorage persistence, and
  // ensures play() runs inside a user-gesture context (browsers block
  // silent autoplay). Skipped if the user previously muted (localStorage)
  // or the music is already known to be playing (sessionStorage).
  useEffect(() => {
    if (!enabled) return
    if (typeof window === 'undefined') return
    if (localStorage.getItem(MUSIC_MUTED_KEY) === '1') return
    if (sessionStorage.getItem(MUSIC_STORAGE_KEY) === '1') return

    let done = false
    const autoStart = () => {
      if (done) return
      done = true
      cleanup()
      // Re-check inside the handler — the user's first interaction may
      // already have been a click on the dock button itself, in which case
      // its own onClick will have updated state by now and we skip.
      if (localStorage.getItem(MUSIC_MUTED_KEY) === '1') return
      if (sessionStorage.getItem(MUSIC_STORAGE_KEY) === '1') return
      const btn = document.querySelector('[data-music-toggle]')
      if (btn) btn.click()
    }
    const cleanup = () => {
      window.removeEventListener('click', autoStart)
      window.removeEventListener('touchstart', autoStart)
      window.removeEventListener('keydown', autoStart)
    }
    window.addEventListener('click', autoStart)
    window.addEventListener('touchstart', autoStart, { passive: true })
    window.addEventListener('keydown', autoStart)
    return cleanup
  }, [enabled])

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
