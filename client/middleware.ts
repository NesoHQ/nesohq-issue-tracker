import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ROUTES, STORAGE_KEYS } from '@/lib/constants';

/**
 * Middleware for authentication and route protection
 * Runs before every request to check auth status
 */
export function middleware(request: NextRequest) {
  const token = request.cookies.get(STORAGE_KEYS.TOKEN)?.value?.trim();
  const hasToken = Boolean(token);
  const hasLegacyUserCookie = Boolean(request.cookies.get(STORAGE_KEYS.USER)?.value);
  const pathname = request.nextUrl.pathname;

  // Protected routes - require authentication
  if (pathname.startsWith('/workspace')) {
    if (!hasToken) {
      const response = NextResponse.redirect(
        new URL(`${ROUTES.AUTH_SESSION_RESET}?next=${encodeURIComponent(ROUTES.HOME)}`, request.url)
      );
      response.cookies.set(STORAGE_KEYS.TOKEN, '', { maxAge: 0, path: '/' });
      response.cookies.set(STORAGE_KEYS.USER, '', { maxAge: 0, path: '/' });
      return response;
    }
  }

  // Public routes - redirect to workspace if already authenticated
  if (pathname === ROUTES.HOME && hasToken) {
    return NextResponse.redirect(new URL(ROUTES.WORKSPACE, request.url));
  }

  if (hasLegacyUserCookie) {
    const response = NextResponse.next();
    response.cookies.set(STORAGE_KEYS.USER, '', { maxAge: 0, path: '/' });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (handled separately)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
