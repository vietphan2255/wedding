import { useEffect, useMemo, useState } from 'react'
import { ref, set } from 'firebase/database'
import { Save, Sparkles } from 'lucide-react'
import { db, isConfigured } from '../../firebase/config.js'
import { useWeddingConfig } from '../../contexts/WeddingConfigContext.jsx'
import { computeMosaic, useImageAspects, DEFAULT_AR } from '../../lib/heroMosaic.js'
import UploadButton from '../../components/admin/UploadButton.jsx'

const PREVIEW_W = 1200
const PREVIEW_H = 1600

function normalise(raw) {
  const list = Array.isArray(raw)
    ? raw
    : raw && typeof raw === 'object'
    ? Object.values(raw)
    : []
  return list
    .map((s) => (typeof s === 'string' ? s.trim() : s))
    .filter(Boolean)
}

export default function HeroSection() {
  const { config } = useWeddingConfig()
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState(null)

  useEffect(() => {
    setText(normalise(config.heroImages).join('\n'))
  }, [config.heroImages])

  const cleaned = useMemo(
    () => text.split(/\r?\n/).map((s) => s.trim()).filter(Boolean),
    [text],
  )

  const aspects = useImageAspects(cleaned)
  const previewLayout = useMemo(() => {
    if (cleaned.length === 0) return null
    const arr = cleaned.map((s) => aspects[s] || DEFAULT_AR)
    return computeMosaic(arr, PREVIEW_W, PREVIEW_H, 6)
  }, [cleaned, aspects])

  const save = async (e) => {
    e.preventDefault()
    if (!isConfigured || !db) {
      setStatus({ type: 'error', message: 'Firebase is not configured.' })
      return
    }
    setSaving(true)
    setStatus(null)
    try {
      await set(
        ref(db, 'config/heroImages'),
        cleaned.length > 0 ? cleaned : null,
      )
      setStatus({ type: 'success', message: 'Hero images saved.' })
    } catch (err) {
      console.error(err)
      setStatus({ type: 'error', message: err.message || 'Failed to save.' })
    } finally {
      setSaving(false)
    }
  }

  const willUseGrid = cleaned.length >= 1

  return (
    <form onSubmit={save} className="space-y-5">
      <header className="glass rounded-3xl p-6 md:p-8">
        <p className="eyebrow flex items-center gap-2">
          <Sparkles size={12} />
          Hero
        </p>
        <h2 className="font-display text-2xl md:text-3xl mt-1">
          Hero background grid
        </h2>
        <p className="text-sm text-muted mt-2 max-w-2xl">
          Paste one image URL per line. The hero packs them into a gap-filling
          mosaic that keeps every photo's own aspect ratio — tiles snapped edge
          to edge like blocks. Any number of photos works and each is used once;
          the packing re-solves itself to fit the visitor's screen.
        </p>
      </header>

      <div className="glass rounded-3xl p-6 md:p-7">
        <div className="mb-2 flex items-center justify-between gap-3">
          <label className="text-[11px] tracking-[0.22em] uppercase text-muted flex items-center gap-2">
            <span>Image URLs</span>
            <span className="normal-case tracking-normal text-[10px] text-muted/80">
              one per line
            </span>
          </label>
          <UploadButton
            multiple
            label="Upload images"
            onUploaded={(urls) =>
              setText((t) => [t.trim(), ...urls].filter(Boolean).join('\n'))
            }
          />
        </div>
        <textarea
          rows={10}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            'https://example.com/hero-1.jpg\nhttps://example.com/hero-2.jpg\nhttps://example.com/hero-3.jpg'
          }
          className="w-full rounded-xl border border-line bg-bg px-4 py-3 font-mono text-xs leading-relaxed"
        />
        <div className="mt-3 flex items-center justify-between text-xs">
          <p className="text-muted">{cleaned.length} image(s)</p>
          <p className={willUseGrid ? 'text-accent' : 'text-muted'}>
            {willUseGrid ? '✓ Mosaic active' : 'Add at least one image'}
          </p>
        </div>

        {cleaned.length > 0 && (
          <div className="mt-5">
            <p className="eyebrow mb-3">Mosaic preview</p>
            <div className="relative aspect-[3/4] max-w-md mx-auto rounded-2xl overflow-hidden border border-line bg-bg">
              {previewLayout &&
                cleaned.map((src, i) => {
                  const r = previewLayout[i]
                  if (!r) return null
                  return (
                    <div
                      key={i}
                      className="absolute overflow-hidden rounded-[3px] bg-surface"
                      style={{
                        left: `${(r.x / PREVIEW_W) * 100}%`,
                        top: `${(r.y / PREVIEW_H) * 100}%`,
                        width: `${(r.w / PREVIEW_W) * 100}%`,
                        height: `${(r.h / PREVIEW_H) * 100}%`,
                      }}
                    >
                      <img
                        src={src}
                        alt=""
                        loading="lazy"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.opacity = '0.15'
                        }}
                      />
                    </div>
                  )
                })}
            </div>
            <p className="text-[11px] text-muted/80 mt-2 text-center">
              Indicative 3 : 4 packing — the live hero re-solves for the actual
              screen size.
            </p>
          </div>
        )}
      </div>

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
          <span />
        )}
        <button
          type="submit"
          disabled={saving}
          className="btn-primary disabled:opacity-60"
        >
          <Save size={16} />
          {saving ? 'Saving…' : 'Save hero'}
        </button>
      </div>
    </form>
  )
}
