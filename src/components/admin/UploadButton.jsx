import { useRef, useState } from 'react'
import { Upload, Loader2 } from 'lucide-react'
import { uploadImage, isUploadConfigured } from '../../lib/uploadImage'

// File-picker button that uploads to Cloudinary and hands back the resulting
// URL(s) via onUploaded(urls). Sits alongside the paste-a-link inputs.
export default function UploadButton({
  multiple = false,
  label = 'Upload',
  onUploaded,
  className = 'btn-ghost',
  accept = 'image/*',
  upload = uploadImage,
}) {
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  if (!isUploadConfigured) {
    return (
      <button
        type="button"
        disabled
        title="Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in .env.local to enable uploads"
        className={`${className} opacity-50 cursor-not-allowed`}
      >
        <Upload size={16} />
        {label}
      </button>
    )
  }

  const onFiles = async (e) => {
    const files = Array.from(e.target.files || [])
    e.target.value = '' // allow re-picking the same file
    if (files.length === 0) return
    setBusy(true)
    setError(null)
    try {
      const urls = []
      for (const file of files) urls.push(await upload(file))
      onUploaded(urls)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Upload failed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <span className="inline-flex flex-col gap-1">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        hidden
        onChange={onFiles}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className={`${className} disabled:opacity-60`}
      >
        {busy ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
        {busy ? 'Uploading…' : label}
      </button>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </span>
  )
}
