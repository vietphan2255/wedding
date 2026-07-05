import { useEffect } from 'react'
import { getLenis } from '../lib/lenis'

// Overlays can nest (QrLightbox z-[120] opens over GiftModal z-[110]), so the
// lock is counted: engage on 0→1, release on 1→0. Without this, closing the
// inner overlay would restart Lenis underneath the outer one.
let lockCount = 0
let prevBodyOverflow = ''

// Freeze page scroll while `active`. Setting body overflow alone is not enough
// on this site: Lenis scrolls programmatically from non-passive window-level
// wheel/touch listeners and never consults CSS overflow — it must be stop()ed.
// Body overflow is still set as the native fallback (reduced-motion mounts no
// Lenis) and because useSmoothScroll's snapBlocked() reads it to gate the hero
// auto-snap.
export default function useScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return
    lockCount += 1
    if (lockCount === 1) {
      prevBodyOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      getLenis()?.stop()
    }
    return () => {
      lockCount -= 1
      if (lockCount === 0) {
        document.body.style.overflow = prevBodyOverflow
        getLenis()?.start()
      }
    }
  }, [active])
}
