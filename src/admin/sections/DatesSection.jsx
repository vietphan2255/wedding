import { useState } from 'react'
import { Save } from 'lucide-react'
import { useDraftConfig } from '../DraftConfigContext.jsx'

// Converts an ISO with timezone like "2026-07-26T09:00:00+07:00" to the
// "yyyy-MM-ddTHH:mm" form that <input type="datetime-local"> expects, while
// preserving the wall-clock time stored in the ISO string.
function isoToLocalInput(iso) {
  if (!iso) return ''
  const match = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})/.exec(iso)
  return match ? match[1] : ''
}

// "yyyy-MM-ddTHH:mm" + "+07:00" tz offset → full ISO. We append seconds so it
// round-trips cleanly through new Date().
function localInputToIso(localValue, tz = '+07:00') {
  if (!localValue) return ''
  return `${localValue}:00${tz}`
}

const FIELDS = [
  { key: 'vuquyStart', label: 'Lễ Vu Quy — start' },
  { key: 'vuquyEnd', label: 'Lễ Vu Quy — end' },
  { key: 'thanhhonStart', label: 'Lễ Thành Hôn — start' },
  { key: 'thanhhonEnd', label: 'Lễ Thành Hôn — end' },
]

export default function DatesSection() {
  const { draft, setSlice, saveSlice, isSliceDirty } = useDraftConfig()
  const form = draft.dates
  const dirty = isSliceDirty('dates')
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState(null)

  const handleChange = (key, value) => {
    setSlice('dates', (d) => ({ ...d, [key]: value }))
  }

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    setStatus(null)
    try {
      await saveSlice('dates')
      setStatus({ type: 'success', message: 'Dates saved.' })
    } catch (err) {
      console.error(err)
      setStatus({ type: 'error', message: err.message || 'Failed to save.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={save}
      className="glass rounded-3xl p-6 md:p-8 space-y-5"
    >
      <header>
        <p className="eyebrow">Dates</p>
        <h2 className="font-display text-2xl md:text-3xl mt-1">
          Wedding ceremony schedule
        </h2>
        <p className="text-sm text-muted mt-2">
          Times use Vietnam time (+07:00). The countdown picks the next
          upcoming event automatically.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-4">
        {FIELDS.map(({ key, label }) => (
          <div key={key}>
            <label className="block text-[11px] tracking-[0.22em] uppercase text-muted mb-2">
              {label}
            </label>
            <input
              type="datetime-local"
              value={isoToLocalInput(form[key])}
              onChange={(e) => handleChange(key, localInputToIso(e.target.value))}
              className="w-full rounded-xl border border-line bg-bg px-4 py-3 text-ink focus:border-accent transition-colors"
              required
            />
          </div>
        ))}

        <div>
          <label className="block text-[11px] tracking-[0.22em] uppercase text-muted mb-2">
            RSVP deadline (YYYY-MM-DD)
          </label>
          <input
            type="date"
            value={form.rsvpDeadline || ''}
            onChange={(e) => handleChange('rsvpDeadline', e.target.value)}
            className="w-full rounded-xl border border-line bg-bg px-4 py-3 text-ink focus:border-accent transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        {status ? (
          <p
            className={`text-sm ${
              status.type === 'error' ? 'text-red-500' : 'text-accent'
            }`}
          >
            {status.message}
          </p>
        ) : (
          <span className="text-xs text-muted">
            {dirty ? 'Unsaved changes' : 'Saved'}
          </span>
        )}
        <button
          type="submit"
          disabled={saving || !dirty}
          className="btn-primary disabled:opacity-60"
        >
          <Save size={16} />
          {saving ? 'Saving…' : 'Save dates'}
        </button>
      </div>
    </form>
  )
}
