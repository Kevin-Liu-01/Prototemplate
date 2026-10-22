import type { HTMLAttributes, ReactNode, RefObject } from 'react';

import type { Story } from '../content';
import { useMountEffect } from '../hooks';
import { plain, type Block } from '../parse';
import { PULLS, type Pull } from '../stories';
import Inline from './Inline';

/* The magazine's text decorations, set over each story's own layout in the
   magazine edition (Reader.tsx, magazine.css): each story's headline, the
   mark over each section head and the pull quotes. The drop cap is a class
   on the first paragraph (leadOf, gtm-lead), and each section head and
   pull quote slides in once the reader reaches it (useSlideIn). */

/** The story's first paragraph, which opens on the drop cap. */
export function leadOf(blocks: Block[]): number {
  return blocks.findIndex((b) => b.kind === 'para');
}

/** A paragraph too short to run three lines beside a drop cap, which takes a two-line one (magazine.css, data-short). */
export function isShort(block: Block | undefined): boolean {
  return block?.kind === 'para' && plain(block.inline).length < 120;
}

/**
 * Slides each section head and pull quote in once it is a short way into the
 * window (magazine.css, [data-in]): a small scroll brings the next one in,
 * timed rather than tied to the scroll. Off when `on` is false.
 */
export function useSlideIn(root: RefObject<HTMLElement | null>, on: boolean) {
  useMountEffect(() => {
    const el = root.current;
    if (!on || !el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.in = 'true';
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -12% 0px' }
    );
    el.querySelectorAll<HTMLElement>('.gtm-h2, .gtm-pull').forEach((item) => {
      item.dataset.in = 'false';
      observer.observe(item);
    });
    return () => observer.disconnect();
  });
}

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

/** A pull quote: the words large, with whoever said them under them. A title in *asterisks* turns roman inside the italic. */
export function PullQuote({ pull, ...rest }: { pull: Pull } & HTMLAttributes<HTMLElement>) {
  const parts = pull.text.split('*');
  return (
    <figure className='gtm-pull' {...rest}>
      <blockquote>
        <p>{parts.map((part, k) => (k % 2 ? <em key={k}>{part}</em> : part))}</p>
      </blockquote>
      {pull.by ? <figcaption>{pull.by}</figcaption> : null}
    </figure>
  );
}

/* The mark over each section head, drawn for its story: Euclid's first
   construction (two circles and the triangle they make), a docs page with
   its sidebar and lines of text, two lines of proof with a caret set into
   the second, and Fuma's crescent moon. */
export function Mark({ slug }: { slug: string }) {
  let drawing: ReactNode;
  switch (slug) {
    case 'translating-euclid':
      drawing = (
        <>
          <circle cx='15' cy='22' r='11' />
          <circle cx='27' cy='22' r='11' />
          <path d='M15 22 L27 22 L21 11.6 Z' />
        </>
      );
      break;
    case 'designing-docs-for-humans':
      drawing = (
        <>
          <rect x='5' y='6' width='32' height='30' rx='2' />
          <path d='M13 6 V36' />
          <path d='M18 14 H31 M18 20 H31 M18 26 H26' />
        </>
      );
      break;
    case 'rewriting-our-docs':
      drawing = (
        <>
          <path d='M5 13 H37' />
          <path d='M5 27 H17 M27 27 H37' />
          <path className='gtm-mark-thumb' d='M17 35 L22 24 L27 35' />
        </>
      );
      break;
    default:
      drawing = <path d='M26 6 A15 15 0 1 0 36 31 A12 12 0 1 1 26 6 Z' />;
  }
  return (
    <svg className='gtm-mark' viewBox='0 0 42 42' aria-hidden='true'>
      {drawing}
    </svg>
  );
}

/* Each story's headline in its own hand: as written, with any italics it
   marks; Designing docs with the people it is for in its accent's italics;
   Rewriting docs with a proofreader's caret after "humans" and "and agents"
   set in red as the insertion. A title with a colon gives its first part
   here and the rest to the line under it (subtitleOf). */
export function Headline({ story }: { story: Story }) {
  const main = subtitleOf(story.title)?.[0];
  if (main) return <>{main}</>;
  if (story.slug === 'rewriting-our-docs') {
    const m = /^(.*?)\s+(and agents)$/.exec(story.title);
    if (m) {
      // the caret holds to the word it follows, so the insertion never opens a line on its own
      const before = m[1]!.split(' ');
      const last = before.pop();
      return (
        <>
          {before.join(' ')}{' '}
          <span className='gtm-insert-at'>
            {last}
            <svg className='gtm-caret' viewBox='0 0 24 30' aria-hidden='true'>
              <path d='M3 28 L12 6 L21 28' />
            </svg>
          </span>{' '}
          <em className='gtm-insert'>{m[2]}</em>
        </>
      );
    }
  }
  if (story.slug === 'designing-docs-for-humans') {
    const m = /^(.*)\s+(\S+)$/.exec(story.title);
    if (m)
      return (
        <>
          {m[1]} <em className='gtm-accent'>{m[2]}</em>
        </>
      );
  }
  return <Inline nodes={story.titleInline} />;
}

/** A title with a colon as its headline and the line under it: 'Fuma Nama: The philosophy…' gives both; a title without one, none. */
export function subtitleOf(title: string): [string, string] | null {
  const m = /^(.+?)\s*:\s*(.+)$/.exec(title);
  return m ? [m[1]!, m[2]!] : null;
}
