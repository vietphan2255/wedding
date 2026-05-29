import { useEffect, useState } from 'react'
import useSmoothScroll from './hooks/useSmoothScroll.js'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import HeroV2 from './components/HeroV2.jsx'
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
import InvitationOverlayV2 from './components/InvitationOverlayV2.jsx'
import CustomCursor from './components/fx/CustomCursor.jsx'
import Admin from './admin/Admin.jsx'
import EngagementPage from './pages/EngagementPage.jsx'
import PaySlipPage from './pages/PaySlipPage.jsx'

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

// Redesigned home page (editorial mosaic hero + reworked sections), served at "/v2".
function WeddingSiteV2() {
  useSmoothScroll()
  return (
    <>
      <InvitationOverlayV2 />
      <ScrollProgress />
      <CustomCursor />
      <Navbar />
      <main>
        <HeroV2 />
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

  if (route === 'admin') return <Admin />
  if (route === 'engagement') return <EngagementPage />
  if (route === 'payslip') return <PaySlipPage />
  if (route === 'v2') return <WeddingSiteV2 />
  return <WeddingSite />
}
