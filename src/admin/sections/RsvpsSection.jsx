import { useEffect, useMemo, useState } from 'react'
import { ref, onValue, remove } from 'firebase/database'
import { Trash2, Download, Search, AlertTriangle } from 'lucide-react'
import { db, isConfigured } from '../../firebase/config'

const ATTENDING_LABELS = { yes: 'Yes', no: 'No' }
const EVENTS_LABELS = {
  vuquy: 'Lễ Vu Quy',
  thanhhon: 'Lễ Thành Hôn',
  both: 'Both',
}

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

function toCsv(rows) {
  const headers = [
    'createdAt',
    'name',
    'phone',
    'attending',
    'events',
    'guests',
    'message',
  ]
  const escape = (v) => {
    const s = v == null ? '' : String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const lines = [headers.join(',')]
  rows.forEach((r) => {
    lines.push(
      [
        new Date(r.createdAt || 0).toISOString(),
        r.name,
        r.phone,
        r.attending,
        r.events,
        r.guests,
        r.message,
      ]
        .map(escape)
        .join(','),
    )
  })
  return lines.join('\n')
}

export default function RsvpsSection() {
  const [rsvps, setRsvps] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [busy, setBusy] = useState(null)

  useEffect(() => {
    if (!isConfigured || !db) {
      setLoading(false)
      return
    }
    const unsub = onValue(
      ref(db, 'rsvps'),
      (snap) => {
        const list = []
        snap.forEach((child) => list.push({ id: child.key, ...child.val() }))
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        setRsvps(list)
        setLoading(false)
      },
      () => setLoading(false),
    )
    return () => unsub()
  }, [])

  const filtered = useMemo(() => {
    if (!query.trim()) return rsvps
    const q = query.toLowerCase()
    return rsvps.filter((r) =>
      [r.name, r.phone, r.message]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    )
  }, [rsvps, query])

  const stats = useMemo(() => {
    const yes = rsvps.filter((r) => r.attending === 'yes')
    const no = rsvps.filter((r) => r.attending === 'no')
    const guests = yes.reduce((sum, r) => sum + (Number(r.guests) || 0), 0)
    return { total: rsvps.length, yes: yes.length, no: no.length, guests }
  }, [rsvps])

  const handleDelete = async (id) => {
    if (!isConfigured || !db) return
    if (!confirm('Delete this RSVP? This cannot be undone.')) return
    setBusy(id)
    try {
      await remove(ref(db, `rsvps/${id}`))
    } catch (err) {
      console.error(err)
      alert(err.message || 'Failed to delete.')
    } finally {
      setBusy(null)
    }
  }

  const exportCsv = () => {
    const blob = new Blob([toCsv(rsvps)], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rsvps-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!isConfigured) {
    return (
      <div className="glass rounded-3xl p-8 flex gap-3">
        <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
        <p className="text-sm text-muted">
          Firebase is not configured — RSVPs cannot be loaded.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <header className="glass rounded-3xl p-6 md:p-8">
        <p className="eyebrow">Guest responses</p>
        <h2 className="font-display text-2xl md:text-3xl mt-1">RSVPs</h2>
        <p className="text-sm text-muted mt-2">
          Live list of RSVPs submitted through the public form.
        </p>

        <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="Total" value={stats.total} />
          <Stat label="Attending" value={stats.yes} accent />
          <Stat label="Declined" value={stats.no} />
          <Stat label="Guests" value={stats.guests} accent />
        </div>

        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, phone, message…"
              className="w-full rounded-xl border border-line bg-bg pl-9 pr-4 py-2.5 text-sm focus:border-accent transition-colors"
            />
          </div>
          <button
            type="button"
            onClick={exportCsv}
            disabled={!rsvps.length}
            className="btn-ghost disabled:opacity-50"
          >
            <Download size={15} />
            Export CSV
          </button>
        </div>
      </header>

      {loading ? (
        <p className="text-sm text-muted text-center py-10">Loading RSVPs…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted text-center py-10">
          {rsvps.length === 0 ? 'No RSVPs yet.' : 'No results match your search.'}
        </p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((r) => (
            <li key={r.id} className="glass rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-lg truncate">
                      {r.name || '—'}
                    </h3>
                    <Pill
                      tone={r.attending === 'yes' ? 'accent' : 'muted'}
                    >
                      {ATTENDING_LABELS[r.attending] || r.attending || '—'}
                    </Pill>
                    {r.attending === 'yes' && r.events && (
                      <Pill>{EVENTS_LABELS[r.events] || r.events}</Pill>
                    )}
                    {r.attending === 'yes' && r.guests && (
                      <Pill>
                        {r.guests} guest{Number(r.guests) === 1 ? '' : 's'}
                      </Pill>
                    )}
                  </div>
                  <p className="text-xs text-muted mt-2">
                    {formatDate(r.createdAt)}
                  </p>
                  {r.phone && (
                    <dl className="mt-3 grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
                      <Row label="Phone">{r.phone}</Row>
                    </dl>
                  )}
                  {r.message && (
                    <p className="text-sm text-ink/90 mt-3 leading-relaxed whitespace-pre-wrap">
                      {r.message}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(r.id)}
                  disabled={busy === r.id}
                  className="rounded-full border border-line p-2 text-red-500 hover:bg-red-500/10 disabled:opacity-50 shrink-0"
                  aria-label="Delete RSVP"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Stat({ label, value, accent }) {
  return (
    <div className="rounded-2xl border border-line bg-bg/60 px-4 py-3">
      <p className="eyebrow text-[10px]">{label}</p>
      <p
        className={`font-display text-2xl mt-1 ${accent ? 'text-accent' : ''}`}
      >
        {value}
      </p>
    </div>
  )
}

function Pill({ children, tone = 'default' }) {
  const cls =
    tone === 'accent'
      ? 'border-accent/40 bg-accent/10 text-accent'
      : tone === 'muted'
      ? 'border-line bg-bg/60 text-muted'
      : 'border-line bg-bg/60 text-ink/80'
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] tracking-wide ${cls}`}
    >
      {children}
    </span>
  )
}

function Row({ label, children }) {
  return (
    <div className="flex gap-2">
      <dt className="text-muted shrink-0">{label}:</dt>
      <dd className="min-w-0 truncate">{children}</dd>
    </div>
  )
}
