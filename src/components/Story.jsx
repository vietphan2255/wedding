import { useLanguage } from '../contexts/LanguageContext'
import { useWeddingConfig } from '../contexts/WeddingConfigContext'
import ParallaxFade from './ParallaxFade.jsx'
import ParallaxImage from './ParallaxImage.jsx'

export default function Story() {
  const { t } = useLanguage()
  const { config } = useWeddingConfig()
  const items = config.story

  return (
    <section id="story" className="section-padding relative bg-bg overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <ParallaxFade strength={40} fadeOut={false} className="text-center max-w-2xl mx-auto">
          <p className="eyebrow">{t('story.eyebrow')}</p>
          <h2 className="font-display mt-3 text-4xl md:text-6xl">
            {t('story.title')}
          </h2>
          <div className="divider-leaf my-6">
            <span className="font-script text-2xl">v &amp; n</span>
          </div>
          <p className="text-muted leading-relaxed">{t('story.intro')}</p>
        </ParallaxFade>

        <div className="mt-20 relative">
          <div
            aria-hidden
            className="hidden md:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-line"
          />
          <ul className="space-y-20 md:space-y-28">
            {items.map((item, idx) => {
              const isLeft = idx % 2 === 0
              const title = item.title_vi
              const body = item.body_vi
              return (
                <li
                  key={item.id}
                  className="grid md:grid-cols-2 gap-8 md:gap-16 items-center"
                >
                  <ParallaxFade
                    strength={220}
                    direction={isLeft ? 'left' : 'right'}
                    fadeOut={false}
                    className={`${isLeft ? 'md:order-1' : 'md:order-2'} relative`}
                  >
                    <ParallaxImage
                      src={item.img}
                      placeholder={item.placeholder || ''}
                      alt=""
                      strength={50}
                      className="aspect-[4/5] rounded-2xl shadow-xl"
                    />
                    <span
                      aria-hidden
                      className="hidden md:block absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-accent ring-4 ring-bg"
                      style={isLeft ? { right: '-2.1rem' } : { left: '-2.1rem' }}
                    />
                  </ParallaxFade>
                  <ParallaxFade
                    strength={220}
                    direction={isLeft ? 'right' : 'left'}
                    fadeOut={false}
                    className={isLeft ? 'md:order-2' : 'md:order-1'}
                  >
                    <p className="font-script text-4xl text-accent">
                      {item.year}
                    </p>
                    <h3 className="font-display text-3xl md:text-4xl mt-2">
                      {title}
                    </h3>
                    <p className="text-muted leading-relaxed mt-4">
                      {body}
                    </p>
                  </ParallaxFade>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
