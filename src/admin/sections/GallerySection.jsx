import { useEffect, useState } from 'react'
import { ref, set, push, update } from 'firebase/database'
import { Plus, Trash2, ArrowUp, ArrowDown, Save } from 'lucide-react'
import { db, isConfigured } from '../../firebase/config.js'
import { useWeddingConfig } from '../../contexts/WeddingConfigContext.jsx'
import ImageInput from '../../components/admin/ImageInput.jsx'
import UploadButton from '../../components/admin/UploadButton.jsx'

function emptyItem(order) {
  return { src: '', tall: false, order }
}

function isFirebaseId(id) {
  return id && !id.startsWith('default-')
}

export default function GallerySection() {
  const { config, source } = useWeddingConfig()
  const [items, setItems] = useState([])
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState(null)

  useEffect(() => {
    setItems(config.gallery.map((it) => ({ ...it })))
  }, [config.gallery])

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
      if (source === 'default') {
        const payload = {}
        items.forEach((it, i) => {
          const newRef = push(ref(db, 'config/gallery'))
          payload[newRef.key] = {
            src: it.src,
            tall: Boolean(it.tall),
            order: i,
          }
        })
        await set(ref(db, 'config/gallery'), payload)
      } else {
        const existingIds = config.gallery.map((s) => s.id).filter(isFirebaseId)
        const keptIds = new Set(items.map((s) => s.id).filter(isFirebaseId))
        const updates = {}
        existingIds.forEach((id) => {
          if (!keptIds.has(id)) updates[id] = null
        })
        items.forEach((it, i) => {
          const payload = { src: it.src, tall: Boolean(it.tall), order: i }
          if (isFirebaseId(it.id)) {
            updates[it.id] = payload
          } else {
            const newRef = push(ref(db, 'config/gallery'))
            updates[newRef.key] = payload
          }
        })
        await update(ref(db, 'config/gallery'), updates)
      }
      setStatus({ type: 'success', message: 'Gallery saved.' })
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
          <button type="button" onClick={addItem} className="btn-ghost">
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
                  onError={(e) => (e.currentTarget.style.opacity = 0.3)}
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
                onChange={(url) => update_(idx, 'src', url)}
                inputClassName="w-full rounded-xl border border-line bg-bg px-3 py-2 text-sm"
              />
              <label className="mt-2 flex items-center gap-2 text-xs text-muted cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(it.tall)}
                  onChange={(e) => update_(idx, 'tall', e.target.checked)}
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
          <span />
        )}
        <button
          type="submit"
          disabled={saving}
          className="btn-primary disabled:opacity-60"
        >
          <Save size={16} />
          {saving ? 'Saving…' : 'Save gallery'}
        </button>
      </div>
    </form>
  )
}
