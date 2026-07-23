import { describe, it, expect } from 'vitest'
import mergeConfig from '../mergeConfig'
import { DEFAULT_CONFIG, encodeLabelKey } from '../configDefaults'

describe('mergeConfig', () => {
  it('returns DEFAULT_CONFIG when snapshot is null', () => {
    expect(mergeConfig(null)).toEqual(DEFAULT_CONFIG)
  })

  it('returns DEFAULT_CONFIG when snapshot is undefined', () => {
    expect(mergeConfig(undefined)).toEqual(DEFAULT_CONFIG)
  })

  it('returns DEFAULT_CONFIG when snapshot is not an object', () => {
    expect(mergeConfig('not-an-object')).toEqual(DEFAULT_CONFIG)
  })

  it('falls back to default for missing slices', () => {
    const result = mergeConfig({ common: { coupleNameLeft: 'Alice' } })
    expect(result.common.coupleNameLeft).toBe('Alice')
    // Other common fields keep defaults
    expect(result.common.coupleNameRight).toBe(DEFAULT_CONFIG.common.coupleNameRight)
    // Missing slices are full defaults
    expect(result.gifts).toEqual(DEFAULT_CONFIG.gifts)
    expect(result.faqs).toEqual(DEFAULT_CONFIG.faqs)
  })

  it('decodes labels with __ back to . keys', () => {
    const encoded = encodeLabelKey('hero.eyebrow')
    expect(encoded).toBe('hero__eyebrow')
    const result = mergeConfig({
      labels: { vi: { [encoded]: 'A new label' } },
    })
    expect(result.labels.vi['hero.eyebrow']).toBe('A new label')
  })

  it('preserves gifts.enabled === false', () => {
    const result = mergeConfig({ gifts: { enabled: false } })
    expect(result.gifts.enabled).toBe(false)
    // Bride/groom keep defaults
    expect(result.gifts.bride.bank).toBe(DEFAULT_CONFIG.gifts.bride.bank)
  })

  it('uses default gifts.enabled when value is not boolean', () => {
    const result = mergeConfig({ gifts: { enabled: 'yes' as unknown as boolean } })
    expect(result.gifts.enabled).toBe(DEFAULT_CONFIG.gifts.enabled)
  })

  it('merges partial gifts.paypal and keeps defaults', () => {
    const result = mergeConfig({ gifts: { paypal: { url: 'paypal.me/foo' } } })
    expect(result.gifts.paypal.url).toBe('paypal.me/foo')
    expect(result.gifts.paypal.holder).toBe('')
  })

  it('defaults gifts.paypal when the stored gifts node predates it', () => {
    const result = mergeConfig({ gifts: { enabled: true, groom: { bank: 'X' } } })
    expect(result.gifts.paypal).toEqual(DEFAULT_CONFIG.gifts.paypal)
  })

  it('sorts list slices by order and adds Firebase-style ids', () => {
    const result = mergeConfig({
      faqs: {
        '-N100': { order: 2, question_vi: 'B', answer_vi: 'b' },
        '-N101': { order: 0, question_vi: 'A', answer_vi: 'a' },
        '-N102': { order: 1, question_vi: 'C', answer_vi: 'c' },
      },
    })
    expect(result.faqs.map((f) => f.question_vi)).toEqual(['A', 'C', 'B'])
    expect(result.faqs[0].id).toBe('-N101')
  })

  it('returns default list when Firebase node is empty object', () => {
    const result = mergeConfig({ gallery: {} })
    expect(result.gallery).toEqual(DEFAULT_CONFIG.gallery)
  })

  it('partial nested venues merge keeps the other venue default', () => {
    const result = mergeConfig({
      venues: { vuquy: { mapEmbed: 'https://example.com/embed' } },
    })
    expect(result.venues.vuquy.mapEmbed).toBe('https://example.com/embed')
    expect(result.venues.thanhhon.mapEmbed).toBe(DEFAULT_CONFIG.venues.thanhhon.mapEmbed)
  })

  it('falls back to default mobileEffect when the slice is missing', () => {
    const result = mergeConfig({ common: { coupleNameLeft: 'Alice' } })
    expect(result.mobileEffect).toEqual(DEFAULT_CONFIG.mobileEffect)
  })

  it('partial mobileEffect merge fills slot defaults and keeps the other slot', () => {
    const result = mergeConfig({ mobileEffect: { slotA: { image: 'x.png' } } })
    expect(result.mobileEffect.slotA.image).toBe('x.png')
    // Missing slotA fields fall back to defaults
    expect(result.mobileEffect.slotA.size).toBe(DEFAULT_CONFIG.mobileEffect.slotA.size)
    expect(result.mobileEffect.slotA.speed).toBe(DEFAULT_CONFIG.mobileEffect.slotA.speed)
    // New per-slot modal fields default
    expect(result.mobileEffect.slotA.character).toBe('')
    expect(result.mobileEffect.slotA.name).toBe('')
    expect(result.mobileEffect.slotA.script).toEqual([])
    // slotB stays fully default
    expect(result.mobileEffect.slotB).toEqual(DEFAULT_CONFIG.mobileEffect.slotB)
  })

  it('coerces a Firebase-style object script into a string array', () => {
    const result = mergeConfig({
      mobileEffect: { slotA: { script: { 0: 'a', 1: 'b' } as unknown as string[] } },
    })
    expect(result.mobileEffect.slotA.script).toEqual(['a', 'b'])
  })

  it('preserves mobileEffect.enabled === false', () => {
    const result = mergeConfig({ mobileEffect: { enabled: false } })
    expect(result.mobileEffect.enabled).toBe(false)
  })

  it('uses default mobileEffect.enabled when value is not boolean', () => {
    const result = mergeConfig({
      mobileEffect: { enabled: 'yes' as unknown as boolean },
    })
    expect(result.mobileEffect.enabled).toBe(DEFAULT_CONFIG.mobileEffect.enabled)
  })
})
