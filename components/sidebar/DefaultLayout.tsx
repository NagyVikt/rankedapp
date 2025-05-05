// File: components/sidebar/DefaultLayout.tsx
'use client';

import React, { useState, useEffect, useRef, ReactNode } from 'react'; // Import useEffect, useRef
import SidebarComponent from '@/components/sidebar/SidebarComponent';
import { Icon } from '@iconify/react';
import { Button, Tooltip } from '@heroui/react';

interface DefaultLayoutProps {
  children: ReactNode;
}

const SIDEBAR_WIDTH_CLASS = 'w-64';
const SIDEBAR_MARGIN_CLASS = 'md:ml-64';
const ANIMATION_DURATION = 300; // Match CSS transition duration in ms

export default function DefaultLayout({ children }: DefaultLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false); // State to track animation
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Ref to store timeout ID

  const toggleSidebar = () => {
    // Clear any existing timeout to prevent conflicts if clicked quickly
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    setIsAnimating(true); // Start animating
    setIsSidebarOpen(prevState => !prevState); // Trigger the state change for CSS transition

    // Set a timeout to mark animation as finished
    animationTimeoutRef.current = setTimeout(() => {
      setIsAnimating(false); // Stop animating
      animationTimeoutRef.current = null; // Clear the ref
    }, ANIMATION_DURATION);
  };

  // Effect for cleaning up the timeout if the component unmounts mid-animation
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []); // Empty dependency array means this runs only on mount and unmount

  return (
    <div className="relative flex min-h-screen">

      {/* --- Button to OPEN sidebar (visible only when closed AND not animating) --- */}
      {!isSidebarOpen && !isAnimating && ( // Check isAnimating state
          <Tooltip content="Expand sidebar" placement="right">
             <Button
                 isIconOnly
                 size="sm"
                 variant="light"
                 className={`
                    fixed top-4 left-4 z-50
                    border border-divider bg-background hover:bg-default-100
                    `} // Removed transition classes, appears instantly when ready
                 aria-label="Expand sidebar"
                 onPress={toggleSidebar}
             >
                 <Icon icon="mdi:chevron-double-right" width={18} className="text-default-600" />
             </Button>
          </Tooltip>
      )}
      {/* --- END: Open Button --- */}


      {/* Sidebar Wrapper - Animation controlled by CSS */}
      <div
        className={`
          ${SIDEBAR_WIDTH_CLASS}
          fixed inset-y-0 left-0 z-40
          transform transition-transform duration-${ANIMATION_DURATION} ease-in-out // Ensure duration matches timeout
          bg-background border-r border-divider
          flex flex-col
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Pass necessary props TO SidebarComponent */}
        <SidebarComponent
          isSidebarOpen={isSidebarOpen}
          isAnimating={isAnimating} // Pass animating state
          toggleSidebar={toggleSidebar}
        />
      </div>

      {/* Main Content Area Wrapper */}
      <div className={`
          flex flex-col flex-1
          transition-all duration-${ANIMATION_DURATION} ease-in-out // Match duration
          pl-16 md:pl-4
          ${isSidebarOpen ? SIDEBAR_MARGIN_CLASS : 'ml-0'}
      `}>
         {/* Header */}
         <header className={`
            sticky top-0 z-20 flex items-center justify-between h-16 px-6
            bg-background/80 backdrop-blur border-b border-divider
         `}>
              {/* Mobile-only Hamburger - Consider adding !isAnimating check here too */}
              {!isSidebarOpen && !isAnimating && (
                <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-md text-default-700 hover:bg-default-100 md:hidden"
                    aria-label="Open sidebar"
                >
                    <Icon icon="mdi:menu" width={24} />
                </button>
              )}
              <div className="flex-1 pl-10 md:pl-0"> {/* Placeholder */} </div>
              <div>{/* Right side content */}</div>
         </header>

         {/* Main Content */}
         <main className="container mx-auto px-6 py-4 flex-grow">
           {children}
         </main>

         {/* Footer */}
         <footer className="w-full flex items-center justify-center py-3 border-t border-divider">
           {/* Footer content */}
         </footer>
      </div>
    </div>
  );
}