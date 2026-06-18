import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'
import vi from '../i18n/vi.js'
import { useWeddingConfig } from './WeddingConfigContext'

type Dict = Record<string, string>
const DICT = vi as Dict

interface LanguageContextValue {
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextValue>({
  t: (k: string) => k,
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { config } = useWeddingConfig()
  const overrides = config?.labels?.vi

  const t = useCallback(
    (key: string): string => {
      const override = overrides?.[key]
      if (typeof override === 'string' && override.length > 0) return override
      return DICT[key] ?? key
    },
    [overrides],
  )

  const value = useMemo(() => ({ t }), [t])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export const useLanguage = () => useContext(LanguageContext)
