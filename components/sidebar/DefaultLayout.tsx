// @ts-nocheck
'use client';

import React, { ReactNode } from 'react';
import SidebarComponent from '@/components/sidebar/SidebarComponent';
import { Icon } from '@iconify/react';
import { Button, Tooltip } from '@heroui/react';
import { useSidebar } from '@/context/SidebarContext';

/**
 * DefaultLayout wraps page content with a sidebar and header/footer.
 * @param disableMarginShift if true, disables content shifting when sidebar opens
 * @param children page content to render
 */
export default function DefaultLayout({
  disableMarginShift = false,
  children,
}: {
  disableMarginShift?: boolean;
  children?: ReactNode;
}) {
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const mainMargin = disableMarginShift
    ? 'md:ml-0'
    : isSidebarOpen
      ? 'md:ml-80'
      : 'md:ml-0';

  return (
    <div className="relative flex min-h-screen bg-background text-foreground">
      {/* Toggle button visible when sidebar is closed */}
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
            <Icon icon="mdi:chevron-double-right" width={22} />
          </Button>
        </Tooltip>
      )}

      {/* Sidebar panel */}
      <aside
        className={`w-80 fixed inset-y-0 left-0 z-40 flex flex-col bg-background border-r border-divider transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-hidden={!isSidebarOpen}
      >
        <SidebarComponent />
      </aside>

      {/* Main content area */}
      <div
        className={`flex flex-col flex-1 transition-all duration-300 ease-in-out ${mainMargin}`}
      >
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 bg-background/80 backdrop-blur border-b border-divider">
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
          <div>{/* User actions / profile here */}</div>
        </header>

        <main className="flex-grow w-full">{children}</main>

        <footer className="w-full flex items-center justify-center py-4 border-t border-divider text-xs text-default-500">
          <p>
            &copy; {new Date().getFullYear()} Your Company. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
