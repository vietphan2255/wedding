import { useEffect, useState } from 'react'
import { ref, set } from 'firebase/database'
import { Save, Gift } from 'lucide-react'
import { db, isConfigured } from '../../firebase/config.js'
import { useWeddingConfig } from '../../contexts/WeddingConfigContext.jsx'

const SIDES = [
  { key: 'bride', label: "Bride's account" },
  { key: 'groom', label: "Groom's account" },
]

const FIELDS = [
  { key: 'bank', label: 'Bank name' },
  { key: 'holder', label: 'Account holder' },
  { key: 'account', label: 'Account number' },
  { key: 'qrUrl', label: 'QR image URL (optional)' },
]

export default function GiftsSection() {
  const { config } = useWeddingConfig()
  const [form, setForm] = useState(() => ({ ...(config.gifts || {}) }))
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState(null)

  useEffect(() => {
    setForm({ ...(config.gifts || {}) })
  }, [config.gifts])

  const handle = (side, field, value) => {
    setForm((f) => ({
      ...f,
      [side]: { ...(f[side] || {}), [field]: value },
    }))
  }

  const toggleEnabled = (value) => {
    setForm((f) => ({ ...f, enabled: value }))
  }

  const save = async (e) => {
    e.preventDefault()
    if (!isConfigured || !db) {
      setStatus({ type: 'error', message: 'Firebase is not configured.' })
      return
    }
    setSaving(true)
    setStatus(null)
    try {
      await set(ref(db, 'config/gifts'), {
        enabled: form.enabled !== false,
        bride: form.bride || {},
        groom: form.groom || {},
      })
      setStatus({ type: 'success', message: 'Gift details saved.' })
    } catch (err) {
      console.error(err)
      setStatus({ type: 'error', message: err.message || 'Failed to save.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={save} className="space-y-5">
      <header className="glass rounded-3xl p-6 md:p-8">
        <p className="eyebrow flex items-center gap-2">
          <Gift size={12} />
          Gift / Lì Xì
        </p>
        <h2 className="font-display text-2xl md:text-3xl mt-1">
          Bank details for wedding gifts
        </h2>
        <p className="text-sm text-muted mt-2 max-w-2xl">
          Edit the bank-transfer info shown on the public site. Each card has an
          optional QR image — paste a public image URL (e.g. a VietQR PNG)
          generated from your banking app.
        </p>
        <label className="mt-4 inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.enabled !== false}
            onChange={(e) => toggleEnabled(e.target.checked)}
            className="accent-[var(--color-accent)]"
          />
          <span>Show the gift section on the public site</span>
        </label>
      </header>

      <div className="grid md:grid-cols-2 gap-4">
        {SIDES.map(({ key, label }) => (
          <div key={key} className="glass rounded-3xl p-6 md:p-7">
            <p className="eyebrow">{label}</p>
            <div className="mt-4 space-y-4">
              {FIELDS.map((f) => (
                <div key={f.key}>
                  <label className="block text-[11px] tracking-[0.22em] uppercase text-muted mb-2">
                    {f.label}
                  </label>
                  {f.key === 'qrUrl' ? (
                    <input
                      type="url"
                      value={form[key]?.[f.key] || ''}
                      onChange={(e) => handle(key, f.key, e.target.value)}
                      placeholder="https://…/qr.png"
                      className="w-full rounded-xl border border-line bg-bg px-4 py-3 text-ink focus:border-accent"
                    />
                  ) : (
                    <input
                      type="text"
                      value={form[key]?.[f.key] || ''}
                      onChange={(e) => handle(key, f.key, e.target.value)}
                      className="w-full rounded-xl border border-line bg-bg px-4 py-3 text-ink focus:border-accent"
                    />
                  )}
                </div>
              ))}
            </div>
            {form[key]?.qrUrl && (
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-line p-3">
                <img
                  src={form[key].qrUrl}
                  alt="QR preview"
                  className="w-20 h-20 rounded-lg object-contain bg-bg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
                <p className="text-xs text-muted">QR preview</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between glass rounded-3xl p-5">
        {status ? (
          <p
            className={`text-sm ${
              status.type === 'error' ? 'text-red-500' : 'text-accent'
            }`}
          >
            {status.message}
          </p>
        ) : (
          <span />
        )}
        <button
          type="submit"
          disabled={saving}
          className="btn-primary disabled:opacity-60"
        >
          <Save size={16} />
          {saving ? 'Saving…' : 'Save gift details'}
        </button>
      </div>
    </form>
  )
}
