'use client';

import React, { ReactNode } from 'react';
import SidebarComponent from '@/components/sidebar/SidebarComponent'; // Assuming this path is correct
import { Icon } from '@iconify/react';
import { Button, Tooltip } from '@heroui/react'; // Assuming this library and path are correct
import { useSidebar } from '@/context/SidebarContext'; // Assuming this path is correct

interface DefaultLayoutProps {
  children: ReactNode;
  disableMarginShift?: boolean; // New optional prop
}

// Define constants for tailwind classes to ensure consistency
const SIDEBAR_WIDTH_CLASS = 'w-64'; // Corresponds to 16rem or 256px
const MAIN_CONTENT_MARGIN_LEFT_CLASS_OPEN = 'md:ml-64'; // Margin for main content when sidebar is open (matches sidebar width on md+)
const MAIN_CONTENT_MARGIN_LEFT_CLASS_CLOSED = 'md:ml-0'; // No margin when sidebar is closed
const TRANSITION_DURATION_CLASS = 'duration-300'; // Tailwind class for 300ms transition

export default function DefaultLayout({ children, disableMarginShift = false }: DefaultLayoutProps) {
  const { isSidebarOpen, toggleSidebar } = useSidebar();

  // Determine the appropriate margin class based on sidebar state and the new prop
  const mainContentMarginClass = disableMarginShift
    ? MAIN_CONTENT_MARGIN_LEFT_CLASS_CLOSED // If margin shift is disabled, always use the 'closed' margin (md:ml-0)
    : (isSidebarOpen ? MAIN_CONTENT_MARGIN_LEFT_CLASS_OPEN : MAIN_CONTENT_MARGIN_LEFT_CLASS_CLOSED);

  return (
    <div className="relative flex min-h-screen bg-background text-foreground">
      {/* Open/Toggle Button - visible only when sidebar is closed */}
      {!isSidebarOpen && (
        <Tooltip content="Expand sidebar" placement="right">
          <Button
            isIconOnly
            size="sm"
            variant="light"
            className="fixed top-4 left-4 z-50 border border-divider bg-background hover:bg-default-100 text-default-600 rounded-md"
            aria-label="Expand sidebar"
            onPress={toggleSidebar}
          >
            <Icon icon="mdi:chevron-double-right" width={18} />
          </Button>
        </Tooltip>
      )}

      {/* Sidebar */}
      <div
        className={`
          ${SIDEBAR_WIDTH_CLASS}
          fixed inset-y-0 left-0 z-40
          flex flex-col
          bg-background border-r border-divider
          transform transition-transform ${TRANSITION_DURATION_CLASS} ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        aria-hidden={!isSidebarOpen}
      >
        <SidebarComponent />
      </div>

      {/* Main Content Area */}
      <div
        className={`
          flex flex-col flex-1
          transition-all ${TRANSITION_DURATION_CLASS} ease-in-out
          ${mainContentMarginClass} {/* Apply the determined margin class */}
        `}
      >
        {/* Header within the Main Content Area */}
        <header
          className={`
            sticky top-0 z-30 flex items-center justify-between h-16
            px-4 sm:px-6 lg:px-8
            bg-background/80 backdrop-blur border-b border-divider
          `}
        >
          {!isSidebarOpen && (
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md text-default-700 hover:bg-default-100 md:hidden"
              aria-label="Open sidebar"
            >
              <Icon icon="mdi:menu" width={24} />
            </button>
          )}
          <div className="flex-1" />
          <div>{/* User Profile / Actions */}</div>
        </header>

        {/* Page Content */}
        <main className="flex-grow w-full ">
          {children}
        </main>

        {/* Footer within the Main Content Area */}
        <footer className="w-full flex items-center justify-center py-4 border-t border-divider text-xs text-default-500">
          <p>&copy; {new Date().getFullYear()} Your Company. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
