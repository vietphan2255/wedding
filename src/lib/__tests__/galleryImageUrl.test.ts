import { describe, it, expect } from 'vitest'
import { galleryImageUrl, viewportMaxEdge } from '../galleryImageUrl'

describe('galleryImageUrl — picsum-style /w/h tails', () => {
  it('scales a portrait tail to fit maxEdge, preserving aspect ratio', () => {
    // 900×1300, cap 720 → longest edge (1300) becomes 720; 900 → round(900*720/1300)=498
    expect(galleryImageUrl('https://picsum.photos/seed/x/900/1300', 720)).toBe(
      'https://picsum.photos/seed/x/498/720',
    )
  })

  it('scales a landscape tail to fit maxEdge, preserving aspect ratio', () => {
    expect(galleryImageUrl('https://picsum.photos/seed/x/1300/900', 720)).toBe(
      'https://picsum.photos/seed/x/720/498',
    )
  })

  it('never upscales when the source is already within the cap', () => {
    expect(galleryImageUrl('https://picsum.photos/seed/x/400/300', 720)).toBe(
      'https://picsum.photos/seed/x/400/300',
    )
  })

  it('only rewrites the trailing dimensions, not earlier path digits', () => {
    expect(galleryImageUrl('https://picsum.photos/id/1024/1600/1200', 800)).toBe(
      'https://picsum.photos/id/1024/800/600',
    )
  })
})

describe('galleryImageUrl — Cloudinary delivery URLs', () => {
  const base =
    'https://res.cloudinary.com/demo/image/upload/v1699999999/wedding/pic.jpg'

  it('injects f_auto,q_auto,c_limit and the size box after /upload/', () => {
    expect(galleryImageUrl(base, 720)).toBe(
      'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_limit,w_720,h_720/v1699999999/wedding/pic.jpg',
    )
  })

  it('is idempotent — does not double-inject a transform', () => {
    const once = galleryImageUrl(base, 720)
    expect(galleryImageUrl(once, 1600)).toBe(once)
  })

  it('rounds a fractional maxEdge', () => {
    expect(galleryImageUrl(base, 719.6)).toContain('w_720,h_720')
  })
})

describe('galleryImageUrl — pass-through and guards', () => {
  it('returns unknown hosts unchanged', () => {
    expect(galleryImageUrl('https://example.com/photo.jpg', 720)).toBe(
      'https://example.com/photo.jpg',
    )
  })

  it('returns a Cloudinary-looking non-upload URL unchanged', () => {
    const u = 'https://res.cloudinary.com/demo/image/list/tag.json'
    expect(galleryImageUrl(u, 720)).toBe(u)
  })

  it('handles empty and non-string input safely', () => {
    expect(galleryImageUrl('', 720)).toBe('')
    expect(galleryImageUrl(undefined, 720)).toBe('')
    expect(galleryImageUrl(null, 720)).toBe('')
    expect(galleryImageUrl(42, 720)).toBe('')
  })
})

describe('viewportMaxEdge', () => {
  it('returns a positive integer no greater than the cap', () => {
    const v = viewportMaxEdge(1600)
    expect(Number.isInteger(v)).toBe(true)
    expect(v).toBeGreaterThan(0)
    expect(v).toBeLessThanOrEqual(1600)
  })

  it('honors a smaller explicit cap', () => {
    expect(viewportMaxEdge(500)).toBeLessThanOrEqual(500)
  })
})
