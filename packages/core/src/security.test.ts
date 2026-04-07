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
});
