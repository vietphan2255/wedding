import { useState } from 'react'
import {
  Calendar,
  Image,
  Heart,
  LogOut,
  ExternalLink,
  AlertTriangle,
  ClipboardList,
  MessageCircle,
  Music,
  MapPin,
  Gift,
  HelpCircle,
  Sparkles,
  Mail,
} from 'lucide-react'
import { isConfigured } from '../firebase/config.js'
import { useWeddingConfig } from '../contexts/WeddingConfigContext.jsx'
import AdminAuth, { isAuthed, clearAuth } from './AdminAuth.jsx'
import DatesSection from './sections/DatesSection.jsx'
import VenuesSection from './sections/VenuesSection.jsx'
import HeroSection from './sections/HeroSection.jsx'
import InvitationSection from './sections/InvitationSection.jsx'
import StorySection from './sections/StorySection.jsx'
import GallerySection from './sections/GallerySection.jsx'
import MusicSection from './sections/MusicSection.jsx'
import GiftsSection from './sections/GiftsSection.jsx'
import FaqsSection from './sections/FaqsSection.jsx'
import RsvpsSection from './sections/RsvpsSection.jsx'
import WishesSection from './sections/WishesSection.jsx'

const TABS = [
  { id: 'dates', label: 'Dates', icon: Calendar },
  { id: 'venues', label: 'Venues', icon: MapPin },
  { id: 'hero', label: 'Hero', icon: Sparkles },
  { id: 'invitation', label: 'Invitation', icon: Mail },
  { id: 'story', label: 'Story', icon: Heart },
  { id: 'gallery', label: 'Gallery', icon: Image },
  { id: 'gifts', label: 'Gifts', icon: Gift },
  { id: 'faqs', label: 'FAQ', icon: HelpCircle },
  { id: 'music', label: 'Music', icon: Music },
  { id: 'rsvps', label: 'RSVPs', icon: ClipboardList },
  { id: 'wishes', label: 'Wishes', icon: MessageCircle },
]

export default function Admin() {
  const [authed, setAuthed] = useState(() => isAuthed())
  const [tab, setTab] = useState('dates')
  const { source, loading } = useWeddingConfig()

  if (!authed) return <AdminAuth onSuccess={() => setAuthed(true)} />

  const logout = () => {
    clearAuth()
    setAuthed(false)
  }

  return (
    <div className="min-h-screen bg-bg text-ink">
      <header className="border-b border-line bg-surface/40 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="font-display text-xl tracking-wider">
              V <span className="text-accent">&</span> N
            </a>
            <span className="text-[11px] tracking-[0.22em] uppercase text-muted ml-2 hidden sm:inline">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 text-[12px] tracking-[0.18em] uppercase text-ink/70 hover:text-ink"
            >
              <ExternalLink size={14} />
              View site
            </a>
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 text-[12px] tracking-[0.18em] uppercase text-ink/70 hover:text-ink ml-3"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 md:px-8 py-10">
        <div className="mb-8">
          <p className="eyebrow">Wedding configuration</p>
          <h1 className="font-display text-4xl md:text-5xl mt-2">
            Manage your wedding site
          </h1>
          <p className="text-muted text-sm mt-3 max-w-xl">
            Edit the ceremony dates, the story timeline, and the photo
            gallery. Changes propagate to the public site in real time via
            Firebase Realtime Database.
          </p>
        </div>

        {!isConfigured && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/5 p-5 flex gap-3">
            <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-red-500">
                Firebase is not configured.
              </p>
              <p className="text-muted mt-1">
                Copy <code>.env.example</code> to <code>.env.local</code> and
                fill in your Firebase project values. Saves will fail until
                this is configured.
              </p>
            </div>
          </div>
        )}

        {isConfigured && (
          <div className="mb-6 flex items-center gap-2 text-xs text-muted">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                loading ? 'bg-muted' : source === 'firebase' ? 'bg-accent' : 'bg-yellow-500'
              }`}
            />
            <span>
              {loading
                ? 'Loading config…'
                : source === 'firebase'
                ? 'Live from Firebase'
                : 'Showing defaults — save once to publish to Firebase'}
            </span>
          </div>
        )}

        <nav className="flex gap-2 border-b border-line mb-8 overflow-x-auto -mx-5 px-5 md:mx-0 md:px-0">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm tracking-wide border-b-2 -mb-px transition whitespace-nowrap ${
                tab === id
                  ? 'border-accent text-ink'
                  : 'border-transparent text-muted hover:text-ink'
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </nav>

        {tab === 'dates' && <DatesSection />}
        {tab === 'venues' && <VenuesSection />}
        {tab === 'hero' && <HeroSection />}
        {tab === 'invitation' && <InvitationSection />}
        {tab === 'story' && <StorySection />}
        {tab === 'gallery' && <GallerySection />}
        {tab === 'gifts' && <GiftsSection />}
        {tab === 'faqs' && <FaqsSection />}
        {tab === 'music' && <MusicSection />}
        {tab === 'rsvps' && <RsvpsSection />}
        {tab === 'wishes' && <WishesSection />}
      </main>
    </div>
  )
}
