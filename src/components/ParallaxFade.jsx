import { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'

export default function ParallaxFade({
  children,
  className = '',
  strength = 40,
  as = 'div',
  fadeRange = [0, 0.25, 0.75, 1],
}) {
  const ref = useRef(null)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const opacity = useTransform(scrollYProgress, fadeRange, [0, 1, 1, 0])
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [strength, 0, -strength])

  const MotionTag = motion[as] || motion.div

  if (reduceMotion) {
    const Tag = as
    return <Tag className={className}>{children}</Tag>
  }

  return (
    <MotionTag
      ref={ref}
      style={{ opacity, y, willChange: 'opacity, transform' }}
      className={className}
    >
      {children}
    </MotionTag>
  )
}
