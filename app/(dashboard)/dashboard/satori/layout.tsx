import React from 'react';
import './satori.css'; // Ensure this CSS file exists and is correctly pathed
import { SilenceSpecificPromiseRejection } from '@/components/error-handler'; // Assuming path is correct
import type { Metadata } from 'next';
import ClientSatoriWrapper from './ClientSatoriWrapper'; // Import the Client Wrapper

// Metadata for the Satori playground page
export const metadata: Metadata = {
  title: 'Satori OG Image Playground',
  description: 'Interactive playground for Vercel Satori OG Image generation.',
};

// This is a Server Component layout
export default function SatoriPlaygroundServerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // suppressHydrationWarning might be useful if Satori causes mismatches
    <div suppressHydrationWarning>
      <SilenceSpecificPromiseRejection />
      {/* Wrap children with ClientSatoriWrapper, which will handle DefaultLayout */}
      <ClientSatoriWrapper>{children}</ClientSatoriWrapper>
    </div>
  );
}
