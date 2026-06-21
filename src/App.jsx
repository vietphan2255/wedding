import { lazy, Suspense, useRef } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import useSmoothScroll from './hooks/useSmoothScroll'
import { useWeddingConfig } from './contexts/WeddingConfigContext'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import WeddingInvite from './components/WeddingInvite.jsx'
import Countdown from './components/Countdown.jsx'
import StoryV2 from './components/StoryV2.jsx'
import GalleryV2 from './components/GalleryV2.jsx'
// import CeremonyTimelineV2 from './components/CeremonyTimelineV2.jsx'
import RSVP from './components/RSVP.jsx'
import Wishes from './components/Wishes.jsx'
import GiftCard from './components/GiftCard.jsx'
import FAQ from './components/FAQ.jsx'
import Footer from './components/Footer.jsx'
import FloatingDock from './components/FloatingDock.jsx'
import ScrollProgress from './components/ScrollProgress.jsx'
import ParallaxPetals from './components/ParallaxPetals.jsx'
import MobileRsvpBar from './components/MobileRsvpBar.jsx'
import InvitationOverlay from './components/InvitationOverlay.jsx'
import { MusicProvider } from './contexts/MusicContext.jsx'
import { InvitedGuestProvider } from './contexts/InvitedGuestContext.jsx'
// Temporarily disabled: flying date overlay (Hero → Countdown).
// import FlyingDate from './components/fx/FlyingDate.jsx'
import CustomCursor from './components/fx/CustomCursor.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

// Off-/ routes load lazily so the admin tree and the engagement / pay-slip
// pages aren't shipped to / visitors.
const Admin = lazy(() => import('./admin/Admin'))
const EngagementPage = lazy(() => import('./pages/EngagementPage'))
const PaySlipPage = lazy(() => import('./pages/payslip'))

// Original home page (main branch version), served at "/".
function WeddingSite() {
  useSmoothScroll()
  // Shared anchors for the hero → countdown date flight. Hero exposes
  // vqDate (A), middle, and year (B); FlyingDate lifts A+B and merges
  // them into the countdown's date label.
  const flightSourceARef = useRef(null)
  const flightMiddleRef = useRef(null)
  const flightSourceBRef = useRef(null)
  const flightTargetRef = useRef(null)
  const flightTargetARef = useRef(null)
  const flightTargetBRef = useRef(null)
  // GIF-as-cursor: when set, <main> carries data-cursor=<url> so CustomCursor
  // renders the GIF page-wide. Interactive children with `data-cursor="open"`
  // etc. still win because the cursor handler reads the closest ancestor.
  const { config } = useWeddingConfig()
  const cursorGif = (config.effects?.cursorGif || '').trim()
  return (
    <InvitedGuestProvider>
      <MusicProvider>
        <InvitationOverlay />
        <ScrollProgress />
        <CustomCursor />
        <ParallaxPetals />
        <Navbar />
        <main {...(cursorGif ? { 'data-cursor': cursorGif } : {})}>
          <Hero
            flightSourceARef={flightSourceARef}
            flightMiddleRef={flightMiddleRef}
            flightSourceBRef={flightSourceBRef}
          />
          <WeddingInvite />
          <Countdown
            flightTargetRef={flightTargetRef}
            flightTargetARef={flightTargetARef}
            flightTargetBRef={flightTargetBRef}
          />
          <StoryV2 />
          <GalleryV2 />
          {/*<CeremonyTimelineV2 />*/}
          <RSVP />
          <Wishes />
          <GiftCard />
          <FAQ />
        </main>
        {/* Temporarily disabled: flying date overlay (Hero → Countdown). The hero
          and countdown show their date labels statically while this is off.
          Re-enable by uncommenting the import above and this block. */}
        {/* <FlyingDate
        sourceARef={flightSourceARef}
        sourceBRef={flightSourceBRef}
        middleRef={flightMiddleRef}
        targetRef={flightTargetRef}
        targetARef={flightTargetARef}
        targetBRef={flightTargetBRef}
      /> */}
        <Footer />
        <FloatingDock />
        <MobileRsvpBar />
      </MusicProvider>
    </InvitedGuestProvider>
  )
}

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-6">
      <div className="glass rounded-3xl p-8 md:p-10 max-w-md text-center">
        <p className="eyebrow">404</p>
        <h1 className="font-display text-2xl md:text-3xl mt-3">Page not found</h1>
        <p className="text-sm text-muted mt-3">
          That page doesn&apos;t exist — try the home page.
        </p>
        <div className="mt-6">
          <Link to="/" className="btn-primary">
            Go home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div className="min-h-screen bg-bg" />}>
        <Routes>
          <Route path="/" element={<WeddingSite />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/engagement" element={<EngagementPage />} />
          <Route path="/pay-slip" element={<PaySlipPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}
