import { useState, useEffect, useLayoutEffect, useCallback, useMemo, useRef } from 'react'
import {
  motion,
  AnimatePresence,
  useScroll,
  useVelocity,
  useSpring,
  useTransform,
  useMotionValue,
  useAnimationFrame,
  useReducedMotion,
  wrap,
} from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { useWeddingConfig } from '../contexts/WeddingConfigContext'
import useFocusTrap from '../hooks/useFocusTrap'
import { GALLERY_BASE_VELOCITY } from '../lib/constants'
import SplitText from './fx/SplitText.jsx'
import SectionSubtitle from './SectionSubtitle.jsx'

// A single photo "plane". rotateY is driven by scroll velocity (passed as a
// motion value) so tiles tilt as the page scrolls and flatten when still.
function Tile({ p, photosLength, onOpen, tilt }) {
  return (
    <motion.button
      type="button"
      onClick={() => onOpen(p.globalIndex)}
      data-cursor="open"
      aria-label={`Open photo ${p.globalIndex + 1}`}
      style={tilt ? { rotateY: tilt } : undefined}
      whileHover={{ scale: 1.6 }}
      transition={{ type: 'spring', duration: 0.8, bounce: 0.15 }}
      className="group relative shrink-0 mr-5 md:mr-8 h-48 md:h-72 w-auto overflow-hidden rounded-xl cursor-pointer [backface-visibility:hidden] will-change-transform transition-shadow duration-300 hover:shadow-[0_22px_45px_-12px_rgba(0,0,0,0.55)] hover:z-10"
    >
      {/* Fixed height, auto width → each photo keeps its own aspect ratio and
          shows in full (no crop). */}
      <img
        src={p.src}
        alt=""
        loading="lazy"
        decoding="async"
        draggable={false}
        className="block h-full w-auto select-none"
      />
      <span className="absolute inset-0 bg-ink/0 group-hover:bg-ink/10 transition-colors" />
      <span className="absolute bottom-3 left-3 font-display text-bg text-sm tracking-widest tabular-nums opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
        {String(p.globalIndex + 1).padStart(2, '0')}
        <span className="opacity-60"> / {String(photosLength).padStart(2, '0')}</span>
      </span>
    </motion.button>
  )
}

// Horizontal ribbon whose offset is advanced every frame. The base drift is
// modulated by scroll velocity (speed) and its sign flips the direction, so
// scrolling down accelerates the ribbon and scrolling up reverses it. The row
// content is repeated enough times to always overflow the viewport and wrapped
// in pixels over one measured set width for a seamless loop.
function VelocityRow({ items, baseVelocity, velocityFactor, tilt, paused, onOpen, photosLength }) {
  const baseX = useMotionValue(0)
  const directionFactor = useRef(1)
  const containerRef = useRef(null)
  const trackRef = useRef(null)
  const periodRef = useRef(0)
  const [copies, setCopies] = useState(4)

  // Measure one set's pixel width and how many copies are needed to always
  // overflow the container — so the wrapped loop is truly seamless and never
  // reveals empty space at the seam. Runs before paint, on resize, and as
  // images load (their natural widths change the layout).
  useLayoutEffect(() => {
    const measure = () => {
      const cont = containerRef.current
      const track = trackRef.current
      if (!cont || !track) return
      // Tiles have varying widths (auto width per image aspect), so measure the
      // exact span of one set as the distance between the first tile of copy 1
      // and the first tile of copy 2 (includes the trailing gap). Wait until
      // the first image has a real width so we don't lock in a margins-only span.
      const first = track.children[0]
      const nextSet = track.children[items.length]
      if (!first || !nextSet || !first.offsetWidth) return
      const setW = nextSet.offsetLeft - first.offsetLeft
      if (!setW) return
      periodRef.current = setW
      // Re-base the accumulator into one period so the px wrap below stays in
      // range (and stops unbounded growth over long sessions).
      baseX.set(wrap(-setW, 0, baseX.get()))
      const needed = Math.min(12, Math.max(2, Math.ceil(cont.offsetWidth / setW) + 1))
      setCopies((c) => (c === needed ? c : needed))
    }
    measure()
    // Observe the container (viewport width) and the track (its width grows as
    // images load and take their natural width) so the period re-measures.
    const ro = new ResizeObserver(measure)
    if (containerRef.current) ro.observe(containerRef.current)
    if (trackRef.current) ro.observe(trackRef.current)
    return () => ro.disconnect()
  }, [items.length, baseX])

  // Wrap in pixels by the measured period; read it from a ref so it is always
  // current after a resize.
  const x = useTransform(baseX, (v) => {
    const p = periodRef.current
    return p ? `${wrap(-p, 0, v)}px` : '0px'
  })

  useAnimationFrame((t, delta) => {
    if (paused || !periodRef.current) return
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000)

    // Flip direction to follow the current scroll direction.
    if (velocityFactor.get() < 0) directionFactor.current = -1
    else if (velocityFactor.get() > 0) directionFactor.current = 1

    // Scroll speed boosts the base drift.
    moveBy += directionFactor.current * moveBy * velocityFactor.get()

    baseX.set(baseX.get() + moveBy)
  })

  // Enough copies that the track always exceeds the viewport at every wrap
  // position; spacing is per-tile margin so the seam matches internal spacing.
  const repeated = Array.from({ length: copies }, () => items).flat()

  return (
    <div
      ref={containerRef}
      className="relative has-[button:hover]:z-20"
      style={{ perspective: 1200, overflowX: 'clip', overflowY: 'visible' }}
    >
      <motion.div
        ref={trackRef}
        className="flex w-max will-change-transform"
        style={{ x }}
      >
        {repeated.map((p, i) => (
          <Tile
            key={`${p.id}-${i}`}
            p={p}
            photosLength={photosLength}
            onOpen={onOpen}
            tilt={tilt}
          />
        ))}
      </motion.div>
    </div>
  )
}

