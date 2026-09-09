import type { ReactNode } from 'react';

import type { ShellShot } from '@/lib/shell-data';

/**
 * The shapes the docs route hands from the server (book.tsx, which reads
 * the files) to the client (DocsShell, which renders the shell). Pure types
 * and URL helpers, so both sides import the same names.
 */

/** The slug of the repository readme, the first document and the /docs index. */
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

/** `/docs` for the readme, `/docs/<slug>` otherwise. */
export function docHref(slug: string): string {
  return slug === README_SLUG ? '/docs' : `/docs/${slug}`;
}

/** The slug a /docs path names, or null when the path is not a docs route. */
export function slugFromPath(pathname: string): string | null {
  const match = /^\/docs(?:\/([a-z0-9-]+))?\/?$/.exec(pathname);
  if (!match) return null;
  return match[1] ?? README_SLUG;
}

/** The window title for a document: `Prototemplate docs`, `The brand, Prototemplate docs`. */
export function docWindowTitle(slug: string, title: string): string {
  return slug === README_SLUG ? 'Prototemplate docs' : `${title}, Prototemplate docs`;
}

/** Where a document's thumbnails live, light and dark. */
export function docShot(slug: string): ShellShot {
  return { light: `/shots/thumb/docs-${slug}.jpg`, dark: `/shots/thumb/docs-${slug}-dark.jpg` };
}
