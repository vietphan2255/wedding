import { useMemo, useState } from 'react'
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
  Mail,
  Users,
  Timer,
  Languages,
  ChevronDown,
  ChevronRight,
  Send,
  Sparkles,
  Layout,
} from 'lucide-react'
import { isConfigured } from '../firebase/config.js'
import { useWeddingConfig } from '../contexts/WeddingConfigContext.jsx'
import AdminAuth, { isAuthed, clearAuth } from './AdminAuth.jsx'
import DatesSection from './sections/DatesSection.jsx'
import VenuesSection from './sections/VenuesSection.jsx'
import InvitationSection from './sections/InvitationSection.jsx'
import StorySection from './sections/StorySection.jsx'
import GallerySection from './sections/GallerySection.jsx'
import MusicSection from './sections/MusicSection.jsx'
import GiftsSection from './sections/GiftsSection.jsx'
import FaqsSection from './sections/FaqsSection.jsx'
import RsvpsSection from './sections/RsvpsSection.jsx'
import WishesSection from './sections/WishesSection.jsx'
import CommonCoupleSection from './sections/CommonCoupleSection.jsx'
import HeroSection from './sections/HeroSection.jsx'
import CountdownSection from './sections/CountdownSection.jsx'
import FooterSection from './sections/FooterSection.jsx'
import RsvpLabelsSection from './sections/RsvpLabelsSection.jsx'
import WishesLabelsSection from './sections/WishesLabelsSection.jsx'
import { DraftConfigProvider } from './DraftConfigContext.jsx'
import { AdminUIProvider, useAdminUI } from './AdminUIContext.jsx'
import PreviewSite from './PreviewSite.jsx'

// Sidebar registry: groups -> entries -> component.
// `id` is also used by PreviewSite.PREVIEWS to pick a preview.
const GROUPS = [
  {
    id: 'common',
    label: 'Common',
    items: [
      { id: 'common-couple', label: 'Couple', icon: Users, Component: CommonCoupleSection },
      { id: 'dates', label: 'Dates', icon: Calendar, Component: DatesSection },
      { id: 'music', label: 'Music', icon: Music, Component: MusicSection },
    ],
  },
  {
    id: 'sections',
    label: 'Sections',
    items: [
      { id: 'hero', label: 'Hero', icon: Sparkles, Component: HeroSection },
      { id: 'countdown', label: 'Countdown', icon: Timer, Component: CountdownSection },
      { id: 'story', label: 'Story', icon: Heart, Component: StorySection },
      { id: 'timeline', label: 'Timeline', icon: MapPin, Component: VenuesSection },
      { id: 'invitation', label: 'Invitation', icon: Mail, Component: InvitationSection },
      { id: 'gallery', label: 'Gallery', icon: Image, Component: GallerySection },
      { id: 'gifts', label: 'Gifts', icon: Gift, Component: GiftsSection },
      { id: 'faqs', label: 'FAQ', icon: HelpCircle, Component: FaqsSection },
      { id: 'rsvp', label: 'RSVP', icon: Send, Component: RsvpLabelsSection },
      { id: 'wishes', label: 'Wishes', icon: MessageCircle, Component: WishesLabelsSection },
      { id: 'footer', label: 'Footer', icon: Layout, Component: FooterSection },
    ],
  },
  {
    id: 'submissions',
    label: 'Submissions',
    items: [
      { id: 'rsvps', label: 'RSVPs', icon: ClipboardList, Component: RsvpsSection },
      { id: 'wishes-submissions', label: 'Wishes', icon: MessageCircle, Component: WishesSection },
    ],
  },
]

const ALL_ITEMS = GROUPS.flatMap((g) => g.items.map((i) => ({ ...i, groupId: g.id })))

export default function Admin() {
  const [authed, setAuthed] = useState(() => isAuthed())

  if (!authed) return <AdminAuth onSuccess={() => setAuthed(true)} />

  return (
    <AdminUIProvider>
      <DraftConfigProvider>
        <AdminShell onLogout={() => setAuthed(false)} />
      </DraftConfigProvider>
    </AdminUIProvider>
  )
}

