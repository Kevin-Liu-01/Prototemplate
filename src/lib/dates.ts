/**
 * Calendar days as the site prints them. A day is `YYYY-MM-DD` in the
 * committer's own time zone (src/lib/updated.ts) or in a SKILL.md's
 * frontmatter, so printing one never goes through Date: the server and the
 * client print the same text whatever the reader's zone. The relative hint
 * is the one value that depends on the reader's clock, so it is computed on
 * the client only (BookView.tsx, UpdatedValue).
 */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

const DAY_MS = 86_400_000;

function parts(day: string): [number, number, number] {
  const [y = 1970, m = 1, d = 1] = day.split('-').map(Number);
  return [y, m, d];
}

/** `2026-10-05` as `Oct 5, 2026`. */
export function formatDay(day: string): string {
  const [y, m, d] = parts(day);
  return `${MONTHS[m - 1] ?? ''} ${d}, ${y}`;
}

/** Today in the reader's time zone, `YYYY-MM-DD`. */
export function localDay(now: Date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;
}

/** Whole calendar days from `day` to `today`. */
function daysBetween(day: string, today: string): number {
  const [y1, m1, d1] = parts(day);
  const [y2, m2, d2] = parts(today);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / DAY_MS);
}

/**
 * How long ago `day` was, while that helps a reader: `today`, `yesterday`,
 * `2 days ago` to `13 days ago`, then `2 weeks ago` to `5 weeks ago`. Null
 * from 35 days on, where the date alone says it, and for a day after today
 * (a clock behind the committer's).
 */
export function relativeDay(day: string, today: string): string | null {
  const n = daysBetween(day, today);
  if (n < 0 || n >= 35) return null;
  if (n === 0) return 'today';
  if (n === 1) return 'yesterday';
  if (n < 14) return `${n} days ago`;
  return `${Math.round(n / 7)} weeks ago`;
}
