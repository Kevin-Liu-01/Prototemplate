import { DIRECTIONS, getDirection } from '@/lib/directions';
import type { Direction } from '@/lib/directions';
import type { ShellItem, ShellSection } from '@/lib/shell-data';
import { pad2 } from '@/lib/shell-data';

/**
 * The data behind /compare: the two panes, the default pair, the sidebar
 * sections and the hash format. Pure, so the page and the rig share one
 * source and nothing here touches React or the DOM.
 */

/** The two panes. `a` is the left pane and `b` the right one, as the marks in the list read. */
export type PaneKey = 'a' | 'b';

/** Which direction each pane holds, by slug. */
export type Pair = Record<PaneKey, string>;

export const PANE_KEYS: readonly PaneKey[] = ['a', 'b'];

export const OTHER: Record<PaneKey, PaneKey> = { a: 'b', b: 'a' };

/** The seg labels. */
export const PANE_NAME: Record<PaneKey, string> = { a: 'Left', b: 'Right' };

/** The number column mark while a direction is loaded in that pane: the pane's initial, as the seg, the caption and the count name it. */
export const PANE_MARK: Record<PaneKey, string> = { a: 'L', b: 'R' };

export const DEFAULT_PAIR: Pair = {
  a: 'singularity-dossier',
  b: 'singularity-signal',
};

function shotFor(slug: string): ShellItem['shot'] {
  return { light: `/shots/light/${slug}.jpg`, dark: `/shots/dark/${slug}.jpg` };
}

/** `L`, `R`, or `LR` when one direction fills both panes; undefined when it is loaded in neither. */
function paneMark(slug: string, pair: Pair): string | undefined {
  const marks = PANE_KEYS.filter((key) => pair[key] === slug).map((key) => PANE_MARK[key]);
  return marks.length > 0 ? marks.join('') : undefined;
}

/**
 * One sidebar item. The number column shows the pane mark while the
 * direction is loaded, otherwise the direction's place in the count (the
 * sites 01 to 04, the explorations after them), as the gallery numbers them.
 */
function toItem(direction: Direction, pair: Pair, position: number): ShellItem {
  return {
    id: direction.slug,
    n: paneMark(direction.slug, pair) ?? pad2(position + 1),
    title: direction.name,
    href: `/d/${direction.slug}`,
    shot: shotFor(direction.slug),
    desc: direction.reference ? `${direction.concept} Live at generaltranslation.com.` : direction.concept,
  };
}

/**
 * The gallery's two sections in the gallery's order: the three site
 * concepts and the shipped site under Sites, then the explorations in label
 * order (the order DIRECTIONS keeps). Rebuilt on every pair change so the
 * marks move.
 */
export function compareSections(pair: Pair): readonly ShellSection[] {
  const sites = DIRECTIONS.filter((d) => d.site);
  const explorations = DIRECTIONS.filter((d) => !d.site);
  return [
    { id: 'sites', label: 'Sites', items: sites.map((d, i) => toItem(d, pair, i)) },
    {
      id: 'explorations',
      label: 'Explorations',
      items: explorations.map((d, i) => toItem(d, pair, sites.length + i)),
    },
  ];
}

/** `#a=singularity-dossier&b=singularity-signal` */
export function pairHash(pair: Pair): string {
  return `#a=${pair.a}&b=${pair.b}`;
}

/**
 * The pair named by a hash, with a missing or unknown side kept from
 * `fallback`. Null when the hash names neither pane, so the caller can try
 * the shell's own `#<slug>` form.
 */
export function parsePairHash(hash: string, fallback: Pair): Pair | null {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  const a = params.get('a');
  const b = params.get('b');
  if (a === null && b === null) return null;
  return {
    a: a && getDirection(a) ? a : fallback.a,
    b: b && getDirection(b) ? b : fallback.b,
  };
}
