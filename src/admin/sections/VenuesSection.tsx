import { useState } from 'react'
import { Save, ExternalLink } from 'lucide-react'
import { useDraftConfig } from '../DraftConfigContext'
import LabelsPanel from './LabelsPanel.jsx'
import LabelField from './LabelField.jsx'

const CEREMONIES = [
  { key: 'vuquy', label: 'Lễ Vu Quy' },
  { key: 'thanhhon', label: 'Lễ Thành Hôn' },
]

export default function VenuesSection() {
  const { draft, setSlice, saveSlice, isSliceDirty } = useDraftConfig()
  const form = draft.venues
  const dirty = isSliceDirty('venues')
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const handle = (key, field, value) => {
    setSlice('venues', (v) => ({
      ...v,
      [key]: { ...(v?.[key] || {}), [field]: value },
    }))
  }

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    setStatus(null)
    try {
      await saveSlice('venues')
      setStatus({ type: 'success', message: 'Venues saved.' })
    } catch (err) {
      console.error(err)
      setStatus({ type: 'error', message: (err as Error).message || 'Failed to save.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <LabelsPanel title="Timeline labels">
        <LabelField
          fieldKey="timeline.eyebrow"
          label="Eyebrow"
          defaultVi="Lưu lại các ngày"
        />
        <LabelField
          fieldKey="timeline.title"
          label="Title"
          defaultVi="Hành trình lễ cưới"
        />
        <LabelField
          fieldKey="timeline.divider"
          label="Divider text"
          defaultVi="v & n"
        />
        <LabelField
          fieldKey="timeline.subtitle"
          label="Subtitle"
          defaultVi="Mỗi nghi lễ là một chương của hành trình đến ngày trọng đại"
          multiline
        />
        <LabelField
          fieldKey="timeline.dressCode"
          label="Dress code label"
          defaultVi="Trang phục"
        />
        <LabelField
          fieldKey="timeline.showDetails"
          label="Show details CTA"
          defaultVi="Xem chi tiết"
        />
        <LabelField
          fieldKey="timeline.hideDetails"
          label="Hide details CTA"
          defaultVi="Ẩn chi tiết"
        />
        <LabelField
          fieldKey="timeline.openMap"
          label="Open map CTA"
          defaultVi="Mở Google Maps"
        />
        <LabelField
          fieldKey="timeline.addCalendar"
          label="Add to calendar CTA"
          defaultVi="Thêm vào lịch"
        />
      </LabelsPanel>

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
              value={form?.[key]?.mapEmbed || ''}
              onChange={(e) => handle(key, 'mapEmbed', e.target.value)}
              placeholder="https://www.google.com/maps/embed?pb=…"
              className="w-full rounded-xl border border-line bg-bg px-4 py-3 text-ink focus:border-accent font-mono text-xs leading-relaxed"
            />
            {form?.[key]?.mapEmbed && (
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
          {saving ? 'Saving…' : 'Save venues'}
        </button>
      </div>
    </form>
    </div>
  )
}
