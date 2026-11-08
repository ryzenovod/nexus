import { describe, expect, it } from 'vitest';
import { safeExternalUrl } from './safeExternalUrl';

describe('safe external link handling', () => {
  it('allows well-formed HTTP and HTTPS store and school links', () => {
    expect(safeExternalUrl('https://example.org/path?a=1')).toBe('https://example.org/path?a=1');
    expect(safeExternalUrl('http://example.org/')).toBe('http://example.org/');
  });

  it('blocks javascript URLs, embedded credentials and non-web schemes', () => {
    for (const entry of [
      'javascript:alert(1)', 'data:text/html,hello', 'file:///etc/passwd',
      'blob:https://example.org/foo', 'https://user:secret@example.org/',
      'mailto:contact@example.org', 'about:blank', '//evil.example',
      'https://example.org/\r\n', '\u0000https://example.org',
    ]) expect(safeExternalUrl(entry)).toBeNull();
  });

  it('rejects empty, relative, oversized and non-string URLs', () => {
    expect(safeExternalUrl('')).toBeNull();
    expect(safeExternalUrl('/relative')).toBeNull();
    expect(safeExternalUrl('https://' + 'a'.repeat(2100) + '.com')).toBeNull();
    expect(safeExternalUrl({ toString: () => 'https://example.org' })).toBeNull();
  });
});
