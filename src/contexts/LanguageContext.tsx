import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'
import en from '../i18n/en.js'
import vi from '../i18n/vi.js'
import { useWeddingConfig } from './WeddingConfigContext'

export type Lang = 'en' | 'vi'

type Dict = Record<string, string>
const DICTS: Record<Lang, Dict> = { en: en as Dict, vi: vi as Dict }
const LANGS: Lang[] = ['en', 'vi']
const STORAGE_KEY = 'vn-lang'

interface LanguageContextValue {
  lang: Lang
  langs: Lang[]
  t: (key: string) => string
  setLang: (next: Lang) => void
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'en',
  langs: LANGS,
  t: (k: string) => k,
  setLang: () => {},
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { config } = useWeddingConfig()
  const overrides = config?.labels || { en: {}, vi: {} }

  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === 'undefined') return 'en'
    const stored = window.localStorage.getItem(STORAGE_KEY) as Lang | null
    if (stored && LANGS.includes(stored)) return stored
    const browser = (navigator.language || 'en').slice(0, 2) as Lang
    return LANGS.includes(browser) ? browser : 'en'
  })

  useEffect(() => {
    document.documentElement.setAttribute('lang', lang)
    window.localStorage.setItem(STORAGE_KEY, lang)
  }, [lang])

  const setLang = useCallback((next: Lang) => {
    if (LANGS.includes(next)) setLangState(next)
  }, [])

  const langOverrides = overrides[lang] || {}
  const enOverrides = overrides.en || {}

  const t = useCallback(
    (key: string): string => {
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

  const value = useMemo(
    () => ({ lang, langs: LANGS, t, setLang }),
    [lang, t, setLang],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export const useLanguage = () => useContext(LanguageContext)
