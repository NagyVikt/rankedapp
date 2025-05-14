import React from 'react';
import './globals.css'; // You might still need global styles

// You can define metadata specific to the /start route here if needed
// import type { Metadata } from 'next';
// export const metadata: Metadata = {
//   title: 'Start Page',
//   description: 'Welcome to the start page',
// };

export default function StartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // This layout is minimal and does not include the global Navbar
    // or other components from the root layout like ThemeProvider, etc.
    // Only global styles and components defined here will apply.
    <html lang="en">
      <body>
        {/* Render the page content for the /start route */}
        {children}
      </body>
    </html>
  );
}
