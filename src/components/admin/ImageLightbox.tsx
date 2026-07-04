import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { X, ExternalLink } from 'lucide-react'
import useFocusTrap from '../../hooks/useFocusTrap'

// Full-screen preview of a single uploaded image for the admin. Adapted from the
// site's QrLightbox (src/components/GiftCard.jsx): backdrop-click + Esc + drag-to-
// dismiss, body scroll-lock, and an "Open original" link. Sits at z-[130] so it
// layers above every admin panel. Rendered once by ImageLightboxProvider.
export default function ImageLightbox({
  src,
  alt = '',
  onClose,
}: {
  src: string
  alt?: string
  onClose: () => void
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  useFocusTrap(panelRef, true)

  useEffect(() => {
    // Capture phase + stopImmediatePropagation so Esc closes only the lightbox,
    // never an underlying handler.
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation()
        onClose()
      }
    }
    document.addEventListener('keydown', onKey, true)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey, true)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose])

  return (
    <motion.div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label={alt || 'Image preview'}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      className="fixed inset-0 z-[130] bg-black/90 flex items-center justify-center p-4"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-5 right-5 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition"
      >
        <X size={22} />
      </button>

      <motion.img
        src={src}
        alt={alt}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.25 }}
        onClick={(e) => e.stopPropagation()}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.6}
        onDragEnd={(_, info) => {
          if (Math.abs(info.offset.y) > 120) onClose()
        }}
        className="max-w-[92vw] max-h-[88vh] rounded-xl object-contain shadow-2xl cursor-grab active:cursor-grabbing"
      />

      <a
        href={src}
        target="_blank"
        rel="noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 text-xs tracking-[0.16em] uppercase transition backdrop-blur-sm"
      >
        <ExternalLink size={15} />
        Open original
      </a>
    </motion.div>
  )
}
