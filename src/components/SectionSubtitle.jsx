// Optional line shown directly under a section title. Renders nothing when the
// text is empty, so sections opt in via an admin label override
// (config.labels.vi['<section>.subhead']); the default is an empty string.
export default function SectionSubtitle({ text, className = '' }) {
  if (!text || !text.trim()) return null
  return <p className={`section-subtitle ${className}`.trim()}>{text}</p>
}
