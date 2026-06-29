import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

// jsdom has no matchMedia; stub it so any internal framer-motion use is safe.
if (!window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })
}

// Force the mobile + motion-enabled gating so the effect actually renders.
vi.mock('../../hooks/useIsPhone', () => ({ default: () => true }))
vi.mock('../../contexts/LanguageContext', () => ({
  useLanguage: () => ({ t: (k: string) => k }),
}))
vi.mock('framer-motion', async (importOriginal) => {
  const actual = await importOriginal<typeof import('framer-motion')>()
  return { ...actual, useReducedMotion: () => false }
})
// slotA configured, slotB empty → leg A shows slotA's image (no flip).
vi.mock('../../contexts/WeddingConfigContext', () => ({
  useWeddingConfig: () => ({
    config: {
      floatingGift: {
        enabled: true,
        slotA: { image: 'a.png', size: 80, offset: 8, speed: 60, wait: 1.5 },
        slotB: { image: '', size: 72, offset: 8, speed: 60, wait: 1.5 },
      },
    },
    loading: false,
    source: 'firebase',
  }),
}))

import FloatingGift from '../FloatingGift'

describe('<FloatingGift />', () => {
  it('mounts on mobile and renders the configured gift as a tappable button', () => {
    const onGiftClick = vi.fn()
    render(<FloatingGift onGiftClick={onGiftClick} />)

    const btn = screen.getByRole('button', { name: 'nav.gift' })
    expect(btn).toBeInTheDocument()

    const img = btn.querySelector('img')
    expect(img).toHaveAttribute('src', 'a.png')

    fireEvent.click(btn)
    expect(onGiftClick).toHaveBeenCalledTimes(1)
  })
})
