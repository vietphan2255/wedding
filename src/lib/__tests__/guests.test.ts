import { describe, it, expect } from 'vitest'
import {
  genInviteCode,
  genUniqueInviteCode,
  normalizeParty,
  parseGuestCsv,
  inviteLink,
} from '../guests'

describe('normalizeParty', () => {
  it('maps the Vietnamese ceremony names', () => {
    expect(normalizeParty('Lễ Vu Quy')).toBe('vuquy')
    expect(normalizeParty('Lễ Thành Hôn')).toBe('thanhhon')
  })

  it('is case- and diacritic-insensitive and ignores punctuation', () => {
    expect(normalizeParty('  thanh hon ')).toBe('thanhhon')
    expect(normalizeParty('VU-QUY')).toBe('vuquy')
    expect(normalizeParty('vuquy')).toBe('vuquy')
  })

  it('treats both / cả hai and anything unknown as "both"', () => {
    expect(normalizeParty('Cả hai')).toBe('both')
    expect(normalizeParty('both')).toBe('both')
    expect(normalizeParty('')).toBe('both')
    expect(normalizeParty(undefined)).toBe('both')
    expect(normalizeParty('???')).toBe('both')
  })
})

describe('genInviteCode', () => {
  it('produces a base62 string of the requested length', () => {
    expect(genInviteCode()).toMatch(/^[0-9A-Za-z]{8}$/)
    expect(genInviteCode(12)).toMatch(/^[0-9A-Za-z]{12}$/)
  })

  it('is effectively unique across many calls', () => {
    const codes = new Set(Array.from({ length: 2000 }, () => genInviteCode()))
    expect(codes.size).toBe(2000)
  })
})

describe('genUniqueInviteCode', () => {
  it('never returns a code already taken', () => {
    const taken = new Set([genInviteCode(), genInviteCode()])
    for (let i = 0; i < 200; i += 1) {
      expect(taken.has(genUniqueInviteCode(taken))).toBe(false)
    }
  })
})

describe('parseGuestCsv', () => {
  it('parses tab-separated rows (Google Sheets paste) and drops the header', () => {
    const text = [
      'name\tinvitation name\tparty',
      'Nguyễn Văn A\tGia đình Anh A\tLễ Thành Hôn',
      'Trần Thị B\tCô B\tLễ Vu Quy',
    ].join('\n')
    expect(parseGuestCsv(text)).toEqual([
      { name: 'Nguyễn Văn A', invitationName: 'Gia đình Anh A', party: 'thanhhon' },
      { name: 'Trần Thị B', invitationName: 'Cô B', party: 'vuquy' },
    ])
  })

  it('drops a Vietnamese header row too', () => {
    const text = ['Họ tên\tTên thiệp\tSự kiện', 'A\tAnh A\tcả hai'].join('\n')
    expect(parseGuestCsv(text)).toEqual([
      { name: 'A', invitationName: 'Anh A', party: 'both' },
    ])
  })

  it('keeps a real first row whose invitation name contains "mời"', () => {
    const rows = parseGuestCsv('\tKính mời cô Ba\tLễ Vu Quy')
    expect(rows).toEqual([{ name: '', invitationName: 'Kính mời cô Ba', party: 'vuquy' }])
  })

  it('handles quoted commas in a CSV export and skips blank lines', () => {
    const text = 'Le Van C,"Gia đình C, D",both\n\nDo Thi E,Chị E,vuquy\n'
    expect(parseGuestCsv(text)).toEqual([
      { name: 'Le Van C', invitationName: 'Gia đình C, D', party: 'both' },
      { name: 'Do Thi E', invitationName: 'Chị E', party: 'vuquy' },
    ])
  })

  it('falls back to the name when the invitation-name column is empty', () => {
    expect(parseGuestCsv('Solo Guest')).toEqual([
      { name: 'Solo Guest', invitationName: 'Solo Guest', party: 'both' },
    ])
  })
})

describe('inviteLink', () => {
  it('builds an origin-qualified ?invite= URL', () => {
    expect(inviteLink('a7Qk2Ztb').endsWith('/?invite=a7Qk2Ztb')).toBe(true)
  })
})
