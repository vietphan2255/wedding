import { Heart } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { useWeddingConfig } from '../contexts/WeddingConfigContext'
import ShareRow from './ShareRow.jsx'
import FadeIn from './FadeIn.jsx'

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
        <FadeIn>
          <p className="eyebrow">{t('footer.thanksEyebrow')}</p>
          <p className="font-display mt-4 text-2xl md:text-3xl leading-relaxed text-ink/90 max-w-2xl mx-auto">
            {t('footer.thankyou')}
          </p>
          <div className="divider-leaf my-8">
            <Heart size={16} className="text-accent" />
          </div>
        </FadeIn>

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
