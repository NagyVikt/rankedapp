// middleware.ts
import NextAuth from 'next-auth';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { authConfig } from '@/app/(auth)/auth.config'; // Assuming this is used by NextAuth internally
import { signToken, verifyToken } from '@/lib/auth/session'; // Your custom session functions

// This export likely integrates NextAuth's core logic if needed elsewhere or by the framework
export default NextAuth(authConfig).auth;

const protectedRoutes = '/dashboard';

// Helper to safely extract hostname (same as before)
function getHostname(url: string): string | null {
    try {
        const fullUrl = url.startsWith('http://') || url.startsWith('https://')
        ? url
        : `https://${url}`;
        return new URL(fullUrl).hostname;
    } catch (e) {
        console.error(`Invalid URL for hostname extraction: ${url}`, e);
        return null;
    }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session');
  const isProtectedRoute = pathname.startsWith(protectedRoutes);

  // --- 1. Authentication Check ---
  if (isProtectedRoute && !sessionCookie) {
    console.log(`[Middleware] No session cookie, redirecting from protected route: ${pathname}`);
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  // --- 2. Prepare Base Response ---
  // Start with a base response to modify.
  // Important: NextResponse.next() creates the response that will be sent *after* this middleware.
  let res = NextResponse.next();

  // --- 3. Session Refresh Logic ---
  // Only refresh for authenticated users on GET requests to avoid unnecessary processing
  if (sessionCookie && request.method === "GET") {
    try {
      const parsed = await verifyToken(sessionCookie.value);
      // Refresh the token and update the cookie
      const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const newToken = await signToken({
          ...parsed, // Spread existing payload
          expires: expiresInOneDay.toISOString(), // Update expiry within payload if needed
      });

      // Set the refreshed cookie on the response 'res'
      res.cookies.set({
        name: 'session',
        value: newToken,
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development', // Use secure flag in production
        sameSite: 'lax',
        expires: expiresInOneDay,
        path: '/', // Ensure path is set
      });
       console.log(`[Middleware] Session cookie refreshed for path: ${pathname}`);

    } catch (error) {
      // If token verification fails (e.g., expired, invalid)
      console.error('[Middleware] Error verifying/refreshing session token:', error);
      // Delete the invalid cookie from the response
      res.cookies.delete('session');
      // If it was a protected route, redirect to sign-in
      if (isProtectedRoute) {
        console.log(`[Middleware] Invalid session, redirecting from protected route: ${pathname}`);
        // Need to create a *new* redirect response here
        const redirectResponse = NextResponse.redirect(new URL('/sign-in', request.url));
        // Make sure the deletion instruction is on the redirect response too
        redirectResponse.cookies.delete('session');
        return redirectResponse;
      }
      // If not a protected route, just continue the response but without the invalid cookie
       console.log(`[Middleware] Invalid session removed for public route: ${pathname}`);
    }
  }

  // --- 4. Read Dynamic Hostnames ---
  const shopHostnamesCookie = request.cookies.get('shop_hostnames');
  let shopHostnames: string[] = [];
  if (shopHostnamesCookie?.value) {
    try {
      shopHostnames = JSON.parse(shopHostnamesCookie.value);
      if (!Array.isArray(shopHostnames) || !shopHostnames.every(s => typeof s === 'string')) {
         console.warn('[Middleware] Invalid shop_hostnames cookie format:', shopHostnamesCookie.value);
         shopHostnames = [];
      }
    } catch (e) {
      console.error('[Middleware] Failed to parse shop_hostnames cookie:', e);
      shopHostnames = [];
    }
  }

  // --- 5. Construct Dynamic CSP Header ---
  // Combine sources from your next.config.js with dynamic ones
  const imgSrcSources = [
    "'self'", "data:", "blob:",
    "https://i.pravatar.cc",
    "https://stripe-camo.global.ssl.fastly.net",
    "https://d1wqzb5bdbcre6.cloudfront.net",
    "*.stripe.com", // Allows http and https subdomains
    ...shopHostnames.map(hostname => `https://${hostname}`) // Add dynamic sources
  ];

  // Copy other directives from your next.config.js CSP
  const scriptSrcSources = [
    "'self'", "'unsafe-inline'", "'unsafe-eval'", "blob:", "data:", // Added blob: data: based on your config
    "https://js.stripe.com", "https://checkout.stripe.com", "https://js.stripe.network",
    "https://m.stripe.network", "https://hcaptcha.com", "*.hcaptcha.com",
    "https://va.vercel-scripts.com", "https://editor.unlayer.com"
  ];
  const styleSrcSources = [
    "'self'", "'unsafe-inline'",
    "https://js.stripe.com", "https://checkout.stripe.com", "https://js.stripe.network",
    "https://m.stripe.network", "https://hcaptcha.com", "*.hcaptcha.com",
    "https://editor.unlayer.com"
  ];
  const connectSrcSources = [
    "'self'",
    "https://api.stripe.com", "https://checkout.stripe.com", "https://js.stripe.network",
    "https://m.stripe.network", "https://hcaptcha.com", "*.hcaptcha.com",
    "https://va.vercel-scripts.com", "https://api.iconify.design",
    "https://api.unisvg.com", "https://api.simplesvg.com",
    // Conditionally add localhost if needed during development
    process.env.NODE_ENV === 'development' ? 'http://localhost:5001' : null,
  ].filter(Boolean) as string[]; // Filter out nulls
  const frameSrcSources = [
    "'self'",
    "https://js.stripe.com", "https://checkout.stripe.com", "https://js.stripe.network",
    "https://m.stripe.network", "https://hcaptcha.com", "*.hcaptcha.com",
    "https://editor.unlayer.com"
  ];

  const cspHeader = `
    default-src 'self';
    img-src ${imgSrcSources.join(" ")};
    script-src ${scriptSrcSources.join(" ")};
    style-src ${styleSrcSources.join(" ")};
    connect-src ${connectSrcSources.join(" ")};
    frame-src ${frameSrcSources.join(" ")};
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'self';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim();

  // --- 6. Set Dynamic CSP Header on the Response ---
  res.headers.set('Content-Security-Policy', cspHeader);

  // --- 7. Set Other Security Headers on the Response ---
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  res.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  res.headers.set('X-Frame-Options', 'SAMEORIGIN'); // Changed to SAMEORIGIN, adjust if DENY is needed
  res.headers.set('X-XSS-Protection', '1; mode=block');
  // res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()'); // Keep if needed

   console.log(`[Middleware] Applied dynamic CSP for path: ${pathname}`);

  // --- 8. Return Final Response ---
  return res;
}

// --- Keep your existing Matcher Config ---
export const config = {
  matcher: [
    '/dashboard/:path*',
    // '/', // Commented out - check if you *really* need middleware on public homepage
    // '/:id', // Commented out - check if dynamic public pages need auth/CSP middleware
    '/login', // Keep if you want session refresh logic on login page? Or remove.
    '/register', // Keep if you want session refresh logic on register page? Or remove.
    // '/api/:path*', // Be careful applying middleware to all API routes
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * This negative lookahead is generally recommended for middleware performance
     */
     '/((?!api|_next/static|_next/image|favicon.ico).*)'
  ],
};