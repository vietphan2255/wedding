import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Music } from 'lucide-react'
import { useWeddingConfig } from './WeddingConfigContext'
import useIsPhone from '../hooks/useIsPhone'
import useInterval from '../hooks/useInterval'
import { sanitizeUrl } from '../lib/sanitizeUrl'

// Single source of truth for the background music: one <audio> element plus the
// autostart/gesture/mute logic, exposed via useMusic() so both the desktop
// FloatingDock and the mobile bottom bar can drive the same player without ever
// mounting two audio elements (which would double-play).
const MUSIC_STORAGE_KEY = 'vn-music-playing'
const MUSIC_MUTED_KEY = 'vn-music-muted'
// Safety cap so the autostart poller can't run forever if play() never succeeds.
const MAX_AUTOSTART_TRIES = 20

const MusicContext = createContext(null)

export function useMusic() {
  return (
    useContext(MusicContext) || {
      enabled: false,
      playing: false,
      toggle: () => {},
      title: '',
    }
  )
}

// True once the visitor has interacted with the page (pointer/touch/key) — the
// gesture browsers require before audio can play. Captures the envelope tap even
// before the config finishes loading from Firebase.
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

function clampVolume(v) {
  const n = Number(v)
  if (!Number.isFinite(n)) return 0.4
  return Math.min(1, Math.max(0, n))
}

export function MusicProvider({ children }) {
  const { config } = useWeddingConfig()
  const music = config.music || {}
  const hasInteracted = useHasInteracted()
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
  // trusts. Blocked attempts fall through to the gesture-gated poller. Honours a
  // previous mute.
  useEffect(() => {
    if (!enabled || muted) return
    start()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, music.url])

  // Resilient autostart: once the guest has interacted (e.g. the envelope tap),
  // retry play() until it sticks, then stop. Survives the async config load.
  useInterval(
    () => {
      setAttempts((n) => n + 1)
      start()
    },
    enabled && hasInteracted && !playing && !muted && attempts < MAX_AUTOSTART_TRIES
      ? 500
      : null,
  )

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

  const value = { enabled, playing, toggle, title: music.title || '' }

  return (
    <MusicContext.Provider value={value}>
      {enabled && (
        <audio
          ref={audioRef}
          src={sanitizeUrl(music.url)}
          loop
          preload="none"
          onEnded={() => setPlaying(false)}
          onPause={() => setPlaying(false)}
        />
      )}
      {children}
    </MusicContext.Provider>
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
      transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut', delay }}
      style={{ height: '25%' }}
    />
  )
}

// Shared play/pause glyph: animated equalizer bars while playing, music note
// otherwise. Used by both the dock button and the mobile bar's music tab.
export function MusicGlyph({ playing }) {
  return (
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
  )
}
