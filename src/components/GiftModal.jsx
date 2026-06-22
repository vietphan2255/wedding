import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Gift } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { useWeddingConfig } from '../contexts/WeddingConfigContext'
import { GiftBlock } from './GiftCard.jsx'

// Quick-access gift modal: the same bride/groom account cards shown in the
// #gifts section, reachable from the FloatingDock and MobileRsvpBar without
// scrolling. Open/close state is owned by App (WeddingSite).
export default function GiftModal({ open, onClose }) {
  const { t } = useLanguage()
  const { config } = useWeddingConfig()
  const gifts = config.gifts || {}

  // Esc to close + lock background scroll while the modal is open.
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
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

          {/* Panel — bottom sheet on phones, centered card on desktop */}
          <motion.div
            role="dialog"
            aria-modal="true"
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

            <div className="text-center max-w-xl mx-auto">
              <p className="eyebrow">{t('gift.eyebrow')}</p>
              <h2 className="font-display mt-2 text-3xl md:text-4xl">
                {t('gift.title')}
              </h2>
              <div className="divider-leaf my-4">
                <Gift size={16} className="text-accent" />
              </div>
              <p className="text-muted text-sm">{t('gift.subtitle')}</p>
            </div>

            <div className="mt-8 grid md:grid-cols-2 gap-5">
              <GiftBlock title={t('gift.groom')} info={gifts.groom || {}} {...labels} />
              <GiftBlock title={t('gift.bride')} info={gifts.bride || {}} {...labels} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
