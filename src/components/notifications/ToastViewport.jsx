import { AnimatePresence } from 'framer-motion'
import ToastItem from './ToastItem.jsx'

// The single fixed overlay for all toasts. Top-right on every breakpoint so it
// never collides with the desktop FloatingDock (bottom-right, z-50) or the
// mobile RSVP bar (bottom). z-50 keeps it below the intro envelope overlay
// (z-100). The container ignores pointer events; each card re-enables them.
export default function ToastViewport({ toasts, onDismiss }) {
  return (
    <div
      className="fixed top-3 right-3 inset-x-3 sm:inset-x-auto sm:top-5 sm:right-5 z-50 pointer-events-none flex flex-col gap-2 items-end pt-[env(safe-area-inset-top)]"
      aria-live="polite"
      aria-atomic="false"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  )
}
