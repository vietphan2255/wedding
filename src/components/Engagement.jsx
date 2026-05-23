import { Sparkles } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext.jsx'
import FadeIn from './FadeIn.jsx'
import ParallaxImage from './ParallaxImage.jsx'

const PHOTOS = [
  'https://picsum.photos/seed/vn-engagement-1/900/1200',
  'https://picsum.photos/seed/vn-engagement-2/1200/900',
  'https://picsum.photos/seed/vn-engagement-3/900/900',
  'https://picsum.photos/seed/vn-engagement-4/1100/900',
  'https://picsum.photos/seed/vn-engagement-5/900/1100',
]

export default function Engagement() {
  const { t } = useLanguage()
  return (
    <section id="engagement" className="section-padding relative bg-surface overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <FadeIn from="left" x={80} className="lg:col-span-5">
            <p className="eyebrow">{t('engagement.eyebrow')}</p>
            <h2 className="font-display mt-3 text-4xl md:text-6xl">
              {t('engagement.title')}
            </h2>
            <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-line bg-bg/60 px-3.5 py-1.5 text-[11px] tracking-[0.22em] uppercase">
              <Sparkles size={12} className="text-accent" />
              {t('engagement.subtitle')}
            </span>
            <p className="text-muted leading-relaxed mt-6">
              {t('engagement.body')}
            </p>
            <p className="font-script text-3xl text-accent mt-6">
              {t('engagement.date')}
            </p>
          </FadeIn>

          <div className="lg:col-span-7 grid grid-cols-6 gap-3 md:gap-4">
            <FadeIn delay={0.05} className="col-span-3 row-span-2">
              <ParallaxImage
                src={PHOTOS[0]}
                strength={40}
                className="aspect-[3/4] rounded-2xl"
              />
            </FadeIn>
            <FadeIn delay={0.1} className="col-span-3">
              <ParallaxImage
                src={PHOTOS[1]}
                strength={40}
                className="aspect-[4/3] rounded-2xl"
              />
            </FadeIn>
            <FadeIn delay={0.15} className="col-span-3">
              <ParallaxImage
                src={PHOTOS[2]}
                strength={40}
                className="aspect-square rounded-2xl"
              />
            </FadeIn>
            <FadeIn delay={0.2} className="col-span-4">
              <ParallaxImage
                src={PHOTOS[3]}
                strength={40}
                className="aspect-[4/3] rounded-2xl"
              />
            </FadeIn>
            <FadeIn delay={0.25} className="col-span-2">
              <ParallaxImage
                src={PHOTOS[4]}
                strength={40}
                className="aspect-[3/4] rounded-2xl"
              />
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  )
}
