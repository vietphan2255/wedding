import { useEffect, useState } from 'react'
import './EnvelopeIntro.css'

// Faithful replica of the cinelove animated envelope. The reference is built
// from fixed-px CSS border-triangles, so we render it at its native size and
// scale the whole thing to fit the viewport — keeping every proportion exact.
const NATIVE_W = 430
const NATIVE_H = 287

function WaxSeal() {
  return (
    <svg viewBox="0 0 100 100" aria-hidden>
      <defs>
        <radialGradient id="env-wax" cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#c8434b" />
          <stop offset="55%" stopColor="#a4161a" />
          <stop offset="100%" stopColor="#6e0f12" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill="url(#env-wax)" />
      <circle
        cx="50"
        cy="50"
        r="38"
        fill="none"
        stroke="#5e0d10"
        strokeWidth="1.5"
        opacity="0.55"
      />
      <path
        d="M50 65 C 39 55, 31 48, 31 40.5 C 31 35.5, 35 32, 40 32 C 44.5 32, 48 35, 50 38 C 52 35, 55.5 32, 60 32 C 65 32, 69 35.5, 69 40.5 C 69 48, 61 55, 50 65 Z"
        fill="#f0cfc6"
        opacity="0.85"
      />
    </svg>
  )
}

export default function EnvelopeIntro({ open = false, letterImage = '' }) {
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const calc = () => {
      const avail = Math.min(window.innerWidth * 0.92, 520)
      setScale(Math.min(1.2, avail / NATIVE_W))
    }
    calc()
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
  }, [])

  const src = (letterImage || '').trim()

  return (
    <div
      className="envelope-intro"
      style={{ width: NATIVE_W, height: NATIVE_H, transform: `scale(${scale})` }}
    >
      <div className="envelope-shadow" />
      <div className={`envelope-container${open ? ' open' : ''}`}>
        <div className="front pocket" />
        <div className="letter">
          {src ? (
            <img
              className="letter-image"
              src={src}
              alt="Invitation letter"
              draggable={false}
              decoding="async"
            />
          ) : (
            <div className="letter-fallback">
              <p className="lf-eyebrow">You&apos;re invited</p>
              <p className="lf-names">Viet &amp; Nguyen</p>
              <p className="lf-date">26.07 · 02.08 · 2026</p>
            </div>
          )}
        </div>
        <div className="front flap" />
        <div className="wax-seal">
          <WaxSeal />
        </div>
        <div className="hearts">
          <div className="heart a1" />
          <div className="heart a2" />
          <div className="heart a3" />
        </div>
      </div>
    </div>
  )
}
