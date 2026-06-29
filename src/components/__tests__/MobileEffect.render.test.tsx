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
vi.mock('framer-motion', async (importOriginal) => {
  const actual = await importOriginal<typeof import('framer-motion')>()
  return { ...actual, useReducedMotion: () => false }
})
// slotA configured (with a name + script), slotB empty → leg A is active first.
vi.mock('../../contexts/WeddingConfigContext', () => ({
  useWeddingConfig: () => ({
    config: {
      mobileEffect: {
        enabled: true,
        slotA: {
          image: 'a.png',
          size: 80,
          offset: 8,
          speed: 60,
          wait: 1.5,
          character: '',
          name: 'Santa',
          script: ['Hello', 'Bye'],
        },
        slotB: {
          image: '',
          size: 72,
          offset: 8,
          speed: 60,
          wait: 1.5,
          character: '',
          name: '',
          script: [],
        },
      },
    },
    loading: false,
    source: 'firebase',
  }),
}))

import MobileEffect from '../MobileEffect'

describe('<MobileEffect />', () => {
  it('mounts on mobile and opens the character-script modal when the sprite is tapped', () => {
    render(<MobileEffect />)

    // The sprite tap target (leg A is active first; aria-label is its name).
    const sprite = screen.getByRole('button', { name: 'Santa' })
    expect(sprite).toBeInTheDocument()

    fireEvent.click(sprite)

    // The character-script modal appears showing the first script line.
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
