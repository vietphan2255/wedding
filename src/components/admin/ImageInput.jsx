import UploadButton from './UploadButton.jsx'

// Drop-in replacement for a single image-URL <input>: keeps the paste-a-link
// field and adds an Upload button beside it. Pass inputClassName to preserve
// each form's existing input styling.
const COMPACT_UPLOAD =
  'shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-line bg-bg px-3 py-2 text-sm text-ink hover:bg-surface transition'

export default function ImageInput({
  value,
  onChange,
  placeholder = 'https://…',
  inputClassName = 'w-full rounded-xl border border-line bg-bg px-3 py-2 text-sm',
}) {
  return (
    <div className="flex items-start gap-2">
      <div className="flex-1 min-w-0">
        <input
          type="url"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={inputClassName}
        />
      </div>
      <UploadButton
        className={COMPACT_UPLOAD}
        onUploaded={(urls) => urls[0] && onChange(urls[0])}
      />
    </div>
  )
}
