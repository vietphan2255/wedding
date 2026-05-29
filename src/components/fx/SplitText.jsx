import { motion, useReducedMotion } from 'framer-motion'

// Splits a string into words, each rising from a clip mask with a stagger when
// the element scrolls into view. Space-split works for both EN and VI.
export default function SplitText({
  text = '',
  as = 'div',
  className = '',
  wordClassName = '',
  stagger = 0.05,
  delay = 0,
  duration = 0.8,
  once = true,
  y = '110%',
}) {
  const reduce = useReducedMotion()
  const MotionTag = motion[as] || motion.div
  const words = String(text).split(/(\s+)/) // keep whitespace tokens

  if (reduce) {
    const Tag = as
    return <Tag className={className}>{text}</Tag>
  }

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-10% 0px' }}
      transition={{ staggerChildren: stagger, delayChildren: delay }}
      aria-label={text}
    >
      {words.map((w, i) =>
        /\s+/.test(w) ? (
          <span key={i} aria-hidden> </span>
        ) : (
          <span
            key={i}
            aria-hidden
            className="inline-block overflow-hidden align-bottom"
            style={{ paddingBottom: '0.15em', marginBottom: '-0.15em' }}
          >
            <motion.span
              className={`inline-block ${wordClassName}`}
              variants={{
                hidden: { y, opacity: 0 },
                visible: {
                  y: '0%',
                  opacity: 1,
                  transition: { duration, ease: [0.22, 1, 0.36, 1] },
                },
              }}
            >
              {w}
            </motion.span>
          </span>
        ),
      )}
    </MotionTag>
  )
}
