'use client';

import { createContext, useContext } from 'react';

/* Which edition of GT Atlas a page belongs to. The magazine is /press: each
   story a magazine on the rack and a magazine feature to read. The shelf is
   the direction before it, kept explorable at /press/shelf: each story a
   book on the shelf, read in its own look (the docs reader, Fumadocs' own
   look, the printed book). Links home and between stories stay inside the
   edition they start in. */

export type Edition = 'magazine' | 'shelf';

export const EditionContext = createContext<Edition>('magazine');

/** The edition's front page. */
export function homeOf(edition: Edition): string {
  return edition === 'shelf' ? '/press/shelf' : '/press';
}

/** A story's page in the edition. */
export function storyHref(edition: Edition, slug: string): string {
  return `${homeOf(edition)}/${slug}`;
}

/** The edition this page belongs to. */
export function useEdition(): Edition {
  return useContext(EditionContext);
}
