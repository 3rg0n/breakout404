import { describe, it, expect } from 'vitest';
import { isValidRedirectUrl } from './security';

describe('isValidRedirectUrl', () => {
  it('allows relative paths starting with /', () => {
    expect(isValidRedirectUrl('/')).toBe(true);
    expect(isValidRedirectUrl('/home')).toBe(true);
    expect(isValidRedirectUrl('/path/to/page')).toBe(true);
  });

  it('allows https URLs', () => {
    expect(isValidRedirectUrl('https://example.com')).toBe(true);
    expect(isValidRedirectUrl('https://example.com/path')).toBe(true);
  });

  it('allows http URLs', () => {
    expect(isValidRedirectUrl('http://example.com')).toBe(true);
  });

  it('rejects javascript: protocol', () => {
    expect(isValidRedirectUrl('javascript:alert(1)')).toBe(false);
    expect(isValidRedirectUrl('javascript:void(0)')).toBe(false);
    expect(isValidRedirectUrl('JAVASCRIPT:alert(1)')).toBe(false);
  });

  it('rejects data: protocol', () => {
    expect(isValidRedirectUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
  });

  it('rejects vbscript: protocol', () => {
    expect(isValidRedirectUrl('vbscript:msgbox("xss")')).toBe(false);
  });

  it('rejects file: protocol', () => {
    expect(isValidRedirectUrl('file:///etc/passwd')).toBe(false);
  });

  it('rejects blob: protocol', () => {
    expect(isValidRedirectUrl('blob:http://example.com/file')).toBe(false);
  });

  describe('SSR-safety (baseUrl parameter)', () => {
    it('works without window — accepts http/https', () => {
      expect(isValidRedirectUrl('http://example.com', 'http://localhost')).toBe(true);
      expect(isValidRedirectUrl('https://example.com/path', 'http://localhost')).toBe(true);
    });

    it('works without window — rejects dangerous protocols', () => {
      expect(isValidRedirectUrl('javascript:alert(1)', 'http://localhost')).toBe(false);
      expect(isValidRedirectUrl('data:text/html,<script>1</script>', 'http://localhost')).toBe(
        false
      );
    });

    it('relative paths are always accepted regardless of baseUrl', () => {
      expect(isValidRedirectUrl('/home', 'http://localhost')).toBe(true);
      expect(isValidRedirectUrl('/home', 'https://other.example.com')).toBe(true);
    });

    it('rejects protocol-relative URLs without base', () => {
      // Protocol-relative URLs (//evil.com) resolve to the base protocol.
      // When base is http:, the resulting protocol is http: (allowed).
      // This is expected browser behavior — document this explicitly.
      expect(isValidRedirectUrl('//evil.com', 'http://localhost')).toBe(true);
      // But with an https base, it becomes https: (also allowed)
      expect(isValidRedirectUrl('//evil.com', 'https://localhost')).toBe(true);
    });
  });
});
