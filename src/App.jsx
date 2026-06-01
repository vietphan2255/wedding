import { lazy, Suspense, useEffect, useState } from 'react'
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

// Off-/ routes load lazily so HeroV2, InvitationOverlayV2, CustomCursor, the
// admin tree, and the engagement/pay-slip pages aren't shipped to / visitors.
const WeddingSiteV2 = lazy(() => import('./routes/WeddingSiteV2.jsx'))
const Admin = lazy(() => import('./admin/Admin.jsx'))
const EngagementPage = lazy(() => import('./pages/EngagementPage.jsx'))
const PaySlipPage = lazy(() => import('./pages/PaySlipPage.jsx'))

function getRoute() {
  if (typeof window === 'undefined') return 'site'
  const path = window.location.pathname.replace(/\/+$/, '')
  if (path === '/admin') return 'admin'
  if (path === '/engagement') return 'engagement'
  if (path === '/v2') return 'v2'
  if (path === '/pay-slip') return 'payslip'
  return 'site'
}

// Original home page (main branch version), served at "/".
function WeddingSite() {
  useSmoothScroll()
  return (
    <>
      <InvitationOverlay />
      <ScrollProgress />
      <ParallaxPetals />
      <Navbar />
      <main>
        <Hero />
        <Countdown />
        <StoryV2 />
        <GalleryV2 />
        <CeremonyTimelineV2 />
        <RSVP />
        <Wishes />
        <GiftCard />
        <FAQ />
      </main>
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
    route === 'payslip' ? <PaySlipPage /> :
    <WeddingSiteV2 />

  return (
    <Suspense fallback={<div className="min-h-screen bg-bg" />}>
      {lazyPage}
    </Suspense>
  )
}
