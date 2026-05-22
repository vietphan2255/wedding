import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext.jsx'
import FadeIn from './FadeIn.jsx'

const PHOTOS = Array.from({ length: 12 }, (_, i) => {
  const ratio = i % 5 === 0 ? '900/1300' : i % 3 === 0 ? '1300/900' : '1000/1000'
  return {
    src: `https://picsum.photos/seed/vn-gallery-${i + 1}/${ratio}`,
    rowSpan: i % 5 === 0 ? 'row-span-2' : '',
  }
})

export default function Gallery() {
  const { t } = useLanguage()
  const [open, setOpen] = useState(null)

  const close = useCallback(() => setOpen(null), [])
  const next = useCallback(
    () => setOpen((i) => (i === null ? null : (i + 1) % PHOTOS.length)),
    [],
  )
  const prev = useCallback(
    () =>
      setOpen((i) =>
        i === null ? null : (i - 1 + PHOTOS.length) % PHOTOS.length,
      ),
    [],
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

        <div className="mt-14 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-[180px] md:auto-rows-[220px] gap-3 md:gap-4">
          {PHOTOS.map((p, i) => (
            <FadeIn
              key={p.src}
              delay={(i % 4) * 0.05}
              y={30}
              className={`relative group cursor-pointer overflow-hidden rounded-xl ${p.rowSpan}`}
            >
              <button
                onClick={() => setOpen(i)}
                className="absolute inset-0 w-full h-full"
                aria-label={`Open photo ${i + 1}`}
              >
                <img
                  src={p.src}
                  alt=""
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/15 transition-colors" />
              </button>
            </FadeIn>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {open !== null && (
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
              src={PHOTOS[open].src.replace(/\/\d+\/\d+$/, '/1600/1200')}
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
