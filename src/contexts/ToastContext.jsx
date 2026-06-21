import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import ToastViewport from '../components/notifications/ToastViewport.jsx'

// Single, generic toast/notification system. Holds the active toast queue and
// exposes imperative helpers (success / error / wish) so any component can fire
// a transient message. The provider renders the one fixed-position viewport, so
// there's never more than one stacking overlay (mirrors how MusicProvider owns
// the single <audio> element). Kept presentation-only — callers supply text.
const ToastContext = createContext(null)

// Most recent N stay on screen; a flood of new wishes drops the oldest rather
// than stacking off-screen.
const MAX_TOASTS = 3
const DEFAULT_DURATION = { success: 4000, error: 4000, wish: 7000 }

function makeId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `t-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

// No-op fallback so components used outside the provider (other routes, tests)
// never crash on useToast().
export function useToast() {
  return (
    useContext(ToastContext) || {
      toasts: [],
      addToast: () => '',
      dismiss: () => {},
      success: () => {},
      error: () => {},
      wish: () => {},
    }
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const addToast = useCallback((partial) => {
    const id = makeId()
    const variant = partial.variant || 'success'
    const toast = {
      id,
      variant,
      title: partial.title,
      message: partial.message || '',
      duration: partial.duration ?? DEFAULT_DURATION[variant] ?? 4000,
      action: partial.action,
      createdAt: Date.now(),
    }
    setToasts((prev) => {
      const next = [...prev, toast]
      return next.length > MAX_TOASTS ? next.slice(next.length - MAX_TOASTS) : next
    })
    return id
  }, [])

  const success = useCallback(
    (message, opts = {}) => addToast({ ...opts, variant: 'success', message }),
    [addToast],
  )
  const error = useCallback(
    (message, opts = {}) => addToast({ ...opts, variant: 'error', message }),
    [addToast],
  )
  // payload: { title, message, action } — caller builds the (i18n) strings.
  const wish = useCallback(
    (payload = {}, opts = {}) => addToast({ ...opts, ...payload, variant: 'wish' }),
    [addToast],
  )

  const value = useMemo(
    () => ({ toasts, addToast, dismiss, success, error, wish }),
    [toasts, addToast, dismiss, success, error, wish],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}
