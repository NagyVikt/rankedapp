import React, { ReactNode } from 'react';
import { Navbar } from '@/components/navbar';
import SidebarComponent from '@/components/sidebar/SidebarComponent';

interface DefaultLayoutProps {
  children: ReactNode;
}
/**
 * Wraps pages with a common Navbar + Sidebar shell.
 */
export default function DefaultLayout({ children }: DefaultLayoutProps) {
    return (
      <div className="relative flex flex-col h-screen">
        {/* Body with Sidebar and Main Content */}
        <div className="flex flex-1">
          <SidebarComponent />
          <main className="container mx-auto px-6 flex-grow overflow-auto">
            {children}
          </main>
        </div>
        <footer className="w-full flex items-center justify-center py-3">
          {/* Optional footer content */}
        </footer>
      </div>
    );
  }
  
