import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { ref, onValue } from 'firebase/database'
import { db, isConfigured } from '../firebase/config'
import { DEFAULT_CONFIG } from './configDefaults'
import mergeConfig from './mergeConfig'
import type { ConfigSource, WeddingConfig } from './configTypes'

// Re-export the label key helpers so existing admin imports keep working.
export { encodeLabelKey, decodeLabelKey } from './configDefaults'
export { DEFAULT_CONFIG } from './configDefaults'

interface WeddingConfigContextValue {
  config: WeddingConfig
  loading: boolean
  source: ConfigSource
}

export const WeddingConfigContext = createContext<WeddingConfigContextValue>({
  config: DEFAULT_CONFIG,
  loading: true,
  source: 'default',
})

export function WeddingConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<WeddingConfig>(DEFAULT_CONFIG)
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState<ConfigSource>('default')

  useEffect(() => {
    if (!isConfigured || !db) {
      setLoading(false)
      return
    }
    const unsub = onValue(
      ref(db, 'config'),
      (snap) => {
        const data = snap.val()
        if (!data) {
          setConfig(DEFAULT_CONFIG)
          setSource('default')
        } else {
          setConfig(mergeConfig(data))
          setSource('firebase')
        }
        setLoading(false)
      },
      (err) => {
        console.error('[config] subscription failed', err)
        setLoading(false)
      },
    )
    return () => unsub()
  }, [])

  const value = useMemo(() => ({ config, loading, source }), [config, loading, source])
  return (
    <WeddingConfigContext.Provider value={value}>
      {children}
    </WeddingConfigContext.Provider>
  )
}

export const useWeddingConfig = () => useContext(WeddingConfigContext)
