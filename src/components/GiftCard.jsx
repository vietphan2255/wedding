import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Check, Gift, QrCode } from 'lucide-react'
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

function GiftBlock({ title, info, copyLabel, copiedLabel, bankLabel, holderLabel, accountLabel, qrLabel }) {
  return (
    <article className="relative h-full rounded-3xl border border-line bg-surface p-7 md:p-8 overflow-hidden">
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-accent/10 blur-3xl" />
      <p className="eyebrow text-accent flex items-center gap-2">
        <Gift size={12} />
        {title}
      </p>

      <dl className="mt-6 space-y-4 text-sm">
        <div>
          <dt className="text-[11px] tracking-[0.22em] uppercase text-muted">
            {bankLabel}
          </dt>
          <dd className="font-display text-2xl mt-1">{info.bank || '—'}</dd>
        </div>
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
          <dd className="mt-1 flex items-center gap-3 flex-wrap">
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

      {info.qrUrl && (
        <div className="mt-6 pt-6 border-t border-line flex items-center gap-4">
          <div className="w-24 h-24 rounded-xl border border-line bg-bg p-1.5 shrink-0">
            <img
              src={info.qrUrl}
              alt={qrLabel}
              className="w-full h-full object-contain"
              loading="lazy"
            />
          </div>
          <p className="text-xs text-muted leading-relaxed flex items-center gap-2">
            <QrCode size={14} className="text-accent shrink-0" />
            {qrLabel}
          </p>
        </div>
      )}
    </article>
  )
}

export default function GiftCard() {
  const { t } = useLanguage()
  const { config } = useWeddingConfig()
  const gifts = config.gifts || {}

  if (gifts.enabled === false) return null

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
            <GiftBlock
              title={t('gift.bride')}
              info={gifts.bride || {}}
              copyLabel={t('gift.copy')}
              copiedLabel={t('gift.copied')}
              bankLabel={t('gift.bank')}
              holderLabel={t('gift.holder')}
              accountLabel={t('gift.account')}
              qrLabel={t('gift.qrLabel')}
            />
          </FadeIn>
          <FadeIn delay={0.12}>
            <GiftBlock
              title={t('gift.groom')}
              info={gifts.groom || {}}
              copyLabel={t('gift.copy')}
              copiedLabel={t('gift.copied')}
              bankLabel={t('gift.bank')}
              holderLabel={t('gift.holder')}
              accountLabel={t('gift.account')}
              qrLabel={t('gift.qrLabel')}
            />
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
