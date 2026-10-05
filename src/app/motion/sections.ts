import { MOTION_FILMS, MOTION_SECTIONS } from '@/lib/motion';
import type { MotionFilm } from '@/lib/motion';
import type { ShellItem, ShellSection } from '@/lib/shell-data';

/**
 * The films as the shell's sections, shared by /motion and the package
 * pages under /motion/<slug>, so both routes list the same rows in the
 * same order. Pure data on top of the generated src/lib/motion.ts.
 *
 * Both sections hang under Knowledge > Motion in the sidebar (`under`).
 * Their ids carry a `motion-` prefix so they never match a site map group
 * (a section named `knowledge` would replace that group) and so their fold
 * state, which persists site-wide by group key, belongs to this page.
 *
 * Where a row goes depends on the route. A series film is a link to its
 * package page on every route, and the shell selects it in place on that
 * page. Another film on /motion is selected in place (the book scrolls to
 * its row); on a package page it is a link to its row on /motion, whose
 * shell reads the hash on mount.
 */

/** The text of a summary without its inline markup, for the sidebar filter. */
export function plainSummary(text: string): string {
  return text.replace(/`([^`]+)`/g, '$1').replace(/\*/g, '');
}

function filmItem(film: MotionFilm, route: string): ShellItem {
  const base = { id: film.id, n: film.n, title: film.title, desc: plainSummary(film.summary) };
  if (film.pkg) return { ...base, href: `/motion/${film.slug}` };
  if (route === 'index') return { ...base, inPlace: true };
  return { ...base, href: `/motion#${film.id}` };
}

/** The two sections for a route: `index` for /motion, or the slug of the package page. */
export function motionSections(route: string): readonly ShellSection[] {
  return MOTION_SECTIONS.map((section) => ({
    id: section.id,
    label: section.label,
    under: 'motion',
    items: MOTION_FILMS.filter((film) => film.section === section.id).map((film) => filmItem(film, route)),
  }));
}

/** The film a shell item id names. */
export function filmById(id: string): MotionFilm | undefined {
  return MOTION_FILMS.find((film) => film.id === id);
}
