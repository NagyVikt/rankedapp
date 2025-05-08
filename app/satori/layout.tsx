import React, { ReactNode } from 'react';
// Ensure this CSS file exists and is correctly named/pathed
// This CSS will be applied to the content rendered by this layout and its children.
import './satori.css';

// --- IMPORT THE HANDLER COMPONENT ---
// Adjust the path based on where you created 'error-handler.tsx'
import { SilenceSpecificPromiseRejection } from '@/components/error-handler';

// Metadata specific to this layout (optional but good practice)
// This metadata will be merged with metadata from parent layouts.
export const metadata = {
  title: 'Satori OG Image Playground',
  description: 'Interactive playground for Vercel Satori OG Image generation.',
};

// Define a props interface so children is correctly typed
interface SatoriPlaygroundLayoutProps {
  children: ReactNode;
}

// Explicitly annotate return type as JSX.Element
export default function SatoriPlaygroundLayout({ children }: SatoriPlaygroundLayoutProps): JSX.Element {
  return (
    <>
      {/* Silence specific promise rejections if needed */}
      <SilenceSpecificPromiseRejection />

      {/* Container for the playground content */}
      <div className="satori-playground-container">
        {children}
      </div>
    </>
  );
}
