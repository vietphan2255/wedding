import { WeddingConfigContext } from '../contexts/WeddingConfigContext.jsx'
import { LanguageProvider } from '../contexts/LanguageContext.jsx'
import Hero from '../components/Hero.jsx'
import Countdown from '../components/Countdown.jsx'
import StoryV2 from '../components/StoryV2.jsx'
import GalleryV2 from '../components/GalleryV2.jsx'
import CeremonyTimelineV2 from '../components/CeremonyTimelineV2.jsx'
import RSVP from '../components/RSVP.jsx'
import Wishes from '../components/Wishes.jsx'
import GiftCard from '../components/GiftCard.jsx'
import FAQ from '../components/FAQ.jsx'
import Footer from '../components/Footer.jsx'
import EnvelopeIntro from '../components/EnvelopeIntro.jsx'
import { useDraftConfig } from './DraftConfigContext.jsx'

// Inline render of the public homepage section that corresponds to the active
// admin tab — driven by the admin's draft config (overrides
// WeddingConfigContext for this subtree only so every keystroke rerenders).
// Chrome that uses position:fixed (Navbar, FloatingDock, MobileRsvpBar, the
// InvitationOverlay wrapper) is intentionally avoided so it doesn't leak over
// the admin UI.

function InvitationPreview() {
  const { draft } = useDraftConfig()
  const letter = (draft.invitation?.letterImage || '').trim()
  return (
    <div className="h-full flex items-center justify-center bg-bg p-6 overflow-hidden">
      <EnvelopeIntro open letterImage={letter} />
    </div>
  )
}

function MusicPreview() {
  const { draft } = useDraftConfig()
  const music = draft.music || {}
  const volPct = Math.round((Number(music.volume) || 0) * 100)
  return (
    <div className="h-full flex items-center justify-center bg-bg p-8">
      <div className="glass rounded-3xl p-8 max-w-md w-full">
        <p className="eyebrow">Music</p>
        <h3 className="font-display text-2xl md:text-3xl mt-1">
          {music.title || 'No track set'}
        </h3>
        <dl className="mt-5 text-sm divide-y divide-line/60">
          <div className="flex justify-between py-2">
            <dt className="text-muted">Status</dt>
            <dd>{music.enabled ? 'Enabled' : 'Disabled'}</dd>
          </div>
          <div className="flex justify-between py-2 gap-4">
            <dt className="text-muted shrink-0">URL</dt>
            <dd className="font-mono text-xs truncate">
              {music.url || <span className="text-muted">—</span>}
            </dd>
          </div>
          <div className="flex justify-between py-2">
            <dt className="text-muted">Volume</dt>
            <dd>{volPct}%</dd>
          </div>
        </dl>
        <p className="text-xs text-muted mt-5">
          On the public site, music plays from the floating play button. The
          preview shows the active settings — use the form&apos;s own Preview
          button to listen.
        </p>
      </div>
    </div>
  )
}

const PREVIEWS = {
  // Common
  'common-couple': <Hero />,
  dates: <Countdown />,
  music: <MusicPreview />,

  // Sections
  hero: <Hero />,
  countdown: <Countdown />,
  story: <StoryV2 />,
  timeline: <CeremonyTimelineV2 />,
  invitation: <InvitationPreview />,
  gallery: <GalleryV2 />,
  gifts: <GiftCard />,
  faqs: <FAQ />,
  rsvp: <RSVP />,
  wishes: <Wishes />,
  footer: <Footer />,

  // Submissions
  rsvps: <RSVP />,
  'wishes-submissions': <Wishes />,
}

export default function PreviewSite({ tab }) {
  const { draft } = useDraftConfig()
  return (
    <WeddingConfigContext.Provider
      value={{ config: draft, loading: false, source: 'draft' }}
    >
      <LanguageProvider>
        <div className="h-full overflow-y-auto bg-bg text-ink">
          {PREVIEWS[tab] ?? (
            <p className="p-8 text-sm text-muted">No preview for this tab.</p>
          )}
        </div>
      </LanguageProvider>
    </WeddingConfigContext.Provider>
  )
}
