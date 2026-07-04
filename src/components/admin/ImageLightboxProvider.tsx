import { createContext, useCallback, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence } from 'framer-motion'
import ImageLightbox from './ImageLightbox'

type OpenImage = (src: string, alt?: string) => void

const ImageLightboxContext = createContext<OpenImage>(() => {})

// Any admin tab can call `useImageLightbox()(url)` to pop the full image in a
// single shared lightbox. The provider lives at the admin shell root so there is
// exactly one instance no matter which tab is active.
export function useImageLightbox(): OpenImage {
  return useContext(ImageLightboxContext)
}

export function ImageLightboxProvider({ children }: { children: ReactNode }) {
  const [img, setImg] = useState<{ src: string; alt?: string } | null>(null)
  const openImage = useCallback<OpenImage>((src, alt) => {
    if (src && src.trim()) setImg({ src: src.trim(), alt })
  }, [])
  const close = useCallback(() => setImg(null), [])

  return (
    <ImageLightboxContext.Provider value={openImage}>
      {children}
      <AnimatePresence>
        {img && <ImageLightbox src={img.src} alt={img.alt} onClose={close} />}
      </AnimatePresence>
    </ImageLightboxContext.Provider>
  )
}
