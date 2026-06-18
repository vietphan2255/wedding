import { useDraftConfig } from '../DraftConfigContext'
import type { Labels } from '../../contexts/configTypes'

interface LabelFieldProps {
  fieldKey: string
  label: string
  defaultVi?: string
  multiline?: boolean
  help?: string
}

// One row of the Labels panel. Reads/writes the override at
// draft.labels.vi[fieldKey]. Empty string means "no override" —
// the site falls back to the static i18n dict.
export default function LabelField({
  fieldKey,
  label,
  defaultVi = '',
  multiline = false,
  help,
}: LabelFieldProps) {
  const { draft, setSlice } = useDraftConfig()

  const labels: Labels = draft.labels || { vi: {} }
  const value = labels.vi?.[fieldKey] ?? ''

  const onChange = (next: string) => {
    setSlice('labels', (prev) => {
      const safePrev = (prev as Labels) || { vi: {} }
      return {
        ...safePrev,
        vi: {
          ...(safePrev.vi || {}),
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
      <span className="text-xs uppercase tracking-[0.18em] text-muted">
        {label}
      </span>
      <InputTag
        {...inputProps}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={defaultVi || `(default)`}
        className="mt-1 w-full bg-surface/40 border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
      />
      {help && <p className="mt-1 text-[11px] text-muted">{help}</p>}
    </label>
  )
}
