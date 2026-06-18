import { Plus, Trash2, ArrowUp, ArrowDown, Save } from 'lucide-react'
import useFirebaseSlice from '../hooks/useFirebaseSlice'
import ImageInput from '../../components/admin/ImageInput.jsx'
import LabelsPanel from './LabelsPanel.jsx'
import LabelField from './LabelField.jsx'

const emptyItem = {
  year: '',
  title_vi: '',
  body_vi: '',
  img: '',
}

const encodeItem = (it, i) => ({
  year: it.year,
  title_vi: it.title_vi,
  body_vi: it.body_vi,
  img: it.img,
  order: i,
})

export default function StorySection() {
  const {
    items,
    updateItem,
    addItem,
    removeItem,
    move,
    save,
    saving,
    status,
    dirty,
  } = useFirebaseSlice('story', encodeItem)

  const onSubmit = (e) => {
    e.preventDefault()
    save('Story timeline saved.')
  }

  return (
    <div>
      <LabelsPanel title="Story labels">
        <LabelField
          fieldKey="story.eyebrow"
          label="Eyebrow"
          defaultVi="Hành trình của chúng mình"
        />
        <LabelField
          fieldKey="story.title"
          label="Title"
          defaultVi="Chuyện chúng mình yêu nhau"
        />
        <LabelField
          fieldKey="story.subhead"
          label="Subtitle"
          help="Để trống = không hiển thị"
        />
        <LabelField
          fieldKey="story.divider"
          label="Divider text"
          defaultVi="v & n"
        />
        <LabelField
          fieldKey="story.intro"
          label="Intro"
          defaultVi="Một câu chuyện được viết bằng những ly cà phê, những cuộc gọi đêm khuya, và hàng ngàn khoảnh khắc nhỏ mà chẳng hề nhỏ chút nào."
          multiline
        />
      </LabelsPanel>

    <form onSubmit={onSubmit} className="space-y-5">
      <header className="glass rounded-3xl p-6 md:p-8">
        <p className="eyebrow">Our Story</p>
        <h2 className="font-display text-2xl md:text-3xl mt-1">
          Timeline of moments
        </h2>
        <p className="text-sm text-muted mt-2">
          Add, edit, reorder, or remove story chapters. Each chapter shows on
          the public site with its image, year, title, and body.
        </p>
        <div className="mt-4 flex items-center gap-3">
          <button type="button" onClick={() => addItem(emptyItem)} className="btn-ghost">
            <Plus size={16} />
            Add chapter
          </button>
          <p className="text-xs text-muted">{items.length} chapter(s)</p>
        </div>
      </header>

      <ul className="space-y-4">
        {items.map((it, idx) => (
          <li key={it.id} className="glass rounded-3xl p-6 md:p-7">
            <div className="flex items-center justify-between gap-3 mb-4">
              <p className="eyebrow">Chapter {idx + 1}</p>
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
                  aria-label="Remove chapter"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] tracking-[0.22em] uppercase text-muted mb-2">
                  Year
                </label>
                <input
                  type="text"
                  value={it.year || ''}
                  onChange={(e) => updateItem(idx, 'year', e.target.value)}
                  className="w-full rounded-xl border border-line bg-bg px-4 py-3"
                  placeholder="2024"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[11px] tracking-[0.22em] uppercase text-muted mb-2">
                  Image URL
                </label>
                <ImageInput
                  value={it.img}
                  onChange={(url) => updateItem(idx, 'img', url)}
                  inputClassName="w-full rounded-xl border border-line bg-bg px-4 py-3"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-[11px] tracking-[0.22em] uppercase text-muted mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={it.title_vi || ''}
                  onChange={(e) => updateItem(idx, 'title_vi', e.target.value)}
                  className="w-full rounded-xl border border-line bg-bg px-4 py-3"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-[11px] tracking-[0.22em] uppercase text-muted mb-2">
                  Body
                </label>
                <textarea
                  rows={3}
                  value={it.body_vi || ''}
                  onChange={(e) => updateItem(idx, 'body_vi', e.target.value)}
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
          {saving ? 'Saving…' : 'Save story'}
        </button>
      </div>
    </form>
    </div>
  )
}
