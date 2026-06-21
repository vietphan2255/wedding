import { useEffect, useMemo, useState } from 'react'
import { ref, onValue, update, remove, serverTimestamp } from 'firebase/database'
import {
  Trash2,
  Download,
  Search,
  AlertTriangle,
  Copy,
  Check,
  Plus,
  Upload,
  Pencil,
  X,
} from 'lucide-react'
import { db, isConfigured } from '../../firebase/config'
import { genUniqueInviteCode, parseGuestCsv, inviteLink } from '../../lib/guests'

const PARTY_LABELS = {
  vuquy: 'Lễ Vu Quy',
  thanhhon: 'Lễ Thành Hôn',
  both: 'Cả hai',
}
const PARTY_OPTIONS = [
  ['vuquy', 'Lễ Vu Quy'],
  ['thanhhon', 'Lễ Thành Hôn'],
  ['both', 'Cả hai'],
]

// Stable per-guest match key for idempotent re-imports: prefer the real name,
// fall back to the invitation name so a nameless row still reuses its code.
const matchKey = (g) => (g.name || g.invitationName || '').trim().toLowerCase()

function csvEscape(v) {
  const s = v == null ? '' : String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export default function GuestsSection() {
  const [guests, setGuests] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [busy, setBusy] = useState(null)
  const [copied, setCopied] = useState(null)

  const [importOpen, setImportOpen] = useState(false)
  const [importText, setImportText] = useState('')
  const [importStatus, setImportStatus] = useState(null)
  const [importing, setImporting] = useState(false)

  const [editing, setEditing] = useState(null) // { id, name, invitationName, party }

  useEffect(() => {
    if (!isConfigured || !db) {
      setLoading(false)
      return
    }
    const unsub = onValue(
      ref(db, 'guests'),
      (snap) => {
        const list = []
        snap.forEach((child) => list.push({ id: child.key, ...child.val() }))
        list.sort(
          (a, b) =>
            (a.order ?? 0) - (b.order ?? 0) ||
            (a.invitationName || '').localeCompare(b.invitationName || ''),
        )
        setGuests(list)
        setLoading(false)
      },
      () => setLoading(false),
    )
    return () => unsub()
  }, [])

  const filtered = useMemo(() => {
    if (!query.trim()) return guests
    const q = query.toLowerCase()
    return guests.filter((g) =>
      [g.invitationName, g.name, g.id]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    )
  }, [guests, query])

  const stats = useMemo(() => {
    const by = (p) => guests.filter((g) => g.party === p).length
    return {
      total: guests.length,
      vuquy: by('vuquy'),
      thanhhon: by('thanhhon'),
      both: by('both'),
    }
  }, [guests])

  const copy = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(key)
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 1500)
    } catch {
      alert(text)
    }
  }

  const handleImport = async () => {
    if (!isConfigured || !db) return
    const parsed = parseGuestCsv(importText)
    if (!parsed.length) {
      setImportStatus({
        type: 'error',
        message: 'No rows found. Expected: name, invitation name, party.',
      })
      return
    }
    setImporting(true)
    setImportStatus(null)
    try {
      const existingByKey = new Map()
      guests.forEach((g) => existingByKey.set(matchKey(g), g))
      const taken = new Set(guests.map((g) => g.id))
      const payload = {}
      let added = 0
      let updated = 0
      parsed.forEach((g, i) => {
        const prev = existingByKey.get(matchKey(g))
        let code = prev?.id
        if (code) updated += 1
        else {
          code = genUniqueInviteCode(taken)
          taken.add(code)
          added += 1
        }
        payload[code] = {
          name: g.name,
          invitationName: g.invitationName,
          party: g.party,
          order: i,
          createdAt: prev?.createdAt || serverTimestamp(),
        }
      })
      await update(ref(db, 'guests'), payload)
      setImportStatus({
        type: 'success',
        message: `Imported ${parsed.length} — ${added} new, ${updated} updated (existing links preserved).`,
      })
      setImportText('')
    } catch (err) {
      console.error(err)
      setImportStatus({ type: 'error', message: err.message || 'Import failed.' })
    } finally {
      setImporting(false)
    }
  }

  const addBlank = async () => {
    if (!isConfigured || !db) return
    const taken = new Set(guests.map((g) => g.id))
    const code = genUniqueInviteCode(taken)
    setBusy(code)
    try {
      await update(ref(db, 'guests'), {
        [code]: {
          name: '',
          invitationName: 'Khách mời',
          party: 'both',
          order: guests.length,
          createdAt: serverTimestamp(),
        },
      })
      setEditing({ id: code, name: '', invitationName: 'Khách mời', party: 'both' })
    } catch (err) {
      console.error(err)
      alert(err.message || 'Failed to add.')
    } finally {
      setBusy(null)
    }
  }

  const saveEdit = async () => {
    if (!isConfigured || !db || !editing) return
    setBusy(editing.id)
    try {
      await update(ref(db, `guests/${editing.id}`), {
        name: editing.name || '',
        invitationName: editing.invitationName || editing.name || '',
        party: editing.party || 'both',
      })
      setEditing(null)
    } catch (err) {
      console.error(err)
      alert(err.message || 'Failed to save.')
    } finally {
      setBusy(null)
    }
  }

  const handleDelete = async (id) => {
    if (!isConfigured || !db) return
    if (!confirm('Delete this guest? Their personal link will stop working.')) return
    setBusy(id)
    try {
      await remove(ref(db, `guests/${id}`))
    } catch (err) {
      console.error(err)
      alert(err.message || 'Failed to delete.')
    } finally {
      setBusy(null)
    }
  }

  const allLinksText = () =>
    guests
      .map(
        (g) =>
          `${g.invitationName}\t${PARTY_LABELS[g.party] || g.party}\t${inviteLink(g.id)}`,
      )
      .join('\n')

  const exportCsv = () => {
    const headers = ['invitationName', 'name', 'party', 'code', 'link']
    const lines = [headers.join(',')]
    guests.forEach((g) => {
      lines.push(
        [g.invitationName, g.name, g.party, g.id, inviteLink(g.id)]
          .map(csvEscape)
          .join(','),
      )
    })
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `guests-${new Date().toISOString().slice(0, 10)}.csv`
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
          Firebase is not configured — the guest list cannot be loaded.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <header className="glass rounded-3xl p-6 md:p-8">
        <p className="eyebrow">Personalized invites</p>
        <h2 className="font-display text-2xl md:text-3xl mt-1">Guests</h2>
        <p className="text-sm text-muted mt-2">
          Each guest gets a unique link <code>?invite=&lt;code&gt;</code> that prints
          their name on the envelope and highlights the ceremony they&apos;re invited to.
        </p>

        <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="Total" value={stats.total} />
          <Stat label="Vu Quy" value={stats.vuquy} accent />
          <Stat label="Thành Hôn" value={stats.thanhhon} accent />
          <Stat label="Cả hai" value={stats.both} />
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
              placeholder="Search name or code…"
              className="w-full rounded-xl border border-line bg-bg pl-9 pr-4 py-2.5 text-sm focus:border-accent transition-colors"
            />
          </div>
          <button
            type="button"
            onClick={() => setImportOpen((v) => !v)}
            className="btn-ghost"
          >
            <Upload size={15} />
            Import
          </button>
          <button type="button" onClick={addBlank} className="btn-ghost">
            <Plus size={15} />
            Add
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => copy(allLinksText(), 'all')}
            disabled={!guests.length}
            className="btn-ghost disabled:opacity-50"
          >
            {copied === 'all' ? <Check size={15} /> : <Copy size={15} />}
            Copy all links
          </button>
          <button
            type="button"
            onClick={exportCsv}
            disabled={!guests.length}
            className="btn-ghost disabled:opacity-50"
          >
            <Download size={15} />
            Export CSV
          </button>
        </div>
      </header>

      {importOpen && (
        <div className="glass rounded-3xl p-6 md:p-8 space-y-3">
          <p className="text-sm text-ink/90">
            Paste rows from your Google Sheet (or a CSV) — columns <strong>name</strong>,{' '}
            <strong>invitation name</strong>, <strong>party</strong>. Party accepts
            &quot;Lễ Vu Quy&quot;, &quot;Lễ Thành Hôn&quot;, or &quot;cả hai&quot;.
            Re-importing keeps existing codes, so already-sent links never break.
          </p>
          <textarea
            rows={8}
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder={
              'Nguyễn Văn A\tGia đình Anh A\tLễ Thành Hôn\nTrần Thị B\tCô B\tLễ Vu Quy'
            }
            className="w-full rounded-xl border border-line bg-bg px-4 py-3 text-sm font-mono focus:border-accent transition-colors"
          />
          {importStatus && (
            <p
              className={`text-sm ${importStatus.type === 'error' ? 'text-red-500' : 'text-accent'}`}
            >
              {importStatus.message}
            </p>
          )}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleImport}
              disabled={importing || !importText.trim()}
              className="btn-primary disabled:opacity-50"
            >
              <Upload size={15} />
              {importing ? 'Importing…' : 'Import guests'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted text-center py-10">Loading guests…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted text-center py-10">
          {guests.length === 0
            ? 'No guests yet — use Import or Add.'
            : 'No results match your search.'}
        </p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((g) => {
            const isEditing = editing?.id === g.id
            const link = inviteLink(g.id)
            return (
              <li key={g.id} className="glass rounded-2xl p-5">
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <LabeledInput
                        label="Name (your reference)"
                        value={editing.name}
                        onChange={(v) => setEditing((e) => ({ ...e, name: v }))}
                      />
                      <LabeledInput
                        label="Invitation name (on envelope)"
                        value={editing.invitationName}
                        onChange={(v) => setEditing((e) => ({ ...e, invitationName: v }))}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] tracking-[0.22em] uppercase text-muted mb-2">
                        Party
                      </label>
                      <select
                        value={editing.party}
                        onChange={(e) =>
                          setEditing((ed) => ({ ...ed, party: e.target.value }))
                        }
                        className="rounded-xl border border-line bg-bg px-4 py-2.5 text-sm focus:border-accent transition-colors"
                      >
                        {PARTY_OPTIONS.map(([v, lbl]) => (
                          <option key={v} value={v}>
                            {lbl}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setEditing(null)}
                        className="btn-ghost"
                      >
                        <X size={15} />
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={saveEdit}
                        disabled={busy === g.id}
                        className="btn-primary disabled:opacity-50"
                      >
                        <Check size={15} />
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display text-lg truncate">
                          {g.invitationName || '—'}
                        </h3>
                        <Pill tone="accent">{PARTY_LABELS[g.party] || g.party}</Pill>
                      </div>
                      {g.name && g.name !== g.invitationName && (
                        <p className="text-xs text-muted mt-1.5">{g.name}</p>
                      )}
                      <div className="mt-3 flex items-center gap-2">
                        <code className="text-xs text-ink/80 bg-bg/60 border border-line rounded-lg px-2.5 py-1.5 truncate max-w-[16rem] sm:max-w-md">
                          {link}
                        </code>
                        <button
                          type="button"
                          onClick={() => copy(link, g.id)}
                          className="rounded-full border border-line p-2 text-ink/70 hover:text-ink hover:bg-ink/5 shrink-0"
                          aria-label="Copy link"
                          title="Copy link"
                        >
                          {copied === g.id ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setEditing({
                            id: g.id,
                            name: g.name || '',
                            invitationName: g.invitationName || '',
                            party: g.party || 'both',
                          })
                        }
                        className="rounded-full border border-line p-2 text-ink/70 hover:text-ink hover:bg-ink/5"
                        aria-label="Edit guest"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(g.id)}
                        disabled={busy === g.id}
                        className="rounded-full border border-line p-2 text-red-500 hover:bg-red-500/10 disabled:opacity-50"
                        aria-label="Delete guest"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function LabeledInput({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-[11px] tracking-[0.22em] uppercase text-muted mb-2">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-line bg-bg px-4 py-2.5 text-sm focus:border-accent transition-colors"
      />
    </div>
  )
}

function Stat({ label, value, accent }) {
  return (
    <div className="rounded-2xl border border-line bg-bg/60 px-4 py-3">
      <p className="eyebrow text-[10px]">{label}</p>
      <p className={`font-display text-2xl mt-1 ${accent ? 'text-accent' : ''}`}>
        {value}
      </p>
    </div>
  )
}

function Pill({ children, tone = 'default' }) {
  const cls =
    tone === 'accent'
      ? 'border-accent/40 bg-accent/10 text-accent'
      : 'border-line bg-bg/60 text-ink/80'
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] tracking-wide ${cls}`}
    >
      {children}
    </span>
  )
}
