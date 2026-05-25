import { useEffect, useState } from 'react'
import { ref, set } from 'firebase/database'
import { Save, ExternalLink } from 'lucide-react'
import { db, isConfigured } from '../../firebase/config.js'
import { useWeddingConfig } from '../../contexts/WeddingConfigContext.jsx'

const CEREMONIES = [
  { key: 'vuquy', label: 'Lễ Vu Quy' },
  { key: 'thanhhon', label: 'Lễ Thành Hôn' },
]

export default function VenuesSection() {
  const { config } = useWeddingConfig()
  const [form, setForm] = useState(() => ({
    vuquy: { ...(config.venues?.vuquy || {}) },
    thanhhon: { ...(config.venues?.thanhhon || {}) },
  }))
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState(null)

  useEffect(() => {
    setForm({
      vuquy: { ...(config.venues?.vuquy || {}) },
      thanhhon: { ...(config.venues?.thanhhon || {}) },
    })
  }, [config.venues])

  const handle = (key, field, value) => {
    setForm((f) => ({ ...f, [key]: { ...f[key], [field]: value } }))
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
      await set(ref(db, 'config/venues'), form)
      setStatus({ type: 'success', message: 'Venues saved.' })
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
        <p className="eyebrow">Venues</p>
        <h2 className="font-display text-2xl md:text-3xl mt-1">
          Map embed per ceremony
        </h2>
        <p className="text-sm text-muted mt-2 max-w-2xl">
          Paste the full <strong>Google Maps embed URL</strong> for each ceremony.
          Open Google Maps → find the venue → <em>Share → Embed a map</em> →
          copy the <code>src</code> value of the iframe (a URL starting with{' '}
          <code>https://www.google.com/maps/embed?pb=…</code>).
        </p>
        <a
          href="https://support.google.com/maps/answer/144361"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-[12px] tracking-[0.18em] uppercase text-accent hover:underline"
        >
          <ExternalLink size={13} />
          How to get the embed URL
        </a>
      </header>

      <div className="grid gap-4">
        {CEREMONIES.map(({ key, label }) => (
          <div key={key} className="glass rounded-3xl p-6 md:p-7">
            <p className="eyebrow">{label}</p>
            <label className="block text-[11px] tracking-[0.22em] uppercase text-muted mt-4 mb-2">
              Google Maps embed URL
            </label>
            <textarea
              rows={3}
              value={form[key]?.mapEmbed || ''}
              onChange={(e) => handle(key, 'mapEmbed', e.target.value)}
              placeholder="https://www.google.com/maps/embed?pb=…"
              className="w-full rounded-xl border border-line bg-bg px-4 py-3 text-ink focus:border-accent font-mono text-xs leading-relaxed"
            />
            {form[key]?.mapEmbed && (
              <div className="mt-4 rounded-2xl overflow-hidden border border-line aspect-[16/8]">
                <iframe
                  title={`${label} preview`}
                  src={form[key].mapEmbed}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full border-0"
                />
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
          {saving ? 'Saving…' : 'Save venues'}
        </button>
      </div>
    </form>
  )
}
