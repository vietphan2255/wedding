import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import FadeIn from '../components/FadeIn.jsx'
import ParallaxImage from '../components/ParallaxImage.jsx'
import BackgroundMusic from '../components/BackgroundMusic.jsx'
import useSmoothScroll from '../hooks/useSmoothScroll.js'
import { useLanguage } from '../contexts/LanguageContext.jsx'

const PHOTOS = [
  'https://picsum.photos/seed/vn-engagement-1/900/1200',
  'https://picsum.photos/seed/vn-engagement-2/1200/900',
  'https://picsum.photos/seed/vn-engagement-3/900/900',
  'https://picsum.photos/seed/vn-engagement-4/1100/900',
  'https://picsum.photos/seed/vn-engagement-5/900/1100',
]

export default function EngagementPage() {
  useSmoothScroll()
  const { t } = useLanguage()

  return (
    <>
      <Navbar />
      <main>
        <section className="relative h-[70svh] min-h-[480px] w-full overflow-hidden">
          <ParallaxImage
            src={PHOTOS[0]}
            strength={80}
            className="absolute inset-0 w-full h-full"
            overlay
          />
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
            <FadeIn>
              <p className="eyebrow text-ink">{t('engagementPage.eyebrow')}</p>
              <h1
                className="font-display mt-5 text-ink leading-[0.95]"
                style={{ fontSize: 'clamp(2.5rem, 8vw, 6rem)' }}
              >
                {t('engagementPage.title')}
              </h1>
              <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-bg/70 backdrop-blur px-4 py-1.5 text-[11px] tracking-[0.22em] uppercase text-accent">
                <CheckCircle2 size={12} />
                {t('engagementPage.date')}
              </span>
            </FadeIn>
          </div>
        </section>

        <section className="section-padding relative bg-bg overflow-hidden">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <FadeIn>
              <div className="divider-leaf my-6">
                <span className="font-script text-2xl">v &amp; n</span>
              </div>
              <p className="text-muted leading-relaxed text-lg">
                {t('engagementPage.intro')}
              </p>
              <p className="text-muted leading-relaxed mt-6">
                {t('engagementPage.body')}
              </p>
            </FadeIn>
          </div>
        </section>

        <section className="section-padding relative bg-surface overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <FadeIn className="text-center max-w-2xl mx-auto">
              <p className="eyebrow">{t('engagementPage.galleryEyebrow')}</p>
              <h2 className="font-display mt-3 text-3xl md:text-5xl">
                {t('engagementPage.galleryTitle')}
              </h2>
            </FadeIn>

            <div className="mt-14 grid grid-cols-6 gap-3 md:gap-4 auto-rows-[180px] md:auto-rows-[240px]">
              <FadeIn delay={0.05} className="col-span-6 md:col-span-3 row-span-2">
                <ParallaxImage
                  src={PHOTOS[0]}
                  strength={40}
                  className="w-full h-full rounded-2xl"
                />
              </FadeIn>
              <FadeIn delay={0.1} className="col-span-3 md:col-span-3">
                <ParallaxImage
                  src={PHOTOS[1]}
                  strength={40}
                  className="w-full h-full rounded-2xl"
                />
              </FadeIn>
              <FadeIn delay={0.15} className="col-span-3 md:col-span-3">
                <ParallaxImage
                  src={PHOTOS[2]}
                  strength={40}
                  className="w-full h-full rounded-2xl"
                />
              </FadeIn>
              <FadeIn delay={0.2} className="col-span-4">
                <ParallaxImage
                  src={PHOTOS[3]}
                  strength={40}
                  className="w-full h-full rounded-2xl"
                />
              </FadeIn>
              <FadeIn delay={0.25} className="col-span-2 row-span-2">
                <ParallaxImage
                  src={PHOTOS[4]}
                  strength={40}
                  className="w-full h-full rounded-2xl"
                />
              </FadeIn>
            </div>

            <div className="mt-14 text-center">
              <a href="/#ceremonies" className="btn-ghost">
                <ArrowLeft size={15} />
                {t('engagementPage.back')}
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <BackgroundMusic />
    </>
  )
}
