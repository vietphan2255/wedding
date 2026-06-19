import { useEffect, useRef } from 'react'
import QRCodeStyling, {
  type Options,
  type FileExtension,
  type Gradient,
} from 'qr-code-styling'
import type { Qr } from '../../contexts/configTypes'

const DEG = Math.PI / 180

// Map the flat `qr` config slice onto qr-code-styling's nested Options. When a
// gradient is enabled it replaces the flat colour on dots + corners; otherwise
// each part is painted with the single foreground colour.
export function buildQrOptions(qr: Qr, size: number): Partial<Options> {
  const data =
    (qr.link || '').trim() ||
    (typeof window !== 'undefined' ? window.location.origin + '/' : '')

  const gradient: Gradient | undefined = qr.useGradient
    ? {
        type: qr.gradientType,
        rotation: (qr.gradientRotation || 0) * DEG,
        colorStops: [
          { offset: 0, color: qr.gradientColor1 },
          { offset: 1, color: qr.gradientColor2 },
        ],
      }
    : undefined

  const paint = gradient ? { gradient } : { color: qr.fgColor }

  return {
    type: 'canvas',
    width: size,
    height: size,
    margin: qr.margin,
    data,
    image: qr.logoUrl || undefined,
    qrOptions: { errorCorrectionLevel: qr.errorCorrection },
    imageOptions: {
      // Cloudinary serves CORS headers, so an anonymous crossOrigin keeps the
      // canvas untainted and PNG/JPEG export working with a logo.
      crossOrigin: 'anonymous',
      saveAsBlob: true,
      hideBackgroundDots: true,
      imageSize: qr.logoSize,
      margin: 4,
    },
    dotsOptions: { type: qr.dotStyle, ...paint },
    cornersSquareOptions: { type: qr.cornerSquareStyle, ...paint },
    cornersDotOptions: { type: qr.cornerDotStyle, ...paint },
    // A fully-transparent canvas color yields transparent PNG/SVG exports
    // (JPEG has no alpha, so it falls back to a filled background).
    backgroundOptions: { color: qr.bgTransparent ? 'rgba(0,0,0,0)' : qr.bgColor },
  }
}

// Wraps the imperative qr-code-styling instance: appends its canvas to a div,
// re-renders on option changes, and exposes a download(). Pass a memoized
// `options` object (e.g. from buildQrOptions) so update() only runs on change.
export function useStyledQr(options: Partial<Options>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const qrRef = useRef<QRCodeStyling | null>(null)

  // Create once and append. Clearing the container first makes React 18
  // StrictMode's double-mount idempotent (no duplicate canvas).
  useEffect(() => {
    const qr = new QRCodeStyling(options)
    qrRef.current = qr
    const el = containerRef.current
    if (el) {
      el.innerHTML = ''
      qr.append(el)
    }
    return () => {
      qrRef.current = null
      if (el) el.innerHTML = ''
    }
    // Run once; later option changes flow through the update() effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    qrRef.current?.update(options)
  }, [options])

  const download = (extension: FileExtension, name = 'wedding-qr') => {
    void qrRef.current?.download({ name, extension })
  }

  return { containerRef, download }
}
