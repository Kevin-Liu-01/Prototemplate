/**
 * The site's pages by their plain names: the one source for a page's book
 * head title, its window title (the layout's template adds `, Prototemplate`)
 * and its row in the sidebar's Pages and Knowledge groups (surfaces.ts).
 * A name is the page's noun in sentence case (DESIGN.md section 4, The book
 * page). `short` is the sidebar label where the 208px column needs one.
 */

export type PageId =
  | 'gallery'
  | 'brand'
  | 'docs'
  | 'deck'
  | 'present'
  | 'compare'
  | 'skills'
  | 'handbook'
  | 'marks'
  | 'blog'
  | 'graphics'
  | 'motion'
  | 'archive';

export type PageName = { name: string; short?: string };

export const PAGE_NAMES: Readonly<Record<PageId, PageName>> = {
  gallery: { name: 'Gallery' },
  brand: { name: 'Brand' },
  docs: { name: 'Documentation', short: 'Docs' },
  deck: { name: 'Deck' },
  present: { name: 'Presenter' },
  compare: { name: 'Compare' },
  skills: { name: 'Skills' },
  handbook: { name: 'Handbook' },
  marks: { name: 'Marks' },
  blog: { name: 'Blog' },
  graphics: { name: 'Graphics' },
  motion: { name: 'Motion' },
  archive: { name: 'Archive' },
};

/** The sidebar's label for a page: its short form where it has one. */
export function pageLabel(id: PageId): string {
  const page = PAGE_NAMES[id];
  return page.short ?? page.name;
}
