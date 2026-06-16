import { useEffect, useState } from 'react'

// True when the viewport is small (≤768px) or the primary pointer is coarse
// (i.e. a phone/tablet). Used to suppress decorative infinite animations on
// devices where they cost the most while keeping all content and interactions
// identical.
const QUERY = '(max-width: 768px), (pointer: coarse)'

export default function useIsPhone(): boolean {
  const [isPhone, setIsPhone] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia(QUERY).matches
  })

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia(QUERY)
    const onChange = () => setIsPhone(mq.matches)
    if (mq.addEventListener) mq.addEventListener('change', onChange)
    else mq.addListener(onChange)
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', onChange)
      else mq.removeListener(onChange)
    }
  }, [])

  return isPhone
}
