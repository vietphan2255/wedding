import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import useScrollLock from '../useScrollLock'
import { getLenis } from '../../lib/lenis'

vi.mock('../../lib/lenis', () => ({
  getLenis: vi.fn(() => null),
  setLenis: vi.fn(),
}))

const lenis = { stop: vi.fn(), start: vi.fn() }

beforeEach(() => {
  vi.mocked(getLenis).mockReturnValue(
    lenis as unknown as ReturnType<typeof getLenis>,
  )
  lenis.stop.mockClear()
  lenis.start.mockClear()
  document.body.style.overflow = ''
})

describe('useScrollLock', () => {
  it('locks body scroll and stops Lenis while active, restores on release', () => {
    document.body.style.overflow = 'scroll'
    const { unmount } = renderHook(() => useScrollLock(true))
    expect(document.body.style.overflow).toBe('hidden')
    expect(lenis.stop).toHaveBeenCalledTimes(1)
    unmount()
    // Restores the value that was there before, not just ''.
    expect(document.body.style.overflow).toBe('scroll')
    expect(lenis.start).toHaveBeenCalledTimes(1)
  })

  it('does nothing while inactive', () => {
    const { unmount } = renderHook(() => useScrollLock(false))
    expect(document.body.style.overflow).toBe('')
    expect(lenis.stop).not.toHaveBeenCalled()
    unmount()
    expect(lenis.start).not.toHaveBeenCalled()
  })

  it('engages and releases when `active` toggles', () => {
    const { rerender, unmount } = renderHook(
      ({ active }) => useScrollLock(active),
      { initialProps: { active: false } },
    )
    rerender({ active: true })
    expect(document.body.style.overflow).toBe('hidden')
    expect(lenis.stop).toHaveBeenCalledTimes(1)
    rerender({ active: false })
    expect(document.body.style.overflow).toBe('')
    expect(lenis.start).toHaveBeenCalledTimes(1)
    unmount()
    expect(lenis.start).toHaveBeenCalledTimes(1)
  })

  it('nested locks release only when the last one closes', () => {
    // QrLightbox (inner) opens over GiftModal (outer).
    const outer = renderHook(() => useScrollLock(true))
    const inner = renderHook(() => useScrollLock(true))
    expect(lenis.stop).toHaveBeenCalledTimes(1)
    inner.unmount()
    expect(document.body.style.overflow).toBe('hidden')
    expect(lenis.start).not.toHaveBeenCalled()
    outer.unmount()
    expect(document.body.style.overflow).toBe('')
    expect(lenis.start).toHaveBeenCalledTimes(1)
  })

  it('no-ops safely when no Lenis instance exists (reduced motion, admin)', () => {
    vi.mocked(getLenis).mockReturnValue(null)
    const { unmount } = renderHook(() => useScrollLock(true))
    expect(document.body.style.overflow).toBe('hidden')
    unmount()
    expect(document.body.style.overflow).toBe('')
  })
})
