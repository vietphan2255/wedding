import type { FormEvent } from 'react'
import { Plus, Trash2, ArrowUp, ArrowDown, Save, Images } from 'lucide-react'
import useFirebaseSlice, { type SliceItem } from '../hooks/useFirebaseSlice'
import ImageFocalInput from '../../components/admin/ImageFocalInput.jsx'
import UploadButton from '../../components/admin/UploadButton.jsx'
import type { HeroSlide } from '../../contexts/configTypes'

// useFirebaseSlice's generic requires a string index signature (SliceItem);
// intersect so the typed HeroSlide satisfies it without an explicit one.
type HeroSlideItem = HeroSlide & SliceItem

const labelClass = 'block text-[11px] tracking-[0.22em] uppercase text-muted mb-2'

const emptyItem: Partial<HeroSlideItem> = {
  src: '',
  priority: 1,
  durationSeconds: 6,
  focalX: 50,
  focalY: 50,
}

const encodeItem = (it: HeroSlideItem, i: number) => ({
  src: (it.src || '').trim(),
  priority: Number(it.priority) || 0,
  durationSeconds: Math.max(2, Number(it.durationSeconds) || 6),
  focalX: Number(it.focalX ?? 50),
  focalY: Number(it.focalY ?? 50),
  placeholder: it.placeholder || '',
  order: i,
})

// Hero background slideshow. Mirrors the list-admin pattern (GallerySection +
// CursorsSection) over the `heroSlides` slice: add/upload/reorder/remove images,
// each with a per-image focal point, a play-order priority, and a dwell time.
// An empty list makes the hero fall back to the single Hero image.
export default function HeroSlidesSection() {
  const {
    items,
    setItems,
    updateItem,
    addItem,
    removeItem,
    move,
    save,
    saving,
    status,
    dirty,
  } = useFirebaseSlice<HeroSlideItem>('heroSlides', encodeItem)

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    save('Hero slideshow saved.')
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <header className="glass rounded-3xl p-6 md:p-8">
        <p className="eyebrow flex items-center gap-2">
          <Images size={12} />
          Hero slideshow
        </p>
        <h2 className="font-display text-2xl md:text-3xl mt-1">Background images</h2>
        <p className="text-sm text-muted mt-2 max-w-2xl">
          Add images and the hero background cycles through them with smooth,
          randomized in/out transitions. Each slide is held for its own duration.
          Play order follows the <strong>priority</strong> number (lowest first),
          then loops. Set a focus point per image so the subject stays in frame on
          both phone and desktop. Leave the list empty to use the single Hero
          image instead.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => addItem({ ...emptyItem, priority: items.length + 1 })}
            className="btn-ghost"
          >
            <Plus size={16} />
            Add slide
          </button>
          <UploadButton
            multiple
            label="Upload images"
            onUploaded={(urls: string[]) =>
              setItems((prev) => [
                ...prev,
                ...urls.map(
                  (src, i): HeroSlideItem => ({
                    id: `new-${Date.now()}-${i}`,
                    src,
                    priority: prev.length + i + 1,
                    durationSeconds: 6,
                    focalX: 50,
                    focalY: 50,
                    order: prev.length + i,
                  }),
                ),
              ])
            }
          />
          <p className="text-xs text-muted">{items.length} slide(s)</p>
        </div>
      </header>

      <ul className="space-y-4">
        {items.map((it, idx) => (
          <li key={it.id} className="glass rounded-3xl p-6 md:p-7">
            <div className="flex items-center justify-between gap-3 mb-4">
              <p className="eyebrow">Slide {idx + 1}</p>
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
                  aria-label="Remove slide"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <ImageFocalInput
              value={it.src}
              onChange={(url: string) => updateItem(idx, 'src', url)}
              focalX={it.focalX ?? 50}
              focalY={it.focalY ?? 50}
              onFocalChange={(x: number, y: number) => {
                updateItem(idx, 'focalX', x)
                updateItem(idx, 'focalY', y)
              }}
              frames={[
                { label: 'Phone', aspect: '9 / 16' },
                { label: 'Desktop', aspect: '16 / 9' },
              ]}
              placeholder="https://example.com/photo.jpg"
              inputClassName="w-full rounded-xl border border-line bg-bg px-4 py-3 font-mono text-xs"
              emptyHint="Paste an image URL or upload one."
            />

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Priority (play order)</label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={it.priority ?? 0}
                  onChange={(e) => updateItem(idx, 'priority', Number(e.target.value))}
                  className="w-full rounded-xl border border-line bg-bg px-4 py-3"
                />
              </div>
              <div>
                <label className={labelClass}>Duration (seconds)</label>
                <input
                  type="number"
                  min={2}
                  step={0.5}
                  value={it.durationSeconds ?? 6}
                  onChange={(e) =>
                    updateItem(idx, 'durationSeconds', Number(e.target.value))
                  }
                  className="w-full rounded-xl border border-line bg-bg px-4 py-3"
                />
              </div>
            </div>
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
          {saving ? 'Saving…' : 'Save slideshow'}
        </button>
      </div>
    </form>
  )
}
