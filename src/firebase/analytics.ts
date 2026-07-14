import type { Analytics, logEvent as LogEventFn } from 'firebase/analytics'
import { app, isConfigured } from './config'

// Google Analytics (GA4), kept off the startup path entirely: firebase/analytics
// is dynamically imported only when initAnalytics()/trackEvent() first runs
// (from the lazy app bundle, after the connection gate passes). Optional — only
// wires up when a measurementId is set. isSupported() screens out SSR /
// unsupported / privacy contexts where getAnalytics() would throw.

type AnalyticsCtx = { analytics: Analytics; logEvent: typeof LogEventFn }

let ctxPromise: Promise<AnalyticsCtx | null> | null = null

function ensureAnalytics(): Promise<AnalyticsCtx | null> {
  if (ctxPromise) return ctxPromise
  if (!isConfigured || !app || typeof window === 'undefined') return Promise.resolve(null)
  if (!import.meta.env.VITE_FIREBASE_MEASUREMENT_ID) return Promise.resolve(null)

  ctxPromise = import('firebase/analytics')
    .then(async ({ isSupported, getAnalytics, logEvent }) =>
      (await isSupported()) && app ? { analytics: getAnalytics(app), logEvent } : null,
    )
    .catch(() => null) // analytics unavailable in this environment — permanently a no-op
  return ctxPromise
}

// Initializing is enough for GA's automatic page_view / session events to flow.
export function initAnalytics(): void {
  void ensureAnalytics()
}

// Fire-and-forget GA4 event; no-op when analytics is unconfigured/unsupported.
export function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean>,
): void {
  ensureAnalytics()
    .then((ctx) => {
      if (ctx) ctx.logEvent(ctx.analytics, name, params)
    })
    .catch(() => {})
}
