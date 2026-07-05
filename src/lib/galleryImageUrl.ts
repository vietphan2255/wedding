// Right-size gallery image URLs so the browser decodes bitmaps near their display
// size instead of at full resolution. Decoded image memory is width×height×4 bytes
// regardless of JPEG/WebP/AVIF, so capping *dimensions* is the lever that bounds
// memory — the fix for the iOS WebKit (WKWebView) memory-termination reload that a
// large, full-size gallery triggers on Chrome iOS.
//
// Two source shapes are handled; any other URL passes through untouched so existing
// records keep working:
//   • picsum-style URLs ending in "/<w>/<h>"  → scaled to fit maxEdge (aspect kept)
//   • Cloudinary delivery URLs ("/image/upload/") → f_auto,q_auto,c_limit,w,h injected
import { LIGHTBOX_MAX_EDGE_CAP } from './constants'

// Trailing "/<width>/<height>" (e.g. picsum.photos/seed/x/900/1300).
const PICSUM_TAIL = /\/(\d+)\/(\d+)$/
const CLOUDINARY_UPLOAD = '/image/upload/'

/**
 * Returns `src` re-sized so its longest edge is at most `maxEdge` px, using the
 * source CDN's own transform. Non-string / empty / unrecognized inputs are returned
 * unchanged (as a string). Never upscales.
 */
export function galleryImageUrl(src: unknown, maxEdge: number): string {
  if (typeof src !== 'string') return ''
  if (src.trim() === '') return src
  const cap = Math.max(1, Math.round(maxEdge))

  // Cloudinary: inject a chained transform right after the first "/upload/".
  const uploadAt = src.indexOf(CLOUDINARY_UPLOAD)
  if (uploadAt !== -1 && src.includes('res.cloudinary.com')) {
    const insertPos = uploadAt + CLOUDINARY_UPLOAD.length
    const rest = src.slice(insertPos)
    // Idempotent: if we (or anyone) already put a c_limit transform here, leave it.
    if (rest.startsWith('f_auto') || /^[a-z]{1,3}_[^/]*c_limit/.test(rest) || rest.startsWith('c_limit')) {
      return src
    }
    return `${src.slice(0, insertPos)}f_auto,q_auto,c_limit,w_${cap},h_${cap}/${rest}`
  }

  // picsum-style "/w/h" tail → scale to fit within cap, preserving aspect ratio.
  const m = src.match(PICSUM_TAIL)
  if (m) {
    const w = Number(m[1])
    const h = Number(m[2])
    if (w > 0 && h > 0) {
      const scale = Math.min(1, cap / Math.max(w, h))
      const nw = Math.max(1, Math.round(w * scale))
      const nh = Math.max(1, Math.round(h * scale))
      return src.replace(PICSUM_TAIL, `/${nw}/${nh}`)
    }
  }

  return src
}

/**
 * Longest edge (px) worth requesting for a full-screen lightbox image on this
 * device: viewport longest edge × devicePixelRatio (capped at 2 — beyond that the
 * memory cost doubles for no perceptible gain), bounded by `cap`. SSR-safe.
 */
export function viewportMaxEdge(cap: number = LIGHTBOX_MAX_EDGE_CAP): number {
  if (typeof window === 'undefined') return cap
  const longEdge = Math.max(window.innerWidth || 0, window.innerHeight || 0)
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const px = Math.round(longEdge * dpr)
  return Math.min(cap, px || cap)
}
