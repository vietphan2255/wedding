import { useState } from 'react'
import { Save, Gift } from 'lucide-react'
import { useDraftConfig } from '../DraftConfigContext'
import ImageInput from '../../components/admin/ImageInput.jsx'
import ZoomableImg from '../../components/admin/ZoomableImg'
import LabelsPanel from './LabelsPanel.jsx'
import LabelField from './LabelField.jsx'

const SIDES = [
  { key: 'bride', label: "Bride's account" },
  { key: 'groom', label: "Groom's account" },
]

const FIELDS = [
  { key: 'bank', label: 'Bank name' },
  { key: 'holder', label: 'Account holder' },
  { key: 'account', label: 'Account number' },
  { key: 'qrUrl', label: 'QR / banking portrait image' },
]

export default function GiftsSection() {
  const { draft, setSlice, saveSlice, isSliceDirty } = useDraftConfig()
  const form = draft.gifts || {}
  const dirty = isSliceDirty('gifts')
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const handle = (side, field, value) => {
    setSlice('gifts', (f) => ({
      ...(f || {}),
      [side]: { ...((f && f[side]) || {}), [field]: value },
    }))
  }

  const toggleEnabled = (value) => {
    setSlice('gifts', (f) => ({ ...(f || {}), enabled: value }))
  }

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    setStatus(null)
    try {
      await saveSlice('gifts', {
        enabled: form.enabled !== false,
        bride: form.bride || {},
        groom: form.groom || {},
      })
      setStatus({ type: 'success', message: 'Gift details saved.' })
    } catch (err) {
      console.error(err)
      setStatus({ type: 'error', message: (err as Error).message || 'Failed to save.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <LabelsPanel title="Gifts labels">
        <LabelField
          fieldKey="gift.eyebrow"
          label="Eyebrow"
          defaultVi="Mừng cưới"
        />
        <LabelField
          fieldKey="gift.title"
          label="Title"
          defaultVi="Gửi mừng cưới"
        />
        <LabelField
          fieldKey="gift.subhead"
          label="Subtitle"
          help="Để trống = không hiển thị"
        />
        <LabelField
          fieldKey="gift.subtitle"
          label="Description"
          defaultVi="Sự có mặt của bạn đã là món quà lớn nhất — nhưng nếu bạn muốn gửi mừng cưới, đây là thông tin tài khoản."
          multiline
        />
      </LabelsPanel>

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
          Edit the bank-transfer info shown on the public site. Each card shows a
          portrait QR image (e.g. a VietQR card, ~2:3 vertical) as its centerpiece
          — use the same style for both sides. The account number below it stays
          editable so guests can copy it. If no image is set, the card falls back
          to plain bank text.
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
                    <ImageInput
                      value={form[key]?.[f.key]}
                      onChange={(url) => handle(key, f.key, url)}
                      placeholder="https://…/qr.png"
                      inputClassName="w-full rounded-xl border border-line bg-bg px-4 py-3 text-ink focus:border-accent"
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
                <ZoomableImg
                  src={form[key].qrUrl}
                  alt="QR preview"
                  className="w-16 aspect-[2/3] rounded-lg object-contain bg-ink"
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
          {saving ? 'Saving…' : 'Save gift details'}
        </button>
      </div>
    </form>
    </div>
  )
}
