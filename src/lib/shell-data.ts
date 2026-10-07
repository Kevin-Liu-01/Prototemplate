/**
 * The shapes every route feeds ViewerShell. Pure types and a few small
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
  /** a short mark at the right end of the item's list row: the pane letter (`L`, `R`, `LR`) on /compare */
  mark?: string;
  title: string;
  /** internal route the item opens, when it is a page rather than a slide */
  href?: string;
  shot?: ShellShot;
  desc?: string;
  /** external address, when the item points off the site */
  url?: string;
  /**
   * The src/lib/surfaces.ts id this item stands for, when it differs from
   * `id`: `docs-design` for the document `design`, `brand-the-mark` for a
   * brand section, `archive-concrete-mono` for an archived version. The
   * preview layer (directive 8.6) resolves a row's capture by this id
   * through previewId(), which falls back to `id`.
   */
  surface?: string;
  /**
   * True for an item the shell selects in place even though it carries an
   * href to another path: the documents on /docs, whose book scrolls and
   * rewrites the address itself. Without it, a sidebar row or grid tile
   * for an item whose href names a path other than the current one is a
   * link and navigates; the shell never scrolls the page for it.
   */
  inPlace?: true;
  /**
   * The row's name in the sidebar when the title is a sentence that would
   * run past two lines in a run: `Fuma Nama` for the film `Fuma Nama, the
   * philosophy of an open-sourcerer`. The title stays the grid caption, the
   * preview title, the filter text and the row's hover title.
   */
  short?: string;
};

export type ShellSection = {
  id: string;
  label: string;
  items: readonly ShellItem[];
  /**
   * False for a section whose items can be selected but are not part of the
   * paged sequence: the gallery's archive rows. Such items are left out of
   * the count, the progress line and step(); a paged route counts the rest.
   */
  paged?: false;
  /**
   * The surfaces.ts id of the page row this section opens under in the
   * sidebar, on the page's own routes: `brand`, `docs`, `marks`,
   * `graphics`, `motion`, `skills`. A section whose id is a site map
   * group's name (`documents`) takes that group's rows with it, and the
   * group leaves the top level on that route. A section without it stands
   * at the top level, replacing the site map group of its own name.
   */
  under?: string;
  /** The section's label in a run when the label is a sentence: `Fuma Nama` for that post's graphics. The grid keeps `label`. */
  short?: string;
};

/**
 * A heading the sidebar hangs under the active item of a run: an h3 of the
 * brand section being read, a heading of the open document, a section of a
 * film's package. A link to its place; the route answers its plain click.
 */
export type ShellSubRow = {
  id: string;
  title: string;
  /** the place's address, `/brand#personality`, so a modified click opens it */
  href: string;
  /** the heading being read */
  active: boolean;
  onSelect: () => void;
};

/** Stage modes. A route offers a subset; the first offered is its default. */
export type ShellMode = 'slide' | 'grid' | 'book';

/** The one order the mode segmented control keeps on every route. */
export const MODE_ORDER: readonly ShellMode[] = ['slide', 'grid', 'book'];

/** Key table: paged routes take the arrows and Space; flow routes let them scroll. */
export type ShellKeys = 'paged' | 'flow';

/** A route's key table, fixed or decided by the current mode (the gallery pages only while the slide is up). */
export type ShellKeysProp = ShellKeys | ((mode: ShellMode) => ShellKeys);

/** The mark in the sidebar head and the toolbar brand. */
export type ShellMark = 'gt' | 'pt';

/** The sidebar item renderer for the route's own items: captured images, or frameless rows. */
export type ShellThumb = 'shot' | 'row';

/** The sidebar density: an outline of rows, or the strip of 16:9 frames. */
export type ShellDensity = 'outline' | 'thumbs';

/** Every item across sections, in reading order. */
export function flattenShellItems(sections: readonly ShellSection[]): readonly ShellItem[] {
  return sections.flatMap((section) => section.items);
}

/** The items the count and the arrows run over: every item of every paged section. */
export function pagedShellItems(sections: readonly ShellSection[]): readonly ShellItem[] {
  return sections.filter((section) => section.paged !== false).flatMap((section) => section.items);
}

/** The key table a route resolves to for a mode. */
export function resolveShellKeys(keys: ShellKeysProp, mode: ShellMode): ShellKeys {
  return typeof keys === 'function' ? keys(mode) : keys;
}

/** The surfaces.ts id an item previews under: its own `surface`, or its id. Written to data-preview. */
export function previewId(item: ShellItem): string {
  return item.surface ?? item.id;
}

/** `1` becomes `01`; `52` stays `52`. Used for counts, thumbs and pages. */
export function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/** The longest a lead runs before the rest becomes the note: about three lines of the lead measure. */
export const LEAD_MAX = 200;

/** A note longer than this leaves the head and becomes the book's last section. */
export const NOTE_MAX = 600;

/** A sentence ends at . ! or ? before a space and a capital, a quote or a parenthesis. */
const SENTENCE_END = /(?<=[.!?])\s+(?=[A-Z“"(])/;

/**
 * Splits a plain-text lead at a sentence end: whole sentences up to `max`
 * characters (LEAD_MAX) stay (always at least one); the rest is the note.
 * A `max` of 0 keeps the first sentence alone.
 */
export function splitLead(text: string, max: number = LEAD_MAX): { lead: string; note: string | null } {
  const sentences = text.trim().split(SENTENCE_END);
  let lead = sentences[0] ?? '';
  let i = 1;
  while (i < sentences.length && lead.length + 1 + sentences[i].length <= max) {
    lead += ` ${sentences[i]}`;
    i += 1;
  }
  const rest = sentences.slice(i).join(' ');
  return { lead, note: rest.length > 0 ? rest : null };
}
