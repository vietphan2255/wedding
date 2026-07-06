// Opt-in experiment flags for isolating the iOS lightbox content-process crash on a
// real device, e.g. `?exp=nozoom`, `?exp=lite`, or `?exp=nozoom,lite` (or persist via
// localStorage `exp`). TEMPORARY scaffolding — removed once the culprit is confirmed.
// No effect unless a flag is set. Flags are read once per page load.

let cached: Set<string> | null = null

function read(): Set<string> {
  const set = new Set<string>()
  if (typeof window === 'undefined') return set
  try {
    const q = new URLSearchParams(window.location.search).get('exp') || ''
    const ls = window.localStorage.getItem('exp') || ''
    for (const part of `${q},${ls}`.split(',')) {
      const name = part.trim().toLowerCase()
      if (name) set.add(name)
    }
  } catch {
    /* URL/storage unavailable — no flags */
  }
  return set
}

/** True when experiment flag `name` is enabled via `?exp=` or `localStorage.exp`. */
export function hasExp(name: string): boolean {
  if (cached === null) cached = read()
  return cached.has(name.toLowerCase())
}
