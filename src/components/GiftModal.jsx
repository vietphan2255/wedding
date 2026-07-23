import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Gift } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { useWeddingConfig } from '../contexts/WeddingConfigContext'
import useScrollLock from '../hooks/useScrollLock'
import { normalizePaypal } from '../lib/paypalUrl'
import { GiftBlock, PaypalBlock } from './GiftCard.jsx'

// Quick-access gift modal: the same bride/groom account cards (plus the PayPal
// strip when configured) shown in the #gifts section, reachable from the
// FloatingDock and MobileRsvpBar without scrolling. Open/close state is owned
// by App (WeddingSite).
export default function GiftModal({ open, onClose }) {
  const { t } = useLanguage()
  const { config } = useWeddingConfig()
  const gifts = config.gifts || {}
  // Which account to show on phones (desktop shows both side by side).
  const [side, setSide] = useState('groom')

  // Lock background scroll (incl. stopping Lenis) while the modal is open.
  useScrollLock(open)

  // Esc to close.
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

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
  // The paypal tab can outlive its config (`side` survives close/reopen, and
  // the admin can clear the link live) — fall back to groom, not a blank pane.
  const effectiveSide = side === 'paypal' && !paypalConfigured ? 'groom' : side

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[110] flex items-end md:items-center justify-center md:p-6"
        >
          {/* Backdrop — clicking it closes the modal */}
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
          />

          {/* Panel — bottom sheet on phones, centered card on desktop.
              data-lenis-prevent: Lenis checks it before its stopped-guard, so
              wheel/touch over this scrollable panel scroll it natively while
              the page behind stays frozen. */}
          <motion.div
            role="dialog"
            aria-modal="true"
            data-lenis-prevent
            initial={{ y: 48, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 48, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 220, damping: 26 }}
            className="relative w-full md:max-w-3xl max-h-[88vh] overflow-y-auto bg-bg border border-line shadow-2xl rounded-t-3xl md:rounded-3xl p-6 md:p-8"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute top-4 right-4 w-9 h-9 rounded-full border border-line bg-bg/80 flex items-center justify-center text-ink/70 hover:text-ink hover:bg-ink/5 transition"
            >
              <X size={18} />
            </button>

            {/* Minimal title — keeps the cards as high as possible on desktop */}
            <div className="flex items-center justify-center gap-2 pr-10">
              <Gift size={18} className="text-accent" />
              <h2 className="font-display text-2xl">{t('gift.title')}</h2>
            </div>

            {/* Desktop: both accounts side by side, PayPal strip below */}
            <div className="hidden md:grid md:grid-cols-2 gap-5 mt-6">
              <GiftBlock title={t('gift.groom')} info={gifts.groom || {}} {...labels} />
              <GiftBlock title={t('gift.bride')} info={gifts.bride || {}} {...labels} />
            </div>
            {paypalConfigured && (
              <div className="hidden md:block mt-5">
                <PaypalBlock info={gifts.paypal} {...paypalLabels} />
              </div>
            )}

            {/* Mobile: one account at a time via a segmented control (groom /
                bride / paypal when configured) */}
            <div className="md:hidden mt-6">
              <div className="flex justify-center">
                <div className="inline-flex rounded-full border border-line bg-surface p-1">
                  {[
                    { key: 'groom', label: t('gift.tabGroom') },
                    { key: 'bride', label: t('gift.tabBride') },
                    ...(paypalConfigured ? [{ key: 'paypal', label: t('gift.tabPaypal') }] : []),
                  ].map((s) => (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setSide(s.key)}
                      aria-pressed={effectiveSide === s.key}
                      className={`rounded-full px-5 py-2 text-sm tracking-wide transition ${
                        effectiveSide === s.key ? 'bg-accent text-bg' : 'text-ink/70 hover:text-ink'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-5">
                {effectiveSide === 'paypal' ? (
                  <PaypalBlock info={gifts.paypal} {...paypalLabels} />
                ) : (
                  <GiftBlock
                    title={effectiveSide === 'groom' ? t('gift.groom') : t('gift.bride')}
                    info={(effectiveSide === 'groom' ? gifts.groom : gifts.bride) || {}}
                    {...labels}
                  />
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
