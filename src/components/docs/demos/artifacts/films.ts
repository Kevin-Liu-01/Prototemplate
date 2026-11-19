import { MOTION_SECTIONS, type MotionCutFields } from '@/lib/motion';
import { KB_ONLY_FILMS, ROSTER_FILMS } from '@/lib/motion-roster';
import { filmNote, previousLogoNote } from '@/lib/previous-mark';

import { SHEET_TILE } from './film-list';

/**
 * The published films as the film plates take them: the fields a player
 * and a contact sheet need and nothing else. ROSTER_FILMS is the list
 * /motion plays (src/lib/motion-roster.ts): the roster scripts/build/motion.mjs
 * writes from public/motion/published.json, with each knowledge base film
 * generaltranslation.com publishes playing gt-cloud's cut, which ends on the
 * logo, and the site's other knowledge base films after them. A roster film
 * counts as published when its cut is pinned and its web copy exists; a
 * film from gt-cloud counts when it has a web copy. A language version (the
 * Slash announcement's German, Spanish and Japanese cuts) is its own entry.
 * A film kept as made that ends on the 11-06 globe says so in its note.
 *
 * The MDX page imports this module and passes PUBLISHED_FILMS to the
 * plates as a prop, so the registry stays on the server and the page
 * ships only these fields.
 */

export type FilmSheet = { src: string; width: number; height: number; frames: number; columns: number; rows: number };

export type PublishedFilm = {
  slug: string;
  title: string;
  /** the section of /motion the film is listed under */
  section: string;
  /** the language of a version, `German`; absent for a base cut */
  language?: string;
  /** the pinned cut's length as its script states it, `55.5 s` */
  length: string;
  video: string;
  poster: string;
  captions?: string;
  captionsLang?: { locale: string; label: string };
  sheet?: FilmSheet;
  /** the note when the cut shows the previous mark or ends on the previous logo (filmNote and previousLogoNote in src/lib/previous-mark.ts) */
  note?: string;
};

function sheetOf(fields: MotionCutFields): FilmSheet | undefined {
  const sheet = fields.sheet;
  if (!sheet?.frames) return undefined;
  const columns = (sheet.width + SHEET_TILE.gap) / (SHEET_TILE.width + SHEET_TILE.gap);
  const rows = (sheet.height + SHEET_TILE.gap) / (SHEET_TILE.height + SHEET_TILE.gap);
  if (!Number.isInteger(columns) || !Number.isInteger(rows)) return undefined;
  return { src: sheet.src, width: sheet.width, height: sheet.height, frames: sheet.frames, columns, rows };
}

/* the films from gt-cloud that the roster lacks: no pinned cut, published by their web copy, with gt-cloud's running time */
const KB_ONLY = new Set(KB_ONLY_FILMS.map((film) => film.slug));

const SECTION_LABEL = new Map(MOTION_SECTIONS.map((section) => [section.id, section.label]));

export const PUBLISHED_FILMS: readonly PublishedFilm[] = ROSTER_FILMS.flatMap((film) => {
  const cuts = [
    { slug: film.slug, fields: film as MotionCutFields, lang: film.language },
    ...(film.versions ?? []).map((version) => ({ slug: version.slug, fields: version as MotionCutFields, lang: version.language })),
  ];
  return cuts.flatMap(({ slug, fields, lang }): PublishedFilm[] => {
    const length = fields.cut?.length ?? (KB_ONLY.has(slug) ? film.length : undefined);
    if (!length || !fields.media) return [];
    return [
      {
        slug,
        title: film.title,
        section: SECTION_LABEL.get(film.section) ?? 'Films',
        language: lang && slug !== film.slug ? lang.language : undefined,
        length,
        video: fields.media.video,
        poster: fields.media.poster,
        captions: fields.captions,
        captionsLang: lang ? { locale: lang.locale, label: lang.name } : undefined,
        sheet: sheetOf(fields),
        note: filmNote(fields.media.video) ?? previousLogoNote(fields.media.video) ?? undefined,
      },
    ];
  });
});
