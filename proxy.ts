import { type Session } from './lib/auth/types';
import { betterFetch } from '@better-fetch/fetch';
import { type NextRequest, NextResponse } from 'next/server';

export async function proxy(request: NextRequest) {
  const { data: session } = await betterFetch<Session>(
    '/api/auth/get-session',
    {
      baseURL: request.nextUrl.origin,
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
    },
  );

  // Not logged in -> redirect to sign-in with callback URL
  if (!session) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Non-admin accessing /admin routes -> redirect to not-authorized page
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  if (isAdminRoute && session.user?.role !== 'admin') {
    return NextResponse.redirect(new URL('/not-authorized', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard',
    '/admin/:path*',
    '/library',
    '/learn/:path*',
    '/purchases/:path*',
  ],
};
