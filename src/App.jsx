import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import useSmoothScroll from './hooks/useSmoothScroll.js'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import Countdown from './components/Countdown.jsx'
import StoryV2 from './components/StoryV2.jsx'
import GalleryV2 from './components/GalleryV2.jsx'
import CeremonyTimelineV2 from './components/CeremonyTimelineV2.jsx'
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
import FlyingDate from './components/fx/FlyingDate.jsx'
import CustomCursor from './components/fx/CustomCursor.jsx'

// Off-/ routes load lazily so the admin tree and the engagement / pay-slip
// pages aren't shipped to / visitors.
const Admin = lazy(() => import('./admin/Admin.jsx'))
const EngagementPage = lazy(() => import('./pages/EngagementPage.jsx'))
const PaySlipPage = lazy(() => import('./pages/PaySlipPage.jsx'))

function getRoute() {
  if (typeof window === 'undefined') return 'site'
  const path = window.location.pathname.replace(/\/+$/, '')
  if (path === '/admin') return 'admin'
  if (path === '/engagement') return 'engagement'
  if (path === '/pay-slip') return 'payslip'
  return 'site'
}

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
  return (
    <>
      <InvitationOverlay />
      <ScrollProgress />
      <CustomCursor />
      <ParallaxPetals />
      <Navbar />
      <main>
        <Hero
          flightSourceARef={flightSourceARef}
          flightMiddleRef={flightMiddleRef}
          flightSourceBRef={flightSourceBRef}
        />
        <Countdown
          flightTargetRef={flightTargetRef}
          flightTargetARef={flightTargetARef}
          flightTargetBRef={flightTargetBRef}
        />
        <StoryV2 />
        <GalleryV2 />
        <CeremonyTimelineV2 />
        <RSVP />
        <Wishes />
        <GiftCard />
        <FAQ />
      </main>
      <FlyingDate
        sourceARef={flightSourceARef}
        sourceBRef={flightSourceBRef}
        middleRef={flightMiddleRef}
        targetRef={flightTargetRef}
        targetARef={flightTargetARef}
        targetBRef={flightTargetBRef}
      />
      <Footer />
      <FloatingDock />
      <MobileRsvpBar />
    </>
  )
}

export default function App() {
  const [route, setRoute] = useState(getRoute)

  useEffect(() => {
    const onPop = () => setRoute(getRoute())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  // / renders synchronously — no Suspense delay on the main route.
  if (route === 'site') return <WeddingSite />

  const lazyPage =
    route === 'admin' ? <Admin /> :
    route === 'engagement' ? <EngagementPage /> :
    <PaySlipPage />

  return (
    <Suspense fallback={<div className="min-h-screen bg-bg" />}>
      {lazyPage}
    </Suspense>
  )
}
