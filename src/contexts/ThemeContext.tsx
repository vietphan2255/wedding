import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'

export type Theme = 'blush' | 'dark' | 'modern'

const THEMES: Theme[] = ['blush', 'dark', 'modern']
const STORAGE_KEY = 'vn-theme'

interface ThemeContextValue {
  theme: Theme
  themes: Theme[]
  setTheme: (next: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'blush',
  themes: THEMES,
  setTheme: () => {},
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'blush'
    const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null
    return stored && THEMES.includes(stored) ? stored : 'blush'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    window.localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const setTheme = useCallback((next: Theme) => {
    if (THEMES.includes(next)) setThemeState(next)
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, themes: THEMES, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
