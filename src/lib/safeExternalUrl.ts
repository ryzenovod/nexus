/**
 * Accept only ordinary external web links supplied in user-created tasks, bills and wishlist.
 * Never allow javascript:, data:, file:, blob: or credential-bearing URLs.
 */
export function safeExternalUrl(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  const trimmed = input.trim();
  if (!trimmed || trimmed.length > 2048 || /[\u0000-\u001f\u007f]/.test(input)) return null;
  try {
    const url = new URL(trimmed);
    if (!['https:', 'http:'].includes(url.protocol)) return null;
    if (!url.hostname || url.username || url.password) return null;
    return url.href;
  } catch {
    return null;
  }
}

export function openExternalUrl(input: unknown): boolean {
  const url = safeExternalUrl(input);
  if (!url) return false;
  const opened = window.open(url, '_blank', 'noopener,noreferrer');
  if (opened) opened.opener = null;
  return true;
}
