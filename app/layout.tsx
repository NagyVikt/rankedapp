// app/layout.tsx
import './globals.css'
import Script from 'next/script'
import { headers } from 'next/headers'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/theme-provider'
import { Analytics } from '@vercel/analytics/react'
import { DeepResearchProvider } from '@/lib/deep-research-context'
import { Navbar } from '@/components/navbar'

export const metadata = {
  metadataBase: new URL('https://extract.chat'),
  title: 'Extract Chat - by Firecrawl',
  description:
    'Extract Chat allows you to extract information from any website with the help of an AI chatbot.',
}

export const viewport = {
  maximumScale: 1, // Disable auto-zoom on mobile Safari
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Grab the per-request CSP nonce so our inline scripts aren’t blocked
  const hdrs = await headers()
  const nonce = hdrs.get('x-csp-nonce') ?? ''

  // Inline script: keep <meta name="theme-color"> in sync with dark/light mode
  const themeColorScript = `
    (function() {
      var html = document.documentElement;
      var meta = document.querySelector('meta[name="theme-color"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'theme-color');
        document.head.appendChild(meta);
      }
      function updateThemeColor() {
        var isDark = html.classList.contains('dark');
        meta.setAttribute('content', isDark
          ? 'hsl(240deg 10% 3.92%)'
          : 'hsl(0 0% 100%)'
        );
      }
      var observer = new MutationObserver(updateThemeColor);
      observer.observe(html, { attributes: true, attributeFilter: ['class'] });
      updateThemeColor();
    })();
  `

  // Inline script: patch console.warn/error to suppress CSP & unreachable-code noise
  const consoleFilterScript = `
    (function() {
      const origWarn = console.warn.bind(console);
      const origError = console.error.bind(console);

      console.warn = (...args) => {
        const msg = args[0] + '';
        if (
          msg.includes('Content-Security-Policy') ||
          msg.includes('unreachable code after return statement')
        ) {
          return;
        }
        origWarn(...args);
      };

      console.error = (...args) => {
        const msg = args[0] + '';
        if (msg.includes('Content-Security-Policy')) {
          return;
        }
        origError(...args);
      };
    })();
  `

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Viewport meta so you don’t need it on every page */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />

        {/*
          0) Patch console at earliest opportunity to drop CSP & unreachable-code warnings
        */}
        <Script
          id="console-filter"
          strategy="beforeInteractive"
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: consoleFilterScript }}
        />

        {/*
          1) Load Stripe.js as an external script, with our per-request nonce
        */}
        <Script
          src="https://js.stripe.com/v3/"
          strategy="beforeInteractive"
          nonce={nonce}
        />

        {/*
          2) Our inline theme-color toggler, also carrying the same nonce
        */}
        <Script
          id="theme-color-toggle"
          strategy="beforeInteractive"
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: themeColorScript }}
        />
      </head>

      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <DeepResearchProvider>
            <Navbar />
            <Toaster position="top-center" />
            {children}
          </DeepResearchProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
