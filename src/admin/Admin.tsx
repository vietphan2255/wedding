import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar,
  Image,
  Images,
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
  ChevronDown,
  ChevronRight,
  Send,
  Sparkles,
  Layout,
  MousePointer2,
  MousePointerClick,
  PartyPopper,
  QrCode,
  Ticket,
} from 'lucide-react'
import { isConfigured } from '../firebase/config'
import { useWeddingConfig } from '../contexts/WeddingConfigContext'
import { ImageLightboxProvider } from '../components/admin/ImageLightboxProvider'
import AdminAuth, { useAuthUser, clearAuth } from './AdminAuth'
import { isAllowedAdminEmail } from '../lib/adminEmails'
import DatesSection from './sections/DatesSection'
import VenuesSection from './sections/VenuesSection'
import InvitationSection from './sections/InvitationSection'
import StorySection from './sections/StorySection'
import GallerySection from './sections/GallerySection'
import MusicSection from './sections/MusicSection'
import GiftsSection from './sections/GiftsSection'
import FaqsSection from './sections/FaqsSection'
import RsvpsSection from './sections/RsvpsSection'
import WishesSection from './sections/WishesSection'
import GuestsSection from './sections/GuestsSection'
import CommonCoupleSection from './sections/CommonCoupleSection'
import HeroSection from './sections/HeroSection'
import HeroSlidesSection from './sections/HeroSlidesSection'
import CountdownSection from './sections/CountdownSection'
import FooterSection from './sections/FooterSection'
import RsvpLabelsSection from './sections/RsvpLabelsSection'
import WishesLabelsSection from './sections/WishesLabelsSection'
import EffectsSection from './sections/EffectsSection'
import MobileEffectSection from './sections/MobileEffectSection'
import CursorsSection from './sections/CursorsSection'
import QrCodeSection from './sections/QrCodeSection'
import { DraftConfigProvider } from './DraftConfigContext'

// Sidebar registry: groups -> entries -> component.
const GROUPS = [
  {
    id: 'common',
    label: 'Common',
    items: [
      {
        id: 'common-couple',
        label: 'Couple',
        icon: Users,
        Component: CommonCoupleSection,
      },
      { id: 'dates', label: 'Dates', icon: Calendar, Component: DatesSection },
      { id: 'music', label: 'Music', icon: Music, Component: MusicSection },
    ],
  },
  {
    id: 'sections',
    label: 'Sections',
    items: [
      { id: 'hero', label: 'Hero', icon: Sparkles, Component: HeroSection },
      {
        id: 'hero-slides',
        label: 'Hero slideshow',
        icon: Images,
        Component: HeroSlidesSection,
      },
      { id: 'countdown', label: 'Countdown', icon: Timer, Component: CountdownSection },
      { id: 'story', label: 'Story', icon: Heart, Component: StorySection },
      { id: 'timeline', label: 'Timeline', icon: MapPin, Component: VenuesSection },
      { id: 'invitation', label: 'Invitation', icon: Mail, Component: InvitationSection },
      { id: 'gallery', label: 'Gallery', icon: Image, Component: GallerySection },
      { id: 'gifts', label: 'Gifts', icon: Gift, Component: GiftsSection },
      { id: 'faqs', label: 'FAQ', icon: HelpCircle, Component: FaqsSection },
      { id: 'rsvp', label: 'RSVP', icon: Send, Component: RsvpLabelsSection },
      {
        id: 'wishes',
        label: 'Wishes',
        icon: MessageCircle,
        Component: WishesLabelsSection,
      },
      { id: 'footer', label: 'Footer', icon: Layout, Component: FooterSection },
      { id: 'effects', label: 'Effects', icon: MousePointer2, Component: EffectsSection },
      {
        id: 'mobile-effect',
        label: 'Mobile effect',
        icon: PartyPopper,
        Component: MobileEffectSection,
      },
      {
        id: 'cursors',
        label: 'Cursors',
        icon: MousePointerClick,
        Component: CursorsSection,
      },
    ],
  },
  {
    id: 'submissions',
    label: 'Submissions',
    items: [
      { id: 'guests', label: 'Guests', icon: Ticket, Component: GuestsSection },
      { id: 'rsvps', label: 'RSVPs', icon: ClipboardList, Component: RsvpsSection },
      {
        id: 'wishes-submissions',
        label: 'Wishes',
        icon: MessageCircle,
        Component: WishesSection,
      },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    items: [{ id: 'qr', label: 'QR code', icon: QrCode, Component: QrCodeSection }],
  },
]

const ALL_ITEMS = GROUPS.flatMap((g) => g.items.map((i) => ({ ...i, groupId: g.id })))

export default function Admin() {
  const { user, loading } = useAuthUser()

  // Wait for Firebase to rehydrate the session — a sync check would bounce an
  // already-signed-in admin to the login form on every reload.
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg text-muted text-sm">
        Loading…
      </div>
    )
  }

  if (!user) return <AdminAuth />

  // The single allowlist gate: only accounts whose email is in VITE_ADMIN_EMAILS
  // reach the shell. Anyone else (incl. a freshly signed-in non-admin) gets the
  // "Not authorized" screen; the RTDB rules independently deny their reads/writes.
  if (!isAllowedAdminEmail(user.email)) return <AccessDenied />

  return (
    <DraftConfigProvider>
      <ImageLightboxProvider>
        <AdminShell />
      </ImageLightboxProvider>
    </DraftConfigProvider>
  )
}

