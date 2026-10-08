import type { ReactNode } from 'react';

import { PAGE_NAMES } from '@/lib/page-names';
import type { ShellShot } from '@/lib/shell-data';

/**
 * The shapes the docs route hands from the server (book.tsx, which reads
 * the files) to the client (DocsShell, which renders the shell). Pure types
 * and URL helpers, so both sides import the same names. The same shell
 * renders two books: the repository documents at /docs and the handbook
 * (docs/handbook/) at /handbook. Every helper takes the book and defaults
 * to /docs.
 */

/** The books the docs shell renders, by their page id in src/lib/page-names.ts. */
export type BookId = 'docs' | 'handbook';

/** Where each book is served: its readme at the base, a document at `<base>/<slug>`. */
export const BOOK_BASE: Readonly<Record<BookId, string>> = {
  docs: '/docs',
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
 * readme. The body starts with its own h2.
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
  href: string;
  shot: ShellShot;
  /** the prose before the first h2, without the h1 */
  lead: ReactNode | null;
  sections: readonly DocSection[];
};

/** `/docs` for the readme, `/docs/<slug>` otherwise; `/handbook` and `/handbook/<slug>` for the handbook. */
export function docHref(slug: string, book: BookId = 'docs'): string {
  const base = BOOK_BASE[book];
  return slug === README_SLUG ? base : `${base}/${slug}`;
}

/** The slug a path names in the book, or null when the path is not one of the book's routes. */
export function slugFromPath(pathname: string, book: BookId = 'docs'): string | null {
  const base = BOOK_BASE[book];
  if (pathname === base || pathname === `${base}/`) return README_SLUG;
  const match = /^\/([a-z0-9-]+)\/?$/.exec(pathname.startsWith(`${base}/`) ? pathname.slice(base.length) : '');
  return match?.[1] ?? null;
}

/**
 * The window title for a document, written whole (the layout's template
 * would add the site name once more): `Documentation, Prototemplate` on the
 * readme, `The brand, Documentation, Prototemplate` on a document, and
 * `Glossary, Handbook, Prototemplate` in the handbook. DocsShell writes the
 * same text to document.title as the reader moves.
 */
export function docWindowTitle(slug: string, title: string, book: BookId = 'docs'): string {
  const name = `${PAGE_NAMES[book].name}, Prototemplate`;
  return slug === README_SLUG ? name : `${title}, ${name}`;
}

/** Where a document's thumbnails live, light and dark: `docs-<slug>` or `handbook-<slug>` under /shots/thumb. */
export function docShot(slug: string, book: BookId = 'docs'): ShellShot {
  return { light: `/shots/thumb/${book}-${slug}.webp`, dark: `/shots/thumb/${book}-${slug}-dark.webp` };
}
