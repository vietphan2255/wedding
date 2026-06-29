// Defense-in-depth allowlister for config-driven URLs that become DOM attribute
// sinks (e.g. an <iframe>/<audio> `src`). The real protection against a malicious
// config value is the admin-only RTDB write rule (see database.rules.json) — this
// is belt-and-braces so that even a bad value can't point a frame/audio element at
// a dangerous scheme (javascript:, data:text/html, …).
//
// Config URLs are always absolute, so anything that doesn't parse as an absolute
// URL with an allowed scheme is dropped (returns '' → the consumer's empty/default
// fallback kicks in).

export function sanitizeUrl(
  value: unknown,
  allowSchemes: readonly string[] = ['https:'],
): string {
  if (typeof value !== 'string') return ''
  const trimmed = value.trim()
  if (trimmed === '') return ''
  try {
    const { protocol } = new URL(trimmed)
    return allowSchemes.includes(protocol) ? trimmed : ''
  } catch {
    return ''
  }
}
