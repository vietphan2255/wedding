import { useEffect, useState } from 'react'
import { ref, set } from 'firebase/database'
import { Save, Mail } from 'lucide-react'
import { db, isConfigured } from '../../firebase/config.js'
import { useWeddingConfig } from '../../contexts/WeddingConfigContext.jsx'

export default function InvitationSection() {
  const { config } = useWeddingConfig()
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState(null)

  useEffect(() => {
    setText((config.invitation?.letterImage || '').trim())
  }, [config.invitation])

  const cleaned = text.trim()

  const save = async (e) => {
    e.preventDefault()
    if (!isConfigured || !db) {
      setStatus({ type: 'error', message: 'Firebase is not configured.' })
      return
    }
    setSaving(true)
    setStatus(null)
    try {
      await set(ref(db, 'config/invitation'), { letterImage: cleaned || null })
      setStatus({ type: 'success', message: 'Invitation letter saved.' })
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
        <p className="eyebrow flex items-center gap-2">
          <Mail size={12} />
          Invitation
        </p>
        <h2 className="font-display text-2xl md:text-3xl mt-1">
          Invitation letter
        </h2>
        <p className="text-sm text-muted mt-2 max-w-2xl">
          Paste an image URL for the letter that slides up out of the envelope
          when a guest opens the site. Portrait images look best. Leave it empty
          to fall back to the default text card.
        </p>
      </header>

      <div className="glass rounded-3xl p-6 md:p-7">
        <label className="block text-[11px] tracking-[0.22em] uppercase text-muted mb-2">
          Letter image URL
        </label>
        <input
          type="url"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="https://example.com/our-invitation.jpg"
          className="w-full rounded-xl border border-line bg-bg px-4 py-3 font-mono text-xs"
        />

        {cleaned ? (
          <div className="mt-5">
            <p className="eyebrow mb-3">Preview</p>
            <div className="relative w-[min(280px,100%)] mx-auto aspect-[4/5] rounded-2xl overflow-hidden border border-line bg-surface shadow-[0_30px_70px_-30px_rgba(0,0,0,0.45)]">
              <img
                src={cleaned}
                alt="Invitation letter preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.opacity = '0.15'
                }}
              />
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted mt-3">
            No image set — the envelope shows the default text card.
          </p>
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
          {saving ? 'Saving…' : 'Save invitation'}
        </button>
      </div>
    </form>
  )
}
