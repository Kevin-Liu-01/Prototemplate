'use client';

import { createContext, useContext } from 'react';

import { HOME, type Where } from './coords';

/* Which edition of GT Atlas a page belongs to. The magazine is /atlas: each
   story a magazine on the rack and a magazine feature to read. The shelf is
   the direction before it, kept explorable at /atlas/shelf: each story a
   book on the shelf, read in its own look (the docs reader, Fumadocs' own
   look, the printed book). Links home and between stories stay inside the
   edition they start in. */

export type Edition = 'magazine' | 'shelf';

export const EditionContext = createContext<Edition>('magazine');

/** The General Translation home, where the nameplate's GT leads (ui/HomeMark.tsx). */
export const GT_HOME = '/';

/** Where the front page asks where its reader is (atlas/where): their city and its coordinates, or null. */
export const WHERE = '/atlas/where';

/** The dateline's city until the reader's own is known, and where it stays when it is not: General Translation's home. */
export const HOME_CITY: Where = { city: 'San Francisco', ...HOME };

/** The edition's front page. */
export function homeOf(edition: Edition): string {
  return edition === 'shelf' ? '/atlas/shelf' : '/atlas';
}

/** A story's page in the edition. */
export function storyHref(edition: Edition, slug: string): string {
  return `${homeOf(edition)}/${slug}`;
}

/** The edition this page belongs to. */
export function useEdition(): Edition {
  return useContext(EditionContext);
}
