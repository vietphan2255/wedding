import { useEffect } from 'react'
import type { RefObject } from 'react'

// Traps Tab / Shift+Tab focus within `containerRef` while `active` is true.
// On activate, focus moves to `initialFocusRef` (or the first focusable inside
// the container). On deactivate, focus returns to whichever element was active
// before the trap engaged — so dismissing a modal sends keyboard users back to
// the trigger.
const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export default function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  active: boolean,
  initialFocusRef?: RefObject<HTMLElement | null>,
): void {
  useEffect(() => {
    if (!active) return
    const container = containerRef.current
    if (!container) return

    const previouslyFocused =
      typeof document !== 'undefined' ? document.activeElement : null

    // Defer one frame so the dialog is painted before we move focus into it.
    const raf = requestAnimationFrame(() => {
      const target =
        initialFocusRef?.current ||
        (container.querySelector(FOCUSABLE) as HTMLElement | null)
      if (target && typeof target.focus === 'function') {
        target.focus({ preventScroll: true })
      }
    })

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const focusables = container.querySelectorAll<HTMLElement>(FOCUSABLE)
      if (focusables.length === 0) {
        e.preventDefault()
        return
      }
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const activeEl = document.activeElement
      if (e.shiftKey) {
        if (activeEl === first || !container.contains(activeEl)) {
          e.preventDefault()
          last.focus({ preventScroll: true })
        }
      } else if (activeEl === last) {
        e.preventDefault()
        first.focus({ preventScroll: true })
      }
    }

    container.addEventListener('keydown', onKeyDown)
    return () => {
      cancelAnimationFrame(raf)
      container.removeEventListener('keydown', onKeyDown)
      if (
        previouslyFocused &&
        previouslyFocused instanceof HTMLElement &&
        typeof previouslyFocused.focus === 'function' &&
        document.contains(previouslyFocused)
      ) {
        previouslyFocused.focus({ preventScroll: true })
      }
    }
  }, [active, containerRef, initialFocusRef])
}
