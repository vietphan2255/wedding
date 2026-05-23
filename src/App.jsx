import { useEffect, useState } from 'react'
import useSmoothScroll from './hooks/useSmoothScroll.js'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import Countdown from './components/Countdown.jsx'
import Story from './components/Story.jsx'
import Gallery from './components/Gallery.jsx'
import CeremonyTimeline from './components/CeremonyTimeline.jsx'
import RSVP from './components/RSVP.jsx'
import Wishes from './components/Wishes.jsx'
import Footer from './components/Footer.jsx'
import Admin from './admin/Admin.jsx'
import EngagementPage from './pages/EngagementPage.jsx'

function getRoute() {
  if (typeof window === 'undefined') return 'site'
  const path = window.location.pathname.replace(/\/+$/, '')
  if (path === '/admin') return 'admin'
  if (path === '/engagement') return 'engagement'
  return 'site'
}

function WeddingSite() {
  useSmoothScroll()
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Countdown />
        <Story />
        <Gallery />
        <CeremonyTimeline />
        <RSVP />
        <Wishes />
      </main>
      <Footer />
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
  return <WeddingSite />
}
