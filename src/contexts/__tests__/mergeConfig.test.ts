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
      labels: { en: { [encoded]: 'A new label' } },
    })
    expect(result.labels.en['hero.eyebrow']).toBe('A new label')
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
        '-N100': { order: 2, question_en: 'B', question_vi: 'B', answer_en: 'b', answer_vi: 'b' },
        '-N101': { order: 0, question_en: 'A', question_vi: 'A', answer_en: 'a', answer_vi: 'a' },
        '-N102': { order: 1, question_en: 'C', question_vi: 'C', answer_en: 'c', answer_vi: 'c' },
      },
    })
    expect(result.faqs.map((f) => f.question_en)).toEqual(['A', 'C', 'B'])
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
})
