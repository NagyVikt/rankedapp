// File: app/(dashboard)/dashboard/satori/layout.tsx
import React from 'react';
// Ensure this CSS file exists and is correctly named/pathed
import './satori.css'; // Keep this import for CSS

// --- IMPORT THE HANDLER COMPONENT ---
import { SilenceSpecificPromiseRejection } from '@/components/error-handler';

// Metadata specific to this page (optional but good practice)
// Keep metadata export - Next.js handles this correctly
export const metadata = {
    title: 'Satori OG Image Playground',
    description: 'Interactive playground for Vercel Satori OG Image generation.',
};

export default function SatoriPlaygroundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout now returns only the content for this section,
  // which will be placed inside the parent layout's <body>.
  // We use a div as the main container for this layout's content.
  // You can apply necessary styling or classes here.
  return (
    // Apply the body class to this container div instead
    // Use a React.Fragment (<>) if you don't need a wrapper div
    <div className="satori-playground-body h-full w-full"> {/* Example applying class */}
      {/* --- ADD THE HANDLER HERE --- */}
      <SilenceSpecificPromiseRejection />

      {/* The children will be the SatoriClient component rendered by page.tsx */}
      {children}
    </div>
  );
}