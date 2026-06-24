import { useState } from 'react'
import { Plus, Trash2, ArrowUp, ArrowDown, ArrowRightLeft, Save } from 'lucide-react'
import useFirebaseSlice from '../hooks/useFirebaseSlice'
import ImageInput from '../../components/admin/ImageInput.jsx'
import UploadButton from '../../components/admin/UploadButton.jsx'
import LabelsPanel from './LabelsPanel.jsx'
import LabelField from './LabelField.jsx'
import { GALLERY_MIN_PER_LINE } from '../../lib/constants'

// Photos saved before the two-line feature have no `line`; treat them as Line 1.
const normLine = (l) => (l === 2 ? 2 : 1)

const encodeItem = (it, i) => ({
  src: it.src,
  tall: Boolean(it.tall),
  line: normLine(it.line),
  order: i,
})

export default function GallerySection() {
  const {
    items,
    setItems,
    updateItem,
    addItem,
    removeItem,
    save,
    saving,
    status,
    dirty,
  } = useFirebaseSlice('gallery', encodeItem)

  // Which line's photos are shown/edited. Each photo carries `line` (1 or 2);
  // the public gallery renders Line 1 in the top row and Line 2 in the bottom.
  const [tab, setTab] = useState(1)
  const tabItems = items
    .map((it, idx) => ({ it, idx }))
    .filter(({ it }) => normLine(it.line) === tab)

  // Move a photo within its line. tabItems positions map back to global array
  // indices; we swap those slots and re-derive `order` like the hook's move().
  const moveInTab = (position, dir) => {
    const target = position + dir
    if (target < 0 || target >= tabItems.length) return
    const a = tabItems[position].idx
    const b = tabItems[target].idx
    setItems((prev) => {
      const next = [...prev]
      ;[next[a], next[b]] = [next[b], next[a]]
      return next.map((it, i) => ({ ...it, order: i }))
    })
  }

  const onSubmit = (e) => {
    e.preventDefault()
    save('Gallery saved.')
  }

  return (
    <div>
      <LabelsPanel title="Gallery labels">
        <LabelField
          fieldKey="gallery.eyebrow"
          label="Eyebrow"
          defaultVi="Khoảnh khắc"
        />
        <LabelField
          fieldKey="gallery.title"
          label="Title"
          defaultVi="Qua ống kính"
        />
        <LabelField
          fieldKey="gallery.subhead"
          label="Subtitle"
          help="Để trống = không hiển thị"
        />
        <LabelField
          fieldKey="gallery.divider"
          label="Divider symbol"
          defaultVi="∞"
        />
        <LabelField
          fieldKey="gallery.subtitle"
          label="Description"
          defaultVi="Một góc nhỏ của những chương đã đưa tụi mình đến hôm nay"
          multiline
        />
      </LabelsPanel>

    <form onSubmit={onSubmit} className="space-y-5">
      <header className="glass rounded-3xl p-6 md:p-8">
        <p className="eyebrow">Gallery</p>
        <h2 className="font-display text-2xl md:text-3xl mt-1">
          Photo grid
        </h2>
        <p className="text-sm text-muted mt-2">
          Photos are organized into two rows. <strong>Line 1</strong> fills the
          top marquee row and <strong>Line 2</strong> the bottom one. Paste in
          image URLs or upload to the selected line, and use the swap button on a
          photo to send it to the other line. (If either line has fewer than{' '}
          {GALLERY_MIN_PER_LINE} photos, the gallery merges both lines instead.)
        </p>

        {/* Line 1 / Line 2 tabs — each shows its own photo count. */}
        <div className="mt-4 inline-flex rounded-full border border-line bg-bg p-1">
          {[1, 2].map((n) => {
            const count = items.filter((it) => normLine(it.line) === n).length
            return (
              <button
                key={n}
                type="button"
                onClick={() => setTab(n)}
                aria-pressed={tab === n}
                className={`rounded-full px-5 py-2 text-sm tracking-wide transition ${
                  tab === n ? 'bg-accent text-bg' : 'text-ink/70 hover:text-ink'
                }`}
              >
                Line {n} ({count})
              </button>
            )
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => addItem({ src: '', tall: false, line: tab })}
            className="btn-ghost"
          >
            <Plus size={16} />
            Add photo
          </button>
          <UploadButton
            multiple
            label="Upload photos"
            onUploaded={(urls) =>
              setItems((prev) => [
                ...prev,
                ...urls.map((src, i) => ({
                  id: `new-${Date.now()}-${i}`,
                  src,
                  tall: false,
                  line: tab,
                  order: prev.length + i,
                })),
              ])
            }
          />
          <p className="text-xs text-muted">
            {tabItems.length} in Line {tab} · {items.length} total
          </p>
        </div>
      </header>

      <ul className="grid md:grid-cols-2 gap-4">
        {tabItems.length === 0 ? (
          <li className="glass rounded-3xl p-8 text-center text-sm text-muted md:col-span-2">
            No photos in Line {tab} yet — add or upload one above, or send a
            photo over from the other line.
          </li>
        ) : (
          tabItems.map(({ it, idx }, position) => (
            <li key={it.id} className="glass rounded-3xl p-5 flex gap-4">
              <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-bg border border-line">
                {it.src ? (
                  <img
                    src={it.src}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => (e.currentTarget.style.opacity = '0.3')}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-muted text-center px-2">
                    No preview
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <p className="eyebrow">Photo {position + 1}</p>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveInTab(position, -1)}
                      disabled={position === 0}
                      className="rounded-full border border-line p-1.5 text-ink hover:bg-bg disabled:opacity-40"
                      aria-label="Move up"
                    >
                      <ArrowUp size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveInTab(position, 1)}
                      disabled={position === tabItems.length - 1}
                      className="rounded-full border border-line p-1.5 text-ink hover:bg-bg disabled:opacity-40"
                      aria-label="Move down"
                    >
                      <ArrowDown size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => updateItem(idx, 'line', tab === 1 ? 2 : 1)}
                      className="rounded-full border border-line p-1.5 text-ink hover:bg-bg"
                      aria-label={tab === 1 ? 'Send to Line 2' : 'Send to Line 1'}
                      title={tab === 1 ? 'Send to Line 2' : 'Send to Line 1'}
                    >
                      <ArrowRightLeft size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="rounded-full border border-line p-1.5 text-red-500 hover:bg-red-500/10"
                      aria-label="Remove photo"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                <ImageInput
                  value={it.src}
                  onChange={(url) => updateItem(idx, 'src', url)}
                  inputClassName="w-full rounded-xl border border-line bg-bg px-3 py-2 text-sm"
                />
                <label className="mt-2 flex items-center gap-2 text-xs text-muted cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(it.tall)}
                    onChange={(e) => updateItem(idx, 'tall', e.target.checked)}
                  />
                  Tall (span 2 rows)
                </label>
              </div>
            </li>
          ))
        )}
      </ul>

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
          {saving ? 'Saving…' : 'Save gallery'}
        </button>
      </div>
    </form>
    </div>
  )
}