function AdminShell({ onLogout }) {
  const [tab, setTab] = useState('common-couple')
  const [openGroups, setOpenGroups] = useState({
    common: true,
    sections: true,
    submissions: true,
  })
  const { source, loading } = useWeddingConfig()
  const { adminLang, setAdminLang } = useAdminUI()

  const active = useMemo(
    () => ALL_ITEMS.find((i) => i.id === tab) || ALL_ITEMS[0],
    [tab],
  )
  const ActiveComponent = active.Component

  const logout = () => {
    clearAuth()
    onLogout()
  }

  const toggleGroup = (gid) =>
    setOpenGroups((s) => ({ ...s, [gid]: !s[gid] }))

  return (
    <div className="h-screen flex flex-col bg-bg text-ink overflow-hidden">
      <header className="border-b border-line bg-surface/40 backdrop-blur shrink-0">
        <div className="px-5 md:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="font-display text-xl tracking-wider">
              V <span className="text-accent">&</span> N
            </a>
            <span className="text-[11px] tracking-[0.22em] uppercase text-muted ml-2 hidden sm:inline">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-2">
            <LangToggle adminLang={adminLang} setAdminLang={setAdminLang} />
            <a
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 text-[12px] tracking-[0.18em] uppercase text-ink/70 hover:text-ink ml-2"
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

      {!isConfigured && (
        <div className="border-b border-red-500/30 bg-red-500/5 px-5 md:px-8 py-3 flex gap-3 shrink-0">
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

      <div className="px-5 md:px-8 py-3 flex items-center justify-between border-b border-line shrink-0">
        <h1 className="font-display text-xl md:text-2xl">Website config</h1>
        {isConfigured && (
          <div className="flex items-center gap-2 text-xs text-muted">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                loading ? 'bg-muted' : source === 'firebase' ? 'bg-accent' : 'bg-yellow-500'
              }`}
            />
            <span className="hidden sm:inline">
              {loading
                ? 'Loading…'
                : source === 'firebase'
                ? 'Live from Firebase'
                : 'Defaults — save once to publish'}
            </span>
          </div>
        )}
      </div>

      <div className="md:hidden px-5 py-2 border-b border-line shrink-0">
        <MobileTabSelect tab={tab} setTab={setTab} />
      </div>

      <div className="flex-1 flex overflow-hidden">
        <nav className="hidden md:flex flex-col w-60 lg:w-64 shrink-0 overflow-y-auto border-r border-line py-3 px-2 bg-surface/20">
          {GROUPS.map((group) => (
            <div key={group.id} className="mb-2">
              <button
                onClick={() => toggleGroup(group.id)}
                className="w-full flex items-center justify-between px-3 py-2 text-[11px] tracking-[0.22em] uppercase text-muted hover:text-ink"
              >
                <span>{group.label}</span>
                {openGroups[group.id] ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
              </button>
              {openGroups[group.id] && (
                <ul className="mt-1 space-y-0.5">
                  {group.items.map(({ id, label, icon: Icon }) => (
                    <li key={id}>
                      <button
                        onClick={() => setTab(id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                          tab === id
                            ? 'bg-ink/5 text-ink'
                            : 'text-ink/70 hover:bg-ink/5 hover:text-ink'
                        }`}
                      >
                        <Icon size={15} className="shrink-0" />
                        {label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </nav>

        <aside className="w-full lg:w-[440px] xl:w-[480px] shrink-0 overflow-y-auto border-r border-line p-5 md:p-6">
          <ActiveComponent />
        </aside>

        <section className="hidden lg:block flex-1 overflow-hidden bg-bg">
          <PreviewSite tab={tab} />
        </section>
      </div>
    </div>
  )
}

function LangToggle({ adminLang, setAdminLang }) {
  return (
    <div className="inline-flex items-center gap-0 rounded-full border border-line bg-surface/40 p-0.5">
      <Languages size={12} className="mx-2 text-muted" />
      {['en', 'vi'].map((l) => (
        <button
          key={l}
          onClick={() => setAdminLang(l)}
          className={`px-2.5 py-1 text-[11px] tracking-[0.2em] uppercase rounded-full transition ${
            adminLang === l ? 'bg-ink text-bg' : 'text-ink/70 hover:text-ink'
          }`}
          aria-pressed={adminLang === l}
        >
          {l}
        </button>
      ))}
    </div>
  )
}

function MobileTabSelect({ tab, setTab }) {
  return (
    <select
      value={tab}
      onChange={(e) => setTab(e.target.value)}
      className="w-full bg-surface border border-line rounded-lg px-3 py-2 text-sm"
    >
      {GROUPS.map((g) => (
        <optgroup key={g.id} label={g.label}>
          {g.items.map((i) => (
            <option key={i.id} value={i.id}>
              {i.label}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  )
}
