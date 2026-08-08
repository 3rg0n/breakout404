const ALLOWED_REDIRECT_PROTOCOLS = ['http:', 'https:'];

/**
 * A safe base URL used when `window` is not available (e.g. SSR, Node.js
 * tests). The base only matters for resolving *relative* URLs, which are
 * short-circuited before `new URL` is ever called. For absolute URLs the
 * base is irrelevant — only the protocol is checked.
 */
const FALLBACK_BASE_URL = 'http://localhost';

/**
 * Resolve the base URL for `new URL()`, preferring the browser's
 * `window.location.href` when available.
 */
function resolveBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location?.href) {
    return window.location.href;
  }
  return FALLBACK_BASE_URL;
}

/**
 * Validates a redirect URL to prevent open redirect attacks (CWE-601).
 *
 * Only allows:
 * - **Relative paths** starting with `/` (e.g. `/home`, `/products/42`)
 * - **`http:` and `https:`** absolute URLs
 *
 * Rejects dangerous protocols: `javascript:`, `data:`, `vbscript:`,
 * `file:`, `blob:`, etc.
 *
 * This function is **SSR-safe**: when `window` is not available it falls
 * back to a static base URL. Relative paths are handled before `URL` is
 * invoked, so the base URL only affects absolute-URL resolution.
 *
 * @param url     - The URL to validate.
 * @param baseUrl - Optional base URL override (useful for testing).
 * @returns `true` if the URL is safe for client-side redirect.
 */
export function isValidRedirectUrl(url: string, baseUrl?: string): boolean {
  if (url.startsWith('/')) return true;
  try {
    const base = baseUrl ?? resolveBaseUrl();
    const parsed = new URL(url, base);
    return ALLOWED_REDIRECT_PROTOCOLS.includes(parsed.protocol);
  } catch {
    return false;
  }
}
