import { getAuth, type Auth } from 'firebase/auth'
import { app, isConfigured } from './config'

// Firebase Auth singleton, split out of ./config so firebase/auth only bundles
// into the (already lazy) admin chunk that consumes it — never the initial
// startup path. Reuses the same initialized app.
let auth: Auth | null = null

if (isConfigured && app) {
  auth = getAuth(app)
}

export { auth }
