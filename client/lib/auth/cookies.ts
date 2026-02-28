import { cookies } from 'next/headers';
import { STORAGE_KEYS } from '../constants';
import type { User } from '../types';

/**
 * Server-side cookie utilities for authentication
 * Use these in Server Components and Server Actions
 */

export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(STORAGE_KEYS.TOKEN)?.value ?? null;
}

export async function setAuthToken(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(STORAGE_KEYS.TOKEN, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
  });
}

export async function removeAuthToken(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(STORAGE_KEYS.TOKEN);
}

export async function getUserFromCookie(): Promise<User | null> {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get(STORAGE_KEYS.USER)?.value;

  if (!userCookie) return null;

  try {
    return JSON.parse(userCookie) as User;
  } catch {
    return null;
  }
}

export async function setUserCookie(user: User): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(STORAGE_KEYS.USER, JSON.stringify(user), {
    httpOnly: false, // Accessible from client for UI
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
  });
}

export async function removeUserCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(STORAGE_KEYS.USER);
}
