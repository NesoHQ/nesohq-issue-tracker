'use client';

import { apiUrl, fetchJson } from '../http';
import { OAUTH_CONFIG, STORAGE_KEYS } from '../constants';

interface AuthConfigResponse {
  client_id: string;
  redirect_uri?: string | null;
}

function resolveRedirectUri(config: AuthConfigResponse): string | null {
  return (config.redirect_uri || '').trim() || null;
}

function createRandomString(length = 64): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => charset[byte % charset.length] ?? 'A').join('');
}

async function sha256Base64Url(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  const bytes = new Uint8Array(digest);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export const authService = {
  /**
   * Start GitHub OAuth PKCE flow.
   * Generates state + code verifier, stores them in sessionStorage,
   * then redirects the browser to GitHub's authorization page.
   */
  async initiateGitHubOAuth(): Promise<void> {
    const config = await fetchJson<AuthConfigResponse>(apiUrl('/api/auth/config'));
    if (!config?.client_id) {
      throw new Error('OAuth configuration is missing client_id');
    }

    const state = createRandomString(OAUTH_CONFIG.STATE_LENGTH);
    const codeVerifier = createRandomString(OAUTH_CONFIG.VERIFIER_LENGTH);
    const codeChallenge = await sha256Base64Url(codeVerifier);
    const redirectUri = resolveRedirectUri(config);

    sessionStorage.setItem(STORAGE_KEYS.OAUTH_STATE, state);
    sessionStorage.setItem(STORAGE_KEYS.OAUTH_VERIFIER, codeVerifier);
    if (redirectUri) {
      sessionStorage.setItem(STORAGE_KEYS.OAUTH_REDIRECT_URI, redirectUri);
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.OAUTH_REDIRECT_URI);
    }

    const params = new URLSearchParams({
      client_id: config.client_id,
      scope: OAUTH_CONFIG.SCOPE,
      state,
      code_challenge: codeChallenge,
      code_challenge_method: OAUTH_CONFIG.CHALLENGE_METHOD,
      allow_signup: 'true',
    });
    if (redirectUri) {
      params.set('redirect_uri', redirectUri);
    }

    window.location.href = `https://github.com/login/oauth/authorize?${params.toString()}`;
  },

  /**
   * Complete GitHub OAuth PKCE flow on the callback page.
   * Validates the state parameter, retrieves the code verifier,
   * clears sessionStorage, and returns the values needed to
   * exchange the code for a token via the server action.
   */
  completeGitHubOAuth(
    _code: string,
    stateFromUrl: string | null
  ): { codeVerifier: string; redirectUri: string | null } {
    const expectedState = sessionStorage.getItem(STORAGE_KEYS.OAUTH_STATE);
    const codeVerifier = sessionStorage.getItem(STORAGE_KEYS.OAUTH_VERIFIER);

    if (!expectedState || !stateFromUrl || expectedState !== stateFromUrl) {
      throw new Error('Invalid OAuth state. Please try again.');
    }
    if (!codeVerifier) {
      throw new Error('Missing OAuth verifier. Please try again.');
    }

    const redirectUri = sessionStorage.getItem(STORAGE_KEYS.OAUTH_REDIRECT_URI);

    sessionStorage.removeItem(STORAGE_KEYS.OAUTH_STATE);
    sessionStorage.removeItem(STORAGE_KEYS.OAUTH_VERIFIER);
    sessionStorage.removeItem(STORAGE_KEYS.OAUTH_REDIRECT_URI);

    return { codeVerifier, redirectUri };
  },
};
