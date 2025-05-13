// components/gallery.tsx
import React from 'react';
import { galleryPreviewHtml } from '../previews/gallery';

/**
 * This React component simply renders your snippet HTML
 * inside a wrapper.  When Unlayer inserts it into the canvas,
 * it will show exactly the same markup you designed in
 * galleryPreviewHtml.
 */
export default function LinkBlock() {
  return (
    <div
      // dangerouslySetInnerHTML is the easiest way to drop
      // raw HTML + inline styles straight into a React tree.
      dangerouslySetInnerHTML={{ __html: galleryPreviewHtml }}
    />
  );
}
