import { useState } from 'react'
import { Save, PartyPopper } from 'lucide-react'
import { useDraftConfig } from '../DraftConfigContext'
import ImageInput from '../../components/admin/ImageInput.jsx'
import type { FloatingGift, FloatingGiftSlot } from '../../contexts/configTypes'

// Clamp helpers mirror the EffectsSection normalize-on-save style. Match the
// runtime/merge defaults (size 72, offset 8, speed 60, wait 1.5).
const clampSize = (n: number) => Math.max(24, Math.min(240, Math.round(n) || 72))
const clampOffset = (n: number) => Math.max(0, Math.min(160, Math.round(n) || 0))
const clampSpeed = (n: number) => Math.max(10, Math.min(300, Math.round(n) || 60))
const clampWait = (n: number) => Math.max(0, Math.min(15, Number(n) || 0))

function normalizeSlot(s?: Partial<FloatingGiftSlot>): FloatingGiftSlot {
  return {
    image: (s?.image || '').trim(),
    size: clampSize(Number(s?.size)),
    offset: clampOffset(Number(s?.offset)),
    speed: clampSpeed(Number(s?.speed)),
    wait: clampWait(Number(s?.wait)),
  }
}

// Representative phone width for the live "≈ N s to cross" read-out — turns the
// raw px/sec speed into something an admin can reason about.
const PHONE_W = 390

// Defined at module scope (not inside FloatingGiftSection) so it keeps a stable
// component identity across renders — otherwise the text inputs would remount
// and lose focus on every keystroke.
function SlotEditor({
  title,
  hint,
  slot,
  onPatch,
}: {
  title: string
  hint: string
  slot: FloatingGiftSlot
  onPatch: (patch: Partial<FloatingGiftSlot>) => void
}) {
  const image = (slot.image || '').trim()
  const speed = Number(slot.speed) || 60
  const secs = ((PHONE_W + clampSize(Number(slot.size))) / Math.max(10, speed)).toFixed(1)

  return (
    <div className="glass rounded-3xl p-6 md:p-7">
      <p className="eyebrow">{title}</p>
      <p className="text-xs text-muted mt-1 mb-4">{hint}</p>

      <label className="block text-[11px] tracking-[0.22em] uppercase text-muted mb-2">
        Image
      </label>
      <ImageInput
        value={image}
        onChange={(next: string) => onPatch({ image: next })}
        placeholder="https://…/gift.png"
        inputClassName="w-full rounded-xl border border-line bg-bg px-4 py-3 font-mono text-xs"
      />

      {image ? (
        <div className="mt-4 inline-flex items-center justify-center w-20 h-20 rounded-2xl border border-line bg-surface">
          <img
            src={image}
            alt="Gift preview"
            className="max-w-full max-h-full object-contain"
            onError={(e) => {
              ;(e.currentTarget as HTMLImageElement).style.opacity = '0.15'
            }}
          />
        </div>
      ) : (
        <p className="text-xs text-muted mt-3">
          No image — this direction reuses the other slot&apos;s image, mirrored.
        </p>
      )}

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] tracking-[0.22em] uppercase text-muted mb-2">
            Size (width, px)
          </label>
          <input
            type="number"
            min={24}
            max={240}
            step={1}
            value={slot.size ?? 72}
            onChange={(e) => onPatch({ size: Number(e.target.value) })}
            className="w-full rounded-xl border border-line bg-bg px-4 py-3"
          />
        </div>
        <div>
          <label className="block text-[11px] tracking-[0.22em] uppercase text-muted mb-2">
            Offset above dock (px)
          </label>
          <input
            type="number"
            min={0}
            max={160}
            step={1}
            value={slot.offset ?? 8}
            onChange={(e) => onPatch({ offset: Number(e.target.value) })}
            className="w-full rounded-xl border border-line bg-bg px-4 py-3"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-[11px] tracking-[0.22em] uppercase text-muted mb-2">
          Speed — {Math.round(speed)} px/s{' '}
          <span className="text-muted/70">(≈ {secs}s across)</span>
        </label>
        <input
          type="range"
          min={10}
          max={300}
          step={5}
          value={slot.speed ?? 60}
          onChange={(e) => onPatch({ speed: Number(e.target.value) })}
          className="w-full accent-[var(--color-accent)]"
        />
      </div>

      <div className="mt-4">
        <label className="block text-[11px] tracking-[0.22em] uppercase text-muted mb-2">
          Wait at edge — {(Number(slot.wait) || 0).toFixed(1)}s
        </label>
        <input
          type="range"
          min={0}
          max={15}
          step={0.5}
          value={slot.wait ?? 1.5}
          onChange={(e) => onPatch({ wait: Number(e.target.value) })}
          className="w-full accent-[var(--color-accent)]"
        />
      </div>
    </div>
  )
}

export default function FloatingGiftSection() {
  const { draft, setSlice, saveSlice, isSliceDirty } = useDraftConfig()
  const fg = draft.floatingGift
  const dirty = isSliceDirty('floatingGift')
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<
    { type: 'success' | 'error'; message: string } | null
  >(null)

  const setFG = (patch: Partial<FloatingGift>) =>
    setSlice('floatingGift', (f) => ({ ...(f as FloatingGift), ...patch }))
  const setSlot = (key: 'slotA' | 'slotB', patch: Partial<FloatingGiftSlot>) =>
    setFG({ [key]: { ...fg[key], ...patch } } as Partial<FloatingGift>)

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setStatus(null)
    try {
      const payload: FloatingGift = {
        enabled: fg?.enabled !== false,
        slotA: normalizeSlot(fg?.slotA),
        slotB: normalizeSlot(fg?.slotB),
      }
      await saveSlice('floatingGift', payload)
      setSlice('floatingGift', payload)
      setStatus({ type: 'success', message: 'Floating gift saved.' })
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

  return (
    <form onSubmit={save} className="space-y-5">
      <header className="glass rounded-3xl p-6 md:p-8">
        <p className="eyebrow flex items-center gap-2">
          <PartyPopper size={12} />
          Floating gift
        </p>
        <h2 className="font-display text-2xl md:text-3xl mt-1">
          Floating gift (mobile)
        </h2>
        <p className="text-sm text-muted mt-2 max-w-2xl">
          A small image drifts across the bottom of phone screens, just above the
          bottom bar — left→right, then right→left, forever. Configure each
          direction below. Set only one image to reuse it (mirrored) for both
          directions; leave both empty to turn the effect off. Tapping the gift
          opens the gift modal. Phones only; hidden for visitors who prefer
          reduced motion.
        </p>
        <label className="flex items-center gap-2 text-sm cursor-pointer mt-4">
          <input
            type="checkbox"
            checked={fg?.enabled !== false}
            onChange={(e) => setFG({ enabled: e.target.checked })}
          />
          <span className="font-medium">Enabled</span>
        </label>
      </header>

      <fieldset
        disabled={fg?.enabled === false}
        className="space-y-5 disabled:opacity-50 border-0 m-0 p-0 min-w-0"
      >
        <SlotEditor
          title="Slot A — enters from left"
          hint="Travels left → right."
          slot={fg.slotA}
          onPatch={(patch) => setSlot('slotA', patch)}
        />
        <SlotEditor
          title="Slot B — enters from right"
          hint="Travels right → left."
          slot={fg.slotB}
          onPatch={(patch) => setSlot('slotB', patch)}
        />
      </fieldset>

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
          {saving ? 'Saving…' : 'Save floating gift'}
        </button>
      </div>
    </form>
  )
}
