import { Plus, Trash2, ArrowUp, ArrowDown, Save } from 'lucide-react'
import useFirebaseSlice from '../hooks/useFirebaseSlice'
import ImageInput from '../../components/admin/ImageInput.jsx'
import UploadButton from '../../components/admin/UploadButton.jsx'
import LabelsPanel from './LabelsPanel.jsx'
import LabelField from './LabelField.jsx'

const encodeItem = (it, i) => ({
  src: it.src,
  tall: Boolean(it.tall),
  order: i,
})

export default function GallerySection() {
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
  } = useFirebaseSlice('gallery', encodeItem)

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
          defaultEn="Moments"
          defaultVi="Khoảnh khắc"
        />
        <LabelField
          fieldKey="gallery.title"
          label="Title"
          defaultEn="Through the lens"
          defaultVi="Qua ống kính"
        />
        <LabelField
          fieldKey="gallery.divider"
          label="Divider symbol"
          defaultEn="∞"
          defaultVi="∞"
        />
        <LabelField
          fieldKey="gallery.subtitle"
          label="Subtitle"
          defaultEn="A small look into the chapters that brought us here"
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
          Paste in image URLs (e.g. from your storage provider or any public
          CDN). Mark a photo as <em>tall</em> to make it span two rows in the
          grid for a more dynamic layout.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => addItem({ src: '', tall: false })}
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
                  order: prev.length + i,
                })),
              ])
            }
          />
          <p className="text-xs text-muted">{items.length} photo(s)</p>
        </div>
      </header>

      <ul className="grid md:grid-cols-2 gap-4">
        {items.map((it, idx) => (
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
                <p className="eyebrow">Photo {idx + 1}</p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => move(idx, -1)}
                    disabled={idx === 0}
                    className="rounded-full border border-line p-1.5 text-ink hover:bg-bg disabled:opacity-40"
                    aria-label="Move up"
                  >
                    <ArrowUp size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(idx, 1)}
                    disabled={idx === items.length - 1}
                    className="rounded-full border border-line p-1.5 text-ink hover:bg-bg disabled:opacity-40"
                    aria-label="Move down"
                  >
                    <ArrowDown size={12} />
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
        ))}
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
