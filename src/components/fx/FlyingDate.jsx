import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from 'framer-motion'

// Dual-clone hero → countdown date flight.
//
// Phases (scroll progress p ∈ [0, 1]):
//   • handoff (p < 0.05): clones sit on the live source spans while fading in;
//     the hero middle ("· 02 August ·") starts fading.
//   • attach (0.05 ≤ p < 0.35): each clone lerps from live source position to
//     the live merged geometry — group center is midpoint(liveA, liveB) lifted
//     by LIFT_PX; A sits left of center, B sits right, separated by SPACE_EM.
//   • glide (0.35 ≤ p < 0.85): each clone glides from a snapshot of its
//     attach-end merged slot to the live countdown piece (date-part for A,
//     year for B), scaling from source font-size to target font-size.
//   • land (p ≥ 0.85): clones clamp at the live target center while the
//     countdown's real date label fades in over them.
//
// Why live every frame: the hero source spans sit inside the hero's `yText`
// parallax (~90px shift over scroll), and the countdown target sits inside a
// ParallaxFade (±30px). If we used a cached `getBoundingClientRect` from
// mount, the clones would drift tens of pixels off the source / target as the
// user scrolls. `readLiveCenter` re-reads on every scroll frame so the clones
// track those transforms exactly. The attach-end merge is snapshotted into a
// ref so the glide's start anchor doesn't keep drifting as the (now-invisible)
// source continues to parallax.
//
// Clone styling mirrors the source's computed font (family, weight, variant,
// letter-spacing, color, line-height) so its natural width matches `srcAW`
// exactly — that's what `xA = aDocX - srcAW/2` assumes. Landing uses the
// target's split spans (targetARef = day+month, targetBRef = year) so the
// final position matches the actual rendered text rather than a scaled
// approximation of the source widths.
//
// Source / middle / target real elements are crossfaded imperatively via their
// refs so the clones never compete visually with the originals.
//
// Opts out under prefers-reduced-motion: returns null; the three hero spans
// stay rendered as plain inline text.

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))
const lerp = (a, b, t) => a + (b - a) * t

const LIFT_PX = 25
const SPACE_EM = 0.3
// Scroll distance before the flight begins fading in. Small buffer so the
// animation triggers shortly after the user starts scrolling rather than
// waiting for the source to parallax past viewport center.
const FLIGHT_START_PX = 80

// Read an element's current document-space center. getBoundingClientRect
// returns viewport coords *with* current transforms applied, so adding
// scrollY/X gives the live "doc position the clone needs to match" — which
// folds in hero parallax, ParallaxFade, and the source bounce in one call.
const readLiveCenter = (el) => {
  if (!el) return null
  const r = el.getBoundingClientRect()
  return {
    x: r.left + r.width / 2 + window.scrollX,
    y: r.top + r.height / 2 + window.scrollY,
  }
}

