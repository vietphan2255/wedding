import { app, isConfigured } from './config'

// Google Analytics (GA4), kept off the startup path entirely: firebase/analytics
// is dynamically imported only when initAnalytics() runs (from the lazy app
// bundle, after the connection gate passes). Optional — only wires up when a
// measurementId is set. isSupported() screens out SSR / unsupported / privacy
// contexts where getAnalytics() would throw. Initializing it is enough for GA's
// automatic page_view / session events to flow.
export function initAnalytics(): void {
  if (!isConfigured || !app || typeof window === 'undefined') return
  if (!import.meta.env.VITE_FIREBASE_MEASUREMENT_ID) return

  import('firebase/analytics')
    .then(({ isSupported, getAnalytics }) =>
      isSupported().then((supported) => {
        if (supported && app) getAnalytics(app)
      }),
    )
    .catch(() => {
      // analytics unavailable in this environment — ignore
    })
}
