import { useEffect, useMemo, useState } from 'react'
import { ref, onValue, remove } from 'firebase/database'
import { Trash2, Search, AlertTriangle, Heart, List, LayoutGrid } from 'lucide-react'
import { db, isConfigured } from '../../firebase/config'

function formatDate(ts) {
  if (!ts) return '—'
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(ts))
  } catch {
    return '—'
  }
}

function DeleteButton({ id, busy, onDelete }) {
  return (
    <button
      type="button"
      onClick={() => onDelete(id)}
      disabled={busy === id}
      className="rounded-full border border-line p-1.5 text-red-500 hover:bg-red-500/10 disabled:opacity-50 shrink-0"
      aria-label="Delete wish"
      title="Delete"
    >
      <Trash2 size={13} />
    </button>
  )
}

export default function WishesSection() {
  const [wishes, setWishes] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [busy, setBusy] = useState(null)
  const [view, setView] = useState(() =>
    typeof window !== 'undefined' && localStorage.getItem('wishes-view') === 'grid'
      ? 'grid'
      : 'list',
  )
  useEffect(() => {
    localStorage.setItem('wishes-view', view)
  }, [view])

  useEffect(() => {
    if (!isConfigured || !db) {
      setLoading(false)
      return
    }
    const unsub = onValue(
      ref(db, 'wishes'),
      (snap) => {
        const list = []
        // Block body: returning push()'s truthy length would cancel RTDB's
        // forEach enumeration after the first child (only one record shows).
        snap.forEach((child) => {
          list.push({ id: child.key, ...child.val() })
        })
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        setWishes(list)
        setLoading(false)
      },
      () => setLoading(false),
    )
    return () => unsub()
  }, [])

  const filtered = useMemo(() => {
    if (!query.trim()) return wishes
    const q = query.toLowerCase()
    return wishes.filter((w) =>
      [w.name, w.message]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    )
  }, [wishes, query])

  const handleDelete = async (id) => {
    if (!isConfigured || !db) return
    if (!confirm('Delete this wish? This cannot be undone.')) return
    setBusy(id)
    try {
      await remove(ref(db, `wishes/${id}`))
    } catch (err) {
      console.error(err)
      alert(err.message || 'Failed to delete.')
    } finally {
      setBusy(null)
    }
  }

  if (!isConfigured) {
    return (
      <div className="glass rounded-3xl p-8 flex gap-3">
        <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
        <p className="text-sm text-muted">
          Firebase is not configured — wishes cannot be loaded.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <header className="glass rounded-3xl p-6 md:p-8">
        <p className="eyebrow">Messages from guests</p>
        <h2 className="font-display text-2xl md:text-3xl mt-1">Wishes</h2>
        <p className="text-sm text-muted mt-2">
          Live list of wishes posted on the public site.
        </p>

        <div className="mt-5 flex flex-col sm:flex-row gap-3 items-stretch">
          <div className="rounded-2xl border border-line bg-bg/60 px-4 py-3 sm:w-44 flex items-center gap-3">
            <Heart size={16} className="text-accent" />
            <div>
              <p className="eyebrow text-[10px]">Total</p>
              <p className="font-display text-xl leading-none mt-1">
                {wishes.length}
              </p>
            </div>
          </div>
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or message…"
              className="w-full rounded-xl border border-line bg-bg pl-9 pr-4 py-2.5 text-sm focus:border-accent transition-colors"
            />
          </div>
        </div>
      </header>

      {!loading && wishes.length > 0 ? (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted">{filtered.length} shown</p>
          <div className="inline-flex items-center gap-1 rounded-full border border-line bg-bg/70 p-1">
            <button
              type="button"
              onClick={() => setView('list')}
              aria-pressed={view === 'list'}
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] transition ${
                view === 'list' ? 'bg-ink text-bg' : 'text-muted hover:text-ink'
              }`}
            >
              <List size={14} />
              List
            </button>
            <button
              type="button"
              onClick={() => setView('grid')}
              aria-pressed={view === 'grid'}
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] transition ${
                view === 'grid' ? 'bg-ink text-bg' : 'text-muted hover:text-ink'
              }`}
            >
              <LayoutGrid size={14} />
              Grid
            </button>
          </div>
        </div>
      ) : null}

      {loading ? (
        <p className="text-sm text-muted text-center py-10">Loading wishes…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted text-center py-10">
          {wishes.length === 0
            ? 'No wishes yet.'
            : 'No results match your search.'}
        </p>
      ) : view === 'grid' ? (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((w) => (
            <li
              key={w.id}
              className="rounded-2xl border border-line bg-surface p-5 relative"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-lg truncate pr-2">
                  {w.name || '—'}
                </h3>
                <DeleteButton id={w.id} busy={busy} onDelete={handleDelete} />
              </div>
              <p className="text-sm text-ink/90 mt-2 leading-relaxed whitespace-pre-wrap">
                {w.message}
              </p>
              <p className="eyebrow text-[10px] mt-3">{formatDate(w.createdAt)}</p>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="space-y-3">
          {filtered.map((w) => (
            <li
              key={w.id}
              className="rounded-2xl border border-line bg-surface px-5 py-4 flex items-start justify-between gap-4"
            >
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-lg truncate">{w.name || '—'}</h3>
                <p className="text-sm text-ink/90 mt-1 leading-relaxed whitespace-pre-wrap">
                  {w.message}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="eyebrow text-[10px]">
                  {formatDate(w.createdAt)}
                </span>
                <DeleteButton id={w.id} busy={busy} onDelete={handleDelete} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
