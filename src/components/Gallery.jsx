import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { useWeddingConfig } from '../contexts/WeddingConfigContext'
import FadeIn from './FadeIn.jsx'
import BlurImage from './BlurImage.jsx'

export default function Gallery() {
  const { t } = useLanguage()
  const { config } = useWeddingConfig()
  const photos = config.gallery
  const [open, setOpen] = useState(null)

  const close = useCallback(() => setOpen(null), [])
  const next = useCallback(
    () => setOpen((i) => (i === null ? null : (i + 1) % photos.length)),
    [photos.length],
  )
  const prev = useCallback(
    () =>
      setOpen((i) =>
        i === null ? null : (i - 1 + photos.length) % photos.length,
      ),
    [photos.length],
  )

  useEffect(() => {
    if (open === null) return
    const onKey = (e) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, close, next, prev])

  return (
    <section id="gallery" className="section-padding relative bg-bg overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <FadeIn className="text-center max-w-2xl mx-auto">
          <p className="eyebrow">{t('gallery.eyebrow')}</p>
          <h2 className="font-display mt-3 text-4xl md:text-6xl">
            {t('gallery.title')}
          </h2>
          <div className="divider-leaf my-6">
            <span className="font-script text-2xl">∞</span>
          </div>
          <p className="text-muted">{t('gallery.subtitle')}</p>
        </FadeIn>

        <div className="mt-14 columns-2 md:columns-3 lg:columns-4 gap-3 md:gap-4 [column-fill:_balance]">
          {photos.map((p, i) => (
            <FadeIn
              key={p.id}
              delay={(i % 6) * 0.04}
              y={20}
              className="mb-3 md:mb-4 break-inside-avoid"
            >
              <button
                onClick={() => setOpen(i)}
                className="group block w-full overflow-hidden rounded-xl cursor-pointer relative"
                aria-label={`Open photo ${i + 1}`}
              >
                <BlurImage
                  src={p.src}
                  placeholder={p.placeholder}
                  className="w-full"
                  imgClassName="h-auto transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-ink/0 group-hover:bg-ink/15 transition-colors" />
              </button>
            </FadeIn>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {open !== null && photos[open] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
            onClick={close}
          >
            <button
              onClick={close}
              aria-label="Close"
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <X size={22} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                prev()
              }}
              aria-label="Previous"
              className="absolute left-3 md:left-8 p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <ChevronLeft size={26} />
            </button>
            <motion.img
              key={open}
              src={photos[open].src.replace(/\/\d+\/\d+$/, '/1600/1200')}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-[92vw] max-h-[88vh] rounded-lg object-contain shadow-2xl"
              alt=""
            />
            <button
              onClick={(e) => {
                e.stopPropagation()
                next()
              }}
              aria-label="Next"
              className="absolute right-3 md:right-8 p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <ChevronRight size={26} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
