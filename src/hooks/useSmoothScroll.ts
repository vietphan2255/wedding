import { useEffect } from 'react'
import Lenis from 'lenis'
import { setLenis } from '../lib/lenis'
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
      // Drive touch through Lenis too, so the hero snap's `lock` cleanly takes
      // over from native iOS momentum instead of fighting it (smooths all touch
      // scrolling site-wide). syncTouchLerp tunes the smoothing strength.
      syncTouch: true,
      syncTouchLerp: 0.075,
      touchMultiplier: 1.6,
    })
    // Expose the instance so overlays can stop()/start() it (useScrollLock).
    setLenis(lenis)

    // Phones use a coarse pointer; shorten the locked glide there so it feels
    // responsive rather than drawn-out.
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches

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

    // ── Hero auto-snap ───────────────────────────────────────────────────
    // While the hero (#home) still fills the viewport, the first *downward*
    // scroll glides the whole hero out to #invitation in one locked motion, so
    // the hero can never be left half-scrolled. Upward scrolling stays normal,
    // and it re-arms whenever the hero comes back into view.
    let snapping = false
    const heroActive = () => {
      const hero = document.getElementById('home')
      if (!hero) return false
      return hero.getBoundingClientRect().bottom > window.innerHeight * 0.4
    }
    // Don't snap mid-animation, or while the intro envelope locks body scroll.
    const snapBlocked = () => snapping || document.body.style.overflow === 'hidden'
    // Cinematic ease-in-out for the hero glide — gentle start, flowing middle,
    // soft settle. (Lenis's global easing is an input-driven expo-out, which
    // would lurch on a programmatic A→B move.)
    const snapEase = (t: number) =>
      t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2
    const snapToNext = () => {
      const next = document.querySelector('#invitation')
      if (!next || snapping) return
      snapping = true
      start()
      lenis.scrollTo(next as HTMLElement, {
        offset: -64,
        duration: coarsePointer ? 1.3 : 1.9,
        easing: snapEase,
        lock: true, // uninterruptible — no piece-by-piece scrolling
        onComplete: () => {
          snapping = false
        },
      })
    }
    const onWheelSnap = (e: WheelEvent) => {
      if (snapBlocked()) return
      if (e.deltaY > 0 && heroActive()) snapToNext()
    }
    // Detect an upward swipe across the gesture, but only fire the snap once the
    // finger lifts — starting the glide mid-drag fights the active touch (and the
    // iOS momentum that follows), which is what made it stutter on mobile.
    let touchStartY = 0
    let touchIntent = false
    const onTouchStartSnap = (e: TouchEvent) => {
      touchStartY = e.touches[0]?.clientY ?? 0
      touchIntent = false
    }
    const onTouchMoveSnap = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY ?? 0
      // finger sliding up (start − current > 0) = scrolling the page down
      if (touchStartY - y > 8) touchIntent = true
    }
    const onTouchEndSnap = () => {
      if (snapBlocked()) return
      if (touchIntent && heroActive()) snapToNext()
      touchIntent = false
    }
    const snapKeys = new Set(['ArrowDown', 'PageDown', ' '])
    const onKeySnap = (e: KeyboardEvent) => {
      if (snapBlocked()) return
      if (snapKeys.has(e.key) && heroActive()) {
        e.preventDefault()
        snapToNext()
      }
    }
    window.addEventListener('wheel', onWheelSnap, opts)
    window.addEventListener('touchstart', onTouchStartSnap, opts)
    window.addEventListener('touchmove', onTouchMoveSnap, opts)
    window.addEventListener('touchend', onTouchEndSnap, opts)
    window.addEventListener('keydown', onKeySnap)

    return () => {
      document.removeEventListener('click', onAnchor)
      window.removeEventListener('wheel', onWheelSnap)
      window.removeEventListener('touchstart', onTouchStartSnap)
      window.removeEventListener('touchmove', onTouchMoveSnap)
      window.removeEventListener('touchend', onTouchEndSnap)
      window.removeEventListener('keydown', onKeySnap)
      window.removeEventListener('wheel', onInput)
      window.removeEventListener('touchstart', onInput)
      window.removeEventListener('touchmove', onInput)
      window.removeEventListener('keydown', onKey)
      if (rafId) cancelAnimationFrame(rafId)
      setLenis(null)
      lenis.destroy()
    }
  }, [])
}
