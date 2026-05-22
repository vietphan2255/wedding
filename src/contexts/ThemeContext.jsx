import { createContext, useContext, useEffect, useState, useCallback } from 'react'

const THEMES = ['blush', 'dark', 'modern']
const STORAGE_KEY = 'vn-theme'

const ThemeContext = createContext({
  theme: 'blush',
  themes: THEMES,
  setTheme: () => {},
})

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    if (typeof window === 'undefined') return 'blush'
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return THEMES.includes(stored) ? stored : 'blush'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    window.localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const setTheme = useCallback((next) => {
    if (THEMES.includes(next)) setThemeState(next)
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, themes: THEMES, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
