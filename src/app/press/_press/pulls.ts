/* Where each of a story's pull quotes sits (stories.ts, PULLS): pure, so the
   web page (Reader.tsx, BookBody.tsx) and the magazine (riffle/article.ts)
   place them alike. */

import { plain, type Block } from './parse';
import { PULLS, type Pull } from './stories';

/** Where a pull quote may sit, in paragraphs from its source, best first: after it, then before it, never nearer than two. */
const PULL_ORDER = [3, 4, 2, 5, 6, 7, 8, -4, -5, -3, -6, -7, -8];

/**
 * The block each of a story's pull quotes follows: a paragraph of prose in
 * its source's section, never ending in a colon and never beside its source,
 * with prose after it; only where no such place exists, with a figure after
 * it (never a list or a head).
 */
export function placePulls(blocks: Block[], slug: string): Map<number, Pull> {
  const fits = (k: number, next: readonly Block['kind'][]) => {
    const b = blocks[k];
    const after = blocks[k + 1]?.kind;
    return b?.kind === 'para' && after !== undefined && next.includes(after) && !plain(b.inline).trimEnd().endsWith(':');
  };
  const sameSection = (a: number, b: number) => !blocks.slice(Math.min(a, b) + 1, Math.max(a, b) + 1).some((x) => x.kind === 'heading');
  const placed = new Map<number, Pull>();
  for (const pull of PULLS[slug] ?? []) {
    const source = blocks.findIndex((b) => b.kind === 'para' && plain(b.inline).includes(pull.after));
    if (source < 0) continue;
    const near = PULL_ORDER.map((d) => source + d).filter((k) => k >= 0 && sameSection(source, k) && !placed.has(k));
    const at = near.find((k) => fits(k, ['para'])) ?? near.find((k) => fits(k, ['figure']));
    if (at !== undefined) placed.set(at, pull);
  }
  return placed;
}
