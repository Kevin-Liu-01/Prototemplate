/**
 * The handbook's addresses. The handbook is one section of the docs site,
 * served at /docs/handbook: its own documents under docs/handbook/ and the
 * canon (AGENTS.md, BRAND.md, DESIGN.md and the rest), each page showing
 * its file through fumadocs-mdx's include tag (content/docs/(guide)/handbook).
 * Pure URL helpers; they keep a book argument so a second book can join
 * without changing their callers.
 */

/** The books, by their page id in src/lib/page-names.ts. */
export type BookId = 'handbook';

/** Where each book is served: its readme at the base, a document at `<base>/<slug>`. */
export const BOOK_BASE: Readonly<Record<BookId, string>> = {
  handbook: '/docs/handbook',
};

/** The slug of a book's readme: the first document and the book's index. */
export const README_SLUG = 'readme';

/** `/docs/handbook` for the readme, `/docs/handbook/<slug>` otherwise. */
export function docHref(slug: string, book: BookId = 'handbook'): string {
  const base = BOOK_BASE[book];
  return slug === README_SLUG ? base : `${base}/${slug}`;
}
