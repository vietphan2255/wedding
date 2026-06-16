import { describe, it, expect } from 'vitest'

describe('test scaffold', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2)
  })

  it('has jsdom available', () => {
    expect(typeof window).toBe('object')
    expect(typeof document).toBe('object')
  })
})
