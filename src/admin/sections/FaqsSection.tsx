import { Plus, Trash2, ArrowUp, ArrowDown, Save, HelpCircle } from 'lucide-react'
import useFirebaseSlice from '../hooks/useFirebaseSlice'
import LabelsPanel from './LabelsPanel.jsx'
import LabelField from './LabelField.jsx'

const emptyItem = {
  question_en: '',
  question_vi: '',
  answer_en: '',
  answer_vi: '',
}

const encodeItem = (it, i) => ({
  question_en: it.question_en,
  question_vi: it.question_vi,
  answer_en: it.answer_en,
  answer_vi: it.answer_vi,
  order: i,
})

export default function FaqsSection() {
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
  } = useFirebaseSlice('faqs', encodeItem)

  const onSubmit = (e) => {
    e.preventDefault()
    save('FAQ saved.')
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

    <form onSubmit={onSubmit} className="space-y-5">
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
          <button type="button" onClick={() => addItem(emptyItem)} className="btn-ghost">
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
                  onChange={(e) => updateItem(idx, 'question_en', e.target.value)}
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
                  onChange={(e) => updateItem(idx, 'question_vi', e.target.value)}
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
                  onChange={(e) => updateItem(idx, 'answer_en', e.target.value)}
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
                  onChange={(e) => updateItem(idx, 'answer_vi', e.target.value)}
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
