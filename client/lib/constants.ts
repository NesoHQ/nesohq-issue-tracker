/**
 * Application-wide constants
 * Centralized configuration values
 */

// Storage keys
export const STORAGE_KEYS = {
  USER: 'github_user',
  TOKEN: 'github_access_token',
  OAUTH_STATE: 'github_oauth_state',
  OAUTH_VERIFIER: 'github_oauth_code_verifier',
  OAUTH_REDIRECT_URI: 'github_oauth_redirect_uri',
  ISSUE_DRAFT: 'issue_draft',
} as const;

// API configuration
export const API_CONFIG = {
  GITHUB_API: 'https://api.github.com',
  GITHUB_VERSION: '2022-11-28',
  DEFAULT_PER_PAGE: 30,
  MAX_PER_PAGE: 100,
} as const;

// OAuth configuration
export const OAUTH_CONFIG = {
  SCOPE: 'read:user repo',
  STATE_LENGTH: 32,
  VERIFIER_LENGTH: 96,
  CHALLENGE_METHOD: 'S256',
} as const;

// UI configuration
export const UI_CONFIG = {
  DEBOUNCE_DELAY: 500,
  TOAST_DURATION: 3000,
  MAX_TITLE_LENGTH: 256,
  PR_FETCH_DELAY: 80, // Rate limit friendly
} as const;

// Route paths
export const ROUTES = {
  HOME: '/',
  WORKSPACE: '/workspace',
  AUTH_CALLBACK: '/auth/callback',
  AUTH_SESSION_RESET: '/auth/session-reset',
} as const;

// Feature flags (for gradual rollout)
export const FEATURES = {
  USE_SERVER_ACTIONS: true,
  ENABLE_ANALYTICS: false,
  ENABLE_PWA: false,
} as const;
