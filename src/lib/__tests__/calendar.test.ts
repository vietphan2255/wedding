import { describe, it, expect } from 'vitest'
import { mapsSearchUrl, googleCalendarUrl, formatVnTime } from '../calendar'

describe('formatVnTime', () => {
  it('formats the Vietnam wall-clock time with a period word', () => {
    expect(formatVnTime('2026-07-26T09:00:00+07:00')).toBe('9:00 sáng')
    expect(formatVnTime('2026-08-02T18:00:00+07:00')).toBe('6:00 chiều')
    expect(formatVnTime('2026-08-02T20:30:00+07:00')).toBe('8:30 tối')
    expect(formatVnTime('2026-08-02T12:00:00+07:00')).toBe('12:00 trưa')
  })

  it('renders Vietnam time regardless of the offset the instant is written in', () => {
    // 02:00Z is 09:00 in Vietnam (+07:00) — must not shift for other timezones.
    expect(formatVnTime('2026-07-26T02:00:00Z')).toBe('9:00 sáng')
  })

  it('accepts a Date and returns "" for missing/invalid input', () => {
    expect(formatVnTime(new Date('2026-07-26T09:00:00+07:00'))).toBe('9:00 sáng')
    expect(formatVnTime('')).toBe('')
    expect(formatVnTime('not a date')).toBe('')
  })
})

describe('googleCalendarUrl', () => {
  it('builds a TEMPLATE link with UTC basic dates and decodable params', () => {
    const url = googleCalendarUrl({
      title: 'Lễ Vu Quy — Viet & Nguyen',
      start: new Date('2026-07-26T09:00:00+07:00'),
      end: new Date('2026-07-26T12:00:00+07:00'),
      location: '123 Nguyễn Huệ',
      details: 'âm lịch',
    })
    expect(url).toContain('https://calendar.google.com/calendar/render?')
    expect(url).toContain('action=TEMPLATE')
    // 09:00 / 12:00 +07:00 → 02:00 / 05:00 UTC
    expect(url).toContain('dates=20260726T020000Z%2F20260726T050000Z')

    const params = new URL(url).searchParams
    expect(params.get('text')).toBe('Lễ Vu Quy — Viet & Nguyen')
    expect(params.get('location')).toBe('123 Nguyễn Huệ')
  })
})

describe('mapsSearchUrl', () => {
  it('encodes the query into a maps search deep link', () => {
    const url = mapsSearchUrl('123 Nguyễn Huệ')
    expect(url.startsWith('https://www.google.com/maps/search/?api=1&query=')).toBe(
      true,
    )
    expect(decodeURIComponent(url.split('query=')[1])).toBe('123 Nguyễn Huệ')
  })
})
