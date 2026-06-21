import { useState } from 'react'
import { Save, MousePointer2 } from 'lucide-react'
import { useDraftConfig } from '../DraftConfigContext'
import ImageInput from '../../components/admin/ImageInput.jsx'
import type { Effects } from '../../contexts/configTypes'

// Single-field admin section for the GIF cursor URL. Mirrors the pattern in
// InvitationSection — paste-or-upload via ImageInput, save via the `effects`
// slice. Empty value disables the GIF cursor and the page falls back to the
// default ring + dot.
export default function EffectsSection() {
  const { draft, setSlice, saveSlice, isSliceDirty } = useDraftConfig()
  const eff = draft.effects
  const cursorGif = eff?.cursorGif || ''
  const dirty = isSliceDirty('effects')
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<
    | { type: 'success' | 'error'; message: string }
    | null
  >(null)

  const setEff = (patch: Partial<Effects>) =>
    setSlice('effects', (e) => ({ ...(e as Effects), ...patch }))
  const setCursorGif = (next: string) => setEff({ cursorGif: next })

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setStatus(null)
    try {
      const payload: Effects = {
        cursorGif: cursorGif.trim(),
        idleSwap: Boolean(eff?.idleSwap),
        idleZoom: Boolean(eff?.idleZoom),
        idleDelay: Number(eff?.idleDelay) || 1.5,
        idleZoomLevels: Math.max(1, Math.round(Number(eff?.idleZoomLevels) || 3)),
      }
      await saveSlice('effects', payload)
      setSlice('effects', payload)
      setStatus({ type: 'success', message: 'Cursor saved.' })
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
          links) where the ring + label state still wins. Optionally reveal it
          only when the mouse is idle and/or zoom it the longer it sits still.
          Disabled on touch devices and for visitors who prefer reduced motion.
          Leave the URL empty to fall back to the default ring + dot cursor.
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

        {cursorGif.trim() ? (
          <div className="mt-5 rounded-2xl border border-line p-4">
            <p className="eyebrow mb-3">Idle behavior</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-start gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(eff?.idleSwap)}
                  onChange={(e) => setEff({ idleSwap: e.target.checked })}
                  className="mt-1"
                />
                <span>
                  <span className="font-medium">Show only when idle</span>
                  <span className="block text-xs text-muted">
                    While the mouse is moving, show the default ring + dot; reveal
                    the GIF after the pointer sits still.
                  </span>
                </span>
              </label>
              <label className="flex items-start gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(eff?.idleZoom)}
                  onChange={(e) => setEff({ idleZoom: e.target.checked })}
                  className="mt-1"
                />
                <span>
                  <span className="font-medium">Zoom when idle</span>
                  <span className="block text-xs text-muted">
                    Grow the GIF in steps the longer the mouse stays still.
                  </span>
                </span>
              </label>
            </div>

            {(eff?.idleSwap || eff?.idleZoom) && (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] tracking-[0.22em] uppercase text-muted mb-2">
                    Idle delay (seconds)
                  </label>
                  <input
                    type="number"
                    min={0.1}
                    step={0.1}
                    value={eff?.idleDelay ?? 1.5}
                    onChange={(e) => setEff({ idleDelay: Number(e.target.value) })}
                    className="w-full rounded-xl border border-line bg-bg px-4 py-3"
                  />
                </div>
                {eff?.idleZoom && (
                  <div>
                    <label className="block text-[11px] tracking-[0.22em] uppercase text-muted mb-2">
                      Zoom levels
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      step={1}
                      value={eff?.idleZoomLevels ?? 3}
                      onChange={(e) =>
                        setEff({ idleZoomLevels: Number(e.target.value) })
                      }
                      className="w-full rounded-xl border border-line bg-bg px-4 py-3"
                    />
                    <p className="text-xs text-muted mt-2">
                      Each level is +0.5× (3 → 1.5× / 2× / 2.5×).
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : null}
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
