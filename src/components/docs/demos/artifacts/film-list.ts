import type { PublishedFilm } from './films';

/** The kit's contact sheet (scripts/build/motion.mjs): 384 by 216 tiles with 3 px gaps, two frames a second from frame 0. */
export const SHEET_TILE = { width: 384, height: 216, gap: 3, perSecond: 2 } as const;

/**
 * The film plates' helpers and the sheet's grid. They live apart from
 * films.ts, which reads the motion registry on the server, so a plate
 * that imports them ships none of the registry.
 */

/** A film's name in the picker and to a screen reader: its title, and its language for a version. */
export function filmName(film: PublishedFilm): string {
  return film.language ? `${film.title} (${film.language})` : film.title;
}

/** The films grouped under their /motion sections, in roster order. */
export function filmGroups(films: readonly PublishedFilm[]): [string, PublishedFilm[]][] {
  const groups = new Map<string, PublishedFilm[]>();
  for (const film of films) groups.set(film.section, [...(groups.get(film.section) ?? []), film]);
  return [...groups.entries()];
}
