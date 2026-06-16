import { useState } from 'react'
import { Save, MousePointer2 } from 'lucide-react'
import { useDraftConfig } from '../DraftConfigContext'
import ImageInput from '../../components/admin/ImageInput.jsx'

// Single-field admin section for the GIF cursor URL. Mirrors the pattern in
// InvitationSection — paste-or-upload via ImageInput, save via the `effects`
// slice. Empty value disables the GIF cursor and the page falls back to the
// default ring + dot.
export default function EffectsSection() {
  const { draft, setSlice, saveSlice, isSliceDirty } = useDraftConfig()
  const cursorGif = draft.effects?.cursorGif || ''
  const dirty = isSliceDirty('effects')
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<
    | { type: 'success' | 'error'; message: string }
    | null
  >(null)

  const setCursorGif = (next: string) =>
    setSlice('effects', (e) => ({ ...(e || { cursorGif: '' }), cursorGif: next }))

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setStatus(null)
    try {
      const cleaned = cursorGif.trim()
      await saveSlice('effects', { cursorGif: cleaned })
      setCursorGif(cleaned)
      setStatus({ type: 'success', message: 'Cursor GIF saved.' })
    } catch (err) {
      console.error(err)
      setStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to save.',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={save} className="space-y-5">
      <header className="glass rounded-3xl p-6 md:p-8">
        <p className="eyebrow flex items-center gap-2">
          <MousePointer2 size={12} />
          Effects
        </p>
        <h2 className="font-display text-2xl md:text-3xl mt-1">
          Cursor GIF
        </h2>
        <p className="text-sm text-muted mt-2 max-w-2xl">
          Show a GIF as the cursor on the home page. The GIF follows the mouse
          everywhere except over interactive elements (gallery, lightbox,
          links) where the ring + label state still wins. Disabled on touch
          devices and for visitors who prefer reduced motion. Leave the URL
          empty to fall back to the default ring + dot cursor.
        </p>
      </header>

      <div className="glass rounded-3xl p-6 md:p-7">
        <label className="block text-[11px] tracking-[0.22em] uppercase text-muted mb-2">
          Cursor GIF URL
        </label>
        <ImageInput
          value={cursorGif}
          onChange={setCursorGif}
          placeholder="https://example.com/sparkle.gif"
          inputClassName="w-full rounded-xl border border-line bg-bg px-4 py-3 font-mono text-xs"
        />

        {cursorGif.trim() ? (
          <div className="mt-5">
            <p className="eyebrow mb-3">Preview</p>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl border border-line bg-surface">
              <img
                src={cursorGif.trim()}
                alt="Cursor GIF preview"
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  ;(e.currentTarget as HTMLImageElement).style.opacity = '0.15'
                }}
              />
            </div>
            <p className="text-xs text-muted mt-3">
              Small, transparent-background GIFs (~64×64) work best. Larger
              GIFs are rendered at 56px on the page.
            </p>
          </div>
        ) : (
          <p className="text-xs text-muted mt-3">
            No GIF set — the home page uses the default ring + dot cursor.
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
          {saving ? 'Saving…' : 'Save cursor'}
        </button>
      </div>
    </form>
  )
}
