import { useState } from 'react'
import { Save, Mail } from 'lucide-react'
import { useDraftConfig } from '../DraftConfigContext'
import { sanitizeGoogleMapsUrl } from '../../lib/googleMapsUrl'
import ImageFocalInput from '../../components/admin/ImageFocalInput.jsx'
import LabelsPanel from './LabelsPanel'
import LabelField from './LabelField'

const COUPLE_FIELDS = [
  { key: 'groomFullName', label: 'Groom · Full name (left)', placeholder: 'Phan Quốc Việt' },
  { key: 'brideFullName', label: 'Bride · Full name (right)', placeholder: 'Nguyễn Thảo Nguyên' },
]

const FAMILY_FIELDS = [
  { key: 'groomFather', label: 'Groom · Father (Nhà Trai)', placeholder: 'Ông Phan Văn Hùng' },
  { key: 'brideFather', label: 'Bride · Father (Nhà Gái)', placeholder: 'Ông Nguyễn Văn Minh' },
  { key: 'groomMother', label: 'Groom · Mother', placeholder: 'Bà Trần Thị Lan' },
  { key: 'brideMother', label: 'Bride · Mother', placeholder: 'Bà Lê Thị Hồng' },
  { key: 'groomHometown', label: 'Groom · Hometown', placeholder: 'TP. Hà Nội' },
  { key: 'brideHometown', label: 'Bride · Hometown', placeholder: 'TP. Điện Biên' },
]

// `kind: 'mapsUrl'` fields render full-width with Google Maps URL validation and
// helper text; the others are plain single-line text inputs.
const MAPS_URL_HELP =
  'Guests tap the address on their invitation card to open this in Google Maps. Leave empty to search by address instead.'
const CEREMONY_FIELDS = [
  { key: 'vuquyLunar', label: 'Lễ Vu Quy · Lunar date', placeholder: 'Nhằm ngày … (Âm lịch)' },
  { key: 'vuquyAddress', label: 'Lễ Vu Quy · Address', placeholder: '123 Nguyễn Huệ, Quận 1, TP. HCM' },
  {
    key: 'vuquyMapsUrl',
    label: 'Lễ Vu Quy · Google Maps URL',
    placeholder: 'https://maps.google.com/...',
    kind: 'mapsUrl',
    helper: MAPS_URL_HELP,
  },
  { key: 'thanhhonLunar', label: 'Lễ Thành Hôn · Lunar date', placeholder: 'Nhằm ngày … (Âm lịch)' },
  { key: 'thanhhonAddress', label: 'Lễ Thành Hôn · Address', placeholder: '456 Lê Lợi, Quận 1, TP. HCM' },
  {
    key: 'thanhhonMapsUrl',
    label: 'Lễ Thành Hôn · Google Maps URL',
    placeholder: 'https://maps.google.com/...',
    kind: 'mapsUrl',
    helper: MAPS_URL_HELP,
  },
]

const inputClass =
  'w-full rounded-xl border border-line bg-bg px-4 py-3 text-ink focus:border-accent transition-colors'
const labelClass = 'block text-[11px] tracking-[0.22em] uppercase text-muted mb-2'

// A maps-URL field is valid when empty (optional) or a recognized Google Maps link.
// Shared by the live inline check and the save gate so they never disagree.
const isMapsFieldValid = (value) => {
  const trimmed = (value ?? '').trim()
  return trimmed === '' || Boolean(sanitizeGoogleMapsUrl(trimmed))
}

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
    // Reject invalid Google Maps URLs before persisting; empty is allowed (the card
    // falls back to an address search). Blocking keeps a bad value out of Firebase
    // without touching the other invitation fields.
    const hasInvalidMapsUrl = CEREMONY_FIELDS.some(
      (f) => f.kind === 'mapsUrl' && !isMapsFieldValid(inv[f.key]),
    )
    if (hasInvalidMapsUrl) {
      setStatus({
        type: 'error',
        message: 'Enter a valid Google Maps link, or leave the field empty.',
      })
      return
    }
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
        <LabelField
          fieldKey="events.vuquy.venue"
          label="Lễ Vu Quy · Venue name"
          defaultVi="Tư gia nhà gái  ·  TP. Hồ Chí Minh"
        />
        <LabelField
          fieldKey="events.thanhhon.venue"
          label="Lễ Thành Hôn · Venue name"
          defaultVi="Trung tâm tiệc cưới  ·  TP. Hồ Chí Minh"
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

        {/* Couple full names — shown large on the invitation card */}
        <div className="glass rounded-3xl p-6 md:p-7">
          <p className="eyebrow">Couple full names</p>
          <p className="text-sm text-muted mt-2 mb-4 max-w-2xl">
            Shown large on the invitation card. Leave empty to use the short names from
            Couple &amp; contact.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {COUPLE_FIELDS.map(({ key, label, placeholder }) => (
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
            {CEREMONY_FIELDS.map(({ key, label, placeholder, kind, helper }) => {
              const value = inv[key] ?? ''
              const isMapsUrl = kind === 'mapsUrl'
              const invalid = isMapsUrl && !isMapsFieldValid(value)
              const inputId = `inv-${key}`
              const helpId = isMapsUrl ? `${inputId}-help` : undefined
              return (
                <div key={key} className={isMapsUrl ? 'md:col-span-2' : undefined}>
                  <label className={labelClass} htmlFor={inputId}>
                    {label}
                  </label>
                  <input
                    id={inputId}
                    type={isMapsUrl ? 'url' : 'text'}
                    value={value}
                    onChange={(e) => setField(key, e.target.value)}
                    placeholder={placeholder}
                    className={`${inputClass}${
                      invalid ? ' border-red-500 focus:border-red-500' : ''
                    }`}
                    aria-invalid={invalid || undefined}
                    aria-describedby={helpId}
                  />
                  {isMapsUrl ? (
                    <p
                      id={helpId}
                      className={`text-xs mt-1.5 ${invalid ? 'text-red-500' : 'text-muted'}`}
                    >
                      {invalid
                        ? 'Enter a valid Google Maps link (maps.google.com, google.com/maps, goo.gl/maps, or maps.app.goo.gl).'
                        : helper}
                    </p>
                  ) : null}
                </div>
              )
            })}
          </div>
        </div>

        {/* Intro-envelope image */}
        <div className="glass rounded-3xl p-6 md:p-7">
          <label className={labelClass}>Envelope letter image URL</label>
          <ImageFocalInput
            value={text}
            onChange={(next) => setField('letterImage', next)}
            focalX={inv.letterFocalX ?? 50}
            focalY={inv.letterFocalY ?? 50}
            onFocalChange={(x, y) =>
              setSlice('invitation', (i) => ({
                ...(i || {}),
                letterFocalX: x,
                letterFocalY: y,
              }))
            }
            frames={[{ label: 'Envelope', aspect: '3 / 2' }]}
            placeholder="https://example.com/our-invitation.jpg"
            inputClassName="w-full rounded-xl border border-line bg-bg px-4 py-3 font-mono text-xs"
            emptyHint="No image set — the envelope shows the default text card."
          />
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
