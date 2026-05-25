import { useState } from 'react'

export default function BlurImage({
  src,
  placeholder,
  alt = '',
  className = '',
  imgClassName = '',
  loading = 'lazy',
  ...rest
}) {
  const [loaded, setLoaded] = useState(false)
  const hasPlaceholder = Boolean(placeholder)

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {hasPlaceholder && (
        <div
          aria-hidden
          className="absolute inset-0 bg-cover bg-center scale-110"
          style={{
            backgroundImage: `url(${placeholder})`,
            filter: 'blur(20px)',
            opacity: loaded ? 0 : 1,
            transition: 'opacity 500ms ease-out',
          }}
        />
      )}
      <img
        src={src}
        alt={alt}
        loading={loading}
        onLoad={() => setLoaded(true)}
        className={`relative w-full h-full object-cover transition-opacity duration-500 ${
          loaded || !hasPlaceholder ? 'opacity-100' : 'opacity-0'
        } ${imgClassName}`}
        {...rest}
      />
    </div>
  )
}