export default function FlyingDate({
  sourceARef,
  sourceBRef,
  middleRef,
  targetRef,
  targetARef,
  targetBRef,
}) {
  const reduce = useReducedMotion()
  const [rects, setRects] = useState(null)
  const [mounted, setMounted] = useState(false)
  const { scrollY } = useScroll()
  // Snapshot of the attach-end merged slot; the glide phase reads this so its
  // start anchor doesn't drift while the source keeps parallaxing.
  const mergeSnapshotRef = useRef(null)

  useEffect(() => setMounted(true), [])

  useLayoutEffect(() => {
    if (reduce) return
    const measure = () => {
      const sA = sourceARef.current
      const sB = sourceBRef.current
      const tT = targetRef.current
      const tA = targetARef?.current ?? tT
      const tB = targetBRef?.current ?? tT
      if (!sA || !sB || !tT || !tA || !tB) return
      const sAR = sA.getBoundingClientRect()
      const sBR = sB.getBoundingClientRect()
      const tTR = tT.getBoundingClientRect()
      const tAR = tA.getBoundingClientRect()
      const tBR = tB.getBoundingClientRect()
      if (!sAR.width || !sBR.width || !tTR.width) return
      const sACs = getComputedStyle(sA)
      const tTCs = getComputedStyle(tT)
      const srcFontPx = parseFloat(sACs.fontSize) || 18
      const tgtFontPx = parseFloat(tTCs.fontSize) || 14
      const spaceWidth = srcFontPx * SPACE_EM
      const sA_docX = sAR.left + sAR.width / 2 + window.scrollX
      const sA_docY = sAR.top + sAR.height / 2 + window.scrollY
      const sB_docX = sBR.left + sBR.width / 2 + window.scrollX
      const sB_docY = sBR.top + sBR.height / 2 + window.scrollY
      const tA_docX = tAR.left + tAR.width / 2 + window.scrollX
      const tA_docY = tAR.top + tAR.height / 2 + window.scrollY
      const tB_docX = tBR.left + tBR.width / 2 + window.scrollX
      const tB_docY = tBR.top + tBR.height / 2 + window.scrollY
      // Offsets from merge center so the two clones sit adjacent with spaceWidth
      // between them, totalling sA.width + spaceWidth + sB.width. These come
      // from cached widths (font/letter-spacing don't change with scroll) and
      // are applied around the *live* merge center in sync().
      const aOffsetX = -(spaceWidth / 2 + sBR.width / 2)
      const bOffsetX = spaceWidth / 2 + sAR.width / 2
      setRects({
        sA_docX, sA_docY,
        sB_docX, sB_docY,
        tA_docX, tA_docY,
        tB_docX, tB_docY,
        srcAW: sAR.width, srcAH: sAR.height,
        srcBW: sBR.width, srcBH: sBR.height,
        srcFontPx, tgtFontPx,
        aOffsetX, bOffsetX,
        srcFontFamily: sACs.fontFamily,
        srcFontWeight: sACs.fontWeight,
        srcFontStyle: sACs.fontStyle,
        srcFontVariantNumeric: sACs.fontVariantNumeric,
        srcLetterSpacing: sACs.letterSpacing,
        srcColor: sACs.color,
        textA: (sA.textContent ?? '').trim(),
        textB: (sB.textContent ?? '').trim(),
      })
    }
    const timers = [50, 700, 1800].map((d) => window.setTimeout(measure, d))
    const ro = new ResizeObserver(measure)
    ;[
      sourceARef.current,
      sourceBRef.current,
      targetRef.current,
      targetARef?.current,
      targetBRef?.current,
    ].forEach((el) => {
      if (el) ro.observe(el)
    })
    window.addEventListener('resize', measure)
    document.fonts?.ready?.then(measure).catch(() => {})
    return () => {
      timers.forEach(window.clearTimeout)
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [reduce, sourceARef, sourceBRef, targetRef, targetARef, targetBRef])

  const xA = useMotionValue(0)
  const yA = useMotionValue(0)
  const xB = useMotionValue(0)
  const yB = useMotionValue(0)
  const scA = useMotionValue(1)
  const scB = useMotionValue(1)
  const op = useMotionValue(0)

  const sync = (sy) => {
    if (!rects) return
    const vh = window.innerHeight
    // flightStart is a small fixed scroll buffer so the flight begins shortly
    // after the user starts scrolling rather than once the source has
    // parallaxed past viewport center. flightEnd is anchored to the countdown
    // date being roughly viewport-centered so the landing alignment is
    // unchanged. Both use stable values so p is a linear function of sy.
    const flightStart = FLIGHT_START_PX
    const flightEnd = Math.max(flightStart + 280, rects.tA_docY - vh * 0.5)
    const p = clamp((sy - flightStart) / (flightEnd - flightStart), 0, 1)

    // Live positions track parallax + bounce; fall back to cached doc coords
    // if a ref isn't currently mounted.
    const liveA = readLiveCenter(sourceARef.current)
      ?? { x: rects.sA_docX, y: rects.sA_docY }
    const liveB = readLiveCenter(sourceBRef.current)
      ?? { x: rects.sB_docX, y: rects.sB_docY }
    const liveTA = readLiveCenter(targetARef?.current ?? targetRef.current)
      ?? { x: rects.tA_docX, y: rects.tA_docY }
    const liveTB = readLiveCenter(targetBRef?.current ?? targetRef.current)
      ?? { x: rects.tB_docX, y: rects.tB_docY }
    const liveMergeCx = (liveA.x + liveB.x) / 2
    const liveMergeCy = (liveA.y + liveB.y) / 2 - LIFT_PX
    const liveMergeAx = liveMergeCx + rects.aOffsetX
    const liveMergeBx = liveMergeCx + rects.bOffsetX

    let aDocX, aDocY, bDocX, bDocY, scaleA, scaleB

    if (p < 0.05) {
      // handoff: clones sit exactly on the live source spans (fade in only)
      aDocX = liveA.x; aDocY = liveA.y
      bDocX = liveB.x; bDocY = liveB.y
      scaleA = 1; scaleB = 1
    } else if (p < 0.35) {
      // attach: each clone lerps from live source to live merge slot. Both
      // endpoints follow ongoing parallax, so the path stays glued to the
      // source as it drifts upward.
      const t = (p - 0.05) / 0.30
      aDocX = lerp(liveA.x, liveMergeAx, t)
      aDocY = lerp(liveA.y, liveMergeCy, t)
      bDocX = lerp(liveB.x, liveMergeBx, t)
      bDocY = lerp(liveB.y, liveMergeCy, t)
      scaleA = 1; scaleB = 1
      // Refresh the snapshot every frame so when p crosses 0.35 the glide
      // reads the most recent merge position.
      mergeSnapshotRef.current = {
        aX: liveMergeAx, aY: liveMergeCy,
        bX: liveMergeBx, bY: liveMergeCy,
      }
    } else {
      // glide + land: lerp from snapshotted merge → live target piece center.
      // Snapshot keeps the start anchor stable; live target tracks the
      // countdown's ParallaxFade.
      const t = clamp((p - 0.35) / 0.5, 0, 1)
      const tgtScale = rects.tgtFontPx / rects.srcFontPx
      scaleA = lerp(1, tgtScale, t)
      scaleB = lerp(1, tgtScale, t)
      const snap = mergeSnapshotRef.current ?? {
        aX: liveMergeAx, aY: liveMergeCy,
        bX: liveMergeBx, bY: liveMergeCy,
      }
      aDocX = lerp(snap.aX, liveTA.x, t)
      aDocY = lerp(snap.aY, liveTA.y, t)
      bDocX = lerp(snap.bX, liveTB.x, t)
      bDocY = lerp(snap.bY, liveTB.y, t)
    }

    // viewport coords; offset by half the clone's natural box (width = source
    // width, height = font size because the clone uses lineHeight: 1) so the
    // clone's box center sits at the source/target box center. Using srcAH/srcBH
    // here would misalign vertically — those include the parent's line-height
    // padding, which the clone's own box doesn't have.
    const aCx = aDocX
    const aCy = aDocY - sy
    const bCx = bDocX
    const bCy = bDocY - sy

    xA.set(aCx - rects.srcAW / 2)
    yA.set(aCy - rects.srcFontPx / 2)
    xB.set(bCx - rects.srcBW / 2)
    yB.set(bCy - rects.srcFontPx / 2)
    scA.set(scaleA)
    scB.set(scaleB)

    let opVal
    if (p < 0.05) opVal = p / 0.05
    else if (p < 0.85) opVal = 1
    else opVal = clamp((1 - p) / 0.15, 0, 1)
    op.set(opVal)

    if (sourceARef.current) {
      sourceARef.current.style.opacity = String(clamp(1 - p * 20, 0, 1))
    }
    if (sourceBRef.current) {
      sourceBRef.current.style.opacity = String(clamp(1 - p * 20, 0, 1))
    }
    if (middleRef?.current) {
      middleRef.current.style.opacity = String(clamp(1 - p * 7, 0, 1))
    }
    if (targetRef.current) {
      targetRef.current.style.opacity = String(clamp((p - 0.85) / 0.15, 0, 1))
    }
  }

  useMotionValueEvent(scrollY, 'change', sync)

  useLayoutEffect(() => {
    if (!rects) return
    ;[sourceARef.current, sourceBRef.current, middleRef?.current, targetRef.current].forEach(
      (el) => {
        if (el) el.style.transition = 'opacity 220ms ease'
      },
    )
    sync(window.scrollY)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rects])

  useEffect(() => {
    const refs = [sourceARef, sourceBRef, middleRef, targetRef]
    return () => {
      refs.forEach((r) => {
        if (r?.current) {
          r.current.style.opacity = ''
          r.current.style.transition = ''
        }
      })
    }
  }, [sourceARef, sourceBRef, middleRef, targetRef])

  if (reduce || !mounted || !rects) return null

  // All font properties come from the source's computed style so the clone
  // renders at the exact same intrinsic width as the source span — that's
  // what `xA = aDocX - srcAW/2` assumes. No font-display / tabular-nums
  // className: if the source doesn't enable tabular figures, the clone must
  // not either, or digits will measure to different widths.
  const baseCloneStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    opacity: op,
    fontFamily: rects.srcFontFamily,
    fontSize: `${rects.srcFontPx}px`,
    fontWeight: rects.srcFontWeight,
    fontStyle: rects.srcFontStyle,
    fontVariantNumeric: rects.srcFontVariantNumeric,
    color: rects.srcColor,
    lineHeight: 1,
    letterSpacing: rects.srcLetterSpacing,
    whiteSpace: 'nowrap',
    transformOrigin: 'center center',
    zIndex: 30,
  }

  return createPortal(
    <>
      <motion.span
        aria-hidden
        className="pointer-events-none will-change-transform"
        style={{ ...baseCloneStyle, x: xA, y: yA, scale: scA }}
      >
        {rects.textA}
      </motion.span>
      <motion.span
        aria-hidden
        className="pointer-events-none will-change-transform"
        style={{ ...baseCloneStyle, x: xB, y: yB, scale: scB }}
      >
        {rects.textB}
      </motion.span>
    </>,
    document.body,
  )
}
