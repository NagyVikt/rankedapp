// File: components/sidebar/DefaultLayout.tsx
'use client';

import React, { ReactNode } from 'react';
import SidebarComponent from '@/components/sidebar/SidebarComponent';
import { Icon } from '@iconify/react';
import { Button, Tooltip } from '@heroui/react';
import { useSidebar } from '@/context/SidebarContext';

interface DefaultLayoutProps {
  children: ReactNode;
}

const SIDEBAR_WIDTH_CLASS = 'w-64';
const ANIMATION_DURATION = 300;

export default function DefaultLayout({ children }: DefaultLayoutProps) {
  const { isSidebarOpen, toggleSidebar } = useSidebar();

  return (
    <div className="relative flex min-h-screen">
      {/* Open button */}
      {!isSidebarOpen && (
        <Tooltip content="Expand sidebar" placement="right">
          <Button
            isIconOnly size="sm" variant="light"
            className="fixed top-4 left-4 z-50 border border-divider bg-background hover:bg-default-100"
            aria-label="Expand sidebar"
            onPress={toggleSidebar}
          >
            <Icon icon="mdi:chevron-double-right" width={18} className="text-default-600" />
          </Button>
        </Tooltip>
      )}

      {/* Sidebar itself */}
      <div
        className={`
          ${SIDEBAR_WIDTH_CLASS} fixed inset-y-0 left-0 z-40
          transform transition-transform duration-${ANIMATION_DURATION} ease-in-out
          bg-background border-r border-divider flex flex-col
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <SidebarComponent />
      </div>

      {/* Main area */}
      <div
        className={`
          flex flex-col flex-1
          transition-all duration-${ANIMATION_DURATION} ease-in-out
          ${isSidebarOpen ? 'md:ml-32' : 'md:ml-0'}
        `}
      >
        <header
          className={`
            sticky top-0 z-20 flex items-center justify-between h-16
            px-6 bg-background/80 backdrop-blur border-b border-divider
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
          <div>{/* right side */}</div>
        </header>

        {/* notice we dropped `container mx-auto` */}
        <main className="w-full flex-grow">
          {children}
        </main>

        <footer className="w-full flex items-center justify-center py-3 border-t border-divider">
          {/* Footer */}
        </footer>
      </div>
    </div>
  );
}
