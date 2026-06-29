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

  it('falls back to default floatingGift when the slice is missing', () => {
    const result = mergeConfig({ common: { coupleNameLeft: 'Alice' } })
    expect(result.floatingGift).toEqual(DEFAULT_CONFIG.floatingGift)
  })

  it('partial floatingGift merge fills slot defaults and keeps the other slot', () => {
    const result = mergeConfig({ floatingGift: { slotA: { image: 'x.png' } } })
    expect(result.floatingGift.slotA.image).toBe('x.png')
    // Missing slotA fields fall back to defaults
    expect(result.floatingGift.slotA.size).toBe(DEFAULT_CONFIG.floatingGift.slotA.size)
    expect(result.floatingGift.slotA.speed).toBe(DEFAULT_CONFIG.floatingGift.slotA.speed)
    // slotB stays fully default
    expect(result.floatingGift.slotB).toEqual(DEFAULT_CONFIG.floatingGift.slotB)
  })

  it('preserves floatingGift.enabled === false', () => {
    const result = mergeConfig({ floatingGift: { enabled: false } })
    expect(result.floatingGift.enabled).toBe(false)
  })

  it('uses default floatingGift.enabled when value is not boolean', () => {
    const result = mergeConfig({
      floatingGift: { enabled: 'yes' as unknown as boolean },
    })
    expect(result.floatingGift.enabled).toBe(DEFAULT_CONFIG.floatingGift.enabled)
  })
})
