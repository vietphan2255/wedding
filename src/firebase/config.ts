import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getDatabase, type Database } from 'firebase/database'
import { getAuth, type Auth } from 'firebase/auth'
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics'

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

export const isConfigured: boolean = Boolean(config.apiKey && config.databaseURL)

// App Check site key (reCAPTCHA v3). Optional: without it the app still boots,
// it just doesn't attach App Check tokens. Set VITE_RECAPTCHA_SITE_KEY in prod
// and enable App Check enforcement on RTDB in the Firebase console to block
// scripted abuse / quota-exhaustion (and signup) from non-app clients.
const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY

let app: FirebaseApp | null = null
let db: Database | null = null
let auth: Auth | null = null
let analytics: Analytics | null = null

if (isConfigured) {
  app = initializeApp(config)

  // Initialize App Check right after the app, before db/auth, so their requests
  // carry tokens. Guarded on the site key (demo/local without one still works);
  // in dev we opt into a debug token (register it under App Check → Manage debug
  // tokens). Wrapped in try/catch so Vite HMR re-runs don't throw on re-init.
  if (recaptchaSiteKey) {
    if (import.meta.env.DEV) {
      ;(self as unknown as Record<string, unknown>).FIREBASE_APPCHECK_DEBUG_TOKEN = true
    }
    try {
      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(recaptchaSiteKey),
        isTokenAutoRefreshEnabled: true,
      })
    } catch {
      // already initialized (HMR) — ignore
    }
  }

  db = getDatabase(app)
  auth = getAuth(app)

  // Google Analytics (GA4). Optional — only wires up when measurementId is set.
  // isSupported() screens out SSR / unsupported / privacy contexts where
  // getAnalytics() would throw; it's async, so `analytics` populates once it
  // resolves. Initializing it is enough for GA's automatic page_view / session
  // events to flow; import `analytics` elsewhere to logEvent custom events.
  if (config.measurementId && typeof window !== 'undefined') {
    isSupported()
      .then((supported) => {
        if (supported && app) analytics = getAnalytics(app)
      })
      .catch(() => {
        // analytics unavailable in this environment — ignore
      })
  }
} else if (typeof window !== 'undefined') {
  console.warn(
    '[firebase] env vars missing — RSVP and Wishes will run in demo mode (no writes). Copy .env.example to .env.local to enable.',
  )
}

export { app, db, auth, analytics }
