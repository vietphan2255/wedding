import { useEffect } from 'react'
import type { UseFormWatch, FieldValues } from 'react-hook-form'

// Persists a react-hook-form value tree to localStorage on every change and
// loads on first read. `watch` is the form's `watch(callback)` subscription
// API; `loadDraft(key, defaults)` is exported so consumers can pass the
// result to `useForm({ defaultValues })` synchronously.

export function loadDraft<T extends Record<string, unknown>>(key: string, defaults: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return defaults
    const saved = JSON.parse(raw)
    if (!saved || typeof saved !== 'object') return defaults
    return mergeDraft(defaults, saved as Record<string, unknown>)
  } catch {
    return defaults
  }
}

function mergeDraft<T extends Record<string, unknown>>(
  defaults: T,
  saved: Record<string, unknown>,
): T {
  const merged: Record<string, unknown> = { ...defaults, ...saved }
  for (const key of Object.keys(defaults)) {
    if (Array.isArray(defaults[key])) {
      merged[key] = Array.isArray(saved[key]) ? saved[key] : defaults[key]
    }
  }
  return merged as T
}

export function clearDraft(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}

export default function useDraftStorage<T extends FieldValues>(
  key: string,
  watch: UseFormWatch<T>,
): void {
  useEffect(() => {
    const sub = watch((value) => {
      try {
        localStorage.setItem(key, JSON.stringify(value))
      } catch {
        /* ignore storage errors (quota / private mode) */
      }
    })
    return () => sub.unsubscribe()
  }, [key, watch])
}
