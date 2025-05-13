'use client';

import React, { ReactNode } from 'react';
import DefaultLayoutOriginal from '@/components/sidebar/DefaultLayout';
import { SilenceSpecificPromiseRejection } from '@/components/error-handler';

// Quick unblock: cast to any-accepting component
const DefaultLayout = DefaultLayoutOriginal as React.ComponentType<any>;

interface SatoriPlaygroundLayoutProps {
  children: ReactNode;
}

export default function SatoriPlaygroundLayout({ children }: SatoriPlaygroundLayoutProps): JSX.Element {
  return (
    <DefaultLayout>
      <SilenceSpecificPromiseRejection />
      <div className="satori-playground-container">{children}</div>
    </DefaultLayout>
  );
}
