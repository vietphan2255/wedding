import { useState } from 'react'
import { useDraftConfig } from '../DraftConfigContext.jsx'
import { useAdminUI } from '../AdminUIContext.jsx'
import { encodeLabelKey, decodeLabelKey } from '../../contexts/WeddingConfigContext.jsx'

// Wraps a list of LabelField rows with a single save button for the
// `labels` slice. Each section drops one in above (or instead of) its
// data panel.
export default function LabelsPanel({ title = 'Labels', help, children }) {
  const { draft, setSlice, saveSlice, isSliceDirty } = useDraftConfig()
  const { adminLang } = useAdminUI()
  const dirty = isSliceDirty('labels')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const save = async () => {
    setError(null)
    setSaving(true)
    try {
      const normalized = normalizeLabels(draft.labels)
      // Drop empty-string entries from the in-memory draft too, so the
      // post-save state matches what the firebase listener will return.
      // Otherwise the section reads as "dirty" forever for any empty input.
      const inMemory = decodeForDraft(normalized)
      setSlice('labels', inMemory)
      await saveSlice('labels', normalized)
    } catch (e) {
      setError(e?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="border border-line rounded-2xl p-5 mb-6 bg-surface/20">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-display text-lg">{title}</h3>
        <span className="text-[10px] uppercase tracking-[0.22em] text-muted">
          Editing {adminLang.toUpperCase()}
        </span>
      </div>
      {help && <p className="text-xs text-muted mb-4">{help}</p>}
      <div className="space-y-4 mt-3">{children}</div>
      <div className="mt-5 flex items-center gap-3">
        <button
          onClick={save}
          disabled={!dirty || saving}
          className="inline-flex items-center gap-2 rounded-full bg-ink text-bg px-4 py-2 text-xs tracking-[0.18em] uppercase disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving…' : dirty ? 'Save labels' : 'Saved'}
        </button>
        {error && <span className="text-xs text-red-500">{error}</span>}
        <span className="text-[11px] text-muted ml-auto">
          Empty field = revert to default
        </span>
      </div>
    </div>
  )
}

// Strips empty-string overrides (revert to default) and encodes i18n keys
// so RTDB accepts them (it rejects keys with `.`).
function normalizeLabels(labels) {
  const out = { en: {}, vi: {} }
  for (const lang of ['en', 'vi']) {
    for (const [k, v] of Object.entries((labels || {})[lang] || {})) {
      if (typeof v === 'string' && v.length > 0) {
        out[lang][encodeLabelKey(k)] = v
      }
    }
  }
  return out
}

// Decodes the RTDB-shape (encoded keys) back to the in-memory shape
// (canonical i18n keys with `.`).
function decodeForDraft(encoded) {
  const out = { en: {}, vi: {} }
  for (const lang of ['en', 'vi']) {
    for (const [k, v] of Object.entries((encoded || {})[lang] || {})) {
      out[lang][decodeLabelKey(k)] = v
    }
  }
  return out
}
