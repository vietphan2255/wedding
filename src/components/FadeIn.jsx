import { motion } from 'framer-motion'

export default function FadeIn({
  children,
  delay = 0,
  y = 24,
  x = 60,
  from = 'bottom',
  duration = 0.8,
  once = true,
  className = '',
  as = 'div',
}) {
  const MotionTag = motion[as] || motion.div

  const initialX =
    from === 'left' ? -x : from === 'right' ? x : 0
  const initialY =
    from === 'top' ? -y : from === 'bottom' ? y : 0

  return (
    <MotionTag
      initial={{ opacity: 0, x: initialX, y: initialY }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, margin: '-80px' }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </MotionTag>
  )
}
