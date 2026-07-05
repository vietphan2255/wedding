import { describe, it, expect } from 'vitest'
import { sanitizeGoogleMapsUrl } from '../googleMapsUrl'

describe('sanitizeGoogleMapsUrl', () => {
  it('accepts classic maps.google.com links over http and https', () => {
    expect(sanitizeGoogleMapsUrl('https://maps.google.com/?q=10.77,106.7')).toBe(
      'https://maps.google.com/?q=10.77,106.7',
    )
    expect(sanitizeGoogleMapsUrl('http://maps.google.com/maps')).toBe(
      'http://maps.google.com/maps',
    )
  })

  it('accepts google.com/maps and www.google.com/maps', () => {
    expect(sanitizeGoogleMapsUrl('https://www.google.com/maps/place/ABC')).toBe(
      'https://www.google.com/maps/place/ABC',
    )
    expect(sanitizeGoogleMapsUrl('https://google.com/maps')).toBe(
      'https://google.com/maps',
    )
  })

  it('accepts country-TLD Google domains', () => {
    expect(sanitizeGoogleMapsUrl('https://maps.google.co.uk/')).toBeTruthy()
    expect(sanitizeGoogleMapsUrl('https://www.google.com.vn/maps')).toBeTruthy()
  })

  it('accepts goo.gl/maps and maps.app.goo.gl short links', () => {
    expect(sanitizeGoogleMapsUrl('https://goo.gl/maps/abc123')).toBeTruthy()
    expect(sanitizeGoogleMapsUrl('https://maps.app.goo.gl/abc123')).toBeTruthy()
  })

  it('trims surrounding whitespace', () => {
    expect(sanitizeGoogleMapsUrl('  https://maps.google.com/  ')).toBe(
      'https://maps.google.com/',
    )
  })

  it('returns "" for empty, whitespace, or non-string values', () => {
    expect(sanitizeGoogleMapsUrl('')).toBe('')
    expect(sanitizeGoogleMapsUrl('   ')).toBe('')
    expect(sanitizeGoogleMapsUrl(undefined)).toBe('')
    expect(sanitizeGoogleMapsUrl(null)).toBe('')
    expect(sanitizeGoogleMapsUrl(42)).toBe('')
  })

  it('rejects non-http(s) schemes', () => {
    expect(sanitizeGoogleMapsUrl('javascript:alert(1)')).toBe('')
    expect(sanitizeGoogleMapsUrl('data:text/html,<h1>x</h1>')).toBe('')
    expect(sanitizeGoogleMapsUrl('ftp://maps.google.com/')).toBe('')
  })

  it('rejects relative or non-absolute URLs', () => {
    expect(sanitizeGoogleMapsUrl('/maps/place/x')).toBe('')
    expect(sanitizeGoogleMapsUrl('maps.google.com')).toBe('')
  })

  it('rejects non-Google map providers', () => {
    expect(sanitizeGoogleMapsUrl('https://maps.apple.com/?q=x')).toBe('')
    expect(sanitizeGoogleMapsUrl('https://www.bing.com/maps?q=x')).toBe('')
    expect(sanitizeGoogleMapsUrl('https://www.openstreetmap.org/#map=x')).toBe('')
  })

  it('rejects google.com without a /maps path', () => {
    expect(sanitizeGoogleMapsUrl('https://www.google.com/search?q=x')).toBe('')
    expect(sanitizeGoogleMapsUrl('https://google.com')).toBe('')
  })

  it('rejects goo.gl short links that are not /maps', () => {
    expect(sanitizeGoogleMapsUrl('https://goo.gl/abc123')).toBe('')
  })

  it('rejects look-alike and suffix-phishing hosts', () => {
    expect(sanitizeGoogleMapsUrl('https://maps.google.com.evil.com/')).toBe('')
    expect(sanitizeGoogleMapsUrl('https://google.com.evil.com/maps')).toBe('')
    expect(sanitizeGoogleMapsUrl('https://evil.com/maps?u=google.com/maps')).toBe('')
    expect(sanitizeGoogleMapsUrl('https://notgoogle.com/maps')).toBe('')
    expect(sanitizeGoogleMapsUrl('https://evilmaps.google.com.attacker.net/')).toBe('')
  })
})
