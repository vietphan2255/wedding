import { useEffect, useMemo, useState } from 'react'
import { Lock } from 'lucide-react'
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  type User,
} from 'firebase/auth'
import { auth } from '../firebase/auth'

// Admin auth is backed by Firebase Authentication (Google or email/password)
// instead of a client-side password compare. This matters because the RTDB
// security rules gate reads/writes on the signed-in token's email — a real
// signed-in admin token is what authorizes config/guests writes and rsvps reads.
//
// This component only performs sign-in. Whether a signed-in account may actually
// use the admin is decided in ONE place — the allowlist gate in Admin.tsx
// (VITE_ADMIN_EMAILS, mirrored in database.rules.json). A non-allowlisted account
// lands on the "Not authorized" screen and gains no data access from the rules.

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

  const googleProvider = useMemo(() => {
    const p = new GoogleAuthProvider()
    // Always show the account chooser so an admin can pick/switch accounts rather
    // than being silently signed in with the wrong cached one.
    p.setCustomParameters({ prompt: 'select_account' })
    return p
  }, [])

  const signInGoogle = async () => {
    if (!auth) {
      setError('Authentication is not configured.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await signInWithPopup(auth, googleProvider)
      // onAuthStateChanged (useAuthUser) flips the gate; Admin.tsx decides whether
      // this account is allowlisted.
    } catch (err) {
      // Ignore the user closing/cancelling the popup; surface anything else.
      const code = (err as { code?: string })?.code
      if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
        setError('Google sign-in failed. Please try again.')
      }
    } finally {
      setBusy(false)
    }
  }

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
      // onAuthStateChanged (useAuthUser) flips the gate; Admin.tsx decides access.
    } catch {
      // Single generic message — don't reveal whether the email exists.
      setError('Incorrect email or password.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-6">
      <div className="w-full max-w-md glass rounded-3xl p-8 md:p-10">
        <div className="flex items-center gap-3 mb-2">
          <Lock size={20} className="text-accent" />
          <p className="eyebrow">Admin</p>
        </div>
        <h1 className="font-display text-3xl md:text-4xl">Sign in</h1>
        <p className="text-muted mt-2 text-sm">
          Sign in with an authorized admin account to manage the wedding configuration.
        </p>

        <button
          type="button"
          onClick={signInGoogle}
          disabled={busy}
          className="mt-6 w-full inline-flex items-center justify-center gap-3 rounded-xl border border-line bg-bg px-4 py-3 text-ink hover:border-accent transition-colors disabled:opacity-60"
        >
          <GoogleIcon />
          <span>Sign in with Google</span>
        </button>

        <div className="flex items-center gap-3 my-5">
          <span className="h-px flex-1 bg-line" />
          <span className="text-[11px] tracking-[0.22em] uppercase text-muted">or</span>
          <span className="h-px flex-1 bg-line" />
        </div>

        <form onSubmit={submit}>
          <label
            htmlFor="admin-email"
            className="block text-[11px] tracking-[0.22em] uppercase text-muted mb-2"
          >
            Email
          </label>
          <input
            id="admin-email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-line bg-bg px-4 py-3 text-ink focus:border-accent transition-colors"
          />
          <label
            htmlFor="admin-password"
            className="block mt-4 text-[11px] tracking-[0.22em] uppercase text-muted mb-2"
          >
            Password
          </label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-line bg-bg px-4 py-3 text-ink focus:border-accent transition-colors"
          />
          <button
            type="submit"
            disabled={busy}
            className="btn-primary mt-6 w-full disabled:opacity-60"
          >
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        {error && <p className="text-xs text-red-500 mt-3">{error}</p>}

        <p className="text-[11px] text-muted mt-4 text-center">
          Admin accounts are managed in Firebase Authentication.
        </p>
      </div>
    </div>
  )
}

// Official Google "G" mark — lucide has no brand icons, so inline it.
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.583-5.036-3.71H.957v2.332A8.997 8.997 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.711A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.711V4.957H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.043l3.007-2.332Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.957L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
      />
    </svg>
  )
}
