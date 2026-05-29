import { useEffect, useState } from 'react'
import { ref, set, push, update } from 'firebase/database'
import { Plus, Trash2, ArrowUp, ArrowDown, Save } from 'lucide-react'
import { db, isConfigured } from '../../firebase/config.js'
import { useWeddingConfig } from '../../contexts/WeddingConfigContext.jsx'
import ImageInput from '../../components/admin/ImageInput.jsx'

function emptyItem(order) {
  return {
    year: '',
    title_en: '',
    title_vi: '',
    body_en: '',
    body_vi: '',
    img: '',
    order,
  }
}

function isFirebaseId(id) {
  return id && !id.startsWith('default-')
}

export default function StorySection() {
  const { config, source } = useWeddingConfig()
  const [items, setItems] = useState([])
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState(null)

  useEffect(() => {
    setItems(config.story.map((it) => ({ ...it })))
  }, [config.story])

  const update_ = (idx, key, value) => {
    setItems((prev) => {
      const next = [...prev]
      next[idx] = { ...next[idx], [key]: value }
      return next
    })
  }

  const move = (idx, dir) => {
    const target = idx + dir
    if (target < 0 || target >= items.length) return
    setItems((prev) => {
      const next = [...prev]
      ;[next[idx], next[target]] = [next[target], next[idx]]
      return next.map((it, i) => ({ ...it, order: i }))
    })
  }

  const addItem = () => {
    setItems((prev) => [...prev, { id: `new-${Date.now()}`, ...emptyItem(prev.length) }])
  }

  const removeItem = (idx) => {
    setItems((prev) => prev.filter((_, i) => i !== idx).map((it, i) => ({ ...it, order: i })))
  }

  const saveAll = async (e) => {
    e.preventDefault()
    if (!isConfigured || !db) {
      setStatus({ type: 'error', message: 'Firebase is not configured.' })
      return
    }
    setSaving(true)
    setStatus(null)
    try {
      // If we're still on defaults (firebase had no story yet), wipe and rewrite.
      // Otherwise, do a targeted update so unchanged children keep their keys.
      if (source === 'default') {
        const payload = {}
        items.forEach((it, i) => {
          const newRef = push(ref(db, 'config/story'))
          payload[newRef.key] = {
            year: it.year,
            title_en: it.title_en,
            title_vi: it.title_vi,
            body_en: it.body_en,
            body_vi: it.body_vi,
            img: it.img,
            order: i,
          }
        })
        await set(ref(db, 'config/story'), payload)
      } else {
        // Remove items that existed in firebase but are no longer in the list
        const existingIds = config.story.map((s) => s.id).filter(isFirebaseId)
        const keptIds = new Set(items.map((s) => s.id).filter(isFirebaseId))
        const updates = {}
        existingIds.forEach((id) => {
          if (!keptIds.has(id)) updates[id] = null
        })
        items.forEach((it, i) => {
          const payload = {
            year: it.year,
            title_en: it.title_en,
            title_vi: it.title_vi,
            body_en: it.body_en,
            body_vi: it.body_vi,
            img: it.img,
            order: i,
          }
          if (isFirebaseId(it.id)) {
            updates[it.id] = payload
          } else {
            const newRef = push(ref(db, 'config/story'))
            updates[newRef.key] = payload
          }
        })
        await update(ref(db, 'config/story'), updates)
      }
      setStatus({ type: 'success', message: 'Story timeline saved.' })
    } catch (err) {
      console.error(err)
      setStatus({ type: 'error', message: err.message || 'Failed to save.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={saveAll} className="space-y-5">
      <header className="glass rounded-3xl p-6 md:p-8">
        <p className="eyebrow">Our Story</p>
        <h2 className="font-display text-2xl md:text-3xl mt-1">
          Timeline of moments
        </h2>
        <p className="text-sm text-muted mt-2">
          Add, edit, reorder, or remove story chapters. Each chapter shows on
          the public site with its image, year, title, and body — in English
          and Vietnamese.
        </p>
        <div className="mt-4 flex items-center gap-3">
          <button type="button" onClick={addItem} className="btn-ghost">
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
                  onChange={(e) => update_(idx, 'year', e.target.value)}
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
                  onChange={(url) => update_(idx, 'img', url)}
                  inputClassName="w-full rounded-xl border border-line bg-bg px-4 py-3"
                />
              </div>
              <div>
                <label className="block text-[11px] tracking-[0.22em] uppercase text-muted mb-2">
                  Title (EN)
                </label>
                <input
                  type="text"
                  value={it.title_en || ''}
                  onChange={(e) => update_(idx, 'title_en', e.target.value)}
                  className="w-full rounded-xl border border-line bg-bg px-4 py-3"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[11px] tracking-[0.22em] uppercase text-muted mb-2">
                  Title (VI)
                </label>
                <input
                  type="text"
                  value={it.title_vi || ''}
                  onChange={(e) => update_(idx, 'title_vi', e.target.value)}
                  className="w-full rounded-xl border border-line bg-bg px-4 py-3"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-[11px] tracking-[0.22em] uppercase text-muted mb-2">
                  Body (EN)
                </label>
                <textarea
                  rows={3}
                  value={it.body_en || ''}
                  onChange={(e) => update_(idx, 'body_en', e.target.value)}
                  className="w-full rounded-xl border border-line bg-bg px-4 py-3"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-[11px] tracking-[0.22em] uppercase text-muted mb-2">
                  Body (VI)
                </label>
                <textarea
                  rows={3}
                  value={it.body_vi || ''}
                  onChange={(e) => update_(idx, 'body_vi', e.target.value)}
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
          <span />
        )}
        <button
          type="submit"
          disabled={saving}
          className="btn-primary disabled:opacity-60"
        >
          <Save size={16} />
          {saving ? 'Saving…' : 'Save story'}
        </button>
      </div>
    </form>
  )
}
