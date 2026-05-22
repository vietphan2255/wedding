import { Heart } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext.jsx'

export default function Footer() {
  const { t } = useLanguage()
  return (
    <footer className="bg-surface border-t border-line">
      <div className="max-w-7xl mx-auto px-6 py-14 text-center">
        <p className="font-script text-5xl md:text-6xl text-accent">Viet &amp; Nguyen</p>
        <p className="eyebrow mt-4">26.07.2026 · 02.08.2026</p>

        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted">
          <span>{t('footer.tagline')}</span>
          <Heart size={14} className="text-accent" />
        </div>

        <p className="mt-2 text-xs text-muted">
          {t('footer.contact')}{' '}
          <a
            href="mailto:hello@vietnguyen-wedding.com"
            className="underline hover:text-ink"
          >
            hello@vietnguyen-wedding.com
          </a>
        </p>
      </div>
    </footer>
  )
}
