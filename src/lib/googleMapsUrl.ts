// Validates an admin-configured Google Maps link. Built on top of `sanitizeUrl`
// (which drops anything that isn't an absolute http/https URL) and then narrows to
// Google Maps hosts, because the site only ever links out to Google Maps — the
// legacy auto-link is a `google.com/maps/search` URL. A non-Google or malformed
// value is rejected (returns '') so the admin form can show an inline error and the
// invitation card can fall back to the address search link.
import { sanitizeUrl } from './sanitizeUrl'

// A Google Maps TLD is one label (com, de, vn) optionally followed by a second
// (co.uk, com.vn). Deliberately bounded: an unbounded `[a-z.]+` would let a
// suffix-phishing host such as `maps.google.com.evil.com` slip through a greedy match.
const TLD = '[a-z]{2,3}(?:\\.[a-z]{2,3})?'
const MAPS_SUBDOMAIN = new RegExp(`^maps\\.google\\.${TLD}$`) // maps.google.com, maps.google.co.uk
const GOOGLE_DOMAIN = new RegExp(`^google\\.${TLD}$`) // google.com, google.com.vn (needs /maps path)

function isGoogleMapsHost(hostname: string, pathname: string): boolean {
  const host = hostname.toLowerCase().replace(/^www\./, '')
  const path = pathname.toLowerCase()
  if (MAPS_SUBDOMAIN.test(host)) return true // classic maps subdomain, any path
  if (GOOGLE_DOMAIN.test(host) && path.startsWith('/maps')) return true // google.com/maps
  if (host === 'goo.gl' && path.startsWith('/maps')) return true // legacy short links
  if (host === 'maps.app.goo.gl') return true // app "share place" short links
  return false
}

/**
 * Returns the trimmed URL when `value` is an absolute http(s) Google Maps link,
 * otherwise ''. Shared by the admin form (inline validation + save gate) and the
 * invitation card (render gate) so both agree on what counts as a valid map link.
 */
export function sanitizeGoogleMapsUrl(value: unknown): string {
  const url = sanitizeUrl(value, ['http:', 'https:'])
  if (!url) return ''
  // `sanitizeUrl` already parsed this successfully, so `new URL` won't throw.
  const { hostname, pathname } = new URL(url)
  return isGoogleMapsHost(hostname, pathname) ? url : ''
}
