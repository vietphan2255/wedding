import { useMemo, useState } from 'react'
import { QrCode, Save, Download, Copy, Check, Trash2 } from 'lucide-react'
import { useDraftConfig } from '../DraftConfigContext'
import ImageInput from '../../components/admin/ImageInput.jsx'
import {
  buildQrOptions,
  useStyledQr,
  downloadQr,
  QR_EXPORT_SIZE,
  QR_PREVIEW_SIZE,
} from '../../components/admin/StyledQrCode'
import type { FileExtension } from 'qr-code-styling'
import type { Qr } from '../../contexts/configTypes'

const DOT_STYLES: Qr['dotStyle'][] = [
  'square',
  'rounded',
  'dots',
  'classy',
  'classy-rounded',
  'extra-rounded',
]
const CORNER_SQUARE_STYLES: Qr['cornerSquareStyle'][] = ['square', 'dot', 'extra-rounded']
const CORNER_DOT_STYLES: Qr['cornerDotStyle'][] = ['square', 'dot']
const GRADIENT_TYPES: Qr['gradientType'][] = ['linear', 'radial']
const EC_LEVELS: Qr['errorCorrection'][] = ['L', 'M', 'Q', 'H']
const EC_LABEL: Record<Qr['errorCorrection'], string> = {
  L: 'L · Low (7%)',
  M: 'M · Medium (15%)',
  Q: 'Q · Quartile (25%)',
  H: 'H · High (30%)',
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="block text-[11px] tracking-[0.22em] uppercase text-muted mb-2">
      {children}
    </span>
  )
}

function SelectField({
  label,
  value,
  options,
  onChange,
  format,
}: {
  label: string
  value: string
  options: readonly string[]
  onChange: (v: string) => void
  format?: (o: string) => string
}) {
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-surface border border-line rounded-lg px-3 py-2 text-sm capitalize"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {format ? format(o) : o.replace(/-/g, ' ')}
          </option>
        ))}
      </select>
    </label>
  )
}

function RangeField({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
}) {
  return (
    <label className="block">
      <FieldLabel>
        {label}: {value}
      </FieldLabel>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-accent"
      />
    </label>
  )
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="flex items-center gap-2">
        <input
          aria-label={`${label} colour picker`}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-line bg-bg p-1"
        />
        <input
          aria-label={`${label} hex value`}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-line bg-bg px-3 py-2 text-sm font-mono"
        />
      </div>
    </div>
  )
}

