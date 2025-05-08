// File: context/SidebarContext.tsx
'use client'; // Provider needs to be a Client Component to use state and effects

import React, {
  createContext,
  useState,
  useContext,
  useRef,        // Import useRef for timeout management
  useEffect,     // Import useEffect for cleanup
  useMemo,       // Import useMemo for optimization
  ReactNode,
  JSX // Import JSX for return type
} from 'react';

// --- Define Animation Duration ---
// Make sure this duration matches the transition duration in your CSS (e.g., duration-300)
const ANIMATION_DURATION = 300; // milliseconds

// --- Define the Context Type ---
interface SidebarContextType {
  isSidebarOpen: boolean;
  isAnimating: boolean;   // Add the animating state flag
  toggleSidebar: () => void;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>; // Expose setter if needed directly
}

// --- Create the Context ---
// Provide an initial undefined value, error handling is done in the hook
const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

// --- Create the Provider Component ---
// Explicitly define the return type as JSX.Element
export function SidebarProvider({ children }: { children: ReactNode }): JSX.Element {
  // State for sidebar visibility, default to closed
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  // State to track if the sidebar is currently animating
  const [isAnimating, setIsAnimating] = useState(false);
  // Ref to hold the timeout ID for clearing if needed
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- Toggle Function with Animation Handling ---
  const toggleSidebar = () => {
    // Prevent toggling if already animating (optional, but can prevent weird states)
    // if (isAnimating) return;

    // Clear any previous timeout if the button is clicked rapidly
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    setIsAnimating(true); // Set animating flag to true
    setIsSidebarOpen(prev => !prev); // Toggle the actual open/closed state

    // Set a timer to turn off the animating flag after the CSS transition completes
    animationTimeoutRef.current = setTimeout(() => {
      setIsAnimating(false); // Animation finished
      animationTimeoutRef.current = null; // Clear the ref
    }, ANIMATION_DURATION);
  };

  // --- Effect for Cleanup ---
  // Ensures the timeout is cleared if the provider unmounts mid-animation
  useEffect(() => {
    // Return the cleanup function
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []); // Empty dependency array means this runs only once on mount and unmount

  // --- Memoize Context Value ---
  // Prevents unnecessary re-renders of consumers if the value object reference hasn't changed
  const value = useMemo(() => ({
    isSidebarOpen,
    isAnimating, // Include isAnimating in the context value
    toggleSidebar,
    setIsSidebarOpen
  }), [isSidebarOpen, isAnimating, toggleSidebar]); // Add isAnimating and toggleSidebar as a dependency

  // --- Provide the Context ---
  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
}

// --- Custom Hook for Consumption ---
export function useSidebar() {
  const context = useContext(SidebarContext);
  // Ensure the hook is used within the provider
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
