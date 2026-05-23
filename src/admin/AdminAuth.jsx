import { useState } from 'react'
import { Lock } from 'lucide-react'

const SESSION_KEY = 'vn-admin-auth'
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'changeme'

export function isAuthed() {
  if (typeof window === 'undefined') return false
  return window.sessionStorage.getItem(SESSION_KEY) === '1'
}

export function clearAuth() {
  if (typeof window !== 'undefined') {
    window.sessionStorage.removeItem(SESSION_KEY)
  }
}

export default function AdminAuth({ onSuccess }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  const submit = (e) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      window.sessionStorage.setItem(SESSION_KEY, '1')
      setError(null)
      onSuccess()
    } else {
      setError('Incorrect password')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-6">
      <form
        onSubmit={submit}
        className="w-full max-w-md glass rounded-3xl p-8 md:p-10"
      >
        <div className="flex items-center gap-3 mb-2">
          <Lock size={20} className="text-accent" />
          <p className="eyebrow">Admin</p>
        </div>
        <h1 className="font-display text-3xl md:text-4xl">Sign in</h1>
        <p className="text-muted mt-2 text-sm">
          Enter the admin password to manage the wedding configuration.
        </p>
        <label className="block mt-6 text-[11px] tracking-[0.22em] uppercase text-muted mb-2">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          className="w-full rounded-xl border border-line bg-bg px-4 py-3 text-ink focus:border-accent transition-colors"
        />
        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
        <button type="submit" className="btn-primary mt-6 w-full">
          Sign in
        </button>
        <p className="text-[11px] text-muted mt-4 text-center">
          Set <code>VITE_ADMIN_PASSWORD</code> in <code>.env.local</code> to
          change the default.
        </p>
      </form>
    </div>
  )
}
