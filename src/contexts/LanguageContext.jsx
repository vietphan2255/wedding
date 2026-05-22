import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import en from '../i18n/en.js'
import vi from '../i18n/vi.js'

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

  const t = useCallback(
    (key) => {
      const dict = DICTS[lang] || DICTS.en
      return dict[key] ?? DICTS.en[key] ?? key
    },
    [lang],
  )

  const value = useMemo(() => ({ lang, langs: LANGS, t, setLang }), [lang, t, setLang])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export const useLanguage = () => useContext(LanguageContext)
