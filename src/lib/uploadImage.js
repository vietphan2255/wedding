// Client-side image upload to Cloudinary using an *unsigned* upload preset.
// No backend and no credit card required (Cloudinary's free tier), which suits
// this client-only app. The returned secure URL is dropped straight into the
// same field the admin forms already save to Firebase Realtime Database.

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

export const isUploadConfigured = Boolean(CLOUD_NAME && UPLOAD_PRESET)

// Cap the longest edge before upload — keeps us well within the free tier and
// keeps the public site fast. Phone photos are routinely 4000px / many MB.
const MAX_DIM = 2000
const JPEG_QUALITY = 0.85

// Vector / animated formats we shouldn't rasterise — upload them untouched.
const PASSTHROUGH = /^image\/(svg\+xml|gif)$/

async function downscale(file) {
  if (!file.type.startsWith('image/') || PASSTHROUGH.test(file.type)) return file

  let bitmap
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
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close?.()

  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY),
  )
  if (!blob) return file

  const name = file.name.replace(/\.[^.]+$/, '') || 'image'
  return new File([blob], `${name}.jpg`, { type: 'image/jpeg' })
}

export async function uploadImage(file) {
  if (!isUploadConfigured) {
    throw new Error('Image upload is not configured (set VITE_CLOUDINARY_* in .env.local).')
  }

  const prepared = await downscale(file)
  const form = new FormData()
  form.append('file', prepared)
  form.append('upload_preset', UPLOAD_PRESET)

  let res
  try {
    res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: form,
    })
  } catch {
    throw new Error('Upload failed — check your network connection.')
  }

  if (!res.ok) {
    let detail = ''
    try {
      detail = (await res.json())?.error?.message || ''
    } catch {
      // ignore non-JSON error bodies
    }
    throw new Error(detail || `Upload failed (${res.status}).`)
  }

  const data = await res.json()
  if (!data.secure_url) throw new Error('Upload succeeded but no URL was returned.')
  return data.secure_url
}
