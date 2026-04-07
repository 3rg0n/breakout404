const ALLOWED_REDIRECT_PROTOCOLS = ['http:', 'https:'];

/**
 * Validates a redirect URL to prevent open redirect attacks.
 * Only allows http:, https: protocols and relative paths starting with '/'.
 * Rejects javascript:, data:, vbscript:, file: and other dangerous protocols.
 */
export function isValidRedirectUrl(url: string): boolean {
  if (url.startsWith('/')) return true;
  try {
    const parsed = new URL(url, window.location.href);
    return ALLOWED_REDIRECT_PROTOCOLS.includes(parsed.protocol);
  } catch {
    return false;
  }
}
