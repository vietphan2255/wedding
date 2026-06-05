import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { ref, set } from 'firebase/database'
import { db, isConfigured } from '../firebase/config.js'
import { useWeddingConfig } from '../contexts/WeddingConfigContext.jsx'

const DraftConfigContext = createContext(null)

export function DraftConfigProvider({ children }) {
  const { config: saved } = useWeddingConfig()
  const [draft, setDraft] = useState(saved)

  useEffect(() => {
    setDraft(saved)
  }, [saved])

  const setSlice = useCallback((key, updater) => {
    setDraft((d) => {
      const next = typeof updater === 'function' ? updater(d[key]) : updater
      return { ...d, [key]: next }
    })
  }, [])

  // Passing `valueOverride` lets a section normalize (trim / clamp / Boolean) right
  // before writing without first round-tripping through setSlice + a render.
  const saveSlice = useCallback(
    async (key, valueOverride) => {
      if (!isConfigured || !db) throw new Error('Firebase is not configured.')
      const value = valueOverride !== undefined ? valueOverride : draft[key]
      await set(ref(db, `config/${key}`), value ?? null)
    },
    [draft],
  )

  const isSliceDirty = useCallback(
    (key) => JSON.stringify(draft[key]) !== JSON.stringify(saved[key]),
    [draft, saved],
  )

  const value = useMemo(
    () => ({ draft, saved, setSlice, saveSlice, isSliceDirty }),
    [draft, saved, setSlice, saveSlice, isSliceDirty],
  )

  return (
    <DraftConfigContext.Provider value={value}>
      {children}
    </DraftConfigContext.Provider>
  )
}

export const useDraftConfig = () => useContext(DraftConfigContext)
