// Loop-aware index math for the gallery lightbox's image windowing: with Swiper in
// loop mode the slide order is cyclic, so "how far is slide i from the current one"
// must wrap around the seam (last↔first). Pure helpers, unit-tested.

/**
 * Cyclic distance between slide `i` and `current` in a list of `count` slides.
 * Indices are normalized into range first, so a stale `current` (e.g. the admin
 * removed photos while the lightbox was open) degrades to a valid distance
 * instead of a negative wrap. Returns 0 when the list is empty.
 */
export function loopDistance(i: number, current: number, count: number): number {
  if (count <= 0) return 0
  const a = ((i % count) + count) % count
  const b = ((current % count) + count) % count
  const d = Math.abs(a - b)
  return Math.min(d, count - d)
}

/** True when slide `i` is within `radius` cyclic steps of `current`. */
export function withinWindow(
  i: number,
  current: number,
  count: number,
  radius: number,
): boolean {
  return loopDistance(i, current, count) <= radius
}
