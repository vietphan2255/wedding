import { createContext, useContext, useEffect, useRef, useState } from 'react'
import {
  ref,
  push,
  onValue,
  query,
  limitToLast,
  serverTimestamp,
} from 'firebase/database'
import { db, isConfigured } from '../firebase/config'
import { useLanguage } from './LanguageContext'
import { useToast } from './ToastContext.jsx'

const DEMO_WISHES = [
  {
    id: 'demo-1',
    name: 'Mai & Phong',
    message:
      'Chúc hai bạn mãi mãi hạnh phúc — wishing you a lifetime of love and laughter!',
    createdAt: Date.now() - 1000 * 60 * 60 * 5,
  },
  {
    id: 'demo-2',
    name: 'Linh',
    message: 'So happy for both of you! Cannot wait to celebrate in July & August!',
    createdAt: Date.now() - 1000 * 60 * 60 * 20,
  },
]

// Hard cap on the floating-card preview length; the card also visually clamps to
// two lines via CSS, this just guards against pathological non-breaking input.
const PREVIEW_MAX = 140

// Single source of truth for the /wishes data. Owns the realtime listener (so
// the list and the new-wish notifier share one subscription) and the submit
// path (so it can record its own push keys and suppress a notification for the
// submitter's own wish — they already get the success toast).
const WishesContext = createContext(null)

export function useWishes() {
  return (
    useContext(WishesContext) || {
      wishes: [],
      loading: false,
      submitWish: async () => {},
    }
  )
}

export function WishesProvider({ children }) {
  const { t } = useLanguage()
  const toast = useToast()
  const [wishes, setWishes] = useState([])
  const [loading, setLoading] = useState(true)

  // Push keys ever observed; the listener notifies only for keys not in here.
  const seenIdsRef = useRef(new Set())
  // False until the first snapshot is seeded, so the existing 50 wishes on first
  // load don't each fire a notification.
  const baselineReadyRef = useRef(false)
  // Keys this client wrote — skipped (and consumed) so the submitter isn't
  // notified about their own wish.
  const ownKeysRef = useRef(new Set())

  // The listener effect runs once on mount; keep the latest toast/t in refs so a
  // new label override or toast-queue change never re-subscribes (which would
  // reset the baseline and replay history).
  const toastRef = useRef(toast)
  const tRef = useRef(t)
  useEffect(() => {
    toastRef.current = toast
  }, [toast])
  useEffect(() => {
    tRef.current = t
  }, [t])

  useEffect(() => {
    if (!isConfigured || !db) {
      setWishes(DEMO_WISHES)
      setLoading(false)
      return undefined
    }
    const q = query(ref(db, 'wishes'), limitToLast(50))
    const unsub = onValue(
      q,
      (snap) => {
        const incoming = []
        snap.forEach((child) => {
          incoming.push({ id: child.key, ...child.val() })
        })

        if (!baselineReadyRef.current) {
          incoming.forEach((w) => seenIdsRef.current.add(w.id))
          baselineReadyRef.current = true
        } else {
          for (const w of incoming) {
            if (seenIdsRef.current.has(w.id)) continue
            seenIdsRef.current.add(w.id) // mark seen first — idempotent under StrictMode
            if (ownKeysRef.current.has(w.id)) {
              ownKeysRef.current.delete(w.id) // own wish: submitter already got success toast
              continue
            }
            if (!w.name || !w.message) continue
            const title = tRef.current('wishes.notif.title').replace('{name}', w.name)
            const preview =
              w.message.length > PREVIEW_MAX
                ? `${w.message.slice(0, PREVIEW_MAX).trimEnd()}…`
                : w.message
            toastRef.current.wish({
              title,
              message: preview,
              action: {
                label: tRef.current('wishes.notif.action'),
                onClick: () =>
                  document
                    .getElementById('wishes')
                    ?.scrollIntoView({ behavior: 'smooth' }),
              },
            })
          }
        }

        const list = [...incoming].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        setWishes(list)
        setLoading(false)
      },
      () => setLoading(false),
    )
    return () => unsub()
  }, [])

  // Throws on write failure so the caller can show the error toast. Records the
  // push key synchronously (Firebase assigns it client-side) before any onValue
  // echo can arrive, so self-suppression is race-free.
  const submitWish = async ({ name, message }) => {
    if (isConfigured && db) {
      const newRef = push(ref(db, 'wishes'), {
        name,
        message,
        createdAt: serverTimestamp(),
      })
      if (newRef.key) ownKeysRef.current.add(newRef.key)
      await newRef
    } else {
      setWishes((prev) => [
        { id: `local-${Date.now()}`, name, message, createdAt: Date.now() },
        ...prev,
      ])
    }
  }

  const value = { wishes, loading, submitWish }

  return <WishesContext.Provider value={value}>{children}</WishesContext.Provider>
}
