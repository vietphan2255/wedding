import { describe, it, expect } from 'vitest'
import { loopDistance, withinWindow } from '../lightboxWindow'

describe('loopDistance', () => {
  it('measures plain adjacency away from the seam', () => {
    expect(loopDistance(5, 7, 40)).toBe(2)
    expect(loopDistance(7, 7, 40)).toBe(0)
  })

  it('wraps across the seam (last ↔ first)', () => {
    expect(loopDistance(0, 59, 60)).toBe(1)
    expect(loopDistance(58, 1, 60)).toBe(3)
    expect(loopDistance(39, 0, 40)).toBe(1)
  })

  it('is symmetric', () => {
    for (const [a, b, n] of [
      [0, 59, 60],
      [3, 17, 21],
      [10, 10, 11],
    ]) {
      expect(loopDistance(a, b, n)).toBe(loopDistance(b, a, n))
    }
  })

  it('normalizes stale/out-of-range indices instead of going negative', () => {
    // current beyond count (admin removed photos mid-lightbox)
    expect(loopDistance(0, 45, 40)).toBe(5)
    expect(loopDistance(-1, 0, 40)).toBe(1) // -1 ≡ 39, one step from 0
    expect(loopDistance(0, 45, 40)).toBeGreaterThanOrEqual(0)
  })

  it('is total for degenerate counts', () => {
    expect(loopDistance(0, 0, 1)).toBe(0)
    expect(loopDistance(3, 9, 1)).toBe(0)
    expect(loopDistance(0, 0, 0)).toBe(0)
  })
})

describe('withinWindow', () => {
  it('selects exactly the seam-spanning window at radius 2', () => {
    const inWindow = Array.from({ length: 40 }, (_, i) => i).filter((i) =>
      withinWindow(i, 0, 40, 2),
    )
    expect(inWindow).toEqual([0, 1, 2, 38, 39])
  })

  it('keeps the window size at min(N, 2R+1) across positions and sizes', () => {
    for (const n of [3, 5, 6, 40, 100]) {
      for (const cur of [0, 1, Math.floor(n / 2), n - 1]) {
        const size = Array.from({ length: n }, (_, i) => i).filter((i) =>
          withinWindow(i, cur, n, 2),
        ).length
        expect(size).toBe(Math.min(n, 5))
      }
    }
  })

  it('degenerates to "everything mounted" for tiny galleries', () => {
    for (let i = 0; i < 5; i++) {
      expect(withinWindow(i, 3, 5, 2)).toBe(true)
    }
  })
})
