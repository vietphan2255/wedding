import type Lenis from 'lenis'

// The live Lenis instance, registered by useSmoothScroll for the lifetime of
// the page it runs on. A module singleton (not context) because two separate
// route roots mount the hook and only one Lenis ever exists at a time. Null
// under prefers-reduced-motion and on routes without smooth scroll (admin).
let instance: Lenis | null = null

export function setLenis(lenis: Lenis | null): void {
  instance = lenis
}

export function getLenis(): Lenis | null {
  return instance
}
