/* What the rack's magazines print with, shared by the front pages on the
   rack (ui/Book.tsx) and the magazine view (riffle/pages.ts). */

export const pad = (n: number) => String(n).padStart(2, '0');

/** A page's number in its issue: each issue runs eight pages (riffle/pages.ts), so issue 2's opening, its third page, is 18. */
export const folioOf = (issue: number, page: number) => issue * 8 + page;

/** Whether a stock is dark, by its relative luminance: the scan's folds then print light, and the page takes a hairline edge. */
export function darkStock(hex: string): boolean {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return false;
  const n = parseInt(m[1]!, 16);
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const l = 0.2126 * lin(((n >> 16) & 255) / 255) + 0.7152 * lin(((n >> 8) & 255) / 255) + 0.0722 * lin((n & 255) / 255);
  return l < 0.18;
}

function utc(iso: string | undefined): Date | null {
  const date = iso ? new Date(`${iso}T00:00:00Z`) : null;
  return date && !Number.isNaN(date.getTime()) ? date : null;
}

/** '2026-10-19' as a credit line dates the story: 19 October 2026. */
export function longDate(iso: string | undefined): string {
  return utc(iso)?.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }) ?? '';
}

/** '2026-10-19' as a cover dates its issue: October 2026. */
export function issueMonth(iso: string | undefined): string {
  return utc(iso)?.toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' }) ?? '';
}
