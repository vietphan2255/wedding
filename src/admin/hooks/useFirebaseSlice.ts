import { useState } from 'react'
import { ref, set, push, update } from 'firebase/database'
import { db, isConfigured } from '../../firebase/config'
import { useWeddingConfig } from '../../contexts/WeddingConfigContext'
import { useDraftConfig } from '../DraftConfigContext'


// Firebase Realtime DB auto-IDs look like `-NXyzAbc...`. We seed defaults with
// `default-N` and stage new draft items with `new-<ts>` — both shouldn't be
// written back as keys. Anything else is a real Firebase ID we want to
// preserve so cross-device subscribers see in-place updates.
export function isFirebaseId(id: unknown): id is string {
  return typeof id === 'string' && !id.startsWith('default-') && !id.startsWith('new-')
}

export interface SliceItem {
  id: string
  order?: number
  [key: string]: unknown
}

export interface SliceStatus {
  type: 'success' | 'error'
  message: string
}

type ItemUpdater<T> = (prev: T[]) => T[]
type SetItems<T> = (updater: T[] | ItemUpdater<T>) => void

export interface UseFirebaseSliceResult<T extends SliceItem> {
  items: T[]
  setItems: SetItems<T>
  updateItem: (idx: number, key: string, value: unknown) => void
  addItem: (extra?: Partial<T>) => void
  removeItem: (idx: number) => void
  move: (idx: number, dir: number) => void
  save: (successMessage?: string) => Promise<void>
  saving: boolean
  status: SliceStatus | null
  dirty: boolean
}

// Wraps the "first save = set with push-keys, subsequent save = update with
// deletes-as-null" Firebase pattern shared by Gallery, Story, and FAQ admin
// sections. Composes on top of `useDraftConfig` — items live in the draft so
// every keystroke is a local state change, only `save()` writes to Firebase.
export default function useFirebaseSlice<T extends SliceItem>(
  sliceKey: string,
  encodeItem: (item: T, index: number) => Record<string, unknown>,
): UseFirebaseSliceResult<T> {
  const { source } = useWeddingConfig()
  const { draft, saved, setSlice, isSliceDirty } = useDraftConfig()
  const items = ((draft as unknown as Record<string, unknown>)[sliceKey] as T[]) || []
  const dirty = isSliceDirty(sliceKey as never)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<SliceStatus | null>(null)

  const setItems: SetItems<T> = (updater) =>
    setSlice(sliceKey as never, ((prev: unknown) => {
      const list = (prev as T[]) || []
      return typeof updater === 'function'
        ? (updater as ItemUpdater<T>)(list)
        : updater
    }) as never)

  const updateItem = (idx: number, key: string, value: unknown) => {
    setItems((prev) => {
      const next = [...prev]
      next[idx] = { ...next[idx], [key]: value }
      return next
    })
  }

  const move = (idx: number, dir: number) => {
    const target = idx + dir
    if (target < 0 || target >= items.length) return
    setItems((prev) => {
      const next = [...prev]
      ;[next[idx], next[target]] = [next[target], next[idx]]
      return next.map((it, i) => ({ ...it, order: i }))
    })
  }

  const addItem = (extra: Partial<T> = {}) => {
    setItems((prev) => [
      ...prev,
      { id: `new-${Date.now()}`, order: prev.length, ...extra } as T,
    ])
  }

  const removeItem = (idx: number) => {
    setItems((prev) =>
      prev.filter((_, i) => i !== idx).map((it, i) => ({ ...it, order: i })),
    )
  }

  const save = async (successMessage = 'Saved.') => {
    if (!isConfigured || !db) {
      setStatus({ type: 'error', message: 'Firebase is not configured.' })
      return
    }
    // Narrow once for the closures below — TS doesn't track the outer guard
    // through nested async scopes.
    const database = db
    setSaving(true)
    setStatus(null)
    try {
      const path = `config/${sliceKey}`
      if (source === 'default') {
        // First save — there is nothing on Firebase yet, so push new IDs for
        // every draft item and write the whole slice in one set().
        const payload: Record<string, Record<string, unknown>> = {}
        items.forEach((it, i) => {
          const newRef = push(ref(database, path))
          if (newRef.key) payload[newRef.key] = encodeItem(it, i)
        })
        await set(ref(database, path), payload)
      } else {
        // Subsequent save — diff against the saved snapshot: existing
        // Firebase IDs that the draft dropped become null (deletes), kept
        // ones get their payload, and `new-*` items get fresh push() keys.
        const existingIds = (((saved as unknown as Record<string, unknown>)[sliceKey] as T[]) || [])
          .map((s) => s.id)
          .filter(isFirebaseId)
        const keptIds = new Set(items.map((s) => s.id).filter(isFirebaseId))
        const updates: Record<string, Record<string, unknown> | null> = {}
        existingIds.forEach((id) => {
          if (!keptIds.has(id)) updates[id] = null
        })
        items.forEach((it, i) => {
          const payload = encodeItem(it, i)
          if (isFirebaseId(it.id)) {
            updates[it.id] = payload
          } else {
            const newRef = push(ref(database, path))
            if (newRef.key) updates[newRef.key] = payload
          }
        })
        await update(ref(database, path), updates)
      }
      setStatus({ type: 'success', message: successMessage })
    } catch (err) {
      console.error(`[useFirebaseSlice:${sliceKey}]`, err)
      setStatus({
        type: 'error',
        message: (err as Error)?.message || 'Failed to save.',
      })
    } finally {
      setSaving(false)
    }
  }

  return {
    items,
    setItems,
    updateItem,
    addItem,
    removeItem,
    move,
    save,
    saving,
    status,
    dirty,
  }
}
