import { createContext, useContext, useEffect, useState } from 'react'
import { ref, get } from 'firebase/database'
import { useSearchParams } from 'react-router-dom'
import { db, isConfigured } from '../firebase/config'
import { trackEvent } from '../firebase/analytics'

// Resolves the guest behind a personalized link (`/?invite=<code>`) once, and
// exposes it via useInvitedGuest() so the envelope, invitation cards, RSVP form
// and countdown can adapt to who's visiting. A missing/unknown code resolves to
// the neutral { found: false, party: 'both' } so everything renders as default.
//
// The guest record lives at `guests/<code>` (see src/lib/guests.js). We read it
// with a one-shot get() — not a subscription — and cache the result in
// sessionStorage so refreshes and the immediately-mounted envelope don't refetch.

const NEUTRAL = {
  loading: false,
  found: false,
  code: '',
  name: '',
  invitationName: '',
  party: 'both',
}

const InvitedGuestContext = createContext(NEUTRAL)

export function useInvitedGuest() {
  return useContext(InvitedGuestContext)
}

const cacheKey = (code) => `vn-invite-${code}`

// Codes already reported to GA this page load — dedupes StrictMode's double
// effect and provider remounts, while a fresh load still counts as an access.
const trackedCodes = new Set()

function readCache(code) {
  try {
    const raw = sessionStorage.getItem(cacheKey(code))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeCache(code, value) {
  try {
    sessionStorage.setItem(cacheKey(code), JSON.stringify(value))
  } catch {
    /* private mode / quota — fine to skip, we just refetch next time */
  }
}

export function InvitedGuestProvider({ children }) {
  const [params] = useSearchParams()
  const code = (params.get('invite') || '').trim()

  const [state, setState] = useState(() =>
    code ? { ...NEUTRAL, code, loading: true } : NEUTRAL,
  )

  useEffect(() => {
    if (!code) {
      setState(NEUTRAL)
      return
    }

    const cached = readCache(code)
    if (cached) {
      setState({ ...NEUTRAL, ...cached, code })
      return
    }

    if (!isConfigured || !db) {
      setState({ ...NEUTRAL, code })
      return
    }

    let active = true
    setState({ ...NEUTRAL, code, loading: true })
    get(ref(db, `guests/${code}`))
      .then((snap) => {
        if (!active) return
        const g = snap.val()
        const resolved = g
          ? {
              found: true,
              name: g.name || '',
              invitationName: g.invitationName || g.name || '',
              party: g.party || 'both',
            }
          : { found: false, party: 'both' }
        writeCache(code, resolved)
        setState({ ...NEUTRAL, code, ...resolved })
      })
      .catch(() => {
        if (active) setState({ ...NEUTRAL, code })
      })

    return () => {
      active = false
    }
  }, [code])

  // GA4 "access" event once a real guest resolves — reacting to state covers
  // both the cache-hit and RTDB branches with a single call site.
  useEffect(() => {
    if (!state.found || !state.invitationName || !state.code) return
    if (trackedCodes.has(state.code)) return
    trackedCodes.add(state.code)
    trackEvent('access', {
      invitation_name: state.invitationName.slice(0, 100), // GA4 param-value limit
      invite_code: state.code,
    })
  }, [state])

  return (
    <InvitedGuestContext.Provider value={state}>{children}</InvitedGuestContext.Provider>
  )
}
