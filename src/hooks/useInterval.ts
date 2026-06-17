import { useEffect, useRef } from 'react'

// Declarative setInterval. Pass `delay = null` to pause/clear the timer. The
// callback is held in a ref so swapping it doesn't restart the interval.
export default function useInterval(
  callback: () => void,
  delay: number | null,
): void {
  const savedCallback = useRef(callback)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (delay === null) return
    const id = window.setInterval(() => savedCallback.current(), delay)
    return () => window.clearInterval(id)
  }, [delay])
}
