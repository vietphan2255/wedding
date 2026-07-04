import { Plus, Trash2, ArrowUp, ArrowDown, Save, MousePointerClick } from 'lucide-react'
import useFirebaseSlice, { type SliceItem } from '../hooks/useFirebaseSlice'
import ImageInput from '../../components/admin/ImageInput.jsx'
import ZoomableImg from '../../components/admin/ZoomableImg'
import cssStringToStyle from '../../lib/cssStringToStyle'
import type { CursorConfig } from '../../contexts/configTypes'

// useFirebaseSlice's generic requires a string index signature (SliceItem);
// intersect so the typed CursorConfig satisfies it without an explicit one.
type CursorItem = CursorConfig & SliceItem

// data-cursor-id values pre-wired into the main sections (see the section
// components). Offered as non-restrictive datalist suggestions — any id works.
const KNOWN_IDS = [
  'hero',
  'countdown',
  'story',
  'gallery',
  'ceremonies',
  'rsvp',
  'wishes',
  'gifts',
  'faq',
  'invitation',
]

const emptyItem: Partial<CursorItem> = {
  cursorId: '',
  name: '',
  image: '',
  size: 56,
  style: '',
  idleSwap: false,
  idleZoom: false,
  idleDelay: 1.5,
  idleZoomLevels: 3,
}

const encodeItem = (it: CursorItem, i: number) => ({
  cursorId: (it.cursorId || '').trim(),
  name: it.name || '',
  image: (it.image || '').trim(),
  size: Number(it.size) || 56,
  style: it.style || '',
  idleSwap: Boolean(it.idleSwap),
  idleZoom: Boolean(it.idleZoom),
  idleDelay: Number(it.idleDelay) || 1.5,
  idleZoomLevels: Math.max(1, Math.round(Number(it.idleZoomLevels) || 3)),
  order: i,
})

