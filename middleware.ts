// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers'; // For Supabase SSR client

// Define paths/patterns to exclude from authentication checks and header modifications
const PUBLIC_FILE = /\.(.*)$/; // Matches file extensions like .js, .css, .png, etc.
const EXCLUDED_PATHS = [
    '/login',
    '/register',
    '/api', // Exclude all API routes (adjust if some need auth/CSP)
    '/_next', // Next.js internals
    '/favicon.ico',
];

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const requestHeaders = new Headers(req.headers); // Clone headers for potential modification

    // --- 1. Skip Middleware for Excluded Paths & Static Files ---
    if (
        EXCLUDED_PATHS.some(path => pathname.startsWith(path))
    ) {
        console.log(`[Middleware] Skipping checks for public/internal path: ${pathname}`);
        return NextResponse.next({
            request: {
                // Apply basic headers even to skipped paths if desired (optional)
                headers: requestHeaders,
            },
        });
    }

    console.log(`[Middleware] Processing request for path: ${pathname}`);

    // --- 2. Prepare Base Response & Supabase Client ---
    // This response object will be modified and eventually returned.
    // Supabase helpers might add Set-Cookie headers to it.
    const res = NextResponse.next({
        request: {
            headers: requestHeaders, // Pass potentially modified headers along
        },
    });

    // Use next/headers cookies for Supabase SSR client initialization
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                // A dictionary of NamedCookie objects available on the server
                getAll: () =>  cookieStore.getAll(),
                // Function to set cookies on the response
                setAll: (cookiesToSet) =>
                    cookiesToSet.forEach(({ name, value, options }) =>
                        // The `res` object will hold the Set-Cookie headers
                        res.cookies.set(name, value, options)
                    ),
            },
        }
    );

    // --- 3. Authentication Check (Using Supabase) ---
    const {
        data: { session },
        error: sessionError, // Capture potential errors during session fetch
    } = await supabase.auth.getSession();

    if (sessionError) {
        console.error('[Middleware] Error fetching Supabase session:', sessionError);
        // Decide how to handle session fetch errors (e.g., redirect to login or an error page)
        // For now, we'll redirect to login as if there's no session
    }

    if (!session) {
        console.log(`[Middleware] No Supabase session, redirecting to login from: ${pathname}`);
        const loginUrl = req.nextUrl.clone();
        loginUrl.pathname = '/login';
        // Add redirect query param if needed: loginUrl.searchParams.set('redirectedFrom', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // --- User is Authenticated - Proceed with adding headers ---
    console.log(`[Middleware] User authenticated for path: ${pathname}`);

    // --- 4. Read Dynamic Hostnames (From Old Logic) ---
    // Use req.cookies here as cookieStore is server-side for Supabase helpers
    const shopHostnamesCookie = req.cookies.get('shop_hostnames');
    let shopHostnames: string[] = [];
    if (shopHostnamesCookie?.value) {
        try {
            const parsed = JSON.parse(shopHostnamesCookie.value);
            if (Array.isArray(parsed) && parsed.every(s => typeof s === 'string')) {
                shopHostnames = parsed;
            } else {
                console.warn('[Middleware] Invalid shop_hostnames cookie format:', shopHostnamesCookie.value);
            }
        } catch (e) {
            console.error('[Middleware] Failed to parse shop_hostnames cookie:', e);
        }
    }

    // --- 5. Construct Dynamic CSP Header (From Old Logic) ---
    const imgSrcSources = [
        "'self'", "data:", "blob:",
        "https://i.pravatar.cc",
        "https://stripe-camo.global.ssl.fastly.net",
        "https://d1wqzb5bdbcre6.cloudfront.net",
        "*.stripe.com",
        ...shopHostnames.map(hostname => `https://${hostname}`) // Add dynamic sources
    ];
    const scriptSrcSources = [
        "'self'", "'unsafe-inline'", "'unsafe-eval'", "blob:", "data:", // Consider reducing 'unsafe-*' if possible
        "https://js.stripe.com", "https://checkout.stripe.com", "https://js.stripe.network",
        "https://m.stripe.network", "https://hcaptcha.com", "*.hcaptcha.com",
        "https://va.vercel-scripts.com", "https://editor.unlayer.com"
    ];
    const styleSrcSources = [
        "'self'", "'unsafe-inline'", // Consider reducing 'unsafe-inline' if possible
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
        // Add Supabase URLs if needed for client-side interaction (WebSockets, etc.)
        // Example: `wss://${process.env.NEXT_PUBLIC_SUPABASE_URL!.split('//')[1]}`
        process.env.NODE_ENV === 'development' ? 'http://localhost:5001' : null,
    ].filter(Boolean) as string[];
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

    // --- 6. Set Headers on the Response (From Old Logic) ---
    res.headers.set('Content-Security-Policy', cspHeader);
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('Referrer-Policy', 'origin-when-cross-origin');
    res.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    res.headers.set('X-Frame-Options', 'SAMEORIGIN');
    res.headers.set('X-XSS-Protection', '1; mode=block');
    // res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()'); // Uncomment if needed

    console.log(`[Middleware] Applied dynamic CSP and security headers for path: ${pathname}`);

    // --- 7. Return Final Response ---
    // This response includes modifications from Supabase cookie helpers AND our custom headers.
    return res;
}

// --- Matcher Config (Using New Simpler Approach) ---
// This matcher runs the middleware on all paths first.
// The logic inside the middleware function then decides whether to skip further processing.
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * However, the logic *inside* the middleware now handles exclusions
         * more explicitly, including /api, /login, /register, and static file patterns.
         * This broad matcher ensures the middleware *can* run, and the internal logic controls *what* it does.
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};