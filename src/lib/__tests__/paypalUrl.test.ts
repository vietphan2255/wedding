import { describe, it, expect } from 'vitest'
import { normalizePaypal } from '../paypalUrl'

describe('normalizePaypal', () => {
  it('builds a link from a bare username', () => {
    expect(normalizePaypal('foo')).toEqual({
      href: 'https://paypal.me/foo',
      display: 'paypal.me/foo',
    })
    expect(normalizePaypal('@foo')).toEqual({
      href: 'https://paypal.me/foo',
      display: 'paypal.me/foo',
    })
  })

  it('accepts paypal.me links in any common spelling', () => {
    expect(normalizePaypal('paypal.me/foo')?.href).toBe('https://paypal.me/foo')
    expect(normalizePaypal('www.paypal.me/foo')?.href).toBe('https://paypal.me/foo')
    expect(normalizePaypal('https://www.paypal.me/foo/')?.href).toBe('https://paypal.me/foo')
  })

  it('lowercases the host but keeps the username casing', () => {
    expect(normalizePaypal('PayPal.Me/Foo')).toEqual({
      href: 'https://paypal.me/Foo',
      display: 'paypal.me/Foo',
    })
  })

  it('rewrites paypal.com/paypalme to paypal.me', () => {
    expect(normalizePaypal('https://paypal.com/paypalme/foo')?.href).toBe('https://paypal.me/foo')
    expect(normalizePaypal('www.paypal.com/paypalme/foo')?.href).toBe('https://paypal.me/foo')
  })

  it('keeps an amount suffix', () => {
    expect(normalizePaypal('paypal.me/foo/25usd')?.href).toBe('https://paypal.me/foo/25usd')
  })

  it('returns null for empty or non-string input', () => {
    expect(normalizePaypal('')).toBeNull()
    expect(normalizePaypal('   ')).toBeNull()
    expect(normalizePaypal(null)).toBeNull()
    expect(normalizePaypal(undefined)).toBeNull()
    expect(normalizePaypal(42)).toBeNull()
  })

  it('returns null when there is no username', () => {
    expect(normalizePaypal('paypal.me')).toBeNull()
    expect(normalizePaypal('https://paypal.me/')).toBeNull()
    expect(normalizePaypal('paypal.com/paypalme')).toBeNull()
  })

  it('returns null for other URLs it cannot safely rewrite', () => {
    expect(normalizePaypal('https://venmo.com/foo')).toBeNull()
    expect(normalizePaypal('foo.bar')).toBeNull()
  })
})