export default function Gallery() {
  const { t } = useLanguage()
  const { config } = useWeddingConfig()
  const reduce = useReducedMotion()
  // Admin can save a row without filling in `src`; those would otherwise reach
  // the marquee as `<img src="">` (= broken image), so the section appeared to
  // "go empty" the moment the firebase subscription replaced the default
  // entries. Filter at the consumer so admin still sees the rows and can fix
  // them.
  const photos = useMemo(
    () =>
      (config.gallery || []).filter(
        (p) => p && typeof p.src === 'string' && p.src.trim().length > 0,
      ),
    [config.gallery],
  )
  const [open, setOpen] = useState(null)
  const sectionRef = useRef(null)
  const dialogRef = useRef(null)
  const closeBtnRef = useRef(null)
  const [inView, setInView] = useState(false)
  const [tabHidden, setTabHidden] = useState(false)
  useFocusTrap(dialogRef, open !== null, closeBtnRef)

  // Scroll-velocity chain, shared by both rows. Smoothed so the ribbon eases
  // in/out of speed-ups instead of snapping.
  const { scrollY } = useScroll()
  const scrollVelocity = useVelocity(scrollY)
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 })
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
    clamp: false,
  })
  // 3D plane tilt — mirrored between the two rows so they lean opposite ways.
  const tiltA = useTransform(smoothVelocity, [-1500, 0, 1500], [22, 0, -22], {
    clamp: true,
  })
  const tiltB = useTransform(smoothVelocity, [-1500, 0, 1500], [-22, 0, 22], {
    clamp: true,
  })

  // Split photos into two rows, preserving each photo's global index for the
  // lightbox.
  const [rowA, rowB] = useMemo(() => {
    const a = []
    const b = []
    photos.forEach((p, i) => (i % 2 ? b : a).push({ ...p, globalIndex: i }))
    return [a, b]
  }, [photos])

  const openAt = useCallback((i) => setOpen(i), [])
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

  // Pause the marquee whenever the section is offscreen or the tab is hidden.
  useEffect(() => {
    const el = sectionRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: '100px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (typeof document === 'undefined') return
    const onVis = () => setTabHidden(document.hidden)
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  // Freeze the ribbon while the lightbox is open OR the section is offscreen/hidden.
  const paused = open !== null || !inView || tabHidden

  return (
    <section ref={sectionRef} id="gallery" data-cursor-id="gallery" className="section-padding relative bg-bg overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto">
          <p className="eyebrow">{t('gallery.eyebrow')}</p>
          <SplitText
            as="h2"
            text={t('gallery.title')}
            className="font-display mt-3 text-4xl md:text-6xl text-center"
          />
          <SectionSubtitle text={t('gallery.subhead')} />
          <div className="divider-leaf my-6">
            <span className="font-script text-2xl">{t('gallery.divider')}</span>
          </div>
          <p className="text-muted">{t('gallery.subtitle')}</p>
        </div>
      </div>

      {/* Full-bleed ribbon so photos run edge to edge. */}
      {reduce ? (
        <div className="mt-14 space-y-5 md:space-y-8">
          {[rowA, rowB].map((row, ri) => (
            <div
              key={ri}
              className="flex overflow-x-auto px-6 pb-2 [scrollbar-width:none]"
            >
              {row.map((p) => (
                <Tile
                  key={p.id}
                  p={p}
                  photosLength={photos.length}
                  onOpen={openAt}
                />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-14 space-y-5 md:space-y-8">
          <VelocityRow
            items={rowA}
            baseVelocity={GALLERY_BASE_VELOCITY}
            velocityFactor={velocityFactor}
            tilt={tiltA}
            paused={paused}
            onOpen={openAt}
            photosLength={photos.length}
          />
          <VelocityRow
            items={rowB}
            baseVelocity={-GALLERY_BASE_VELOCITY}
            velocityFactor={velocityFactor}
            tilt={tiltB}
            paused={paused}
            onOpen={openAt}
            photosLength={photos.length}
          />
        </div>
      )}

      <AnimatePresence>
        {open !== null && photos[open] && (
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={t('gallery.lightbox.label')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
            onClick={close}
          >
            <div className="absolute top-5 left-5 text-white/80 text-sm tracking-widest tabular-nums">
              {String(open + 1).padStart(2, '0')}
              <span className="opacity-50"> / {String(photos.length).padStart(2, '0')}</span>
            </div>
            <button
              ref={closeBtnRef}
              onClick={close}
              aria-label={t('gallery.lightbox.close')}
              data-cursor="close"
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <X size={22} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                prev()
              }}
              aria-label={t('gallery.lightbox.prev')}
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
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.6}
              onDragEnd={(_, info) => {
                if (Math.abs(info.offset.y) > 120) close()
              }}
              data-cursor="drag"
              className="max-w-[92vw] max-h-[88vh] rounded-lg object-contain shadow-2xl cursor-grab active:cursor-grabbing"
              alt={`${t('gallery.lightbox.alt')} ${open + 1} / ${photos.length}`}
            />
            <button
              onClick={(e) => {
                e.stopPropagation()
                next()
              }}
              aria-label={t('gallery.lightbox.next')}
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
