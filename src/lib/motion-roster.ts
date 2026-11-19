import { KB_FILMS } from '@/lib/kb-films';
import type { KbFilm } from '@/lib/kb-films';
import { MOTION_FILMS, MOTION_SECTIONS } from '@/lib/motion';
import type { MotionFilm } from '@/lib/motion';

/*
 * The films /motion lists: the motion roster (the generated src/lib/motion.ts,
 * from the Videos session's motion/) with its knowledge base section brought
 * level with generaltranslation.com (the generated src/lib/kb-films.ts, from
 * gt-cloud). gt-cloud publishes every knowledge base film on its gt-films
 * Blob store, and since #6044 (2026-11-18) the films there end on the
 * logo. So:
 *
 * - a roster film gt-cloud also publishes plays gt-cloud's film and poster,
 *   and keeps its records (contact sheet, script, credits, captions), which
 *   describe the same cut before the logo was patched;
 * - a film gt-cloud publishes that the roster lacks joins the section after
 *   the roster's own films, in gt-cloud's order, with its title, summary,
 *   running time and captions from gt-cloud;
 * - a roster film gt-cloud does not publish stays as the roster has it.
 *
 * Every film is then numbered again in page order. The module is pure data
 * and runs where MOTION_FILMS was read before.
 */

/** `0:46` from seconds. */
function runtime(seconds: number): string {
  const s = Math.round(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** A gt-cloud film the roster lacks, as a roster row. */
function fromKb(film: KbFilm): MotionFilm {
  return {
    slug: film.slug,
    id: `film-${film.slug}`,
    n: '',
    title: film.title,
    length: `${Math.round(film.duration)} s`,
    runtime: runtime(film.duration),
    status: 'rendered',
    section: 'motion-kb',
    summary: film.summary,
    media: { video: film.video, poster: film.poster },
    captions: film.captions,
  };
}

/**
 * Roster films gt-cloud publishes under a later slug: the same answer, cut
 * again and renamed. The roster film plays gt-cloud's cut, which ends on the
 * logo, and gt-cloud's row is not listed twice.
 */
const RENAMED: Readonly<Record<string, string>> = {
  'kb-translate-tanstack-start-app': 'kb-add-i18n-to-tanstack-start',
};

const KB_BY_SLUG = new Map(KB_FILMS.map((film) => [film.slug, film]));
const ROSTER_SLUGS = new Set(MOTION_FILMS.map((film) => RENAMED[film.slug] ?? film.slug));

/** The roster with gt-cloud's film and poster on each knowledge base film it publishes. */
const ROSTER: readonly MotionFilm[] = MOTION_FILMS.map((film) => {
  const kb = KB_BY_SLUG.get(RENAMED[film.slug] ?? film.slug);
  return kb ? { ...film, media: { video: kb.video, poster: kb.poster } } : film;
});

/** The knowledge base films gt-cloud publishes that the roster lacks, in gt-cloud's order. */
export const KB_ONLY_FILMS: readonly MotionFilm[] = KB_FILMS.filter((film) => !ROSTER_SLUGS.has(film.slug)).map(fromKb);

/** Every film /motion lists, in page order, numbered from 01. */
export const ROSTER_FILMS: readonly MotionFilm[] = MOTION_SECTIONS.flatMap((section) => [
  ...ROSTER.filter((film) => film.section === section.id),
  ...(section.id === 'motion-kb' ? KB_ONLY_FILMS : []),
]).map((film, i) => ({ ...film, n: String(i + 1).padStart(2, '0') }));

const KB_COUNT = ROSTER_FILMS.filter((film) => film.section === 'motion-kb').length;

/** The three sections, the knowledge base's lead saying where its films come from. */
export const ROSTER_SECTIONS: typeof MOTION_SECTIONS = MOTION_SECTIONS.map((section) =>
  section.id === 'motion-kb'
    ? {
        ...section,
        lead: `${KB_COUNT} short films that each answer one question about General Translation. The films generaltranslation.com publishes play from its own store and end on the logo: the roster's films first, then the rest of the site's knowledge base in its order.`,
      }
    : section
);
