import { DIRECTIONS, directionPageHref, directionShots } from '@/lib/directions';
import type { Direction } from '@/lib/directions';
import type { ShellItem, ShellSection } from '@/lib/shell-data';
import { pad2 } from '@/lib/shell-data';

/**
 * The directions as the shell's sections, shared by the gallery and the
 * direction pages so both routes list the same rows in the site map's
 * order (directive 8.10): Shipped holds the reference, Sites the three full
 * site concepts, Explorations the single-page directions in label order.
 * Every item opens the direction's own page (directionPageHref: under
 * /directions, or /d/production for the reference), so a row navigates on
 * every route; the number column counts the paged directions 01 to 17 in
 * this order, so it matches the count and the arrows everywhere.
 */

/** The shipped reference, the three full site concepts, the single-page explorations. */
export const REFERENCE = DIRECTIONS.find((d) => d.reference);
export const SITES: readonly Direction[] = DIRECTIONS.filter((d) => d.site && !d.reference);
export const EXPLORATIONS: readonly Direction[] = DIRECTIONS.filter((d) => !d.site);

/** The count's order: every paged direction in the site map's order (Shipped, Sites, Explorations). */
export const PAGED_DIRECTIONS: readonly Direction[] = [...(REFERENCE ? [REFERENCE] : []), ...SITES, ...EXPLORATIONS];

/** The shipped direction is the live site's home, and every list calls it that (surfaces.ts, the index, the corner); its registry name stays the group's. */
export function directionTitle(d: Direction): string {
  return d.reference ? 'Home' : d.name;
}

export function directionItem(d: Direction): ShellItem {
  const position = PAGED_DIRECTIONS.indexOf(d);
  return {
    id: d.slug,
    n: position >= 0 ? pad2(position + 1) : '',
    title: directionTitle(d),
    href: directionPageHref(d.slug),
    desc: d.reference ? `${d.concept} Live at generaltranslation.com.` : d.concept,
    shot: directionShots(d.slug),
  };
}

/** The three direction groups, in the site map's order; a group with no directions is left out. */
export const DIRECTION_SECTIONS: readonly ShellSection[] = [
  { id: 'shipped', label: 'Shipped', items: REFERENCE ? [directionItem(REFERENCE)] : [] },
  { id: 'sites', label: 'Sites', items: SITES.map(directionItem) },
  { id: 'explorations', label: 'Explorations', items: EXPLORATIONS.map(directionItem) },
].filter((section) => section.items.length > 0);

/** Every direction item by slug, for the frames and the pages that need the row's title and capture. */
export const DIRECTION_ITEMS: ReadonlyMap<string, ShellItem> = new Map(
  DIRECTION_SECTIONS.flatMap((section) => section.items).map((item) => [item.id, item])
);
