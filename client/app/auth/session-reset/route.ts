import { NextResponse } from 'next/server';
import { ROUTES, STORAGE_KEYS } from '@/lib/constants';

function safeRedirectPath(path: string | null): string {
  if (!path || !path.startsWith('/')) return ROUTES.HOME;
  if (path.startsWith('//')) return ROUTES.HOME;
  return path;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const nextPath = safeRedirectPath(url.searchParams.get('next'));
  const response = NextResponse.redirect(new URL(nextPath, request.url));

  response.cookies.set(STORAGE_KEYS.TOKEN, '', {
    maxAge: 0,
    path: '/',
  });
  response.cookies.set(STORAGE_KEYS.USER, '', {
    maxAge: 0,
    path: '/',
  });

  return response;
}
