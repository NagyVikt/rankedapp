'use client';

import React, { ReactNode } from 'react';
import DefaultLayout from '@/components/sidebar/DefaultLayout';
import { ShopsProvider } from '@/context/shops';

// Cast providers/layout to any to satisfy ReactNode requirements
const ShopsProviderX = ShopsProvider as any;
const DefaultLayoutX = DefaultLayout as any;

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return (
    <ShopsProviderX>
      <DefaultLayoutX>{children}</DefaultLayoutX>
    </ShopsProviderX>
  );
}