function AccessDenied() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-6">
      <div className="w-full max-w-md glass rounded-3xl p-8 md:p-10 text-center">
        <AlertTriangle size={28} className="text-red-500 mx-auto" />
        <h1 className="font-display text-2xl md:text-3xl mt-4">Not authorized</h1>
        <p className="text-muted mt-2 text-sm">
          This account isn’t on the admin allowlist. Sign out and use an authorized
          account.
        </p>
        <button onClick={() => clearAuth()} className="btn-primary mt-6 w-full">
          Sign out
        </button>
      </div>
    </div>
  )
}

function AdminShell() {
  const [tab, setTab] = useState('common-couple')
  const [openGroups, setOpenGroups] = useState({
    common: true,
    sections: true,
    submissions: true,
    settings: true,
  })
  const { source, loading } = useWeddingConfig()

  const active = useMemo(() => ALL_ITEMS.find((i) => i.id === tab) || ALL_ITEMS[0], [tab])
  const ActiveComponent = active.Component

  const logout = () => {
    // signOut → onAuthStateChanged fires → Admin re-renders to the login screen.
    clearAuth()
  }

  const toggleGroup = (gid) => setOpenGroups((s) => ({ ...s, [gid]: !s[gid] }))

  return (
    <div className="h-screen flex flex-col bg-bg text-ink overflow-hidden">
      <header className="border-b border-line bg-surface/40 backdrop-blur shrink-0">
        <div className="px-5 md:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="font-display text-xl tracking-wider">
              V <span className="text-accent">&</span> N
            </Link>
            <span className="text-[11px] tracking-[0.22em] uppercase text-muted ml-2 hidden sm:inline">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-1.5 text-[12px] tracking-[0.18em] uppercase text-ink/70 hover:text-ink ml-2"
            >
              <ExternalLink size={14} />
              View site
            </Link>
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
            <p className="font-medium text-red-500">Firebase is not configured.</p>
            <p className="text-muted mt-1">
              Copy <code>.env.example</code> to <code>.env.local</code> and fill in your
              Firebase project values. Saves will fail until this is configured.
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
                loading
                  ? 'bg-muted'
                  : source === 'firebase'
                    ? 'bg-accent'
                    : 'bg-yellow-500'
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

      <div className="flex-1 flex overflow-hidden min-h-0">
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

        <aside className="flex-1 min-w-0 overflow-y-auto p-5 md:p-6">
          <div className="mx-auto w-full max-w-7xl">
            <ActiveComponent />
          </div>
        </aside>
      </div>
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
