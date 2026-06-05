import { useState } from 'react'
import { Save } from 'lucide-react'
import { useDraftConfig } from '../DraftConfigContext.jsx'

const FIELDS = [
  { key: 'coupleNameLeft', label: 'Name (left)', placeholder: 'Viet' },
  { key: 'coupleNameRight', label: 'Name (right)', placeholder: 'Nguyen' },
  { key: 'coupleInitialLeft', label: 'Initial (left)', placeholder: 'V' },
  { key: 'coupleInitialRight', label: 'Initial (right)', placeholder: 'N' },
  {
    key: 'contactEmail',
    label: 'Contact email',
    placeholder: 'hello@vietnguyen-wedding.com',
    type: 'email',
  },
  {
    key: 'dateDisplay',
    label: 'Date display (footer / mobile bar)',
    placeholder: '26.07.2026  ·  02.08.2026',
  },
]

export default function CommonCoupleSection() {
  const { draft, setSlice, saveSlice, isSliceDirty } = useDraftConfig()
  const common = draft.common || {}
  const dirty = isSliceDirty('common')
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState(null)

  const handleChange = (key, value) => {
    setSlice('common', (prev) => ({ ...(prev || {}), [key]: value }))
  }

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    setStatus(null)
    try {
      await saveSlice('common')
      setStatus({ type: 'success', message: 'Saved.' })
    } catch (err) {
      console.error(err)
      setStatus({ type: 'error', message: err.message || 'Failed to save.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={save} className="glass rounded-3xl p-6 md:p-8 space-y-5">
      <header>
        <p className="eyebrow">Common · Couple</p>
        <h2 className="font-display text-2xl md:text-3xl mt-1">
          Couple & contact details
        </h2>
        <p className="text-sm text-muted mt-2">
          Shared across Hero, Navbar, Footer, Mobile RSVP bar. Update once,
          changes propagate everywhere.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-4">
        {FIELDS.map(({ key, label, placeholder, type }) => (
          <div key={key}>
            <label className="block text-[11px] tracking-[0.22em] uppercase text-muted mb-2">
              {label}
            </label>
            <input
              type={type || 'text'}
              value={common[key] ?? ''}
              onChange={(e) => handleChange(key, e.target.value)}
              placeholder={placeholder}
              className="w-full rounded-xl border border-line bg-bg px-4 py-3 text-ink focus:border-accent transition-colors"
            />
          </div>
        ))}
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
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  )
}
