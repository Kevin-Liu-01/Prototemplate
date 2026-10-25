import type { MOTION_SECTIONS, MotionFilm } from '@/lib/motion';
import type { ShellItem, ShellSection } from '@/lib/shell-data';

/** One of the three roster sections: its id, label and lead. */
export type MotionSectionInfo = (typeof MOTION_SECTIONS)[number];

/**
 * The films as the shell's sections, shared by /motion and the package
 * pages under /motion/<slug>, so both routes list the same rows in the
 * same order. Pure data on top of the generated src/lib/motion.ts.
 *
 * The three sections (the films, the translation series and the knowledge
 * base) open under Knowledge > Motion in the sidebar (`under`),
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
 *
 * The functions take the roster as arguments and this module imports only
 * types from the generated src/lib/motion.ts, so a client that receives the
 * roster as props never bundles the generated module.
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

/** The three sections for a route: `index` for /motion, or the slug of the package page. */
export function motionSections(
  route: string,
  films: readonly MotionFilm[],
  sections: readonly MotionSectionInfo[]
): readonly ShellSection[] {
  return sections.map((section) => ({
    id: section.id,
    label: section.label,
    under: 'motion',
    items: films.filter((film) => film.section === section.id).map((film) => filmItem(film, route)),
  }));
}

/** The film a shell item id names. */
export function filmById(films: readonly MotionFilm[], id: string): MotionFilm | undefined {
  return films.find((film) => film.id === id);
}
