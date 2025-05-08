'use client';

import React from 'react';
// The useSidebar hook is not strictly necessary here if ClientSatoriWrapper
// itself doesn't directly react to sidebar state for other purposes.
// import { useSidebar } from '@/context/SidebarContext';
import DefaultLayout from '@/components/sidebar/DefaultLayout'; // Ensure this path is correct

export default function ClientSatoriWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  // const { isSidebarOpen } = useSidebar(); // Not needed for controlling DefaultLayout's margin shift via prop

  return (
    // Pass `disableMarginShift={true}` to DefaultLayout.
    // This instructs DefaultLayout to use its 'closed' margin state (md:ml-0)
    // for the main content area, effectively skipping the md:ml-64.
    <DefaultLayout disableMarginShift={true}>
      {/*
        This inner div is for your Satori playground-specific content and styling.
        It should not attempt to manage margins related to the sidebar, as DefaultLayout
        is handling the overall page structure, and we've told it to disable the shift here.
      */}
      <div
        className={`
          satori-playground-html
          satori-playground-body
          transition-all duration-300 ease-in-out
          {/* No conditional margin classes needed here */}
        `}
        suppressHydrationWarning // Useful if Satori content causes hydration warnings
      >
        {children}
      </div>
    </DefaultLayout>
  );
}
