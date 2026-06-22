import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Check, Gift, ZoomIn, Download, X } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { useWeddingConfig } from '../contexts/WeddingConfigContext'
import FadeIn from './FadeIn.jsx'
import SectionSubtitle from './SectionSubtitle.jsx'

function CopyButton({ value, label, labelCopied }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      const el = document.createElement('textarea')
      el.value = value
      document.body.appendChild(el)
      el.select()
      try {
        document.execCommand('copy')
      } catch {
        /* ignore */
      }
      document.body.removeChild(el)
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1.5 rounded-full border border-line bg-bg/80 hover:bg-accent hover:text-bg hover:border-accent px-3 py-1.5 text-[11px] tracking-[0.16em] uppercase text-ink/80 transition-colors"
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="ok"
            initial={{ scale: 0.6 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.6 }}
            transition={{ duration: 0.15 }}
            className="inline-flex items-center gap-1.5"
          >
            <Check size={12} />
            {labelCopied}
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={{ scale: 0.6 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.6 }}
            transition={{ duration: 0.15 }}
            className="inline-flex items-center gap-1.5"
          >
            <Copy size={12} />
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}

// Derive a sensible download filename from the image URL (e.g. "groom.png"),
// falling back to a generic name for query-string / extension-less URLs.
function downloadNameFor(url) {
  try {
    const base = url.split('?')[0].split('/').pop()
    return base && /\.(png|jpe?g|webp)$/i.test(base) ? base : 'qr.png'
  } catch {
    return 'qr.png'
  }
}

