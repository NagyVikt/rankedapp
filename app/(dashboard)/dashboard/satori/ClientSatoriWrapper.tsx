// File: app/(dashboard)/dashboard/satori/ClientSatoriWrapper.tsx
'use client';

import React from 'react';
import { useSidebar } from '@/context/SidebarContext';
import DefaultLayout from '@/components/sidebar/DefaultLayout';

export default function ClientSatoriWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSidebarOpen } = useSidebar();

  return (
    <DefaultLayout>
      <div
        className={`
          satori-playground-html
          satori-playground-body
          transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'md:ml-64' : 'md:ml-0'}
        `}
        suppressHydrationWarning
      >
        {children}
      </div>
    </DefaultLayout>
  );
}
