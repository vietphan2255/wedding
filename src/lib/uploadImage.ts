// Client-side image upload to Cloudinary using an *unsigned* upload preset.
// No backend and no credit card required (Cloudinary's free tier), which suits
// this client-only app. The returned secure URL is dropped straight into the
// same field the admin forms already save to Firebase Realtime Database.

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

export const isUploadConfigured: boolean = Boolean(CLOUD_NAME && UPLOAD_PRESET)

// Cap the longest edge before upload — keeps us well within the free tier and
// keeps the public site fast. Phone photos are routinely 4000px / many MB.
const MAX_DIM = 2000
const JPEG_QUALITY = 0.85

// Vector / animated formats we shouldn't rasterise — upload them untouched.
const PASSTHROUGH = /^image\/(svg\+xml|gif)$/

async function downscale(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || PASSTHROUGH.test(file.type)) return file

  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    // Some browsers can't decode certain formats (e.g. HEIC) — let Cloudinary handle it.
    return file
  }

  const { width, height } = bitmap
  const scale = Math.min(1, MAX_DIM / Math.max(width, height))
  if (scale === 1) {
    bitmap.close?.()
    return file // already small enough
  }

  const canvas = document.createElement('canvas')
  canvas.width = Math.round(width * scale)
  canvas.height = Math.round(height * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    bitmap.close?.()
    return file
  }
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close?.()

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY),
  )
  if (!blob) return file

  const name = file.name.replace(/\.[^.]+$/, '') || 'image'
  return new File([blob], `${name}.jpg`, { type: 'image/jpeg' })
}

// Shared unsigned upload. `resourceType` selects the Cloudinary endpoint:
// 'image' for pictures, 'auto' to let Cloudinary detect the type (audio is
// stored under its `video` resource type).
async function uploadToCloudinary(
  file: File,
  resourceType: 'image' | 'auto',
): Promise<string> {
  if (!isUploadConfigured) {
    throw new Error('Upload is not configured (set VITE_CLOUDINARY_* in .env.local).')
  }

  const form = new FormData()
  form.append('file', file)
  form.append('upload_preset', UPLOAD_PRESET as string)

  let res: Response
  try {
    res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
      { method: 'POST', body: form },
    )
  } catch {
    throw new Error('Upload failed — check your network connection.')
  }

  if (!res.ok) {
    let detail = ''
    try {
      const json = (await res.json()) as { error?: { message?: string } }
      detail = json?.error?.message || ''
    } catch {
      // ignore non-JSON error bodies
    }
    throw new Error(detail || `Upload failed (${res.status}).`)
  }

  const data = (await res.json()) as { secure_url?: string }
  if (!data.secure_url) throw new Error('Upload succeeded but no URL was returned.')
  return data.secure_url
}

export async function uploadImage(file: File): Promise<string> {
  const prepared = await downscale(file)
  return uploadToCloudinary(prepared, 'image')
}

// Fail fast client-side with a friendly message instead of waiting on a slow
// Cloudinary reject for an oversized file.
const MAX_AUDIO_BYTES = 20 * 1024 * 1024 // 20 MB

// Upload a background-music file (mp3/ogg/m4a/…). Uses the `auto` endpoint so
// Cloudinary detects the type (audio lands under its `video` resource type). The
// file is sent as-is — no transform.
export async function uploadAudio(file: File): Promise<string> {
  if (!file.type.startsWith('audio/')) {
    throw new Error('Please choose an audio file (mp3, ogg, m4a).')
  }
  if (file.size > MAX_AUDIO_BYTES) {
    throw new Error('Audio file is too large (max 20 MB).')
  }
  return uploadToCloudinary(file, 'auto')
}
