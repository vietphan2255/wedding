import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Check, ExternalLink, Gift, ZoomIn, Download, X } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { useWeddingConfig } from '../contexts/WeddingConfigContext'
import useScrollLock from '../hooks/useScrollLock'
import { normalizePaypal } from '../lib/paypalUrl'
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

// lucide-react ships no brand icons — inline PayPal mark (Simple Icons path,
// CC0). currentColor lets it take the accent like the lucide glyphs around it.
function PaypalMark({ size = 18 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.816-5.09a.932.932 0 0 1 .923-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.777-4.471z" />
    </svg>
  )
}

// Compact full-width PayPal strip shown under the bank cards (and reused by
// GiftModal) — horizontal on ≥sm, stacked on phones. Renders nothing until a
// recognizable PayPal.Me link is configured; that doubles as the off switch.
export function PaypalBlock({ info, titleLabel, hintLabel, openLabel, copyLabel, copiedLabel }) {
  const paypal = normalizePaypal(info?.url)
  if (!paypal) return null
  return (
    <article className="rounded-3xl border border-line bg-surface shadow-xl px-6 py-5 flex flex-col sm:flex-row items-center sm:justify-between gap-4 text-center sm:text-left">
      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 min-w-0">
        <span className="flex-none w-11 h-11 rounded-full border border-line bg-bg/80 flex items-center justify-center text-accent">
          <PaypalMark />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] tracking-[0.22em] uppercase text-muted">{titleLabel}</p>
          {info.holder && <p className="mt-0.5 text-sm font-bold">{info.holder}</p>}
          {hintLabel && <p className="mt-0.5 text-xs text-muted">{hintLabel}</p>}
        </div>
      </div>
      <div className="flex-none flex items-center justify-center gap-2.5 flex-wrap">
        <a
          href={paypal.href}
          target="_blank"
          rel="noopener noreferrer"
          title={paypal.display}
          className="inline-flex items-center gap-1.5 rounded-full border border-accent bg-accent text-bg px-4 py-2 text-[11px] tracking-[0.16em] uppercase transition-opacity hover:opacity-90"
        >
          <ExternalLink size={13} />
          {openLabel}
        </a>
        <CopyButton value={paypal.href} label={copyLabel} labelCopied={copiedLabel} />
      </div>
    </article>
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
  // Mounted only while zoomed; the counted lock nests cleanly over an open
  // GiftModal's own lock.
  useScrollLock(true)

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation()
        onClose()
      }
    }
    document.addEventListener('keydown', onKey, true)
    return () => document.removeEventListener('keydown', onKey, true)
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
    <article className="relative h-full rounded-3xl border border-line bg-surface p-0 pb-4 overflow-hidden flex flex-col items-center text-center shadow shadow-xl">
      {hasImage ? (
        <>
          <button
            type="button"
            onClick={() => setZoomed(true)}
            aria-label={tapToZoomLabel}
            className="group relative block w-full max-w-[476px] mx-auto cursor-zoom-in rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          >
            <div className="relative aspect-[2/3] w-full rounded-t-2xl bg-ink overflow-hidden ring-1 ring-line/30 shadow-xl">
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
            {info.holder && <p className="text-sm text-muted font-bold">{info.holder}</p>}
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

  const paypalConfigured = Boolean(normalizePaypal(gifts.paypal?.url))
  const paypalLabels = {
    titleLabel: t('gift.paypalTitle'),
    hintLabel: t('gift.paypalHint'),
    openLabel: t('gift.paypalOpen'),
    copyLabel: t('gift.copy'),
    copiedLabel: t('gift.copied'),
  }

  return (
    <section
      id="gifts"
      data-cursor-id="gifts"
      className="section-padding relative bg-bg overflow-hidden"
    >
      <div className="max-w-5xl mx-auto px-6">
        <FadeIn className="text-center max-w-2xl mx-auto">
          <p className="eyebrow">{t('gift.eyebrow')}</p>
          <h2 className="font-display section-title">{t('gift.title')}</h2>
          <SectionSubtitle text={t('gift.subhead')} />
          <div className="divider-leaf section-divider">
            <Gift size={16} className="text-accent" />
          </div>
          <p className="text-muted section-desc">{t('gift.subtitle')}</p>
        </FadeIn>

        <div className="mt-12 grid md:grid-cols-2 gap-5 md:gap-6">
          <FadeIn delay={0.05}>
            <GiftBlock title={t('gift.groom')} info={gifts.groom || {}} {...labels} />
          </FadeIn>
          <FadeIn delay={0.12}>
            <GiftBlock title={t('gift.bride')} info={gifts.bride || {}} {...labels} />
          </FadeIn>
        </div>

        {paypalConfigured && (
          <FadeIn delay={0.18} className="mt-5 md:mt-6">
            <PaypalBlock info={gifts.paypal} {...paypalLabels} />
          </FadeIn>
        )}
      </div>
    </section>
  )
}
