// File: app/(dashboard)/dashboard/satori/layout.tsx
import React from 'react';
import './satori.css';
import { SilenceSpecificPromiseRejection } from '@/components/error-handler';
import type { Metadata } from 'next';
import ClientSatoriWrapper from './ClientSatoriWrapper';

export const metadata: Metadata = {
  title: 'Satori OG Image Playground',
  description: 'Interactive playground for Vercel Satori OG Image generation.',
};

export default function SatoriPlaygroundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div suppressHydrationWarning>
      <SilenceSpecificPromiseRejection />
      <ClientSatoriWrapper>{children}</ClientSatoriWrapper>
    </div>
  );
}
