import { useLanguage } from '../contexts/LanguageContext.jsx'
import FadeIn from './FadeIn.jsx'
import ParallaxImage from './ParallaxImage.jsx'

const ITEMS = [
  { id: 1, img: 'https://picsum.photos/seed/vn-story-1/900/1100' },
  { id: 2, img: 'https://picsum.photos/seed/vn-story-2/900/1100' },
  { id: 3, img: 'https://picsum.photos/seed/vn-story-3/900/1100' },
  { id: 4, img: 'https://picsum.photos/seed/vn-story-4/900/1100' },
]

export default function Story() {
  const { t } = useLanguage()
  return (
    <section id="story" className="section-padding relative bg-bg overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <FadeIn className="text-center max-w-2xl mx-auto">
          <p className="eyebrow">{t('story.eyebrow')}</p>
          <h2 className="font-display mt-3 text-4xl md:text-6xl">
            {t('story.title')}
          </h2>
          <div className="divider-leaf my-6">
            <span className="font-script text-2xl">v &amp; n</span>
          </div>
          <p className="text-muted leading-relaxed">{t('story.intro')}</p>
        </FadeIn>

        <div className="mt-20 relative">
          <div
            aria-hidden
            className="hidden md:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-line"
          />
          <ul className="space-y-20 md:space-y-28">
            {ITEMS.map((item, idx) => {
              const isLeft = idx % 2 === 0
              return (
                <li
                  key={item.id}
                  className="grid md:grid-cols-2 gap-8 md:gap-16 items-center"
                >
                  <FadeIn
                    delay={0.05}
                    y={40}
                    className={`${isLeft ? 'md:order-1' : 'md:order-2'} relative`}
                  >
                    <ParallaxImage
                      src={item.img}
                      alt=""
                      strength={50}
                      className="aspect-[4/5] rounded-2xl shadow-xl"
                    />
                    <span
                      aria-hidden
                      className="hidden md:block absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-accent ring-4 ring-bg"
                      style={isLeft ? { right: '-2.1rem' } : { left: '-2.1rem' }}
                    />
                  </FadeIn>
                  <FadeIn
                    delay={0.15}
                    y={40}
                    className={isLeft ? 'md:order-2' : 'md:order-1'}
                  >
                    <p className="font-script text-4xl text-accent">
                      {t(`story.${item.id}.year`)}
                    </p>
                    <h3 className="font-display text-3xl md:text-4xl mt-2">
                      {t(`story.${item.id}.title`)}
                    </h3>
                    <p className="text-muted leading-relaxed mt-4">
                      {t(`story.${item.id}.body`)}
                    </p>
                  </FadeIn>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
