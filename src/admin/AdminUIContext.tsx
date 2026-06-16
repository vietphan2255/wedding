import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Lang } from '../contexts/LanguageContext'

const STORAGE_KEY = 'vn-admin-lang'

interface AdminUIContextValue {
  adminLang: Lang
  setAdminLang: (next: Lang) => void
}

const AdminUIContext = createContext<AdminUIContextValue>({
  adminLang: 'en',
  setAdminLang: () => {},
})

export function AdminUIProvider({ children }: { children: ReactNode }) {
  const [adminLang, setAdminLangState] = useState<Lang>(() => {
    if (typeof window === 'undefined') return 'en'
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored === 'vi' ? 'vi' : 'en'
  })

  const setAdminLang = useCallback((next: Lang) => {
    const v: Lang = next === 'vi' ? 'vi' : 'en'
    setAdminLangState(v)
    if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, v)
  }, [])

  const value = useMemo(() => ({ adminLang, setAdminLang }), [adminLang, setAdminLang])

  return <AdminUIContext.Provider value={value}>{children}</AdminUIContext.Provider>
}

export const useAdminUI = () => useContext(AdminUIContext)
