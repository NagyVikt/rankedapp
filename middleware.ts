import NextAuth from 'next-auth';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { authConfig } from '@/app/(auth)/auth.config';
import { signToken, verifyToken } from '@/lib/auth/session';

export default NextAuth(authConfig).auth;

const protectedRoutes = '/dashboard';


export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session');
  const isProtectedRoute = pathname.startsWith(protectedRoutes);

  if (isProtectedRoute && !sessionCookie) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  let res = NextResponse.next();

  if (sessionCookie && request.method === "GET") {
    try {
      const parsed = await verifyToken(sessionCookie.value);
      const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);

      res.cookies.set({
        name: 'session',
        value: await signToken({
          ...parsed,
          expires: expiresInOneDay.toISOString(),
        }),
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        expires: expiresInOneDay,
      });
    } catch (error) {
      console.error('Error updating session:', error);
      res.cookies.delete('session');
      if (isProtectedRoute) {
        return NextResponse.redirect(new URL('/sign-in', request.url));
      }
    }
  }

  return res;
}


export const config = {
  // match everything under /dashboard (protected), sign-in/register, and any other public pages…
  matcher: [
    '/dashboard/:path*',
    '/',            // home
    '/:id',         // dynamic public pages
    '/login',
    '/register',
    '/api/:path*',  // only if you really need middleware on API routes
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

