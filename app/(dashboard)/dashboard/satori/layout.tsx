// File: app/playground/layout.tsx
import React from 'react';
// Ensure this CSS file exists and is correctly named/pathed
import './satori.css';

// --- IMPORT THE HANDLER COMPONENT ---
// Adjust the path based on where you created 'error-handler.tsx'
// Example assumes it's in 'components' at the root of 'app' or 'src'
import { SilenceSpecificPromiseRejection } from '@/components/error-handler';
// Or if it's maybe two levels up from 'app/playground':
// import { SilenceSpecificPromiseRejection } from '../../components/error-handler';


// Metadata specific to this page (optional but good practice)
export const metadata = {
    title: 'Satori OG Image Playground',
    description: 'Interactive playground for Vercel Satori OG Image generation.',
};

export default function SatoriPlaygroundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout provides the minimal HTML structure needed.
  // It applies the full-screen CSS via './satori.css'.
  // It does NOT include components from the root layout (app/layout.tsx).
  return (
    // Add suppressHydrationWarning to handle className/style mismatches
    <html lang="en" className="satori-playground-html" suppressHydrationWarning={true}>
       <head>
         {/* Basic meta tags */}
         <meta charSet="utf-8" />
         <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
         {/* Link to your CSS file - Next.js handles the CSS import */}
       </head>
       {/* Add suppressHydrationWarning here too if body classes might mismatch */}
       <body className="satori-playground-body" suppressHydrationWarning={true}>
         {/* --- ADD THE HANDLER HERE --- */}
         {/* This ensures the silencing logic runs on the playground page */}
         <SilenceSpecificPromiseRejection />

         {/* The children will be the SatoriClient component rendered by page.tsx */}
         {children}
       </body>
    </html>
  );
}