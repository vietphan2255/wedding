import { useEffect, useState } from 'react'
import { Lock } from 'lucide-react'
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  type User,
} from 'firebase/auth'
import { auth } from '../firebase/config'

// Admin auth is now backed by Firebase Authentication (email/password) instead
// of a client-side password compare. This matters because the RTDB security
// rules gate writes on `auth.uid` — a real signed-in token is what authorizes
// config/guests writes and rsvps reads. The old VITE_ADMIN_PASSWORD only gated
// this UI and protected nothing at the data layer.

// Subscribe to the Firebase auth session. `loading` is true until the SDK has
// rehydrated the persisted session, so callers can avoid flashing the login
// form to an already-signed-in admin on reload.
export function useAuthUser(): { user: User | null; loading: boolean } {
  const [user, setUser] = useState<User | null>(() => auth?.currentUser ?? null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  return { user, loading }
}

export async function clearAuth(): Promise<void> {
  if (auth) await signOut(auth)
}

// Back-compat shim for any synchronous caller. Prefer useAuthUser() for gating.
export function isAuthed(): boolean {
  return Boolean(auth?.currentUser)
}

export default function AdminAuth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!auth) {
      setError('Authentication is not configured.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
      // The onAuthStateChanged listener (useAuthUser) flips the gate.
    } catch {
      // Single generic message — don't reveal whether the email exists.
      setError('Incorrect email or password.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-6">
      <form onSubmit={submit} className="w-full max-w-md glass rounded-3xl p-8 md:p-10">
        <div className="flex items-center gap-3 mb-2">
          <Lock size={20} className="text-accent" />
          <p className="eyebrow">Admin</p>
        </div>
        <h1 className="font-display text-3xl md:text-4xl">Sign in</h1>
        <p className="text-muted mt-2 text-sm">
          Sign in with your admin account to manage the wedding configuration.
        </p>
        <label className="block mt-6 text-[11px] tracking-[0.22em] uppercase text-muted mb-2">
          Email
        </label>
        <input
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoFocus
          className="w-full rounded-xl border border-line bg-bg px-4 py-3 text-ink focus:border-accent transition-colors"
        />
        <label className="block mt-4 text-[11px] tracking-[0.22em] uppercase text-muted mb-2">
          Password
        </label>
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-line bg-bg px-4 py-3 text-ink focus:border-accent transition-colors"
        />
        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="btn-primary mt-6 w-full disabled:opacity-60"
        >
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
        <p className="text-[11px] text-muted mt-4 text-center">
          Admin accounts are managed in Firebase Authentication.
        </p>
      </form>
    </div>
  )
}
