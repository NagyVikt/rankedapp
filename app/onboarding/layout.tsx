"use client"; // Added "use client" directive as navigation requires client-side hooks

import React from "react";
import { Poppins, Rubik } from "next/font/google";
import { cn } from "@/lib/utils";
import Navbar from "@/components/starter/Navbar";
import { portfolioConfig } from "@/config/portfolio.config";
import { Button } from "@/components/ui/button"; // Assuming you have a Button component
import { useRouter, usePathname } from "next/navigation"; // Import navigation hooks

const poppins = Poppins({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-poppins",
});
const rubik = Rubik({
  subsets: ["latin"],
  weight: "600",
  variable: "--font-rubik",
});

// Define the order of your pages for sequential navigation within this layout.
// This array should match the hrefs used in your Navbar component's data array
// if this layout is used for those pages.

import { pageOrder } from "@/config/welcomepageorder"; // Hypothetical import


export default function StartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  // Find the current page index based on the defined pageOrder
  const currentIndex = pageOrder.indexOf(pathname);

  // Determine the previous and next page paths
  // Check if currentIndex is valid (-1 means not found in pageOrder)
  const prevPage = currentIndex > 0 ? pageOrder[currentIndex - 1] : null;
  const nextPage = currentIndex !== -1 && currentIndex < pageOrder.length - 1 ? pageOrder[currentIndex + 1] : null;

  // Function to handle navigation
  const handleNavigation = (path: string | null) => {
    if (path) {
      router.push(path);
    }
  };

  // Determine if navigation buttons should be shown within this layout
  // They should only show if the current page is in the defined pageOrder
  const showNavigation = currentIndex !== -1;


  return (
    <>
      <main
        className={cn(
          "flex relative break-words h-dvh min-h-screen items-center justify-between pt-14 pb-4 px-40 max-md:p-4 bg-transparent max-sm:pt-20  [background-size:16px_16px]",
          { "bg-white": "#E6E7EB" }
        )}
      >
        {/* NAVBAR */}
        {/* Assuming the Navbar component is designed to work within this layout */}
        <Navbar />
        {children}
      </main>

      {/* Navigation Buttons */}
      {/* Position these buttons at the bottom of the page, within this layout */}
      {showNavigation && ( // Conditionally render buttons
        <div className="fixed bottom-4 left-0 right-0 flex justify-center gap-8 z-50">
          {/* Previous Button */}
          <Button
            onClick={() => handleNavigation(prevPage)}
            disabled={!prevPage} // Disable if there's no previous page
            className="px-6 py-3 text-lg" // Example styling
          >
            Previous
          </Button>

          {/* Next Button */}
          <Button
            onClick={() => handleNavigation(nextPage)}
            disabled={!nextPage} // Disable if there's no next page
            className="px-6 py-3 text-lg" // Example styling
          >
            Next
          </Button>
        </div>
      )}
    </>
  );
}
