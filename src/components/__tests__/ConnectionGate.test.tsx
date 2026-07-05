import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react'

// Mutable mock state shared across resetModules() boundaries via vi.hoisted.
const state = vi.hoisted(() => ({ db: {} as unknown, isConfigured: true }))
const fb = vi.hoisted(() => ({
  cb: null as null | ((snap: { val: () => unknown }) => void),
  calls: 0,
  unsub: vi.fn(),
}))

vi.mock('../../firebase/config', () => ({
  get db() {
    return state.db
  },
  get isConfigured() {
    return state.isConfigured
  },
}))

vi.mock('firebase/database', () => ({
  ref: vi.fn(() => ({})),
  onValue: vi.fn((_ref: unknown, cb: (snap: { val: () => unknown }) => void) => {
    fb.calls += 1
    fb.cb = cb
    return fb.unsub
  }),
  goOffline: vi.fn(),
  goOnline: vi.fn(),
}))

// Stub the lazy app so the gate's logic is tested in isolation (the real App
// pulls the router + every provider). It's what the gate dynamically imports.
vi.mock('../../App.jsx', () => ({
  default: () => <div data-testid="app">app</div>,
}))

// Stub the presentational loader so the gate's logic is tested in isolation.
vi.mock('../LoadingScreen.jsx', () => ({
  default: ({ status, onRetry }: { status: string; onRetry: () => void }) => (
    <div data-testid="loader" data-status={status}>
      <button onClick={onRetry}>retry</button>
    </div>
  ),
}))

// resetModules gives each test a fresh module-level `sessionConnected`.
async function renderGate() {
  const { default: ConnectionGate } = await import('../ConnectionGate.jsx')
  return render(<ConnectionGate />)
}

beforeEach(() => {
  vi.resetModules()
  window.history.pushState({}, '', '/') // gated route by default
  state.db = {}
  state.isConfigured = true
  fb.cb = null
  fb.calls = 0
  fb.unsub.mockClear()
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('<ConnectionGate />', () => {
  it('shows the loader and defers the app while connecting', async () => {
    await renderGate()
    expect(screen.getByTestId('loader')).toHaveAttribute('data-status', 'connecting')
    expect(screen.queryByTestId('app')).toBeNull() // app bundle not loaded yet
    expect(fb.calls).toBe(1) // exactly one listener — no duplicates
  })

  it('lazy-loads the app once the connection is confirmed', async () => {
    await renderGate()
    act(() => fb.cb?.({ val: () => true }))
    expect(await screen.findByTestId('app')).toBeInTheDocument()
  })

  it('falls back to the error state after the timeout', async () => {
    vi.useFakeTimers()
    await renderGate()
    act(() => vi.advanceTimersByTime(12_001))
    expect(screen.getByTestId('loader')).toHaveAttribute('data-status', 'error')
    expect(screen.queryByTestId('app')).toBeNull() // still no app on failure
  })

  it('re-subscribes and nudges the SDK on retry', async () => {
    vi.useFakeTimers()
    await renderGate()
    act(() => vi.advanceTimersByTime(12_001)) // → error
    const before = fb.calls
    act(() => fireEvent.click(screen.getByText('retry')))
    expect(screen.getByTestId('loader')).toHaveAttribute('data-status', 'connecting')
    expect(fb.calls).toBe(before + 1) // fresh single subscription
    expect(fb.unsub).toHaveBeenCalled() // old listener torn down
    const dbMod = await import('firebase/database')
    expect(dbMod.goOffline).toHaveBeenCalled()
    expect(dbMod.goOnline).toHaveBeenCalled()
  })

  it('bypasses the gate entirely when Firebase is not configured', async () => {
    state.isConfigured = false
    await renderGate()
    expect(await screen.findByTestId('app')).toBeInTheDocument()
    expect(screen.queryByTestId('loader')).toBeNull()
    expect(fb.calls).toBe(0) // no listener in demo mode
  })

  it('does not gate secondary routes — loads the app immediately', async () => {
    window.history.pushState({}, '', '/pay-slip')
    await renderGate()
    expect(await screen.findByTestId('app')).toBeInTheDocument()
    expect(screen.queryByTestId('loader')).toBeNull()
    expect(fb.calls).toBe(0) // no connection listener for a non-home route
  })
})
