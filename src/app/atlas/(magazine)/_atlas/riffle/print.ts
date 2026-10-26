/* What the rack's magazines print with, shared by the front pages on the
   rack (ui/Book.tsx) and the magazine view (riffle/pages.ts). */

export const pad = (n: number) => String(n).padStart(2, '0');

/** The base path the app is built with: none here, where the routes sit under /atlas themselves; gt-cloud's Atlas app sets /atlas as its base path. */
export const BASE = '';

/** Whether a stock is dark, by its relative luminance: the scan's folds then print light, and the page takes a hairline edge. */
export function darkStock(hex: string): boolean {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return false;
  const n = parseInt(m[1]!, 16);
  const lin = (c: number) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  const l =
    0.2126 * lin(((n >> 16) & 255) / 255) +
    0.7152 * lin(((n >> 8) & 255) / 255) +
    0.0722 * lin((n & 255) / 255);
  return l < 0.18;
}

/** The fewest of a stock's color its pale tint keeps, and how light the tint is (HSL saturation and lightness). */
const PALE_SATURATION = 0.35;
const PALE_LIGHTNESS = 94;

/**
 * A stock's color as the pale tint on the back of its cover: its hue, a
 * little of its saturation, near white. A straight mix of a dark stock into
 * white is grey; this keeps the hue, so a navy cover's back reads blue.
 */
export function paleOf(hex: string): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return `hsl(0 0% ${PALE_LIGHTNESS}%)`;
  const n = parseInt(m[1]!, 16);
  const [r, g, b] = [16, 8, 0].map((shift) => ((n >> shift) & 255) / 255) as [
    number,
    number,
    number,
  ];
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(max + min - 1));
  const h =
    d === 0
      ? 0
      : max === r
        ? ((g - b) / d + 6) % 6
        : max === g
          ? (b - r) / d + 2
          : (r - g) / d + 4;
  return `hsl(${Math.round(h * 60)} ${Math.round(Math.min(s, PALE_SATURATION) * 100)}% ${PALE_LIGHTNESS}%)`;
}

function utc(iso: string | undefined): Date | null {
  const date = iso ? new Date(`${iso}T00:00:00Z`) : null;
  return date && !Number.isNaN(date.getTime()) ? date : null;
}

/** Each locale's two date formats, made once: a formatter is costly to build and the rack prints dates on every render.
    English dates read day, month, year (en-GB); every other locale's read as its own. */
const FORMATS = new Map<string, [Intl.DateTimeFormat, Intl.DateTimeFormat]>();

function formatsOf(locale: string): [Intl.DateTimeFormat, Intl.DateTimeFormat] {
  let made = FORMATS.get(locale);
  if (!made) {
    const tag = locale === 'en' ? 'en-GB' : locale;
    made = [
      new Intl.DateTimeFormat(tag, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      }),
      new Intl.DateTimeFormat(tag, {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      }),
    ];
    FORMATS.set(locale, made);
  }
  return made;
}

/** '2026-10-19' as a credit line dates the story: 19 October 2026 (the input itself where it is not a date). */
export function longDate(iso: string | undefined, locale = 'en'): string {
  const date = utc(iso);
  return date ? formatsOf(locale)[0].format(date) : (iso ?? '');
}

/** The same date held on one line, as a byline prints it. */
export function bylineDate(iso: string, locale = 'en'): string {
  return longDate(iso, locale).replace(/ /g, '\u00a0');
}

/** '2026-10-19' as a cover dates its issue: October 2026. */
export function issueMonth(iso: string | undefined, locale = 'en'): string {
  const date = utc(iso);
  return date ? formatsOf(locale)[1].format(date) : '';
}
