'use client'; // Keep this if SatoriPlaygroundLayout or its children use client-side features

import React, { ReactNode } from 'react';
// Ensure this CSS file exists and is correctly named/pathed
// This CSS will be applied to the content rendered by this layout and its children.
import './satori.css'; // Assuming this path is correct

// --- IMPORT THE HANDLER COMPONENT ---
// Adjust the path based on where you created 'error-handler.tsx'
import { SilenceSpecificPromiseRejection } from '@/components/error-handler'; // Assuming this path is correct

// --- IMPORT THE DEFAULTLAYOUT ---
// Adjust the path based on where your DefaultLayout.tsx file is located
import DefaultLayout from '@/components/sidebar/DefaultLayout'; // Or the correct path to your DefaultLayout

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
    // Wrap the entire content of SatoriPlaygroundLayout with DefaultLayout
    <DefaultLayout>
      {/* Silence specific promise rejections if needed, placed inside DefaultLayout's children */}
      <SilenceSpecificPromiseRejection />

      {/* Container for the playground content */}
      {/* This div will now be placed within the <main> section of DefaultLayout */}
      <div className="satori-playground-container">
        {children} {/* This is where the actual page content for the Satori playground will go */}
      </div>
    </DefaultLayout>
  );
}
