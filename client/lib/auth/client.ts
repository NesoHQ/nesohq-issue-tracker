'use client';

import { apiUrl, fetchJson } from '../http';

interface AuthConfigResponse {
  client_id: string;
  redirect_uri?: string | null;
}

const OAUTH_STATE_KEY = 'github_oauth_state';
const OAUTH_VERIFIER_KEY = 'github_oauth_code_verifier';
const OAUTH_REDIRECT_URI_KEY = 'github_oauth_redirect_uri';

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

    const state = createRandomString(32);
    const codeVerifier = createRandomString(96);
    const codeChallenge = await sha256Base64Url(codeVerifier);
    const redirectUri = resolveRedirectUri(config);

    sessionStorage.setItem(OAUTH_STATE_KEY, state);
    sessionStorage.setItem(OAUTH_VERIFIER_KEY, codeVerifier);
    if (redirectUri) {
      sessionStorage.setItem(OAUTH_REDIRECT_URI_KEY, redirectUri);
    } else {
      sessionStorage.removeItem(OAUTH_REDIRECT_URI_KEY);
    }

    const params = new URLSearchParams({
      client_id: config.client_id,
      scope: 'read:user repo',
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
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
    const expectedState = sessionStorage.getItem(OAUTH_STATE_KEY);
    const codeVerifier = sessionStorage.getItem(OAUTH_VERIFIER_KEY);

    if (!expectedState || !stateFromUrl || expectedState !== stateFromUrl) {
      throw new Error('Invalid OAuth state. Please try again.');
    }
    if (!codeVerifier) {
      throw new Error('Missing OAuth verifier. Please try again.');
    }

    const redirectUri = sessionStorage.getItem(OAUTH_REDIRECT_URI_KEY);

    sessionStorage.removeItem(OAUTH_STATE_KEY);
    sessionStorage.removeItem(OAUTH_VERIFIER_KEY);
    sessionStorage.removeItem(OAUTH_REDIRECT_URI_KEY);

    return { codeVerifier, redirectUri };
  },
};
