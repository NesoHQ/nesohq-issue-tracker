import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { STORAGE_KEYS } from '@/lib/constants';

/**
 * Middleware for authentication and route protection
 * Runs before every request to check auth status
 */
export function middleware(request: NextRequest) {
  const token = request.cookies.get(STORAGE_KEYS.TOKEN);
  const pathname = request.nextUrl.pathname;

  // Protected routes - require authentication
  if (pathname.startsWith('/workspace')) {
    if (!token) {
      // Redirect to sign in if not authenticated
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Public routes - redirect to workspace if already authenticated
  if (pathname === '/' && token) {
    return NextResponse.redirect(new URL('/workspace', request.url));
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
