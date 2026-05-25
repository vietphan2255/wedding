import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Facebook, MessageCircle, Link2, Check } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext.jsx'

function ZaloIcon({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2C6.48 2 2 6.04 2 11c0 2.42 1.07 4.6 2.82 6.2L4 22l5.06-1.6c.92.25 1.9.39 2.94.39 5.52 0 10-4.04 10-9S17.52 2 12 2zM7.7 12.7l-1.8 2.2h2v.8H4.7v-.8L6.5 12.7h-1.8v-.8H7.7v.8zm2.6 3h-.9V12h.9v3.7zm-.45-4.2a.55.55 0 1 1 0-1.1.55.55 0 0 1 0 1.1zm5.1 4.2h-.85v-.45c-.3.35-.7.55-1.2.55-1 0-1.7-.8-1.7-1.95s.7-1.95 1.7-1.95c.5 0 .9.2 1.2.55V12h.85v3.7zm-1.95-.7c.55 0 .95-.5.95-1.15s-.4-1.15-.95-1.15c-.6 0-1 .5-1 1.15s.4 1.15 1 1.15zm4.65.7H17v-3.7h.65V15.7zm0-4.2a.55.55 0 1 1 0-1.1.55.55 0 0 1 0 1.1z" />
    </svg>
  )
}

function MessengerIcon({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2C6.48 2 2 6.13 2 11.16c0 2.86 1.45 5.4 3.71 7.07V22l3.4-1.87c.91.25 1.88.39 2.89.39 5.52 0 10-4.13 10-9.16C22 6.13 17.52 2 12 2zm.92 12.34l-2.55-2.72-4.97 2.72 5.46-5.8 2.61 2.72 4.91-2.72-5.46 5.8z" />
    </svg>
  )
}

function WhatsAppIcon({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.47 14.38c-.27-.13-1.59-.78-1.84-.87-.25-.09-.43-.13-.61.13-.18.27-.7.87-.86 1.05-.16.18-.32.2-.59.07-.27-.13-1.14-.42-2.17-1.34-.8-.71-1.34-1.59-1.5-1.86-.16-.27-.02-.41.12-.55.12-.12.27-.32.4-.48.13-.16.18-.27.27-.45.09-.18.04-.34-.02-.48-.07-.13-.61-1.46-.84-2-.22-.53-.45-.45-.61-.46-.16-.01-.34-.01-.52-.01s-.48.07-.73.34c-.25.27-.96.94-.96 2.29 0 1.35.98 2.65 1.12 2.83.14.18 1.93 2.95 4.68 4.13.65.28 1.16.45 1.56.58.66.21 1.26.18 1.73.11.53-.08 1.59-.65 1.82-1.28.22-.63.22-1.17.16-1.28-.07-.11-.25-.18-.52-.31zM12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.38 5.07L2 22l4.97-1.36C8.42 21.49 10.15 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" />
    </svg>
  )
}

export default function ShareRow() {
  const { t } = useLanguage()
  const [copied, setCopied] = useState(false)

  const url =
    typeof window !== 'undefined'
      ? window.location.origin + '/'
      : 'https://example.com/'
  const text = t('share.caption')

  const links = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    messenger: `https://www.facebook.com/dialog/send?link=${encodeURIComponent(
      url,
    )}&app_id=140586622674265&redirect_uri=${encodeURIComponent(url)}`,
    zalo: `https://zalo.me/share?u=${encodeURIComponent(url)}&t=${encodeURIComponent(text)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const el = document.createElement('textarea')
      el.value = url
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

  const buttons = [
    {
      key: 'facebook',
      label: t('share.facebook'),
      icon: <Facebook size={16} />,
      href: links.facebook,
    },
    {
      key: 'messenger',
      label: t('share.messenger'),
      icon: <MessengerIcon size={16} />,
      href: links.messenger,
    },
    {
      key: 'zalo',
      label: t('share.zalo'),
      icon: <ZaloIcon size={16} />,
      href: links.zalo,
    },
    {
      key: 'whatsapp',
      label: t('share.whatsapp'),
      icon: <WhatsAppIcon size={16} />,
      href: links.whatsapp,
    },
  ]

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="eyebrow">{t('share.title')}</p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {buttons.map((b) => (
          <a
            key={b.key}
            href={b.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={b.label}
            title={b.label}
            className="w-10 h-10 rounded-full border border-line bg-bg/60 hover:bg-accent hover:text-bg hover:border-accent text-ink/80 flex items-center justify-center transition-colors"
          >
            {b.icon}
          </a>
        ))}
        <button
          type="button"
          onClick={copyLink}
          aria-label={t('share.copy')}
          title={t('share.copy')}
          className="relative w-10 h-10 rounded-full border border-line bg-bg/60 hover:bg-accent hover:text-bg hover:border-accent text-ink/80 flex items-center justify-center transition-colors"
        >
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.span
                key="check"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="inline-flex"
              >
                <Check size={16} />
              </motion.span>
            ) : (
              <motion.span
                key="link"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="inline-flex"
              >
                <Link2 size={16} />
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
      <AnimatePresence>
        {copied && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="text-xs text-accent"
            role="status"
          >
            {t('share.copied')}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
