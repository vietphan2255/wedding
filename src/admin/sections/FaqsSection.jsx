import { useState } from 'react'
import { ref, set, push, update } from 'firebase/database'
import { Plus, Trash2, ArrowUp, ArrowDown, Save, HelpCircle } from 'lucide-react'
import { db, isConfigured } from '../../firebase/config.js'
import { useWeddingConfig } from '../../contexts/WeddingConfigContext.jsx'
import { useDraftConfig } from '../DraftConfigContext.jsx'
import LabelsPanel from './LabelsPanel.jsx'
import LabelField from './LabelField.jsx'

function emptyItem(order) {
  return {
    question_en: '',
    question_vi: '',
    answer_en: '',
    answer_vi: '',
    order,
  }
}

function isFirebaseId(id) {
  return id && !id.startsWith('default-') && !id.startsWith('new-')
}

export default function FaqsSection() {
  const { source } = useWeddingConfig()
  const { draft, saved, setSlice, isSliceDirty } = useDraftConfig()
  const items = draft.faqs || []
  const dirty = isSliceDirty('faqs')
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState(null)

  const setItems = (updater) =>
    setSlice('faqs', (prev) =>
      typeof updater === 'function' ? updater(prev || []) : updater,
    )

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
    setItems((prev) => [
      ...prev,
      { id: `new-${Date.now()}`, ...emptyItem(prev.length) },
    ])
  }

  const removeItem = (idx) => {
    setItems((prev) =>
      prev.filter((_, i) => i !== idx).map((it, i) => ({ ...it, order: i })),
    )
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
          const newRef = push(ref(db, 'config/faqs'))
          payload[newRef.key] = {
            question_en: it.question_en,
            question_vi: it.question_vi,
            answer_en: it.answer_en,
            answer_vi: it.answer_vi,
            order: i,
          }
        })
        await set(ref(db, 'config/faqs'), payload)
      } else {
        const existingIds = (saved.faqs || []).map((s) => s.id).filter(isFirebaseId)
        const keptIds = new Set(items.map((s) => s.id).filter(isFirebaseId))
        const updates = {}
        existingIds.forEach((id) => {
          if (!keptIds.has(id)) updates[id] = null
        })
        items.forEach((it, i) => {
          const payload = {
            question_en: it.question_en,
            question_vi: it.question_vi,
            answer_en: it.answer_en,
            answer_vi: it.answer_vi,
            order: i,
          }
          if (isFirebaseId(it.id)) {
            updates[it.id] = payload
          } else {
            const newRef = push(ref(db, 'config/faqs'))
            updates[newRef.key] = payload
          }
        })
        await update(ref(db, 'config/faqs'), updates)
      }
      setStatus({ type: 'success', message: 'FAQ saved.' })
    } catch (err) {
      console.error(err)
      setStatus({ type: 'error', message: err.message || 'Failed to save.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <LabelsPanel title="FAQ labels">
        <LabelField
          fieldKey="faq.eyebrow"
          label="Eyebrow"
          defaultEn="Good to know"
          defaultVi="Có thể bạn quan tâm"
        />
        <LabelField
          fieldKey="faq.title"
          label="Title"
          defaultEn="Frequently asked"
          defaultVi="Câu hỏi thường gặp"
        />
        <LabelField
          fieldKey="faq.subtitle"
          label="Subtitle"
          defaultEn="A few quick answers before the big day."
          defaultVi="Vài câu hỏi nhanh trước ngày trọng đại."
          multiline
        />
      </LabelsPanel>

    <form onSubmit={saveAll} className="space-y-5">
      <header className="glass rounded-3xl p-6 md:p-8">
        <p className="eyebrow flex items-center gap-2">
          <HelpCircle size={12} />
          FAQ
        </p>
        <h2 className="font-display text-2xl md:text-3xl mt-1">
          Frequently asked questions
        </h2>
        <p className="text-sm text-muted mt-2">
          Add, edit, reorder, or remove FAQ entries. Each question shows on the
          public site with its answer — in English and Vietnamese.
        </p>
        <div className="mt-4 flex items-center gap-3">
          <button type="button" onClick={addItem} className="btn-ghost">
            <Plus size={16} />
            Add question
          </button>
          <p className="text-xs text-muted">{items.length} question(s)</p>
        </div>
      </header>

      <ul className="space-y-4">
        {items.map((it, idx) => (
          <li key={it.id} className="glass rounded-3xl p-6 md:p-7">
            <div className="flex items-center justify-between gap-3 mb-4">
              <p className="eyebrow">Question {idx + 1}</p>
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
                  aria-label="Remove question"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] tracking-[0.22em] uppercase text-muted mb-2">
                  Question (EN)
                </label>
                <input
                  type="text"
                  value={it.question_en || ''}
                  onChange={(e) => update_(idx, 'question_en', e.target.value)}
                  className="w-full rounded-xl border border-line bg-bg px-4 py-3"
                />
              </div>
              <div>
                <label className="block text-[11px] tracking-[0.22em] uppercase text-muted mb-2">
                  Question (VI)
                </label>
                <input
                  type="text"
                  value={it.question_vi || ''}
                  onChange={(e) => update_(idx, 'question_vi', e.target.value)}
                  className="w-full rounded-xl border border-line bg-bg px-4 py-3"
                />
              </div>
              <div>
                <label className="block text-[11px] tracking-[0.22em] uppercase text-muted mb-2">
                  Answer (EN)
                </label>
                <textarea
                  rows={3}
                  value={it.answer_en || ''}
                  onChange={(e) => update_(idx, 'answer_en', e.target.value)}
                  className="w-full rounded-xl border border-line bg-bg px-4 py-3"
                />
              </div>
              <div>
                <label className="block text-[11px] tracking-[0.22em] uppercase text-muted mb-2">
                  Answer (VI)
                </label>
                <textarea
                  rows={3}
                  value={it.answer_vi || ''}
                  onChange={(e) => update_(idx, 'answer_vi', e.target.value)}
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
          {saving ? 'Saving…' : 'Save FAQ'}
        </button>
      </div>
    </form>
    </div>
  )
}
