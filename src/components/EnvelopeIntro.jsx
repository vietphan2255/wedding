import { useEffect, useState } from 'react'
import './EnvelopeIntro.css'

// Replica of the couple's real printed envelope: a flat glossy-red landscape card
// with everything printed on the front. On `open` it flips over (rotateY), the back
// flap lifts (rotateX), and the inner card (invitation image + info) rises into view.
// Rendered at a fixed native size and uniformly scaled to fit the viewport so the
// printed layout keeps its proportions on every screen.
const NATIVE_W = 500
const NATIVE_H = 330

export default function EnvelopeIntro({
  open = false,
  coupleLeft = 'Viet',
  coupleRight = 'Nguyen',
  guestName = '',
  dateDisplay = '',
  eyebrow = '',
  line = '',
  letterImage = '',
  letterFocalX = 50,
  letterFocalY = 50,
}) {
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const calc = () => {
      const avail = Math.min(window.innerWidth * 0.94, 660)
      setScale(Math.min(1.4, avail / NATIVE_W))
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
      <div className="env-shadow" />
      <div className="env-float">
        <div className={`env-3d${open ? ' open' : ''}`}>
          {/* printed front face — the real envelope */}
          <div className="env-front">
            <div className="env-front-text">
              <span className="env-savedate">Save The Date</span>
              <h2 className="env-names">
                <span className="env-name-part">{coupleLeft}</span>{' '}
                <span className="env-amp">&amp;</span>{' '}
                <span className="env-name-part">{coupleRight}</span>
              </h2>
              {dateDisplay ? <p className="env-date">{dateDisplay}</p> : null}
              {eyebrow ? <p className="env-eyebrow">{eyebrow}</p> : null}
            </div>
            <span className="env-namebox">{guestName}</span>
          </div>

          {/* back of the envelope — revealed after the flip */}
          <div className="env-back">
            <div className="env-pocket" />
            <div className="env-flap" />
          </div>
        </div>

        {/* invitation — a 2D layer in front of the flip card; slides up out of
            the pocket on open (never clipped, so it shows in full) */}
        <div className={`env-letter${open ? ' open' : ''}`}>
          {src ? (
            <img
              className="env-letter-image"
              src={src}
              alt="Invitation"
              draggable={false}
              decoding="async"
              style={{ objectPosition: `${letterFocalX}% ${letterFocalY}%` }}
            />
          ) : (
            <div className="env-letter-fallback">
              {eyebrow ? <p className="ec-eyebrow">{eyebrow}</p> : null}
              <p className="ec-names">
                {coupleLeft} <span className="ec-amp">&amp;</span> {coupleRight}
              </p>
              {dateDisplay ? <p className="ec-date">{dateDisplay}</p> : null}
              {line ? <p className="ec-line">{line}</p> : null}
            </div>
          )}
        </div>

        {/* envelope front wall — occludes the letter's lower part so it reads as
            emerging from inside; fades in once the flip settles */}
        <div className={`env-pocket-front${open ? ' open' : ''}`} aria-hidden />
      </div>
    </div>
  )
}
