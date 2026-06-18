import { useState } from 'react'
import { Save, Mail } from 'lucide-react'
import { useDraftConfig } from '../DraftConfigContext'
import ImageInput from '../../components/admin/ImageInput.jsx'
import LabelsPanel from './LabelsPanel'
import LabelField from './LabelField'

const FAMILY_FIELDS = [
  { key: 'groomFather', label: 'Groom · Father (Nhà Trai)', placeholder: 'Ông Phan Văn Hùng' },
  { key: 'brideFather', label: 'Bride · Father (Nhà Gái)', placeholder: 'Ông Nguyễn Văn Minh' },
  { key: 'groomMother', label: 'Groom · Mother', placeholder: 'Bà Trần Thị Lan' },
  { key: 'brideMother', label: 'Bride · Mother', placeholder: 'Bà Lê Thị Hồng' },
  { key: 'groomHometown', label: 'Groom · Hometown', placeholder: 'TP. Hà Nội' },
  { key: 'brideHometown', label: 'Bride · Hometown', placeholder: 'TP. Điện Biên' },
]

const CEREMONY_FIELDS = [
  { key: 'vuquyLunar', label: 'Lễ Vu Quy · Lunar date', placeholder: 'Nhằm ngày … (Âm lịch)' },
  { key: 'vuquyAddress', label: 'Lễ Vu Quy · Address', placeholder: '123 Nguyễn Huệ, Quận 1, TP. HCM' },
  { key: 'thanhhonLunar', label: 'Lễ Thành Hôn · Lunar date', placeholder: 'Nhằm ngày … (Âm lịch)' },
  { key: 'thanhhonAddress', label: 'Lễ Thành Hôn · Address', placeholder: '456 Lê Lợi, Quận 1, TP. HCM' },
]

const inputClass =
  'w-full rounded-xl border border-line bg-bg px-4 py-3 text-ink focus:border-accent transition-colors'
const labelClass = 'block text-[11px] tracking-[0.22em] uppercase text-muted mb-2'

export default function InvitationSection() {
  const { draft, setSlice, saveSlice, isSliceDirty } = useDraftConfig()
  const inv = draft.invitation || {}
  const text = inv.letterImage || ''
  const dirty = isSliceDirty('invitation')
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState(null)

  const setField = (key, value) =>
    setSlice('invitation', (i) => ({ ...(i || {}), [key]: value }))

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    setStatus(null)
    try {
      // Whole-slice save: trim every string so we never persist the other
      // fields blank, then null an empty image so the envelope text card shows.
      const trimmed = Object.fromEntries(
        Object.entries(inv).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v]),
      )
      const payload = { ...trimmed, letterImage: trimmed.letterImage || null }
      await saveSlice('invitation', payload)
      setSlice('invitation', payload)
      setStatus({ type: 'success', message: 'Invitation saved.' })
    } catch (err) {
      console.error(err)
      setStatus({ type: 'error', message: err.message || 'Failed to save.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <LabelsPanel title="Invitation labels">
        <LabelField
          fieldKey="invitation.tap"
          label="Tap-to-open prompt"
          defaultVi="Chạm để mở"
        />
        <LabelField
          fieldKey="invitation.eyebrow"
          label="Eyebrow"
          defaultVi="Trân trọng kính mời"
        />
        <LabelField
          fieldKey="invitation.line"
          label="Letter line"
          defaultVi="Lễ cưới của chúng mình"
        />
        <LabelField
          fieldKey="invite.familyGroom"
          label="Family heading (groom)"
          defaultVi="Nhà Trai"
        />
        <LabelField
          fieldKey="invite.familyBride"
          label="Family heading (bride)"
          defaultVi="Nhà Gái"
        />
      </LabelsPanel>

      <form onSubmit={save} className="space-y-5">
        <header className="glass rounded-3xl p-6 md:p-8">
          <p className="eyebrow flex items-center gap-2">
            <Mail size={12} />
            Invitation
          </p>
          <h2 className="font-display text-2xl md:text-3xl mt-1">Wedding invitation</h2>
          <p className="text-sm text-muted mt-2 max-w-2xl">
            Drives the invitation section after the hero — the two families, your formal
            message, and each ceremony lunar date + address — plus the image that rises out
            of the intro envelope. Solar date, time and venue name come from the Dates
            &amp; Venues sections.
          </p>
        </header>

        {/* Two families — Nhà Trai / Nhà Gái */}
        <div className="glass rounded-3xl p-6 md:p-7">
          <p className="eyebrow">Two families</p>
          <p className="text-sm text-muted mt-2 mb-4 max-w-2xl">
            Parents announced on the invitation. Include the honorific (Ông / Bà) in the
            name. Leave a field empty to hide it.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {FAMILY_FIELDS.map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className={labelClass}>{label}</label>
                <input
                  type="text"
                  value={inv[key] ?? ''}
                  onChange={(e) => setField(key, e.target.value)}
                  placeholder={placeholder}
                  className={inputClass}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Formal invitation message */}
        <div className="glass rounded-3xl p-6 md:p-7">
          <p className="eyebrow">Formal invitation message</p>
          <p className="text-sm text-muted mt-2 mb-4 max-w-2xl">
            The invite sentence under the couple names.
          </p>
          <div>
            <label className={labelClass}>Lời mời</label>
            <textarea
              rows={3}
              value={inv.message_vi ?? ''}
              onChange={(e) => setField('message_vi', e.target.value)}
              placeholder="Trân trọng kính mời quý khách…"
              className={inputClass}
            />
          </div>
        </div>

        {/* Per-ceremony lunar date + full address */}
        <div className="glass rounded-3xl p-6 md:p-7">
          <p className="eyebrow">Ceremony lunar date &amp; address</p>
          <p className="text-sm text-muted mt-2 mb-4 max-w-2xl">
            The lunar-date line and full street address shown under each ceremony card.
            Leave empty to hide a line.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {CEREMONY_FIELDS.map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className={labelClass}>{label}</label>
                <input
                  type="text"
                  value={inv[key] ?? ''}
                  onChange={(e) => setField(key, e.target.value)}
                  placeholder={placeholder}
                  className={inputClass}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Intro-envelope image */}
        <div className="glass rounded-3xl p-6 md:p-7">
          <label className={labelClass}>Envelope letter image URL</label>
          <ImageInput
            value={text}
            onChange={(next) => setField('letterImage', next)}
            placeholder="https://example.com/our-invitation.jpg"
            inputClassName="w-full rounded-xl border border-line bg-bg px-4 py-3 font-mono text-xs"
          />

          {text.trim() ? (
            <div className="mt-5">
              <p className="eyebrow mb-3">Preview</p>
              <div className="relative w-[min(360px,100%)] mx-auto aspect-[3/2] rounded-2xl overflow-hidden border border-line bg-surface shadow-[0_30px_70px_-30px_rgba(0,0,0,0.45)]">
                <img
                  src={text.trim()}
                  alt="Invitation letter preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.opacity = '0.15'
                  }}
                />
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted mt-3">
              No image set — the envelope shows the default text card.
            </p>
          )}
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
            {saving ? 'Saving…' : 'Save invitation'}
          </button>
        </div>
      </form>
    </div>
  )
}
