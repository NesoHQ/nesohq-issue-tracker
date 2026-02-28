'use server';

/**
 * Server Actions for authentication
 * These run on the server and can be called from Client Components
 */

import { redirect } from 'next/navigation';
import { setAuthToken, setUserCookie, removeAuthToken, removeUserCookie } from '@/lib/auth/cookies';
import { ROUTES } from '@/lib/constants';
import type { AuthExchangeResponse } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Complete OAuth flow by exchanging code for token
 */
export async function completeOAuthExchange(
  code: string,
  codeVerifier: string,
  redirectUri?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const body: any = {
      code,
      code_verifier: codeVerifier,
    };
    
    if (redirectUri) {
      body.redirect_uri = redirectUri;
    }

    const response = await fetch(`${API_URL}/api/auth/exchange`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Authentication failed' }));
      return { success: false, error: error.message };
    }

    const data: AuthExchangeResponse = await response.json();

    // Set server-side cookies
    await setAuthToken(data.access_token);
    await setUserCookie({
      id: data.user.login,
      login: data.user.login,
      name: data.user.name,
      avatar_url: data.user.avatar_url,
    });

    return { success: true };
  } catch (error) {
    console.error('OAuth exchange error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Authentication failed' 
    };
  }
}

/**
 * Sign out user by clearing cookies
 */
export async function signOut() {
  await removeAuthToken();
  await removeUserCookie();
  redirect(ROUTES.HOME);
}
