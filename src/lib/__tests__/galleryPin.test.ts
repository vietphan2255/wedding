import { describe, it, expect } from 'vitest'
import { pinExtraPx } from '../galleryPin'

// Defaults: ratio 0.7, clamp [120vh, 320vh].
describe('pinExtraPx', () => {
  it('is proportional to the period in the mid-range', () => {
    // 3000 × 0.7 = 2100, inside [960, 2560] for vh=800
    expect(pinExtraPx(3000, 800)).toBe(2100)
  })

  it('clamps small galleries up to the minimum pin', () => {
    // 500 × 0.7 = 350 < 800 × 1.2
    expect(pinExtraPx(500, 800)).toBe(960)
  })

  it('clamps huge galleries down to the maximum pin', () => {
    // 20000 × 0.7 = 14000 > 800 × 3.2
    expect(pinExtraPx(20000, 800)).toBe(2560)
  })

  it('falls back to the minimum while the period is unmeasured or invalid', () => {
    expect(pinExtraPx(0, 800)).toBe(960)
    expect(pinExtraPx(-100, 800)).toBe(960)
    expect(pinExtraPx(NaN, 800)).toBe(960)
    expect(pinExtraPx(Infinity, 800)).toBe(960) // non-finite → same safe fallback
  })

  it('tolerates a bad viewport height', () => {
    expect(pinExtraPx(3000, 0)).toBe(0)
    expect(pinExtraPx(3000, NaN)).toBe(0)
  })

  it('is monotonically non-decreasing in the period', () => {
    let prev = -1
    for (const period of [0, 100, 1000, 1372, 2000, 3657, 5000, 10000, 50000]) {
      const v = pinExtraPx(period, 800)
      expect(v).toBeGreaterThanOrEqual(prev)
      prev = v
    }
  })

  it('honors custom ratio and clamp bounds', () => {
    // min = 100, max = 800 for vh=1000, minVh=10, maxVh=80
    expect(pinExtraPx(1000, 1000, 0.5, 10, 80)).toBe(500)
    expect(pinExtraPx(50, 1000, 0.5, 10, 80)).toBe(100)
    expect(pinExtraPx(10000, 1000, 0.5, 10, 80)).toBe(800)
  })
})
