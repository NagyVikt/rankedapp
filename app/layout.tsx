// app/layout.tsx
// NO 'use client' directive here - this remains a Server Component

import './globals.css'
import Script from 'next/script'
import { headers } from 'next/headers' // Can use headers() again
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/theme-provider'
import { Analytics } from '@vercel/analytics/react'
import { DeepResearchProvider } from '@/lib/deep-research-context'
import { Navbar } from '@/components/navbar'
import { SidebarProvider } from '@/context/SidebarContext';
import type { Metadata, Viewport } from 'next';
import React from 'react';

// Metadata and Viewport can be exported from a Server Component
export const metadata: Metadata = {
  metadataBase: new URL('https://extract.chat'),
  title: 'Extract Chat - by Firecrawl',
  description:
    'Extract Chat allows you to extract information from any website with the help of an AI chatbot.',
  referrer: 'strict-origin-when-cross-origin',
};

export const viewport: Viewport = {
  maximumScale: 1,
};

// RootLayout is async again to use headers()
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  // Can use headers() again to get nonce
  const hdrs = await headers();
  const nonce = hdrs.get('x-csp-nonce') ?? '';

  // Inline script: keep <meta name="theme-color"> in sync with dark/light mode
  // const themeColorScript = `
  //   (function() {
  //     var html = document.documentElement;
  //     var meta = document.querySelector('meta[name="theme-color"]');
  //     if (!meta) {
  //       meta = document.createElement('meta');
  //       meta.setAttribute('name', 'theme-color');
  //       document.head.appendChild(meta);
  //     }
  //     function updateThemeColor() {
  //       var isDark = html.classList.contains('dark');
  //       meta.setAttribute('content', isDark
  //         ? 'hsl(240deg 10% 3.92%)'
  //         : 'hsl(0 0% 100%)'
  //       );
  //     }
  //     var observer = new MutationObserver(updateThemeColor);
  //     observer.observe(html, { attributes: true, attributeFilter: ['class'] });
  //     updateThemeColor();
  //   })();
  // `;

  // Inline script: patch console.warn/error to suppress CSP & unreachable-code noise
  // const consoleFilterScript = `
  //   (function() {
  //     const origWarn = console.warn.bind(console);
  //     const origError = console.error.bind(console);

  //     console.warn = (...args) => {
  //       const msg = args[0] + '';
  //       if (
  //         msg.includes('Content-Security-Policy') ||
  //         msg.includes('unreachable code after return statement')
  //       ) {
  //         return;
  //       }
  //       origWarn(...args);
  //     };

  //     console.error = (...args) => {
  //       const msg = args[0] + '';
  //       if (msg.includes('Content-Security-Policy')) {
  //         return;
  //       }
  //       origError(...args);
  //     };
  //   })();
  // `;

  // Inline script: Silence specific promise rejection (Revised Again)
  // const silenceRejectionScript = `
  //   (function() { // Wrap in IIFE to avoid polluting global scope
  //     console.log('[Inline Script] Running script to attach rejection handler...');

  //     function handleRejection(event) {
  //       if (
  //         event.reason &&
  //         typeof event.reason === 'object' &&
  //         event.reason.type === 'cancelation' &&
  //         event.reason.msg === 'operation is manually canceled'
  //       ) {
  //         console.log('[Inline Script] MATCHED specific cancellation rejection. Preventing default logging.');
  //         event.preventDefault();
  //         return true;
  //       }
  //       return false;
  //     }

  //     if (!window._rejectionHandlerAttached) {
  //        window.addEventListener('unhandledrejection', handleRejection);
  //        window._rejectionHandlerAttached = true;
  //        console.log('[Inline Script] Attached unhandledrejection listener.');
  //     } else {
  //        console.log('[Inline Script] unhandledrejection listener already attached.');
  //     }

  //   })();
  // `;


  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Console Filter Script (Earliest) */}
        {/*
        <Script
          id="console-filter"
          strategy="beforeInteractive"
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: consoleFilterScript }}
        />
        */}
        {/* Silence Rejection Script (Immediately after console filter) */}
        {/*
        <Script
            id="silence-rejection"
            strategy="beforeInteractive"
            nonce={nonce} // Apply nonce if needed for CSP
            dangerouslySetInnerHTML={{ __html: silenceRejectionScript }}
        />
        */}
        {/* Other head scripts (Stripe, Theme Toggle) */}
        <Script
          src="https://js.stripe.com/v3/"
          strategy="beforeInteractive"
          nonce={nonce}
        />
        {/*
        <Script
          id="theme-color-toggle"
          strategy="beforeInteractive"
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: themeColorScript }}
        />
        */}

      </head>

      <body className="antialiased">
        {/* Render children and providers */}
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider>
            <DeepResearchProvider>
              <Navbar />
              <Toaster position="top-center" />
              {children}
            </DeepResearchProvider>
          </SidebarProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
