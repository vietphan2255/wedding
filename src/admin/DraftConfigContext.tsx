import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { ref, set } from 'firebase/database'
import { db, isConfigured } from '../firebase/config'
import { useWeddingConfig } from '../contexts/WeddingConfigContext'
import type { WeddingConfig } from '../contexts/configTypes'

type SliceKey = keyof WeddingConfig
type SliceValue = WeddingConfig[SliceKey]
type SliceUpdater = SliceValue | ((prev: SliceValue) => SliceValue)

interface DraftConfigContextValue {
  draft: WeddingConfig
  saved: WeddingConfig
  setSlice: (key: SliceKey, updater: SliceUpdater) => void
  saveSlice: (key: SliceKey, valueOverride?: SliceValue) => Promise<void>
  isSliceDirty: (key: SliceKey) => boolean
}

const DraftConfigContext = createContext<DraftConfigContextValue | null>(null)

export function DraftConfigProvider({ children }: { children: ReactNode }) {
  const { config: saved } = useWeddingConfig()
  const [draft, setDraft] = useState<WeddingConfig>(saved)

  useEffect(() => {
    setDraft(saved)
  }, [saved])

  const setSlice = useCallback((key: SliceKey, updater: SliceUpdater) => {
    setDraft((d) => {
      const next =
        typeof updater === 'function'
          ? (updater as (prev: SliceValue) => SliceValue)(d[key])
          : updater
      return { ...d, [key]: next } as WeddingConfig
    })
  }, [])

  // Passing `valueOverride` lets a section normalize (trim / clamp / Boolean)
  // right before writing without first round-tripping through setSlice + a
  // render.
  const saveSlice = useCallback(
    async (key: SliceKey, valueOverride?: SliceValue) => {
      if (!isConfigured || !db) throw new Error('Firebase is not configured.')
      const value = valueOverride !== undefined ? valueOverride : draft[key]
      await set(ref(db, `config/${key}`), value ?? null)
    },
    [draft],
  )

  const isSliceDirty = useCallback(
    (key: SliceKey) => JSON.stringify(draft[key]) !== JSON.stringify(saved[key]),
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

export function useDraftConfig(): DraftConfigContextValue {
  const ctx = useContext(DraftConfigContext)
  if (!ctx) {
    throw new Error('useDraftConfig must be used within DraftConfigProvider')
  }
  return ctx
}
