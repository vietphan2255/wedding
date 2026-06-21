// Parse a free-form inline-CSS string ("border-radius:50%; opacity:.9") into a
// React style object. Tolerant of trailing semicolons and blank declarations;
// camelCases standard properties and leaves custom (--var) props untouched.
// Used by the per-section cursor feature: admins type raw CSS in the Cursors
// panel and it's applied to the cursor <img> (and the admin preview swatch).
export default function cssStringToStyle(css?: string): Record<string, string> {
  const out: Record<string, string> = {}
  if (!css) return out
  for (const decl of css.split(';')) {
    const i = decl.indexOf(':')
    if (i === -1) continue
    const prop = decl.slice(0, i).trim()
    const val = decl.slice(i + 1).trim()
    if (!prop || !val) continue
    const key = prop.startsWith('--')
      ? prop
      : prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
    out[key] = val
  }
  return out
}
