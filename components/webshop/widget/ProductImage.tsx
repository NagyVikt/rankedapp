import React from 'react';

export interface ProductImageProps {
  src?: string;
  alt: string;
}

export function ProductImage({ src, alt }: ProductImageProps) {
  if (!src) {
    return <div className="h-10 w-10 bg-gray-200 rounded" />;
  }
  return <img src={src} alt={alt} className="h-10 w-10 object-cover rounded" />;
}
