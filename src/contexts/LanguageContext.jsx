import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import en from '../i18n/en.js'
import vi from '../i18n/vi.js'
import { useWeddingConfig } from './WeddingConfigContext.jsx'

const DICTS = { en, vi }
const LANGS = ['en', 'vi']
const STORAGE_KEY = 'vn-lang'

const LanguageContext = createContext({
  lang: 'en',
  langs: LANGS,
  t: (k) => k,
  setLang: () => {},
})

export function LanguageProvider({ children }) {
  const { config } = useWeddingConfig()
  const overrides = config?.labels || { en: {}, vi: {} }

  const [lang, setLangState] = useState(() => {
    if (typeof window === 'undefined') return 'en'
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (LANGS.includes(stored)) return stored
    const browser = (navigator.language || 'en').slice(0, 2)
    return LANGS.includes(browser) ? browser : 'en'
  })

  useEffect(() => {
    document.documentElement.setAttribute('lang', lang)
    window.localStorage.setItem(STORAGE_KEY, lang)
  }, [lang])

  const setLang = useCallback((next) => {
    if (LANGS.includes(next)) setLangState(next)
  }, [])

  const langOverrides = overrides[lang] || {}
  const enOverrides = overrides.en || {}

  const t = useCallback(
    (key) => {
      const override = langOverrides[key]
      if (typeof override === 'string' && override.length > 0) return override
      const enOverride = enOverrides[key]
      const dict = DICTS[lang] || DICTS.en
      const fallback = dict[key] ?? DICTS.en[key] ?? key
      // EN override is used as the cross-language fallback when the target
      // language has no override AND its dict has no entry.
      if (dict[key] === undefined && typeof enOverride === 'string' && enOverride.length > 0) {
        return enOverride
      }
      return fallback
    },
    [lang, langOverrides, enOverrides],
  )

  const value = useMemo(() => ({ lang, langs: LANGS, t, setLang }), [lang, t, setLang])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export const useLanguage = () => useContext(LanguageContext)
