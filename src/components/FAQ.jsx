import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, HelpCircle } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { useWeddingConfig } from '../contexts/WeddingConfigContext'
import FadeIn from './FadeIn.jsx'
import SectionSubtitle from './SectionSubtitle.jsx'

export default function FAQ() {
  const { t } = useLanguage()
  const { config } = useWeddingConfig()
  const items = config.faqs || []
  const [openId, setOpenId] = useState(null)

  if (!items.length) return null

  return (
    <section id="faq" data-cursor-id="faq" className="section-padding relative bg-surface overflow-hidden">
      <div className="max-w-3xl mx-auto px-6">
        <FadeIn className="text-center">
          <p className="eyebrow">{t('faq.eyebrow')}</p>
          <h2 className="font-display section-title">
            {t('faq.title')}
          </h2>
          <SectionSubtitle text={t('faq.subhead')} />
          <div className="divider-leaf section-divider">
            <HelpCircle size={16} className="text-accent" />
          </div>
          <p className="text-muted section-desc">{t('faq.subtitle')}</p>
        </FadeIn>

        <ul className="mt-12 space-y-3">
          {items.map((item, i) => {
            const isOpen = openId === item.id
            const question = item.question_vi
            const answer = item.answer_vi
            return (
              <FadeIn key={item.id} delay={Math.min(i, 5) * 0.04} y={20}>
                <li className="rounded-2xl border border-line bg-bg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : item.id)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between gap-4 text-left px-5 md:px-6 py-4 md:py-5"
                  >
                    <span className="font-display text-lg md:text-xl">
                      {question}
                    </span>
                    <motion.span
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-accent shrink-0"
                    >
                      <Plus size={20} />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 md:px-6 pb-5 md:pb-6 -mt-1 text-sm md:text-base text-muted leading-relaxed">
                          {answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              </FadeIn>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
