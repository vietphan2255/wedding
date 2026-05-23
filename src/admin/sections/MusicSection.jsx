import { useEffect, useRef, useState } from 'react'
import { ref, set } from 'firebase/database'
import { Save, Play, Pause } from 'lucide-react'
import { db, isConfigured } from '../../firebase/config.js'
import { useWeddingConfig } from '../../contexts/WeddingConfigContext.jsx'

const DEFAULTS = { enabled: false, url: '', title: '', volume: 0.4 }

export default function MusicSection() {
  const { config } = useWeddingConfig()
  const [form, setForm] = useState(() => ({ ...DEFAULTS, ...(config.music || {}) }))
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState(null)
  const [previewing, setPreviewing] = useState(false)
  const audioRef = useRef(null)

  useEffect(() => {
    setForm({ ...DEFAULTS, ...(config.music || {}) })
  }, [config.music])

  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    el.volume = Math.min(1, Math.max(0, Number(form.volume) || 0))
  }, [form.volume])

  const update_ = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const togglePreview = async () => {
    const el = audioRef.current
    if (!el || !form.url) return
    if (previewing) {
      el.pause()
      setPreviewing(false)
      return
    }
    try {
      await el.play()
      setPreviewing(true)
    } catch (err) {
      console.error(err)
      setStatus({
        type: 'error',
        message: 'Could not play that URL. Check it points to a valid audio file.',
      })
    }
  }

  const save = async (e) => {
    e.preventDefault()
    if (!isConfigured || !db) {
      setStatus({ type: 'error', message: 'Firebase is not configured.' })
      return
    }
    setSaving(true)
    setStatus(null)
    try {
      const payload = {
        enabled: Boolean(form.enabled),
        url: (form.url || '').trim(),
        title: (form.title || '').trim(),
        volume: Math.min(1, Math.max(0, Number(form.volume) || 0)),
      }
      await set(ref(db, 'config/music'), payload)
      setStatus({ type: 'success', message: 'Music settings saved.' })
    } catch (err) {
      console.error(err)
      setStatus({ type: 'error', message: err.message || 'Failed to save.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={save} className="space-y-5">
      <header className="glass rounded-3xl p-6 md:p-8">
        <p className="eyebrow">Audio</p>
        <h2 className="font-display text-2xl md:text-3xl mt-1">
          Background music
        </h2>
        <p className="text-sm text-muted mt-2">
          The public site shows a small play button when music is enabled. Provide a
          direct link to an audio file (mp3, ogg, m4a). Streaming-platform URLs
          (YouTube, Spotify) won&apos;t work — use a hosted audio file.
        </p>
      </header>

      <div className="glass rounded-3xl p-6 md:p-8 space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-medium">Enable background music</p>
            <p className="text-xs text-muted mt-0.5">
              When off, the play button is hidden on the site.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(form.enabled)}
              onChange={(e) => update_('enabled', e.target.checked)}
              className="sr-only peer"
            />
            <span className="w-11 h-6 bg-line peer-checked:bg-accent rounded-full transition-colors" />
            <span className="absolute left-0.5 top-0.5 w-5 h-5 bg-bg rounded-full transition-transform peer-checked:translate-x-5" />
          </label>
        </div>

        <div>
          <label className="block text-[11px] tracking-[0.22em] uppercase text-muted mb-2">
            Audio URL
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={form.url || ''}
              onChange={(e) => update_('url', e.target.value)}
              placeholder="https://…/song.mp3"
              className="flex-1 rounded-xl border border-line bg-bg px-4 py-3 text-ink focus:border-accent transition-colors"
            />
            <button
              type="button"
              onClick={togglePreview}
              disabled={!form.url}
              className="btn-ghost shrink-0 disabled:opacity-50"
            >
              {previewing ? <Pause size={15} /> : <Play size={15} />}
              {previewing ? 'Stop' : 'Preview'}
            </button>
          </div>
          <audio
            ref={audioRef}
            src={form.url || undefined}
            loop
            onEnded={() => setPreviewing(false)}
            onPause={() => setPreviewing(false)}
          />
        </div>

        <div>
          <label className="block text-[11px] tracking-[0.22em] uppercase text-muted mb-2">
            Track title (optional)
          </label>
          <input
            type="text"
            value={form.title || ''}
            onChange={(e) => update_('title', e.target.value)}
            placeholder="Shown as tooltip on the play button"
            className="w-full rounded-xl border border-line bg-bg px-4 py-3 text-ink focus:border-accent transition-colors"
          />
        </div>

        <div>
          <label className="block text-[11px] tracking-[0.22em] uppercase text-muted mb-2">
            Volume — {Math.round((Number(form.volume) || 0) * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={form.volume ?? 0.4}
            onChange={(e) => update_('volume', Number(e.target.value))}
            className="w-full accent-[var(--color-accent)]"
          />
        </div>
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
          {saving ? 'Saving…' : 'Save music settings'}
        </button>
      </div>
    </form>
  )
}