// Full-screen zoom for a single QR portrait. Mirrors the GalleryV2 lightbox
// (backdrop click + Esc + drag-to-dismiss) and sits at z-[120] so it layers
// above GiftModal (z-[110]). The capture-phase Esc handler stops the event so
// closing the zoom does not also close an open GiftModal.
function QrLightbox({ src, alt, saveLabel, downloadName, onClose }) {
  useEffect(() => {
    const onKey = (e) => {
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
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
      className="fixed inset-0 z-[120] bg-black/90 flex items-center justify-center p-4"
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
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.6}
        onDragEnd={(_, info) => {
          if (Math.abs(info.offset.y) > 120) onClose()
        }}
        className="max-w-[92vw] max-h-[82vh] rounded-xl object-contain shadow-2xl cursor-grab active:cursor-grabbing"
      />

      <a
        href={src}
        download={downloadName}
        onClick={(e) => e.stopPropagation()}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 text-xs tracking-[0.16em] uppercase transition backdrop-blur-sm"
      >
        <Download size={15} />
        {saveLabel}
      </a>
    </motion.div>
  )
}

export function GiftBlock({
  title,
  info,
  copyLabel,
  copiedLabel,
  holderLabel,
  accountLabel,
  qrLabel,
  saveLabel,
  tapToZoomLabel,
}) {
  const [zoomed, setZoomed] = useState(false)
  const [imgError, setImgError] = useState(false)
  // Treat a configured-but-broken image (e.g. bride.png not added yet) as "no
  // image" and fall through to the text card.
  const hasImage = Boolean(info.qrUrl) && !imgError
  const downloadName = info.qrUrl ? downloadNameFor(info.qrUrl) : 'qr.png'

  return (
    <article className="relative h-full rounded-3xl border border-line bg-surface p-6 md:p-7 overflow-hidden flex flex-col items-center text-center">
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

      <p className="eyebrow text-accent flex items-center gap-2">
        <Gift size={12} />
        {title}
      </p>

      {hasImage ? (
        <>
          <button
            type="button"
            onClick={() => setZoomed(true)}
            aria-label={tapToZoomLabel}
            className="group relative mt-5 block w-full max-w-[340px] mx-auto cursor-zoom-in rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          >
            <div className="relative aspect-[2/3] rounded-2xl bg-ink overflow-hidden ring-1 ring-line/30 shadow-xl">
              <img
                src={info.qrUrl}
                alt={qrLabel}
                loading="lazy"
                onError={() => setImgError(true)}
                className="absolute inset-0 w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
              />
              <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 bg-gradient-to-t from-black/55 to-transparent pt-8 pb-3 text-[11px] tracking-[0.16em] uppercase text-white/90 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                <ZoomIn size={13} />
                {tapToZoomLabel}
              </span>
            </div>
          </button>

          <div className="mt-5 space-y-1">
            {info.holder && <p className="text-sm text-muted">{info.holder}</p>}
            {info.account && (
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <span className="font-display text-xl tabular-nums tracking-wider">
                  {info.account}
                </span>
                <CopyButton
                  value={info.account.replace(/\s+/g, '')}
                  label={copyLabel}
                  labelCopied={copiedLabel}
                />
              </div>
            )}
          </div>

          <a
            href={info.qrUrl}
            download={downloadName}
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-line bg-bg/80 hover:bg-accent hover:text-bg hover:border-accent px-4 py-2 text-[11px] tracking-[0.16em] uppercase text-ink/80 transition-colors"
          >
            <Download size={14} />
            {saveLabel}
          </a>
        </>
      ) : (
        // Fallback when no QR portrait is set yet: show the transferable text so
        // the card still works (e.g. the bride side before bride.png is added).
        <dl className="mt-6 w-full max-w-xs space-y-4 text-sm">
          <div>
            <dt className="text-[11px] tracking-[0.22em] uppercase text-muted">
              {holderLabel}
            </dt>
            <dd className="mt-1">{info.holder || '—'}</dd>
          </div>
          <div>
            <dt className="text-[11px] tracking-[0.22em] uppercase text-muted">
              {accountLabel}
            </dt>
            <dd className="mt-1 flex items-center justify-center gap-3 flex-wrap">
              <span className="font-display text-2xl tabular-nums tracking-wider">
                {info.account || '—'}
              </span>
              {info.account && (
                <CopyButton
                  value={info.account.replace(/\s+/g, '')}
                  label={copyLabel}
                  labelCopied={copiedLabel}
                />
              )}
            </dd>
          </div>
        </dl>
      )}

      <AnimatePresence>
        {zoomed && (
          <QrLightbox
            src={info.qrUrl}
            alt={qrLabel}
            saveLabel={saveLabel}
            downloadName={downloadName}
            onClose={() => setZoomed(false)}
          />
        )}
      </AnimatePresence>
    </article>
  )
}

export default function GiftCard() {
  const { t } = useLanguage()
  const { config } = useWeddingConfig()
  const gifts = config.gifts || {}

  if (gifts.enabled === false) return null

  const labels = {
    copyLabel: t('gift.copy'),
    copiedLabel: t('gift.copied'),
    holderLabel: t('gift.holder'),
    accountLabel: t('gift.account'),
    qrLabel: t('gift.qrLabel'),
    saveLabel: t('gift.save'),
    tapToZoomLabel: t('gift.tapToZoom'),
  }

  return (
    <section id="gifts" data-cursor-id="gifts" className="section-padding relative bg-bg overflow-hidden">
      <div className="max-w-5xl mx-auto px-6">
        <FadeIn className="text-center max-w-2xl mx-auto">
          <p className="eyebrow">{t('gift.eyebrow')}</p>
          <h2 className="font-display mt-3 text-4xl md:text-6xl">
            {t('gift.title')}
          </h2>
          <SectionSubtitle text={t('gift.subhead')} />
          <div className="divider-leaf my-6">
            <Gift size={16} className="text-accent" />
          </div>
          <p className="text-muted">{t('gift.subtitle')}</p>
        </FadeIn>

        <div className="mt-12 grid md:grid-cols-2 gap-5 md:gap-6">
          <FadeIn delay={0.05}>
            <GiftBlock title={t('gift.bride')} info={gifts.bride || {}} {...labels} />
          </FadeIn>
          <FadeIn delay={0.12}>
            <GiftBlock title={t('gift.groom')} info={gifts.groom || {}} {...labels} />
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
