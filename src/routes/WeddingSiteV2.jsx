import useSmoothScroll from '../hooks/useSmoothScroll.js'
import Navbar from '../components/Navbar.jsx'
import HeroV2 from '../components/HeroV2.jsx'
import Countdown from '../components/Countdown.jsx'
import StoryV2 from '../components/StoryV2.jsx'
import GalleryV2 from '../components/GalleryV2.jsx'
import CeremonyTimelineV2 from '../components/CeremonyTimelineV2.jsx'
import RSVP from '../components/RSVP.jsx'
import Wishes from '../components/Wishes.jsx'
import GiftCard from '../components/GiftCard.jsx'
import FAQ from '../components/FAQ.jsx'
import Footer from '../components/Footer.jsx'
import FloatingDock from '../components/FloatingDock.jsx'
import ScrollProgress from '../components/ScrollProgress.jsx'
import MobileRsvpBar from '../components/MobileRsvpBar.jsx'
import InvitationOverlayV2 from '../components/InvitationOverlayV2.jsx'
import CustomCursor from '../components/fx/CustomCursor.jsx'

// Lazy-loaded /v2 home — extracted so HeroV2, InvitationOverlayV2, CustomCursor,
// and lib/heroMosaic leave the main `/` JS chunk.
export default function WeddingSiteV2() {
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
