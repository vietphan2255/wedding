import { useState, type FormEvent } from 'react'
import { Save } from 'lucide-react'
import { useDraftConfig } from '../DraftConfigContext'
import ImageInput from '../../components/admin/ImageInput.jsx'
import type { Hero } from '../../contexts/configTypes'
import LabelsPanel from './LabelsPanel.jsx'
import LabelField from './LabelField.jsx'

const labelClass = 'block text-[11px] tracking-[0.22em] uppercase text-muted mb-2'

export default function HeroSection() {
  const { draft, setSlice, saveSlice, isSliceDirty } = useDraftConfig()
  const hero = draft.hero
  const dirty = isSliceDirty('hero')
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<{
    type: 'error' | 'success'
    message: string
  } | null>(null)

  const save = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setStatus(null)
    try {
      const payload: Hero = { image: (hero.image || '').trim() }
      setSlice('hero', payload)
      await saveSlice('hero', payload)
      setStatus({ type: 'success', message: 'Hero image saved.' })
    } catch (err) {
      setStatus({
        type: 'error',
        message: (err as Error)?.message || 'Failed to save.',
      })
    } finally {
      setSaving(false)
    }
  }

  const preview = (hero.image || '').trim()

  return (
    <div>
      <header className="mb-5">
        <p className="eyebrow">Hero</p>
        <h2 className="font-display text-2xl md:text-3xl mt-1">
          Hero section
        </h2>
        <p className="text-sm text-muted mt-2">
          Top of the page. Couple names live under Common · Couple.
        </p>
      </header>

      <form onSubmit={save} className="space-y-5 mb-6">
        <div className="glass rounded-3xl p-6 md:p-7">
          <label className={labelClass}>Hero background image</label>
          <ImageInput
            value={hero.image || ''}
            onChange={(next: string) => setSlice('hero', { image: next })}
            placeholder="https://example.com/hero.jpg"
            inputClassName="w-full rounded-xl border border-line bg-bg px-4 py-3 font-mono text-xs"
          />

          {preview ? (
            <div className="mt-5">
              <p className="eyebrow mb-3">Preview</p>
              <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-line bg-surface">
                <img
                  src={preview}
                  alt="Hero background preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.opacity = '0.15'
                  }}
                />
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted mt-3">
              No image set — the hero uses the built-in default photo.
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
            {saving ? 'Saving…' : 'Save hero image'}
          </button>
        </div>
      </form>

      <LabelsPanel
        title="Hero labels"
        help="Keep the date string in the form `26 July · 02 August · 2026` (with the `·` separators) so the hero → countdown animation matches."
      >
        <LabelField
          fieldKey="hero.eyebrow"
          label="Eyebrow"
          defaultVi="Chúng mình sắp về chung một nhà"
        />
        <LabelField
          fieldKey="hero.and"
          label="Conjunction"
          defaultVi="&"
        />
        <LabelField
          fieldKey="hero.saveTheDate"
          label="Save the date"
          defaultVi="Lưu lại ngày vui"
        />
        <LabelField
          fieldKey="hero.dates"
          label="Date line"
          defaultVi="26 Tháng 07  ·  02 Tháng 08  ·  2026"
          help="Use the `·` separator (Option+8 on Mac) so the hero → countdown flight animation can split it."
        />
        <LabelField
          fieldKey="hero.scroll"
          label="Scroll prompt"
          defaultVi="Cuộn để khám phá"
        />
      </LabelsPanel>
    </div>
  )
}
