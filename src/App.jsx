import { useEffect, useState } from 'react'
import useSmoothScroll from './hooks/useSmoothScroll.js'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import Countdown from './components/Countdown.jsx'
import Story from './components/Story.jsx'
import Engagement from './components/Engagement.jsx'
import Gallery from './components/Gallery.jsx'
import Events from './components/Events.jsx'
import RSVP from './components/RSVP.jsx'
import Wishes from './components/Wishes.jsx'
import Footer from './components/Footer.jsx'
import Admin from './admin/Admin.jsx'

function isAdminRoute() {
  if (typeof window === 'undefined') return false
  return window.location.pathname.replace(/\/+$/, '') === '/admin'
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
        <Engagement />
        <Gallery />
        <Events />
        <RSVP />
        <Wishes />
      </main>
      <Footer />
    </>
  )
}

export default function App() {
  const [route, setRoute] = useState(() => (isAdminRoute() ? 'admin' : 'site'))

  useEffect(() => {
    const onPop = () => setRoute(isAdminRoute() ? 'admin' : 'site')
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  return route === 'admin' ? <Admin /> : <WeddingSite />
}
