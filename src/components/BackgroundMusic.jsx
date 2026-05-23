import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Music, Pause } from 'lucide-react'
import { useWeddingConfig } from '../contexts/WeddingConfigContext.jsx'

const STORAGE_KEY = 'vn-music-playing'

export default function BackgroundMusic() {
  const { config } = useWeddingConfig()
  const music = config.music || {}
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)

  const enabled = Boolean(music.enabled && music.url)

  // When the source changes, reset element so the new URL is loaded.
  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    el.volume = clampVolume(music.volume)
  }, [music.volume])

  // Try to auto-resume if the user previously opted in.
  useEffect(() => {
    if (!enabled) return
    const el = audioRef.current
    if (!el) return
    el.volume = clampVolume(music.volume)
    const wasPlaying = sessionStorage.getItem(STORAGE_KEY) === '1'
    if (wasPlaying) {
      el.play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false))
    }
  }, [enabled, music.url])

  if (!enabled) return null

  const toggle = async () => {
    const el = audioRef.current
    if (!el) return
    if (playing) {
      el.pause()
      setPlaying(false)
      sessionStorage.setItem(STORAGE_KEY, '0')
    } else {
      try {
        await el.play()
        setPlaying(true)
        sessionStorage.setItem(STORAGE_KEY, '1')
      } catch (err) {
        console.warn('[music] play() blocked', err)
        setPlaying(false)
      }
    }
  }

  return (
    <>
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
        aria-label={playing ? 'Pause background music' : 'Play background music'}
        title={music.title || (playing ? 'Pause music' : 'Play music')}
        className="fixed bottom-5 right-5 z-50 w-12 h-12 rounded-full bg-accent text-bg shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
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
    </>
  )
}

function Bar({ delay }) {
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
