import { useState, useEffect, useCallback, lazy, Suspense } from 'react'
import { ref, onValue, goOffline, goOnline } from 'firebase/database'
import { db, isConfigured } from '../firebase/config'
import LoadingScreen from './LoadingScreen.jsx'
import { FIREBASE_CONNECT_TIMEOUT_MS } from '../lib/constants'

// The whole application (router, providers, every page and feature bundle) is
// code-split behind this dynamic import and only fetched once the gate passes.
const App = lazy(() => import('../App.jsx'))

// Once the client confirms an RTDB connection during this page load, remember it
// so a same-session SPA re-mount doesn't re-show the loader. A full reload
// resets this and re-verifies the connection.
let sessionConnected = false

// Renders null; its effect fires only after the lazy App chunk has resolved and
// mounted (it sits inside the same Suspense boundary), which is our cue to
// dissolve the loader — so the loader covers the entire chunk download with no
// flash of the fallback.
function AppReady({ onReady }) {
  useEffect(() => {
    onReady()
  }, [onReady])
  return null
}

// Holds the wedding home behind a wedding-themed loading screen until Firebase
// Realtime Database reports a live connection (`.info/connected`), then lazy-
// loads and dissolves into the app. The RTDB connection is only a prerequisite
// for the home experience, so secondary routes (/pay-slip, /engagement, /admin —
// which has its own auth gate) and demo mode bypass the gate and load the app
// immediately.
export default function ConnectionGate() {
  const [gateThisRoute] = useState(
    () => typeof window !== 'undefined' && window.location.pathname === '/',
  )
  const bypass = !isConfigured || !db || !gateThisRoute
  const [status, setStatus] = useState(() =>
    bypass || sessionConnected ? 'connected' : 'connecting',
  )
  const [attempt, setAttempt] = useState(0)
  const [appReady, setAppReady] = useState(false)
  const [showLoader, setShowLoader] = useState(!bypass)

  useEffect(() => {
    if (bypass || sessionConnected) return
    let settled = false
    const timer = window.setTimeout(() => {
      if (!settled) setStatus('error')
    }, FIREBASE_CONNECT_TIMEOUT_MS)
    // `.info/connected` flips true once the socket is up. Left subscribed through
    // the error state so a late connection still unlocks.
    const unsub = onValue(ref(db, '.info/connected'), (snap) => {
      if (snap.val() === true) {
        settled = true
        sessionConnected = true
        window.clearTimeout(timer)
        setStatus('connected')
      }
    })
    return () => {
      window.clearTimeout(timer)
      unsub()
    }
    // `attempt` bumps on retry to re-run this whole effect (fresh timer + single
    // fresh listener); the cleanup above prevents any duplicate/leaked listener.
  }, [attempt, bypass])

  const handleRetry = useCallback(() => {
    setStatus('connecting')
    // Nudge the SDK to drop and re-establish its socket, then re-arm the effect.
    if (db) {
      try {
        goOffline(db)
        goOnline(db)
      } catch {
        /* no-op — retry still re-subscribes below */
      }
    }
    setAttempt((a) => a + 1)
  }, [])

  const connected = bypass || status === 'connected'

  return (
    <>
      {connected && (
        <Suspense fallback={<div className="fixed inset-0 bg-bg" />}>
          <App />
          <AppReady onReady={() => setAppReady(true)} />
        </Suspense>
      )}
      {showLoader && (
        <LoadingScreen
          status={status}
          leaving={appReady}
          onRetry={handleRetry}
          onExited={() => setShowLoader(false)}
        />
      )}
    </>
  )
}
