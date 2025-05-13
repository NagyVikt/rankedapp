// ./components/gallery.tsx
import React from 'react'
import { BlockProps } from '../types'
import { galleryPreviewHtml } from '../previews/gallery'

export default function GalleryBlock(props: BlockProps): JSX.Element {
  return (
    <div
      {...props}
      dangerouslySetInnerHTML={{ __html: galleryPreviewHtml }}
    />
  )
}
