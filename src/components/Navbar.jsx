import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { useWeddingConfig } from '../contexts/WeddingConfigContext'
import ThemeSwitcher from './ThemeSwitcher.jsx'

const LINKS = [
  ['/#invitation', 'nav.invitation'],
  ['/#story', 'nav.story'],
  ['/#gallery', 'nav.gallery'],
  ['/#ceremonies', 'nav.timeline'],
  ['/#rsvp', 'nav.rsvp'],
  ['/#wishes', 'nav.wishes'],
]

export default function Navbar() {
  const { t } = useLanguage()
  const { config } = useWeddingConfig()
  const initialLeft = config?.common?.coupleInitialLeft || 'V'
  const initialRight = config?.common?.coupleInitialRight || 'N'
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled ? 'glass shadow-[0_1px_0_var(--color-line)]' : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="font-display text-xl tracking-wider">
          {initialLeft} <span className="text-accent">&</span> {initialRight}
        </Link>

        <ul className="hidden md:flex items-center gap-7 text-[12px] tracking-[0.22em] uppercase">
          {LINKS.map(([href, key]) => (
            <li key={href}>
              <a
                href={href}
                className="text-ink/80 hover:text-ink transition-colors"
              >
                {t(key)}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-2">
          <ThemeSwitcher />
        </div>

        <button
          aria-label="Toggle menu"
          className="md:hidden p-2 -mr-2 text-ink"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden glass border-t border-line px-6 py-6"
          >
            <ul className="flex flex-col gap-4 text-sm tracking-[0.18em] uppercase">
              {LINKS.map(([href, key]) => (
                <li key={href}>
                  <a
                    href={href}
                    onClick={() => setOpen(false)}
                    className="block py-1 text-ink/85 hover:text-ink"
                  >
                    {t(key)}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex items-center justify-end gap-3">
              <ThemeSwitcher />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
