import { useEffect } from 'react'
import Lenis from 'lenis'
import {
  SMOOTH_SCROLL_IDLE_MS,
  SMOOTH_SCROLL_IDLE_VELOCITY,
} from '../lib/constants'

// Lenis smooth scroll, but only ticks while the user is scrolling or Lenis is
// still settling. When the page is idle the rAF stops, so phones aren't burning
// a frame per 16ms for nothing. Anchor links and `prefers-reduced-motion` work
// exactly as before.
export default function useSmoothScroll(): void {
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
    })

    let rafId = 0
    let running = false
    let lastActive = performance.now()

    const loop = (time: number) => {
      lenis.raf(time)
      const idle =
        performance.now() - lastActive > SMOOTH_SCROLL_IDLE_MS &&
        Math.abs(lenis.velocity || 0) < SMOOTH_SCROLL_IDLE_VELOCITY
      if (idle) {
        running = false
        rafId = 0
        return
      }
      rafId = requestAnimationFrame(loop)
    }
    const start = () => {
      lastActive = performance.now()
      if (running) return
      running = true
      rafId = requestAnimationFrame(loop)
    }

    // Keep the loop alive while Lenis is producing scroll updates.
    lenis.on('scroll', () => {
      lastActive = performance.now()
      if (!running) start()
    })

    const opts = { passive: true } as AddEventListenerOptions
    const onInput = () => start()
    window.addEventListener('wheel', onInput, opts)
    window.addEventListener('touchstart', onInput, opts)
    window.addEventListener('touchmove', onInput, opts)
    const scrollKeys = new Set([
      'ArrowUp',
      'ArrowDown',
      'PageUp',
      'PageDown',
      ' ',
      'Home',
      'End',
    ])
    const onKey = (e: KeyboardEvent) => {
      if (scrollKeys.has(e.key)) start()
    }
    window.addEventListener('keydown', onKey)

    // One initial tick so Lenis can do first-frame setup, then it idles.
    start()

    const onAnchor = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      const a = target?.closest('a[href]') as HTMLAnchorElement | null
      if (!a) return
      const href = a.getAttribute('href') || ''
      let id: string | null = null
      if (href.startsWith('#')) {
        id = href
      } else if (
        href.startsWith('/#') &&
        (window.location.pathname === '/' || window.location.pathname === '')
      ) {
        id = href.slice(1)
      }
      if (!id || id.length < 2) return
      const el = document.querySelector(id)
      if (!el) return
      e.preventDefault()
      start()
      lenis.scrollTo(el as HTMLElement, { offset: -64 })
    }
    document.addEventListener('click', onAnchor)

    return () => {
      document.removeEventListener('click', onAnchor)
      window.removeEventListener('wheel', onInput)
      window.removeEventListener('touchstart', onInput)
      window.removeEventListener('touchmove', onInput)
      window.removeEventListener('keydown', onKey)
      if (rafId) cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [])
}
