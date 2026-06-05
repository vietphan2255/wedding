import { useDraftConfig } from '../DraftConfigContext.jsx'
import { useAdminUI } from '../AdminUIContext.jsx'

// One row of the Labels panel. Reads/writes the override at
// draft.labels[adminLang][fieldKey]. Empty string means "no override" —
// the site falls back to the static i18n dict.
export default function LabelField({
  fieldKey,
  label,
  defaultEn = '',
  defaultVi = '',
  multiline = false,
  help,
}) {
  const { draft, setSlice } = useDraftConfig()
  const { adminLang } = useAdminUI()

  const labels = draft.labels || { en: {}, vi: {} }
  const value = labels[adminLang]?.[fieldKey] ?? ''
  const placeholder = adminLang === 'vi' ? defaultVi : defaultEn

  const onChange = (next) => {
    setSlice('labels', (prev) => {
      const safePrev = prev || { en: {}, vi: {} }
      return {
        ...safePrev,
        [adminLang]: {
          ...(safePrev[adminLang] || {}),
          [fieldKey]: next,
        },
      }
    })
  }

  const InputTag = multiline ? 'textarea' : 'input'
  const inputProps = multiline
    ? { rows: 3 }
    : { type: 'text' }

  return (
    <label className="block">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs uppercase tracking-[0.18em] text-muted">
          {label}
        </span>
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted/60">
          {adminLang}
        </span>
      </div>
      <InputTag
        {...inputProps}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || `(default)`}
        className="mt-1 w-full bg-surface/40 border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
      />
      {help && <p className="mt-1 text-[11px] text-muted">{help}</p>}
    </label>
  )
}