export default function QrCodeSection() {
  const { draft, setSlice, saveSlice, isSliceDirty } = useDraftConfig()
  const qr = draft.qr
  const dirty = isSliceDirty('qr')
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [status, setStatus] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  const setQr = (patch: Partial<Qr>) =>
    setSlice('qr', (q) => ({ ...(q as Qr), ...patch }))

  const options = useMemo(() => buildQrOptions(qr, QR_PREVIEW_SIZE), [qr])
  const { containerRef } = useStyledQr(options)
  // Downloads render a separate, print-ready instance (the preview stays 240px).
  const exportOptions = useMemo(() => buildQrOptions(qr, QR_EXPORT_SIZE), [qr])

  const handleDownload = async (extension: FileExtension) => {
    try {
      await downloadQr(exportOptions, extension)
    } catch (err) {
      console.error(err)
      setStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Export failed.',
      })
    }
  }

  const encoded =
    (qr.link || '').trim() ||
    (typeof window !== 'undefined' ? window.location.origin + '/' : '')

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setStatus(null)
    try {
      const cleaned: Qr = { ...qr, link: qr.link.trim() }
      await saveSlice('qr', cleaned)
      setQr({ link: cleaned.link })
      setStatus({ type: 'success', message: 'QR design saved.' })
    } catch (err) {
      console.error(err)
      setStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to save.',
      })
    } finally {
      setSaving(false)
    }
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(encoded)
    } catch {
      const el = document.createElement('textarea')
      el.value = encoded
      document.body.appendChild(el)
      el.select()
      try {
        document.execCommand('copy')
      } catch {
        /* ignore */
      }
      document.body.removeChild(el)
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <form onSubmit={save} className="space-y-5">
      <header className="glass rounded-3xl p-6 md:p-8">
        <p className="eyebrow flex items-center gap-2">
          <QrCode size={12} />
          Settings · QR code
        </p>
        <h2 className="font-display text-2xl md:text-3xl mt-1">Site QR code</h2>
        <p className="text-sm text-muted mt-2 max-w-2xl">
          A styled, scannable code for the public site — print it on invitations, table
          cards, or a welcome sign. Tune the colours, shapes, and logo, then Save to keep
          the design and download it as a print-ready PNG (1024px), SVG, or JPEG.
        </p>
      </header>

      <div className="space-y-5 lg:space-y-0 lg:flex lg:items-start lg:gap-5">
        {/* Left pane: live preview + export, sticky on wide screens */}
        <div className="lg:sticky lg:top-0 lg:w-[360px] lg:shrink-0 space-y-5">
          {/* Live preview + export */}
          <div className="glass rounded-3xl p-6 md:p-7 flex flex-col items-center gap-5">
            <div
              className="rounded-2xl p-4"
              style={
                qr.bgTransparent
                  ? {
                      // checkerboard so the transparent code is visible in-preview
                      backgroundColor: '#fff',
                      backgroundImage:
                        'conic-gradient(#d4d4d4 25%, #fff 0 50%, #d4d4d4 0 75%, #fff 0)',
                      backgroundSize: '16px 16px',
                    }
                  : { backgroundColor: '#fff' }
              }
            >
              <div ref={containerRef} className="block" />
            </div>
            <p className="font-mono text-xs text-muted break-all max-w-full text-center">
              {encoded}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => handleDownload('png')}
                className="btn-primary"
              >
                <Download size={16} />
                PNG
              </button>
              <button
                type="button"
                onClick={() => handleDownload('svg')}
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-bg/60 px-4 py-2 text-sm text-ink/80 hover:bg-ink/5 hover:text-ink transition-colors"
              >
                <Download size={16} />
                SVG
              </button>
              <button
                type="button"
                onClick={() => handleDownload('jpeg')}
                disabled={qr.bgTransparent}
                title={
                  qr.bgTransparent
                    ? "JPEG can't keep transparency — use PNG or SVG"
                    : undefined
                }
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-bg/60 px-4 py-2 text-sm text-ink/80 hover:bg-ink/5 hover:text-ink transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-bg/60 disabled:hover:text-ink/80"
              >
                <Download size={16} />
                JPEG
              </button>
              <button
                type="button"
                onClick={copy}
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-bg/60 px-4 py-2 text-sm text-ink/80 hover:bg-ink/5 hover:text-ink transition-colors"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied' : 'Copy link'}
              </button>
            </div>
          </div>
        </div>

        {/* Right pane: controls (scroll beside the sticky preview) */}
        <div className="space-y-5 lg:flex-1 lg:min-w-0">
          {/* Content */}
          <div className="glass rounded-3xl p-6 md:p-7">
            <label className="block">
              <FieldLabel>Link to encode</FieldLabel>
              <input
                type="url"
                value={qr.link}
                onChange={(e) => setQr({ link: e.target.value })}
                placeholder="https://your-wedding-site.com/"
                className="w-full rounded-xl border border-line bg-bg px-4 py-3 text-ink focus:border-accent transition-colors"
              />
            </label>
            <p className="text-xs text-muted mt-2">
              Leave empty to use this site&apos;s home page ({encoded}).
            </p>
          </div>

          {/* Colours */}
          <div className="glass rounded-3xl p-6 md:p-7 space-y-5">
            <p className="eyebrow">Colours</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <ColorField
                label="Foreground"
                value={qr.fgColor}
                onChange={(v) => setQr({ fgColor: v })}
              />
              {!qr.bgTransparent && (
                <ColorField
                  label="Background"
                  value={qr.bgColor}
                  onChange={(v) => setQr({ bgColor: v })}
                />
              )}
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={qr.bgTransparent}
                onChange={(e) => setQr({ bgTransparent: e.target.checked })}
                className="accent-accent"
              />
              Transparent background
            </label>
            {qr.bgTransparent && (
              <p className="text-xs text-muted">
                PNG and SVG keep the transparency; JPEG exports with a solid background.
              </p>
            )}

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={qr.useGradient}
                onChange={(e) => setQr({ useGradient: e.target.checked })}
                className="accent-accent"
              />
              Use a gradient for the modules
            </label>

            {qr.useGradient && (
              <div className="grid sm:grid-cols-2 gap-4">
                <ColorField
                  label="Gradient start"
                  value={qr.gradientColor1}
                  onChange={(v) => setQr({ gradientColor1: v })}
                />
                <ColorField
                  label="Gradient end"
                  value={qr.gradientColor2}
                  onChange={(v) => setQr({ gradientColor2: v })}
                />
                <SelectField
                  label="Gradient type"
                  value={qr.gradientType}
                  options={GRADIENT_TYPES}
                  onChange={(v) => setQr({ gradientType: v as Qr['gradientType'] })}
                />
                <RangeField
                  label="Rotation°"
                  value={qr.gradientRotation}
                  min={0}
                  max={360}
                  step={5}
                  onChange={(v) => setQr({ gradientRotation: v })}
                />
              </div>
            )}
          </div>

          {/* Shapes */}
          <div className="glass rounded-3xl p-6 md:p-7 space-y-5">
            <p className="eyebrow">Shapes</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <SelectField
                label="Module (dot) style"
                value={qr.dotStyle}
                options={DOT_STYLES}
                onChange={(v) => setQr({ dotStyle: v as Qr['dotStyle'] })}
              />
              <SelectField
                label="Eye frame style"
                value={qr.cornerSquareStyle}
                options={CORNER_SQUARE_STYLES}
                onChange={(v) =>
                  setQr({ cornerSquareStyle: v as Qr['cornerSquareStyle'] })
                }
              />
              <SelectField
                label="Eye centre style"
                value={qr.cornerDotStyle}
                options={CORNER_DOT_STYLES}
                onChange={(v) => setQr({ cornerDotStyle: v as Qr['cornerDotStyle'] })}
              />
            </div>
          </div>

          {/* Logo */}
          <div className="glass rounded-3xl p-6 md:p-7 space-y-4">
            <p className="eyebrow">Center logo</p>
            <ImageInput
              value={qr.logoUrl}
              onChange={(v: string) => setQr({ logoUrl: v })}
              placeholder="https://…  (paste a URL or upload)"
            />
            {qr.logoUrl ? (
              <>
                <RangeField
                  label="Logo size"
                  value={qr.logoSize}
                  min={0.1}
                  max={0.6}
                  step={0.05}
                  onChange={(v) => setQr({ logoSize: v })}
                />
                <button
                  type="button"
                  onClick={() => setQr({ logoUrl: '' })}
                  className="inline-flex items-center gap-1.5 text-sm text-ink/70 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={15} />
                  Remove logo
                </button>
                <p className="text-xs text-muted">
                  With a logo, use error correction Q or H so the code still scans.
                </p>
              </>
            ) : (
              <p className="text-xs text-muted">
                Optional — embed your monogram or a small icon in the centre.
              </p>
            )}
          </div>

          {/* Advanced */}
          <div className="glass rounded-3xl p-6 md:p-7">
            <div className="grid sm:grid-cols-2 gap-4">
              <SelectField
                label="Error correction"
                value={qr.errorCorrection}
                options={EC_LEVELS}
                onChange={(v) => setQr({ errorCorrection: v as Qr['errorCorrection'] })}
                format={(o) => EC_LABEL[o as Qr['errorCorrection']]}
              />
              <RangeField
                label="Quiet-zone margin"
                value={qr.margin}
                min={0}
                max={40}
                step={2}
                onChange={(v) => setQr({ margin: v })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save bar */}
      <div className="flex items-center justify-between glass rounded-3xl p-5">
        {status ? (
          <p
            className={`text-sm ${
              status.type === 'error' ? 'text-red-500' : 'text-accent'
            }`}
          >
            {status.message}
          </p>
        ) : (
          <span className="text-xs text-muted">
            {dirty ? 'Unsaved changes' : 'Saved'}
          </span>
        )}
        <button
          type="submit"
          disabled={saving || !dirty}
          className="btn-primary disabled:opacity-60"
        >
          <Save size={16} />
          {saving ? 'Saving…' : 'Save design'}
        </button>
      </div>
    </form>
  )
}
