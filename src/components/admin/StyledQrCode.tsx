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

  // `margin` and the logo `imageOptions.margin` are absolute pixels, so scale
  // them with the canvas size (relative to the preview). This makes a download
  // a true high-res copy of the preview with the same proportional quiet zone,
  // instead of a thin, sub-spec border at large export sizes.
  const scale = size / QR_PREVIEW_SIZE

  return {
    type: 'canvas',
    width: size,
    height: size,
    margin: Math.round(qr.margin * scale),
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
      margin: Math.round(4 * scale),
    },
    dotsOptions: { type: qr.dotStyle, ...paint },
    cornersSquareOptions: { type: qr.cornerSquareStyle, ...paint },
    cornersDotOptions: { type: qr.cornerDotStyle, ...paint },
    // A fully-transparent canvas color yields transparent PNG/SVG exports
    // (JPEG has no alpha, so it falls back to a filled background).
    backgroundOptions: { color: qr.bgTransparent ? 'rgba(0,0,0,0)' : qr.bgColor },
  }
}

// On-screen preview size — kept small for snappy re-renders. Also the reference
// size that buildQrOptions scales absolute-pixel margins (quiet zone, logo
// margin) against, so an export is a true high-res copy of the preview.
export const QR_PREVIEW_SIZE = 240

// Print-ready raster export size. Downloads use a throwaway high-res instance
// so the PNG/JPEG come out large enough to print (a 240px PNG is too low-res).
export const QR_EXPORT_SIZE = 4096

// Render a transient (non-appended) instance at the given options and download
// it. Pass high-res options (buildQrOptions(qr, QR_EXPORT_SIZE)); the
// transparent background carries through unchanged.
export async function downloadQr(
  options: Partial<Options>,
  extension: FileExtension,
  name = 'wedding-qr',
): Promise<void> {
  await new QRCodeStyling(options).download({ name, extension })
}

// Wraps the imperative qr-code-styling instance: appends its canvas to a div
// and re-renders on option changes. Pass a memoized `options` object (e.g. from
// buildQrOptions) so update() only runs on change. Exports are handled
// separately by downloadQr so they can render at a higher resolution.
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

  return { containerRef }
}
