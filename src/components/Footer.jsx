import { Heart } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext.jsx'
import { useWeddingConfig } from '../contexts/WeddingConfigContext.jsx'
import ShareRow from './ShareRow.jsx'

export default function Footer() {
  const { t } = useLanguage()
  const { config } = useWeddingConfig()
  const common = config?.common || {}
  const nameLeft = common.coupleNameLeft || 'Viet'
  const nameRight = common.coupleNameRight || 'Nguyen'
  const dateDisplay = common.dateDisplay || '26.07.2026 · 02.08.2026'
  const email = common.contactEmail || 'hello@vietnguyen-wedding.com'
  return (
    <footer className="bg-surface border-t border-line">
      <div className="max-w-7xl mx-auto px-6 py-14 text-center">
        <p className="font-script text-5xl md:text-6xl text-accent">
          {nameLeft} &amp; {nameRight}
        </p>
        <p className="eyebrow mt-4">{dateDisplay}</p>

        <div className="mt-10">
          <ShareRow />
        </div>

        <div className="mt-10 flex items-center justify-center gap-2 text-sm text-muted">
          <span>{t('footer.tagline')}</span>
          <Heart size={14} className="text-accent" />
        </div>

        <p className="mt-2 text-xs text-muted">
          {t('footer.contact')}{' '}
          <a href={`mailto:${email}`} className="underline hover:text-ink">
            {email}
          </a>
        </p>
      </div>
    </footer>
  )
}
