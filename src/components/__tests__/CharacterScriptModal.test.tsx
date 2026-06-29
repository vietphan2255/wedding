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

import CharacterScriptModal from '../CharacterScriptModal'

describe('<CharacterScriptModal />', () => {
  it('advances through lines on tap, then closes past the last line', () => {
    const onClose = vi.fn()
    render(
      <CharacterScriptModal
        open
        image="c.png"
        name="Santa"
        lines={['one', 'two', 'three']}
        onClose={onClose}
      />,
    )
    // The speech bubble is the (stable) button wrapping the current line.
    const bubbleFor = (text: string) =>
      screen.getByText(text).closest('button') as HTMLElement

    expect(screen.getByText('one')).toBeInTheDocument()
    fireEvent.click(bubbleFor('one'))
    expect(screen.getByText('two')).toBeInTheDocument()
    fireEvent.click(bubbleFor('two'))
    expect(screen.getByText('three')).toBeInTheDocument()
    // Past the last line, a tap closes.
    fireEvent.click(bubbleFor('three'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('closes on Escape', () => {
    const onClose = vi.fn()
    render(
      <CharacterScriptModal open image="c.png" name="Santa" lines={['hi']} onClose={onClose} />,
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('renders nothing when closed', () => {
    const { container } = render(
      <CharacterScriptModal
        open={false}
        image="c.png"
        name="Santa"
        lines={['hi']}
        onClose={() => {}}
      />,
    )
    expect(container).toBeEmptyDOMElement()
  })
})
