// Normalizes whatever the admin pastes as the PayPal gift link — a bare
// username ('foo', '@foo'), a paypal.me URL in any spelling, or the long
// paypal.com/paypalme form — into a canonical https://paypal.me/... link.
// Returns null when the value is empty or not confidently a PayPal.Me
// destination; callers treat null as "PayPal not configured", so an empty
// admin field doubles as the feature's off switch.

export interface PaypalLink {
  href: string // https://paypal.me/foo — Open button target + copy value
  display: string // paypal.me/foo — admin preview / link title
}

export function normalizePaypal(input: unknown): PaypalLink | null {
  if (typeof input !== 'string') return null
  let v = input.trim().replace(/\s+/g, '')
  if (!v) return null
  v = v
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/^@/, '')
  v = v.replace(/^paypal\.com\/paypalme(\/|$)/i, 'paypal.me$1')
  if (/^paypal\.me(\/|$)/i.test(v)) {
    // Lowercase the host but keep the username's own casing.
    v = 'paypal.me' + v.slice('paypal.me'.length)
  } else {
    // A dot or slash means some other URL — don't guess a username out of it.
    if (/[/.]/.test(v)) return null
    v = `paypal.me/${v}`
  }
  v = v.replace(/\/+$/, '')
  if (v === 'paypal.me') return null
  return { href: `https://${v}`, display: v }
}
