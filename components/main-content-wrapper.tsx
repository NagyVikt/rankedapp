"use client";

import React from 'react';
import clsx from 'clsx';
import { useSidebar } from '@/context/SidebarContext'; // Adjust path as needed

// Estimate your Navbar's height.
// If your Navbar is, for example, 64px tall (h-16 in Tailwind), use "pt-16".
// If it's 80px (h-20), use "pt-20". Adjust this to match your actual Navbar height.
const NAVBAR_HEIGHT_CLASS = "pt-16"; // Example: for a 64px tall navbar

const MainContentWrapper = ({ children }: { children: React.ReactNode }) => {
  const { isSidebarOpen } = useSidebar();

  // This margin should match the navbar's left offset logic
  // Assumes sidebar width is 64 (16rem, which means left-64 for navbar, ml-64 for content)
  const contentMarginLeft = isSidebarOpen ? "md:ml-12" : "md:ml-0";

  return (
    <main
      className={clsx(
        "flex-1", // Allows the main content to grow and take available vertical space
        NAVBAR_HEIGHT_CLASS, // Adds padding-top for the sticky navbar's height
        "transition-all duration-300 ease-in-out",
        contentMarginLeft, // Shifts content to the right of the sidebar on md+ screens
        "overflow-y-auto", // Ensures the main content area itself can scroll if its content overflows
        "p-4 md:p-6" // General padding for the content area itself (adjust as needed)
      )}
    >
      {children}
    </main>
  );
};

export default MainContentWrapper;