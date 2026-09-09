/**
 * The shapes every route feeds ViewerShell. Pure types and two small
 * helpers; no React, no DOM, so route data files and server components can
 * import them.
 */

/** Light and dark captures for a ThumbShot or a book page. */
export type ShellShot = { light: string; dark?: string };

export type ShellItem = {
  /** stable id; the hash and the active state track it */
  id: string;
  /** the number column text, already padded (`01`); blank hides it */
  n?: string;
  title: string;
  /** internal route the item opens, when it is a page rather than a slide */
  href?: string;
  shot?: ShellShot;
  desc?: string;
  /** external address, when the item points off the site */
  url?: string;
};

export type ShellSection = {
  id: string;
  label: string;
  items: readonly ShellItem[];
};

/** Stage modes. A route offers a subset; the first offered is its default. */
export type ShellMode = 'slide' | 'grid' | 'book';

/** Key table: paged routes take the arrows and Space; flow routes let them scroll. */
export type ShellKeys = 'paged' | 'flow';

/** The mark in the sidebar head and the toolbar brand. */
export type ShellMark = 'gt' | 'pt';

/** The sidebar item renderer. */
export type ShellThumb = 'mini' | 'shot' | 'row';

/** Every item across sections, in reading order. */
export function flattenShellItems(sections: readonly ShellSection[]): readonly ShellItem[] {
  return sections.flatMap((section) => section.items);
}

/** `1` becomes `01`; `52` stays `52`. Used for counts, thumbs and pages. */
export function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}
