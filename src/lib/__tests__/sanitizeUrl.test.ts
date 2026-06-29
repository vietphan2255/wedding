import { describe, it, expect } from 'vitest'
import { sanitizeUrl } from '../sanitizeUrl'

describe('sanitizeUrl', () => {
  it('keeps https URLs by default', () => {
    expect(sanitizeUrl('https://www.google.com/maps/embed?pb=1')).toBe(
      'https://www.google.com/maps/embed?pb=1',
    )
  })

  it('drops dangerous schemes', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBe('')
    expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('')
    expect(sanitizeUrl('vbscript:msgbox(1)')).toBe('')
  })

  it('drops http when only https is allowed', () => {
    expect(sanitizeUrl('http://example.com/x')).toBe('')
  })

  it('honours a custom scheme allowlist (e.g. media)', () => {
    const media = ['https:', 'http:', 'data:', 'blob:']
    expect(sanitizeUrl('http://cdn.example.com/a.jpg', media)).toBe(
      'http://cdn.example.com/a.jpg',
    )
    expect(sanitizeUrl('data:image/png;base64,iVBOR', media)).toBe(
      'data:image/png;base64,iVBOR',
    )
    expect(sanitizeUrl('javascript:alert(1)', media)).toBe('')
  })

  it('returns empty for empty, non-string, or non-absolute input', () => {
    expect(sanitizeUrl('')).toBe('')
    expect(sanitizeUrl('   ')).toBe('')
    expect(sanitizeUrl('/relative/path')).toBe('')
    expect(sanitizeUrl(undefined)).toBe('')
    expect(sanitizeUrl(null)).toBe('')
    expect(sanitizeUrl(123)).toBe('')
  })
})
