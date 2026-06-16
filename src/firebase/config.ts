import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getDatabase, type Database } from 'firebase/database'

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const isConfigured: boolean = Boolean(config.apiKey && config.databaseURL)

let app: FirebaseApp | null = null
let db: Database | null = null

if (isConfigured) {
  app = initializeApp(config)
  db = getDatabase(app)
} else if (typeof window !== 'undefined') {
  console.warn(
    '[firebase] env vars missing — RSVP and Wishes will run in demo mode (no writes). Copy .env.example to .env.local to enable.',
  )
}

export { app, db }
