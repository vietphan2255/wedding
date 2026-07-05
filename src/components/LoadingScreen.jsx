import { useEffect } from 'react'

// This screen renders before the app bundle — and therefore before
// LanguageContext / WeddingConfigContext — loads, so its copy and monogram are
// inlined rather than pulled from those (lazy) providers. Values mirror the
// vi.js `loading.*` keys and configDefaults DEFAULT_COMMON; the loader always
// showed these defaults anyway, since Firebase config hasn't arrived yet while
// connecting. Kept framer-motion-free so it stays out of the initial bundle —
// the ring/shimmer are CSS animations and the dissolve is a CSS opacity
// transition.
const CONNECTING = 'Đang kết nối tới không gian cưới…'
const ERROR = 'Không thể kết nối. Vui lòng kiểm tra mạng và thử lại.'
const RETRY = 'Thử lại'
const INITIAL_LEFT = 'V'
const INITIAL_RIGHT = 'N'
const DATE = '26.07.2026 · 02.08.2026'

// Faint full ring + an accent arc; the wrapper spins so the arc sweeps.
// Colors are theme tokens, so it adapts across blush/dark/modern automatically.
function Ring() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
      <circle cx="50" cy="50" r="46" fill="none" stroke="var(--color-line)" strokeWidth="1" />
      <circle
        cx="50"
        cy="50"
        r="46"
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="70 220"
      />
    </svg>
  )
}

// Full-screen, wedding-themed connection loader. Presentational only — the
// ConnectionGate owns status ('connecting' | 'connected' | 'error') and retry.
// When `leaving` flips true the CSS opacity transition dissolves it out, then
// `onExited` unmounts it.
export default function LoadingScreen({ status, onRetry, leaving = false, onExited }) {
  const isError = status === 'error'

  // Safety net in case transitionend doesn't fire (e.g. reduced motion sets the
  // duration to ~0, or the element is display-swapped) so the loader always
  // unmounts after a dissolve.
  useEffect(() => {
    if (!leaving) return
    const t = window.setTimeout(() => onExited?.(), 700)
    return () => window.clearTimeout(t)
  }, [leaving, onExited])

  return (
    <div
      role={isError ? 'alert' : 'status'}
      aria-live="polite"
      aria-busy={!isError}
      onTransitionEnd={(e) => {
        if (leaving && e.propertyName === 'opacity') onExited?.()
      }}
      className={`fixed inset-0 z-[150] flex items-center justify-center bg-bg text-ink film-grain transition-opacity duration-500 ${
        leaving ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="relative flex flex-col items-center gap-7 px-6 text-center">
        {/* Monogram inside a slowly rotating ring. */}
        <div className="relative flex h-32 w-32 items-center justify-center md:h-36 md:w-36">
          <span
            aria-hidden
            className="absolute inset-0 animate-[spin_9s_linear_infinite] motion-reduce:animate-none"
          >
            <Ring />
          </span>
          <span className="font-display text-4xl tracking-wide md:text-5xl">
            {INITIAL_LEFT} <span className="text-accent">&</span> {INITIAL_RIGHT}
          </span>
        </div>

        {/* Hairline divider with a script flourish. */}
        <div className="divider-leaf w-[240px] max-w-full">
          <span className="font-script-vn text-2xl leading-none text-accent">
            {INITIAL_LEFT.toLowerCase()} &amp; {INITIAL_RIGHT.toLowerCase()}
          </span>
        </div>

        {isError ? (
          <div className="flex flex-col items-center gap-4">
            <p className="max-w-xs text-sm text-muted">{ERROR}</p>
            <button type="button" onClick={onRetry} className="btn-primary">
              {RETRY}
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <p className="eyebrow">{CONNECTING}</p>
            <span
              aria-hidden
              className="h-px w-40 max-w-[60vw] animate-shimmer bg-[linear-gradient(90deg,transparent,var(--color-accent),transparent)] bg-[length:200%_100%] motion-reduce:hidden"
            />
            <p className="text-xs tracking-[0.2em] text-muted">{DATE}</p>
          </div>
        )}
      </div>
    </div>
  )
}
