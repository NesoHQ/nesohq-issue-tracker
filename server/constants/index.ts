/** GitHub OAuth token endpoint */
export const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token'

/** GitHub API user endpoint */
export const GITHUB_USER_URL = 'https://api.github.com/user'

/** Max upload file size in bytes (10MB) */
export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024

/** Allowed image MIME types for uploads */
export const ALLOWED_IMAGE_TYPES = /^image\/(jpeg|png|gif|webp)$/i
