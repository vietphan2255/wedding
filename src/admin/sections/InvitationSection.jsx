import { useState } from 'react'
import { Save, Mail } from 'lucide-react'
import { useDraftConfig } from '../DraftConfigContext.jsx'
import ImageInput from '../../components/admin/ImageInput.jsx'
import LabelsPanel from './LabelsPanel.jsx'
import LabelField from './LabelField.jsx'

export default function InvitationSection() {
  const { draft, setSlice, saveSlice, isSliceDirty } = useDraftConfig()
  const text = draft.invitation?.letterImage || ''
  const dirty = isSliceDirty('invitation')
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState(null)

  const setText = (next) =>
    setSlice('invitation', (i) => ({ ...(i || {}), letterImage: next }))

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    setStatus(null)
    try {
      const cleaned = text.trim()
      await saveSlice('invitation', { letterImage: cleaned || null })
      setText(cleaned)
      setStatus({ type: 'success', message: 'Invitation letter saved.' })
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
          defaultEn="Tap to open"
          defaultVi="Chạm để mở"
        />
        <LabelField
          fieldKey="invitation.eyebrow"
          label="Eyebrow"
          defaultEn="You are invited"
          defaultVi="Trân trọng kính mời"
        />
        <LabelField
          fieldKey="invitation.line"
          label="Letter line"
          defaultEn="A celebration of love"
          defaultVi="Lễ cưới của chúng mình"
        />
      </LabelsPanel>

    <form onSubmit={save} className="space-y-5">
      <header className="glass rounded-3xl p-6 md:p-8">
        <p className="eyebrow flex items-center gap-2">
          <Mail size={12} />
          Invitation
        </p>
        <h2 className="font-display text-2xl md:text-3xl mt-1">
          Invitation letter
        </h2>
        <p className="text-sm text-muted mt-2 max-w-2xl">
          Paste an image URL for the letter that slides up out of the envelope
          when a guest opens the site. Landscape (~3:2) images look best. Leave
          it empty to fall back to the default text card.
        </p>
      </header>

      <div className="glass rounded-3xl p-6 md:p-7">
        <label className="block text-[11px] tracking-[0.22em] uppercase text-muted mb-2">
          Letter image URL
        </label>
        <ImageInput
          value={text}
          onChange={setText}
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
