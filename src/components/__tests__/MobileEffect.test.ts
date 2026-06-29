import { describe, it, expect } from 'vitest'
import { resolveLeg } from '../MobileEffect'

const slot = (over = {}) => ({
  image: '',
  size: 72,
  offset: 8,
  speed: 60,
  wait: 1.5,
  character: '',
  name: '',
  script: [],
  ...over,
})

describe('resolveLeg', () => {
  it("uses each slot's own image with no flip when both are set", () => {
    const fg = {
      enabled: true,
      slotA: slot({ image: 'a.png', size: 80 }),
      slotB: slot({ image: 'b.png', size: 100 }),
    }
    expect(resolveLeg('A', fg)).toMatchObject({ src: 'a.png', flip: false, size: 80 })
    expect(resolveLeg('B', fg)).toMatchObject({ src: 'b.png', flip: false, size: 100 })
  })

  it('mirrors slot A for leg B (borrowing A content) when only A has an image', () => {
    const fg = {
      enabled: true,
      slotA: slot({ image: 'a.png', size: 80, speed: 120, name: 'Santa', script: ['hi', 'bye'] }),
      slotB: slot(),
    }
    expect(resolveLeg('A', fg)).toMatchObject({ src: 'a.png', flip: false })
    expect(resolveLeg('B', fg)).toMatchObject({
      src: 'a.png',
      flip: true,
      size: 80,
      speed: 120,
      name: 'Santa',
      script: ['hi', 'bye'],
    })
  })

  it('mirrors slot B for leg A when only B has an image', () => {
    const fg = {
      enabled: true,
      slotA: slot(),
      slotB: slot({ image: 'b.png', offset: 20 }),
    }
    expect(resolveLeg('A', fg)).toMatchObject({ src: 'b.png', flip: true, offset: 20 })
    expect(resolveLeg('B', fg)).toMatchObject({ src: 'b.png', flip: false })
  })

  it('falls back to the flying sprite when no separate character image is set', () => {
    const fg = { enabled: true, slotA: slot({ image: 'a.png' }), slotB: slot() }
    expect(resolveLeg('A', fg)).toMatchObject({ character: 'a.png' })
  })

  it('uses the separate character image when one is set', () => {
    const fg = {
      enabled: true,
      slotA: slot({ image: 'a.png', character: 'portrait.png' }),
      slotB: slot(),
    }
    expect(resolveLeg('A', fg)).toMatchObject({ character: 'portrait.png' })
  })

  it('returns null for both legs when neither slot has an image', () => {
    const fg = { enabled: true, slotA: slot(), slotB: slot() }
    expect(resolveLeg('A', fg)).toBeNull()
    expect(resolveLeg('B', fg)).toBeNull()
  })

  it('treats a whitespace-only image as empty (falls back to the other slot)', () => {
    const fg = {
      enabled: true,
      slotA: slot({ image: '   ' }),
      slotB: slot({ image: 'b.png' }),
    }
    expect(resolveLeg('A', fg)).toMatchObject({ src: 'b.png', flip: true })
  })
})
