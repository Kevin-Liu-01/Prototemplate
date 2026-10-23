import type { HTMLAttributes, ReactNode, RefObject } from 'react';

import type { Story } from '../content';
import { useMountEffect } from '../hooks';
import { plain, type Block } from '../parse';
import type { Pull } from '../stories';
import Inline from './Inline';

/* The magazine's text decorations, set over each story's own layout in the
   magazine edition (Reader.tsx, magazine.css): each story's headline, the
   mark over each section head and the pull quotes. The drop cap is a class
   on the first paragraph (leadOf, gtm-lead), and pulls.ts places the pull
   quotes; each section head and pull quote slides in as the reader reaches
   it, and the text around them fades in and out with the scroll
   (useSlideIn). */

/** The story's first paragraph, which opens on the drop cap. */
export function leadOf(blocks: Block[]): number {
  return blocks.findIndex((b) => b.kind === 'para');
}

/** A paragraph too short to run three lines beside a drop cap, which takes a two-line one (magazine.css, data-short). */
export function isShort(block: Block | undefined): boolean {
  return block?.kind === 'para' && plain(block.inline).length < 120;
}

/** What fades: each section head and pull quote, and each paragraph, list and quotation of the text. */
const FADES = '.gtm-h2, .gtm-pull, p, ul, ol, blockquote';
/** A paragraph inside one of these goes with it, and a note or a picture beside the text keeps still. */
const HELD = '.gtm-pull, blockquote, ul, ol, figure, aside, header';

/**
 * Fades the text in and out with the scroll (magazine.css, [data-fade]):
 * each section head, pull quote, paragraph, list and quotation comes in as
 * it rises a short way out of the window's foot (the heads and the quotes
 * sliding up as they do) and goes out once it passes under the window's
 * head, timed rather than tied to the scroll, and comes back as the reader
 * scrolls back to it. What is on the screen when the page opens stands, so
 * nothing pops in on arrival. Off when `on` is false.
 */
export function useSlideIn(root: RefObject<HTMLElement | null>, on: boolean) {
  useMountEffect(() => {
    const el = root.current;
    if (!on || !el || typeof IntersectionObserver === 'undefined') return;
    const seen = new WeakSet<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const item = entry.target as HTMLElement;
          const first = !seen.has(item);
          seen.add(item);
          const box = entry.boundingClientRect;
          if (entry.isIntersecting || (first && box.top < innerHeight && box.bottom > 0)) item.dataset.fade = 'in';
          else item.dataset.fade = box.top > (entry.rootBounds?.top ?? 0) ? 'below' : 'above';
        }
      },
      { rootMargin: '-8% 0px -10% 0px' }
    );
    el.querySelectorAll<HTMLElement>(FADES).forEach((item) => {
      const holder = item.parentElement?.closest(HELD);
      if (holder && el.contains(holder)) return;
      observer.observe(item);
    });
    // a jump carries the text past the window without crossing it, so nothing reports: once the scroll stops, what
    // lies above the window is above, and comes back down in place rather than rising from the foot
    const settle = () => {
      el.querySelectorAll<HTMLElement>('[data-fade="below"]').forEach((item) => {
        if (item.getBoundingClientRect().bottom < 0) item.dataset.fade = 'above';
      });
    };
    addEventListener('scrollend', settle);
    return () => {
      observer.disconnect();
      removeEventListener('scrollend', settle);
    };
  });
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