// Per-section GIF cursors. Mirrors the list-admin pattern of FaqsSection: a
// useFirebaseSlice-driven add/edit/reorder/remove form over the `cursors`
// slice. Each entry's ID matches a `data-cursor-id` on the public site.
export default function CursorsSection() {
  const { items, updateItem, addItem, removeItem, move, save, saving, status, dirty } =
    useFirebaseSlice<CursorItem>('cursors', encodeItem)

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    save('Cursors saved.')
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <header className="glass rounded-3xl p-6 md:p-8">
        <p className="eyebrow flex items-center gap-2">
          <MousePointerClick size={12} />
          Cursors
        </p>
        <h2 className="font-display text-2xl md:text-3xl mt-1">Section cursors</h2>
        <p className="text-sm text-muted mt-2 max-w-2xl">
          Show a custom GIF cursor over a section. Each entry has an <strong>ID</strong>{' '}
          that matches a <code className="px-1">data-cursor-id</code> on the page — the
          main sections are pre-wired (see the suggestions), and you can add your own ids
          too. A section cursor overrides the global cursor (Effects) within its area.
          Disabled on touch devices and for reduced-motion visitors.
        </p>
        <div className="mt-4 flex items-center gap-3">
          <button type="button" onClick={() => addItem(emptyItem)} className="btn-ghost">
            <Plus size={16} />
            Add cursor
          </button>
          <p className="text-xs text-muted">{items.length} cursor(s)</p>
        </div>
      </header>

      <datalist id="cursor-id-suggestions">
        {KNOWN_IDS.map((id) => (
          <option key={id} value={id} />
        ))}
      </datalist>

      <ul className="space-y-4">
        {items.map((it, idx) => (
          <li key={it.id} className="glass rounded-3xl p-6 md:p-7">
            <div className="flex items-center justify-between gap-3 mb-4">
              <p className="eyebrow">
                {it.name?.trim() || it.cursorId?.trim() || `Cursor ${idx + 1}`}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => move(idx, -1)}
                  disabled={idx === 0}
                  className="rounded-full border border-line p-2 text-ink hover:bg-bg disabled:opacity-40"
                  aria-label="Move up"
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => move(idx, 1)}
                  disabled={idx === items.length - 1}
                  className="rounded-full border border-line p-2 text-ink hover:bg-bg disabled:opacity-40"
                  aria-label="Move down"
                >
                  <ArrowDown size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="rounded-full border border-line p-2 text-red-500 hover:bg-red-500/10"
                  aria-label="Remove cursor"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] tracking-[0.22em] uppercase text-muted mb-2">
                  ID (data-cursor-id)
                </label>
                <input
                  type="text"
                  list="cursor-id-suggestions"
                  value={it.cursorId || ''}
                  onChange={(e) => updateItem(idx, 'cursorId', e.target.value)}
                  placeholder="gallery"
                  className="w-full rounded-xl border border-line bg-bg px-4 py-3 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-[11px] tracking-[0.22em] uppercase text-muted mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={it.name || ''}
                  onChange={(e) => updateItem(idx, 'name', e.target.value)}
                  placeholder="Gallery camera"
                  className="w-full rounded-xl border border-line bg-bg px-4 py-3"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-[11px] tracking-[0.22em] uppercase text-muted mb-2">
                Image (GIF/PNG)
              </label>
              <ImageInput
                value={it.image}
                onChange={(url: string) => updateItem(idx, 'image', url)}
                placeholder="https://example.com/camera.gif"
                inputClassName="w-full rounded-xl border border-line bg-bg px-4 py-3 font-mono text-xs"
              />
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] tracking-[0.22em] uppercase text-muted mb-2">
                  Size (px)
                </label>
                <input
                  type="number"
                  min={8}
                  max={512}
                  value={it.size ?? 56}
                  onChange={(e) => updateItem(idx, 'size', Number(e.target.value))}
                  className="w-full rounded-xl border border-line bg-bg px-4 py-3"
                />
              </div>
              <div>
                <label className="block text-[11px] tracking-[0.22em] uppercase text-muted mb-2">
                  Style (CSS)
                </label>
                <textarea
                  rows={2}
                  value={it.style || ''}
                  onChange={(e) => updateItem(idx, 'style', e.target.value)}
                  placeholder="border-radius:50%; filter:drop-shadow(0 2px 6px #0006); opacity:.9"
                  className="w-full rounded-xl border border-line bg-bg px-4 py-3 font-mono text-xs"
                />
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-line p-4">
              <p className="eyebrow mb-3">Idle behavior</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-start gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(it.idleSwap)}
                    onChange={(e) => updateItem(idx, 'idleSwap', e.target.checked)}
                    className="mt-1"
                  />
                  <span>
                    <span className="font-medium">Show only when idle</span>
                    <span className="block text-xs text-muted">
                      While moving, show the global/default cursor; reveal this one after
                      the mouse sits still.
                    </span>
                  </span>
                </label>
                <label className="flex items-start gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(it.idleZoom)}
                    onChange={(e) => updateItem(idx, 'idleZoom', e.target.checked)}
                    className="mt-1"
                  />
                  <span>
                    <span className="font-medium">Zoom when idle</span>
                    <span className="block text-xs text-muted">
                      Grow this cursor in steps the longer the mouse stays still.
                    </span>
                  </span>
                </label>
              </div>

              {(it.idleSwap || it.idleZoom) && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] tracking-[0.22em] uppercase text-muted mb-2">
                      Idle delay (seconds)
                    </label>
                    <input
                      type="number"
                      min={0.1}
                      step={0.1}
                      value={it.idleDelay ?? 1.5}
                      onChange={(e) =>
                        updateItem(idx, 'idleDelay', Number(e.target.value))
                      }
                      className="w-full rounded-xl border border-line bg-bg px-4 py-3"
                    />
                  </div>
                  {it.idleZoom && (
                    <div>
                      <label className="block text-[11px] tracking-[0.22em] uppercase text-muted mb-2">
                        Zoom levels
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        step={1}
                        value={it.idleZoomLevels ?? 3}
                        onChange={(e) =>
                          updateItem(idx, 'idleZoomLevels', Number(e.target.value))
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

            {it.image?.trim() ? (
              <div className="mt-4">
                <p className="eyebrow mb-2">Preview</p>
                <div className="flex items-center justify-center h-32 rounded-2xl border border-line bg-surface overflow-hidden">
                  <ZoomableImg
                    src={it.image.trim()}
                    alt=""
                    style={{
                      ...cssStringToStyle(it.style),
                      width: Math.min(Number(it.size) || 56, 120),
                      height: Math.min(Number(it.size) || 56, 120),
                      objectFit: 'contain',
                    }}
                    onError={(e) => {
                      ;(e.currentTarget as HTMLImageElement).style.opacity = '0.15'
                    }}
                  />
                </div>
              </div>
            ) : null}
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between glass rounded-3xl p-5">
        {status ? (
          <p
            className={`text-sm ${status.type === 'error' ? 'text-red-500' : 'text-accent'}`}
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
          {saving ? 'Saving…' : 'Save cursors'}
        </button>
      </div>
    </form>
  )
}
