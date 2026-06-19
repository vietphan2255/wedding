import { useRef } from 'react'
import ImageInput from './ImageInput.jsx'

// ImageInput (paste-a-link + upload) plus a draggable focus-point preview. The
// focal point is stored as x/y percentages (0–100) and applied as the live
// `object-position` so admins can pick what stays in frame when a photo is
// cropped to `object-cover`. Pass one or more `frames` ({ label, aspect }) to
// preview the crop at different shapes (e.g. phone 9/16 + desktop 16/9) — they
// all share the single focal point.
const FRAME_H = 208 // px; width follows each frame's aspect-ratio

const clamp = (n) => Math.min(100, Math.max(0, n))

export default function ImageFocalInput({
  value,
  onChange,
  focalX = 50,
  focalY = 50,
  onFocalChange,
  frames = [{ label: '', aspect: '16 / 9' }],
  placeholder,
  inputClassName,
  emptyHint = 'No image set.',
}) {
  const url = (value || '').trim()
  const dragging = useRef(false)

  const setFromPointer = (e, el) => {
    const rect = el.getBoundingClientRect()
    if (!rect.width || !rect.height) return
    const x = clamp(((e.clientX - rect.left) / rect.width) * 100)
    const y = clamp(((e.clientY - rect.top) / rect.height) * 100)
    onFocalChange(Math.round(x), Math.round(y))
  }

  const onPointerDown = (e) => {
    dragging.current = true
    e.currentTarget.setPointerCapture?.(e.pointerId)
    setFromPointer(e, e.currentTarget)
  }
  const onPointerMove = (e) => {
    if (dragging.current) setFromPointer(e, e.currentTarget)
  }
  const onPointerUp = (e) => {
    dragging.current = false
    e.currentTarget.releasePointerCapture?.(e.pointerId)
  }

  // A new image makes the old focal point meaningless — recenter it.
  const handleUrlChange = (next) => {
    onChange(next)
    if ((next || '').trim() !== url) onFocalChange(50, 50)
  }

  const objectPosition = `${focalX}% ${focalY}%`

  return (
    <div>
      <ImageInput
        value={value}
        onChange={handleUrlChange}
        placeholder={placeholder}
        inputClassName={inputClassName}
      />

      {url ? (
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <p className="eyebrow">Focus point</p>
            <button
              type="button"
              onClick={() => onFocalChange(50, 50)}
              className="text-[11px] tracking-[0.18em] uppercase text-muted hover:text-ink transition"
            >
              Reset to center
            </button>
          </div>
          <p className="text-xs text-muted mb-3">
            Drag the marker to choose what stays in frame when the photo is cropped.
          </p>
          <div className="flex flex-wrap gap-4">
            {frames.map(({ label, aspect }) => (
              <div key={aspect} className="space-y-1.5">
                <div
                  className="relative overflow-hidden rounded-2xl border border-line bg-surface cursor-crosshair touch-none select-none"
                  style={{ aspectRatio: aspect, height: FRAME_H }}
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                >
                  <img
                    src={url}
                    alt=""
                    draggable={false}
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    style={{ objectPosition }}
                    onError={(e) => {
                      e.currentTarget.style.opacity = '0.15'
                    }}
                  />
                  <span
                    aria-hidden
                    className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ left: `${focalX}%`, top: `${focalY}%` }}
                  >
                    <span className="block w-7 h-7 rounded-full border-2 border-white shadow-[0_0_0_2px_rgba(0,0,0,0.45)]">
                      <span className="block w-1.5 h-1.5 rounded-full bg-white mx-auto mt-[9px] shadow-[0_0_0_2px_rgba(0,0,0,0.45)]" />
                    </span>
                  </span>
                </div>
                {label ? (
                  <p className="text-[11px] tracking-[0.18em] uppercase text-muted text-center">
                    {label}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted mt-3">{emptyHint}</p>
      )}
    </div>
  )
}
