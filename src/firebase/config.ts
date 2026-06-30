import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getDatabase, type Database } from 'firebase/database'
import { getAuth, type Auth } from 'firebase/auth'
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

let app: FirebaseApp | null = null
let db: Database | null = null
let auth: Auth | null = null
let analytics: Analytics | null = null

if (isConfigured) {
  app = initializeApp(config)

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
