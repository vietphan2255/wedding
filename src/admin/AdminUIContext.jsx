import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const STORAGE_KEY = 'vn-admin-lang'

const AdminUIContext = createContext({
  adminLang: 'en',
  setAdminLang: () => {},
})

export function AdminUIProvider({ children }) {
  const [adminLang, setAdminLangState] = useState(() => {
    if (typeof window === 'undefined') return 'en'
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored === 'vi' ? 'vi' : 'en'
  })

  const setAdminLang = useCallback((next) => {
    const v = next === 'vi' ? 'vi' : 'en'
    setAdminLangState(v)
    if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, v)
  }, [])

  const value = useMemo(() => ({ adminLang, setAdminLang }), [adminLang, setAdminLang])

  return <AdminUIContext.Provider value={value}>{children}</AdminUIContext.Provider>
}

export const useAdminUI = () => useContext(AdminUIContext)
