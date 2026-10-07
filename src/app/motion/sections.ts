import { MOTION_FILMS, MOTION_SECTIONS } from '@/lib/motion';
import type { MotionFilm } from '@/lib/motion';
import type { ShellItem, ShellSection } from '@/lib/shell-data';

/**
 * The films as the shell's sections, shared by /motion and the package
 * pages under /motion/<slug>, so both routes list the same rows in the
 * same order. Pure data on top of the generated src/lib/motion.ts.
 *
 * Both sections open under Knowledge > Motion in the sidebar (`under`),
 * as the labelled groups of the Motion row's run.
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

/**
 * The sidebar names of the films whose titles are sentences, keyed by film
 * slug (MOTION_PACKAGE_SLUGS and the roster's slugs in src/lib/motion.ts):
 * the title would run past two lines in the 208px list. The title stays
 * the row's hover title, the filter text, the preview title and the book's.
 * The map lives here because src/lib/motion.ts is generated from motion/.
 */
const SIDEBAR_NAME: Readonly<Record<string, string>> = {
  'blog-fuma-nama': 'Fuma Nama',
  'jihe-yuanben': 'Euclid in Chinese',
  'journey-to-the-west': 'Journey to the West in English',
  'modern-hebrew': 'The vocabulary of Modern Hebrew',
};

function filmItem(film: MotionFilm, route: string): ShellItem {
  const base = { id: film.id, n: film.n, title: film.title, short: SIDEBAR_NAME[film.slug], desc: plainSummary(film.summary) };
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
