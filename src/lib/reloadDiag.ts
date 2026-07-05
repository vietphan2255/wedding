/* eslint-disable no-console */
// Opt-in reload/crash classifier — OFF by default. Enable per-tab with `?diag=1`
// (or persist with localStorage `diag=1`). iOS never exposes a crash reason, and
// Chrome iOS (the affected browser) can't be easily remote-inspected, so this also
// paints a tiny on-screen badge. The decisive signal is the RELOADS counter:
//
//   • It lives in sessionStorage (survives reloads within the same tab) and
//     increments once per document load. If it JUMPS when you only tapped
//     next/prev, the page was reloaded / the WebKit process was killed — not a
//     React remount (which keeps the same document and counter).
//   • `pageshow persisted=true` = bfcache restore (not a real reload).
//
// Logs/paints no image URLs or PII — only event names, timings, and JS-heap size.

const SID_KEY = 'diag.sid'
const RELOADS_KEY = 'diag.reloads'

let reloadsCount = 0
let sidVal = '?'
let lastEvent = ''

export function isDiagEnabled(): boolean {
  if (typeof window === 'undefined') return false
  try {
    if (new URLSearchParams(window.location.search).get('diag') === '1') return true
    return window.localStorage.getItem('diag') === '1'
  } catch {
    return false
  }
}

function heapMB(): string {
  const m = (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory
  return m ? `${Math.round(m.usedJSHeapSize / 1048576)}MB` : 'n/a'
}

let overlayEl: HTMLDivElement | null = null
function paint(): void {
  if (typeof document === 'undefined' || !document.body) return
  if (!overlayEl) {
    overlayEl = document.createElement('div')
    overlayEl.setAttribute('data-diag', '')
    overlayEl.style.cssText = [
      'position:fixed', 'left:6px', 'bottom:6px', 'z-index:2147483647',
      'max-width:72vw', 'padding:4px 7px', 'border-radius:6px',
      'font:600 11px/1.35 ui-monospace,Menlo,monospace',
      'background:rgba(0,0,0,.8)', 'color:#39ff14', 'pointer-events:none',
      'white-space:pre-wrap', 'word-break:break-word',
    ].join(';')
    document.body.appendChild(overlayEl)
  }
  overlayEl.textContent = `RELOADS:${reloadsCount}  sid:${sidVal}  ${heapMB()}\n${lastEvent}`
}

/** Emit a labelled diagnostic line (no-op unless diagnostics are enabled). */
export function diagLog(event: string, extra = ''): void {
  if (typeof window === 'undefined' || !isDiagEnabled()) return
  lastEvent = `+${Math.round(performance.now())}ms ${event}${extra ? ` ${extra}` : ''}`
  console.log(`[diag ${sidVal} #${reloadsCount} ${heapMB()}] ${lastEvent}`)
  paint()
}

let started = false

/** Wire up page-lifecycle + error listeners once, as early as possible. */
export function initReloadDiag(): void {
  if (started || typeof window === 'undefined' || !isDiagEnabled()) return
  started = true

  try {
    const ss = window.sessionStorage
    reloadsCount = Number(ss.getItem(RELOADS_KEY) || '0') + 1
    ss.setItem(RELOADS_KEY, String(reloadsCount))
    sidVal = Math.random().toString(36).slice(2, 8)
    ss.setItem(SID_KEY, sidVal)
  } catch {
    /* storage unavailable — still log/paint lifecycle events below */
  }

  const navType =
    (performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined)
      ?.type ?? 'unknown'
  diagLog('document-load', `navType=${navType}`)

  window.addEventListener('pageshow', (e) =>
    diagLog('pageshow', `persisted=${(e as PageTransitionEvent).persisted}`),
  )
  window.addEventListener('pagehide', (e) =>
    diagLog('pagehide', `persisted=${(e as PageTransitionEvent).persisted}`),
  )
  document.addEventListener('visibilitychange', () =>
    diagLog('visibilitychange', document.visibilityState),
  )
  window.addEventListener('error', (e) => diagLog('error', String(e.message || e.type)))
  window.addEventListener('unhandledrejection', (e) =>
    diagLog('unhandledrejection', String((e as PromiseRejectionEvent).reason)),
  )
}
