import { useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { CheckCircle2, AlertCircle, X } from 'lucide-react'

const EASE = [0.22, 1, 0.36, 1]

// One toast card. Owns its own auto-dismiss timer (cleans up on unmount, so it
// survives the Framer exit animation) and adapts its layout to the variant:
// success/error show a leading icon + message; wish shows a title (with the 💌
// in the i18n string), a quoted message preview, and a "view wishes" action.
export default function ToastItem({ toast, onDismiss }) {
  const reduce = useReducedMotion()
  const { id, variant, title, message, duration, action } = toast

  useEffect(() => {
    if (!duration) return undefined
    const timer = setTimeout(() => onDismiss(id), duration)
    return () => clearTimeout(timer)
  }, [id, duration, onDismiss])

  const motionProps = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: -16, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, x: 24 },
      }

  return (
    <motion.div
      layout
      {...motionProps}
      transition={{ duration: 0.4, ease: EASE }}
      className="pointer-events-auto glass rounded-2xl shadow-xl w-[min(92vw,360px)] p-4"
    >
      <div className="flex items-start gap-3">
        {variant === 'success' && (
          <CheckCircle2 size={18} className="text-accent shrink-0 mt-0.5" />
        )}
        {variant === 'error' && (
          <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
        )}
        <div className="flex-1 min-w-0">
          {title && <p className="text-ink font-medium leading-snug">{title}</p>}
          {message && (
            <p
              className={
                variant === 'wish'
                  ? 'text-sm text-muted italic mt-0.5 line-clamp-2'
                  : 'text-sm text-ink/90'
              }
            >
              {variant === 'wish' ? `“${message}”` : message}
            </p>
          )}
          {action && (
            <button
              type="button"
              onClick={() => {
                action.onClick()
                onDismiss(id)
              }}
              className="mt-2 text-xs font-medium text-accent hover:underline inline-flex items-center gap-1"
            >
              {action.label} <span aria-hidden>→</span>
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => onDismiss(id)}
          aria-label="Đóng"
          className="text-muted hover:text-ink transition-colors shrink-0 -mr-1 -mt-1"
        >
          <X size={15} />
        </button>
      </div>
    </motion.div>
  )
}
