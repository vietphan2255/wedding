import type { ImgHTMLAttributes } from 'react'
import { useImageLightbox } from './ImageLightboxProvider'

// Drop-in <img> replacement for admin previews: clicking the thumbnail opens the
// full image in the shared lightbox. The image is wrapped in a layout-neutral
// (display:contents) <button> so it stays keyboard-accessible without disturbing
// the caller's layout — every native <img> prop (className / style / onError) is
// forwarded to the image unchanged. With no src it renders a plain, static image.
export default function ZoomableImg({
  src,
  alt = '',
  className = '',
  ...rest
}: ImgHTMLAttributes<HTMLImageElement>) {
  const openImage = useImageLightbox()
  const url = typeof src === 'string' ? src.trim() : ''

  const img = (
    <img
      src={src}
      alt={alt}
      className={`${className}${url ? ' cursor-zoom-in' : ''}`}
      {...rest}
    />
  )

  if (!url) return img

  return (
    <button
      type="button"
      onClick={() => openImage(url, alt)}
      title="Click to view full image"
      aria-label={alt ? `View full image: ${alt}` : 'View full image'}
      className="contents"
    >
      {img}
    </button>
  )
}
