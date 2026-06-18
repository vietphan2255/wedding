import { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { useLanguage } from '../contexts/LanguageContext'
import { useWeddingConfig } from '../contexts/WeddingConfigContext'
import ParallaxFade from './ParallaxFade.jsx'
import ParallaxImage from './ParallaxImage.jsx'
import SplitText from './fx/SplitText.jsx'
import Reveal from './fx/Reveal.jsx'

export default function Story() {
  const { t } = useLanguage()
  const { config } = useWeddingConfig()
  const reduce = useReducedMotion()
  const items = config.story
  const timelineRef = useRef(null)

  // Progress line "draws" down the centre as the timeline scrolls through.
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ['start center', 'end center'],
  })
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <section id="story" className="section-padding relative bg-bg overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto">
          <p className="eyebrow">{t('story.eyebrow')}</p>
          <SplitText
            as="h2"
            text={t('story.title')}
            className="font-display mt-3 text-4xl md:text-6xl text-center"
          />
          <div className="divider-leaf my-6">
            <span className="font-script text-2xl">{t('story.divider')}</span>
          </div>
          <p className="text-muted leading-relaxed">{t('story.intro')}</p>
        </div>

        <div ref={timelineRef} className="mt-20 relative">
          {/* Faint track + drawn accent progress line */}
          <div
            aria-hidden
            className="hidden md:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-line"
          />
          <motion.div
            aria-hidden
            style={{ scaleY: reduce ? 1 : lineScale }}
            className="hidden md:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-accent origin-top"
          />
          <ul className="space-y-24 md:space-y-32">
            {items.map((item, idx) => (
              <StoryChapter
                key={item.id}
                item={item}
                idx={idx}
              />
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

function StoryChapter({ item, idx }) {
  const isLeft = idx % 2 === 0
  const title = item.title_vi
  const body = item.body_vi

  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  // Ghost year drifts counter to scroll for depth.
  const ghostY = useTransform(scrollYProgress, [0, 1], [70, -70])

  return (
    <li
      ref={ref}
      className="relative grid md:grid-cols-2 gap-8 md:gap-16 items-center"
    >
      {/* Oversized ghost year numeral */}
      <motion.span
        aria-hidden
        style={{ y: reduce ? 0 : ghostY }}
        className={`ghost-numeral absolute -top-10 md:-top-16 text-[28vw] md:text-[12rem] z-0 ${
          isLeft ? 'right-0 md:right-4' : 'left-0 md:left-4'
        }`}
      >
        {item.year}
      </motion.span>

      {/* Image */}
      <ParallaxFade
        strength={200}
        direction={isLeft ? 'left' : 'right'}
        fadeOut={false}
        className={`${isLeft ? 'md:order-1' : 'md:order-2'} relative z-10`}
      >
        <Reveal className="rounded-2xl">
          <div data-cursor="view">
            <ParallaxImage
              src={item.img}
              placeholder={item.placeholder || ''}
              alt=""
              strength={60}
              className="aspect-[4/5] rounded-2xl shadow-xl"
            />
          </div>
        </Reveal>
        <span
          aria-hidden
          className="hidden md:block absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-accent ring-4 ring-bg z-20"
          style={isLeft ? { right: '-2.1rem' } : { left: '-2.1rem' }}
        />
      </ParallaxFade>

      {/* Text */}
      <div className={`relative z-10 ${isLeft ? 'md:order-2' : 'md:order-1'}`}>
        <Reveal>
          <span className="block font-script text-4xl text-accent">
            {item.year}
          </span>
        </Reveal>
        <Reveal delay={0.05}>
          <span className="block font-display text-3xl md:text-4xl mt-2">
            {title}
          </span>
        </Reveal>
        <SplitText
          as="p"
          text={body}
          className="text-muted leading-relaxed mt-4"
          stagger={0.012}
          duration={0.6}
          y="60%"
        />
      </div>
    </li>
  )
}
