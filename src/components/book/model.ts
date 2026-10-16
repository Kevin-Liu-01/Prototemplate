import type { ReactNode } from 'react';

import type { ShellShot } from '@/lib/shell-data';

/**
 * The shapes the handbook routes hand from the server (book.tsx, which
 * reads the files) to the client (BookShell, which renders the shell). Pure
 * types and URL helpers, so both sides import the same names. The shell
 * renders one book, the handbook at /handbook: its own documents under
 * docs/handbook/ and the canon (AGENTS.md, BRAND.md, DESIGN.md and the
 * rest). The docs site at /docs is a separate fumadocs app
 * (src/app/docs). The helpers keep a book argument so a second book can
 * join without changing their callers.
 */

/** The books the book shell renders, by their page id in src/lib/page-names.ts. */
export type BookId = 'handbook';

/** Where each book is served: its readme at the base, a document at `<base>/<slug>`. */
export const BOOK_BASE: Readonly<Record<BookId, string>> = {
  handbook: '/handbook',
};

/** The slug of a book's readme: the first document and the book's index. */
export const README_SLUG = 'readme';

/** One heading row: the anchor, the padded number shown in the gutter, the text. */
export type DocHeading = {
  id: string;
  n: string;
  title: string;
};

/**
 * One numbered row of a document. Markdown rows come from an h2 and run to
 * the next h2; craft rows are the build log's sections, appended to the
 * libraries document. The body starts with its own h2.
 */
export type DocSection = DocHeading & {
  kind: 'markdown' | 'craft';
  body: ReactNode;
};

export type DocPage = {
  slug: string;
  /** the padded position in the set, `01` */
  n: string;
  title: string;
  blurb: string;
  /** the repository path, `docs/SHIP-LOOP.md` */
  file: string;
  /** the window title seoRoute gives the document's route (book.tsx), written to document.title as the reader moves */
  windowTitle: string;
  href: string;
  shot: ShellShot;
  /** the prose before the first h2, without the h1 */
  lead: ReactNode | null;
  sections: readonly DocSection[];
};

/** `/handbook` for the readme, `/handbook/<slug>` otherwise. */
export function docHref(slug: string, book: BookId = 'handbook'): string {
  const base = BOOK_BASE[book];
  return slug === README_SLUG ? base : `${base}/${slug}`;
}

/** The slug a path names in the book, or null when the path is not one of the book's routes. */
export function slugFromPath(pathname: string, book: BookId = 'handbook'): string | null {
  const base = BOOK_BASE[book];
  if (pathname === base || pathname === `${base}/`) return README_SLUG;
  const match = /^\/([a-z0-9-]+)\/?$/.exec(pathname.startsWith(`${base}/`) ? pathname.slice(base.length) : '');
  return match?.[1] ?? null;
}

/** Where a document's thumbnails live, light and dark: `handbook-<slug>` under /shots/thumb. */
export function docShot(slug: string, book: BookId = 'handbook'): ShellShot {
  return { light: `/shots/thumb/${book}-${slug}.webp`, dark: `/shots/thumb/${book}-${slug}-dark.webp` };
}
