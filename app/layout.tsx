import './globals.css'; // Ensure your global styles are imported
import React from 'react';
import Script from 'next/script'; // If you use Next.js Script component
import { Toaster } from 'sonner'; // Or your preferred toast library
import { ThemeProvider } from '@/components/theme-provider'; // Adjust path
import { Analytics } from '@vercel/analytics/react'; // If you use Vercel Analytics
import { DeepResearchProvider } from '@/lib/deep-research-context'; // Adjust path
import Navbar from '@/components/navbar'; // Your global Navbar
// DefaultLayout is typically NOT imported here. It's used by individual page files.
// import MainContentWrapper from '@/components/main-content-wrapper'; // We are letting DefaultLayout handle its own content structure
import { SidebarProvider } from '@/context/SidebarContext'; // Adjust path
import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers'; // For Next.js headers

export const metadata: Metadata = {
  metadataBase: new URL('https://extract.chat'), // Replace with your actual URL
  title: 'Your App Title', // Replace with your app title
  description: 'Your app description.', // Replace
  referrer: 'strict-origin-when-cross-origin',
};

export const viewport: Viewport = {
  maximumScale: 1,
};

export default async function RootLayout({
  children, // children will be your page components, often wrapped by DefaultLayout in page.tsx
}: {
  children: React.ReactNode;
}) {
  const hdrs = await headers();
  const nonce = hdrs.get('x-csp-nonce') ?? '';

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Example: Stripe.js script */}
        <Script
          src="https://js.stripe.com/v3/"
          strategy="beforeInteractive"
          nonce={nonce} // If you use CSP nonce
        />
        {/* Add other head elements like favicons, custom fonts etc. */}
      </head>
      <body className="antialiased bg-background text-foreground">
        {' '}
        {/* Base body styling */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system" // Or "light", "dark"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider>
            {' '}
            {/* Sidebar state is available to Navbar and all children */}
            <DeepResearchProvider>
              {' '}
              {/* Assuming this is another global provider */}
              {/* Global Navbar is rendered first and is sticky */}
              <Navbar />
              <Toaster position="top-center" />
              {/*
                The 'children' here will be your page.tsx content.
                If a page uses DefaultLayout, then DefaultLayout will be here,
                and DefaultLayout itself handles the SidebarComponent and its own header/main/footer structure
                relative to the global Navbar.
              */}
              {children}
            </DeepResearchProvider>
          </SidebarProvider>
        </ThemeProvider>
        <Analytics /> {/* If used */}
      </body>
    </html>
  );
}
