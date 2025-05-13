// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const EXEMPT_PATHS = [
  '/login',
  '/register',
  '/_next',
  '/favicon.ico',
  '/api/auth',
  '/images/components',
  '/images',
];

function makeNonce() {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return btoa(String.fromCharCode(...arr));
}

export async function middleware(req: NextRequest) {
  const { pathname, hostname } = req.nextUrl;
  const res = NextResponse.next();

  // 1) detect localhost
  const isLocalhost =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '[::1]';

  // 2) Content-Security-Policy (prod only)
  if (!isLocalhost && process.env.NODE_ENV === 'production') {
    const nonce = makeNonce();
    const csp = [
      `default-src 'self'`,
      `script-src 'self' 'nonce-${nonce}' https://js.stripe.com https://checkout.stripe.com https://m.stripe.network https://hcaptcha.com`,
      `style-src  'self' 'nonce-${nonce}' https://js.stripe.com https://checkout.stripe.com https://m.stripe.network`,
      `img-src    'self' data: blob: https://i.pravatar.cc *.stripe.com`,
      `connect-src 'self' https://api.stripe.com https://m.stripe.network https://api.iconify.design https://api.simplesvg.com`,
      `frame-src   'self' https://js.stripe.com https://checkout.stripe.com https://hcaptcha.com`,
      `font-src    'self'`,
      `object-src  'none'`,
      `base-uri    'self'`,
      `form-action 'self'`,
      `frame-ancestors 'self'`,
      `upgrade-insecure-requests`,
    ].join('; ');

    res.headers.set('Content-Security-Policy', csp);
    res.headers.set('x-csp-nonce', nonce);
  }

  // 3) security headers
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  res.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload',
  );
  res.headers.set('X-Frame-Options', 'SAMEORIGIN');
  res.headers.set('X-XSS-Protection', '1; mode=block');

  // 4) skip auth for public/exempt paths
  if (EXEMPT_PATHS.some((p) => pathname.startsWith(p))) {
    console.log(`Exempting path via EXEMPT_PATHS: ${pathname}`); // Optional: for debugging
    return res;
  }

  // 5) Supabase SSR client (with cross-site cookies)
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) =>
          toSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, {
              ...options,
              sameSite: 'none',
              secure: true,
            }),
          ),
      },
    },
  );

  // 6) check session
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }

  // 7) allow the request
  return res;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|login|register|images|.*\\.(?:png|jpg|jpeg|gif|webp|svg|css|js)$).*)',
  ],
};
