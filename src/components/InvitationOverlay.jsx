import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../contexts/LanguageContext'
import { useWeddingConfig } from '../contexts/WeddingConfigContext'
import EnvelopeIntro from './EnvelopeIntro.jsx'

const STORAGE_KEY = 'vn-invitation-opened'

export default function InvitationOverlay() {
  const { t } = useLanguage()
  const { config } = useWeddingConfig()
  const letter = (config.invitation?.letterImage || '').trim()
  const [visible, setVisible] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (sessionStorage.getItem(STORAGE_KEY) === '1') return
    setVisible(true)
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const handleOpen = () => {
    if (open) return
    setOpen(true)
    window.setTimeout(() => {
      sessionStorage.setItem(STORAGE_KEY, '1')
      setVisible(false)
      document.body.style.overflow = ''
    }, 3000)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={handleOpen}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          aria-label={t('invitation.tap')}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-bg text-ink film-grain cursor-pointer focus:outline-none"
        >
          <EnvelopeIntro open={open} letterImage={letter} />

          <motion.span
            initial={{ opacity: 0 }}
            animate={open ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="absolute bottom-10 inset-x-0 text-center eyebrow text-muted"
          >
            {t('invitation.tap')}
          </motion.span>
        </motion.button>
      )}
    </AnimatePresence>
  )
}
