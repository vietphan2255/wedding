import { Send, Heart, Gift } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { useWeddingConfig } from '../contexts/WeddingConfigContext'
import { useMusic, MusicGlyph } from '../contexts/MusicContext'

/**
 * Desktop-only quick actions (bottom-right). On phones this is hidden and its
 * actions live in the MobileRsvpBar tab bar instead. The background music is
 * owned by MusicProvider; the button here just reflects + toggles it.
 *
 * @param {{ onGiftClick?: () => void }} props `onGiftClick` opens the gift
 *   modal; when omitted (e.g. the engagement page) the Gift button is hidden.
 */
export default function FloatingDock({ onGiftClick }) {
  const { t } = useLanguage()
  const { config } = useWeddingConfig()
  const giftsEnabled = config.gifts?.enabled !== false
  const onHome =
    typeof window !== 'undefined' &&
    (window.location.pathname === '/' || window.location.pathname === '')
  const rsvpHref = onHome ? '#rsvp' : '/#rsvp'
  const wishesHref = onHome ? '#wishes' : '/#wishes'

  return (
    <div className="hidden md:flex fixed bottom-5 right-5 z-50 flex-col-reverse gap-3 items-end">
      <MusicButton />
      <DockButton href={wishesHref} label={t('nav.wishes')}>
        <Heart size={18} />
      </DockButton>
      <DockButton href={rsvpHref} label={t('nav.rsvp')}>
        <Send size={18} />
      </DockButton>
      {giftsEnabled && onGiftClick && (
        <DockButton onClick={onGiftClick} label={t('nav.gift')}>
          <Gift size={18} />
        </DockButton>
      )}
    </div>
  )
}

function DockButton({ href, onClick, label, children }) {
  const className =
    'w-12 h-12 rounded-full bg-accent text-bg shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform'
  return (
    <div className="group relative flex items-center">
      <span className="hidden sm:block absolute right-full mr-3 px-2.5 py-1 rounded-md bg-ink text-bg text-[11px] tracking-[0.18em] uppercase whitespace-nowrap opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 -translate-x-1 group-hover:translate-x-0 group-focus-within:translate-x-0 transition-all duration-200 pointer-events-none">
        {label}
      </span>
      {href ? (
        <a href={href} aria-label={label} title={label} className={className}>
          {children}
        </a>
      ) : (
        <button
          type="button"
          onClick={onClick}
          aria-label={label}
          title={label}
          className={className}
        >
          {children}
        </button>
      )}
    </div>
  )
}

function MusicButton() {
  const { enabled, playing, toggle, title } = useMusic()
  if (!enabled) return null

  return (
    <div className="group relative flex items-center">
      <span className="hidden sm:block absolute right-full mr-3 px-2.5 py-1 rounded-md bg-ink text-bg text-[11px] tracking-[0.18em] uppercase whitespace-nowrap opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200 pointer-events-none">
        {title || (playing ? 'Pause' : 'Play')}
      </span>
      <button
        type="button"
        onClick={toggle}
        data-music-toggle="true"
        aria-label={playing ? 'Pause background music' : 'Play background music'}
        className="w-12 h-12 rounded-full bg-accent text-bg shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
      >
        <MusicGlyph playing={playing} />
      </button>
    </div>
  )
}
