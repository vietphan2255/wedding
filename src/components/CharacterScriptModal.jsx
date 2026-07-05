import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import useFocusTrap from '../hooks/useFocusTrap'
import useScrollLock from '../hooks/useScrollLock'

// Cute, visual-novel-style dialogue modal opened by tapping the MobileEffect
// sprite. Shows a character portrait, an optional name plate, and a script the
// visitor taps through one line at a time. Modeled on GiftModal (AnimatePresence
// + spring panel, Esc + body-scroll-lock, click-backdrop-to-close, bottom-sheet
// on phones) plus a focus trap. Sits at z-[115] — above the sprite (z-[45]) and
// GiftModal (z-[110]), below the QR lightbox (z-[120]).
/**
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   image?: string,
 *   name?: string,
 *   lines?: string[],
 * }} props
 */
export default function CharacterScriptModal({ open, onClose, image, name, lines = [] }) {
  const [idx, setIdx] = useState(0)
  const panelRef = useRef(null)
  useFocusTrap(panelRef, open)

  // Restart from the first line every time the modal opens.
  useEffect(() => {
    if (open) setIdx(0)
  }, [open])

  // Lock background scroll (incl. stopping Lenis) while open.
  useScrollLock(open)

  // Esc to close (same pattern as GiftModal).
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const hasLines = lines.length > 0
  const last = idx >= lines.length - 1
  // Tap the bubble: advance to the next line, or close once past the last one.
  const advance = () => {
    if (hasLines && !last) setIdx((i) => i + 1)
    else onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[115] flex items-end md:items-center justify-center md:p-6"
        >
          {/* Backdrop — clicking it closes the modal */}
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
          />

          {/* Panel — bottom sheet on phones, centered card on desktop */}
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={name || 'Message'}
            initial={{ y: 48, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 48, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 220, damping: 26 }}
            className="relative w-full md:max-w-md bg-bg border border-line shadow-2xl rounded-t-3xl md:rounded-3xl p-6 md:p-7"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full border border-line bg-bg/80 flex items-center justify-center text-ink/70 hover:text-ink hover:bg-ink/5 transition"
            >
              <X size={18} />
            </button>

            {/* Speech balloon FIRST (above the character), with a tail pointing
                down at the portrait so it reads as the character speaking. The
                balloon is the tap target that advances the script. */}
            {hasLines ? (
              <button
                type="button"
                onClick={advance}
                aria-label={last ? 'Close' : 'Continue'}
                className="relative w-full text-left rounded-2xl bg-surface border border-line p-4 pr-10 active:scale-[0.99] transition after:content-[''] after:absolute after:left-1/2 after:top-full after:-translate-x-1/2 after:-mt-px after:border-x-8 after:border-t-8 after:border-x-transparent after:border-t-line before:content-[''] before:absolute before:left-1/2 before:top-full before:-translate-x-1/2 before:-mt-[2px] before:border-x-8 before:border-t-8 before:border-x-transparent before:border-t-surface before:z-[1]"
              >
                {/* Keyed by idx so each advance remounts with a fresh fade-in
                    (no exit needed — one line is on screen at a time). */}
                <motion.p
                  key={idx}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18 }}
                  className="text-ink leading-relaxed min-h-[3rem]"
                >
                  {lines[idx]}
                </motion.p>
                <div className="mt-2 flex items-center justify-between text-xs text-muted">
                  <span className="tabular-nums">
                    {idx + 1} / {lines.length}
                  </span>
                  <span aria-hidden className="text-accent">
                    {last ? '✕ tap to close' : '▶ tap to continue'}
                  </span>
                </div>
              </button>
            ) : null}

            {image ? (
              <div className={`flex justify-center ${hasLines ? 'mt-6' : ''}`}>
                <img
                  src={image}
                  alt={name || ''}
                  draggable={false}
                  className="max-h-[38vh] w-auto object-contain drop-shadow-xl"
                />
              </div>
            ) : null}

            {name ? (
              <div className="flex justify-center mt-3">
                <span className="inline-block rounded-full bg-accent text-bg px-4 py-1 text-sm font-medium tracking-wide">
                  {name}
                </span>
              </div>
            ) : null}

            {!hasLines ? (
              <p className="mt-4 text-center text-xs text-muted">Tap anywhere to close.</p>
            ) : null}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
