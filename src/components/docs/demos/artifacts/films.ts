import { MOTION_FILMS, MOTION_SECTIONS, type MotionCutFields } from '@/lib/motion';

import { SHEET_TILE } from './film-list';

/**
 * The published films as the film plates take them: the fields a player
 * and a contact sheet need and nothing else. MOTION_FILMS is the registry
 * scripts/build/motion.mjs writes from public/motion/published.json, and
 * a film counts as published when its cut is pinned there and its web
 * copy exists. A language version (the Slash announcement's German,
 * Spanish and Japanese cuts) is its own entry.
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
};

function sheetOf(fields: MotionCutFields): FilmSheet | undefined {
  const sheet = fields.sheet;
  if (!sheet?.frames) return undefined;
  const columns = (sheet.width + SHEET_TILE.gap) / (SHEET_TILE.width + SHEET_TILE.gap);
  const rows = (sheet.height + SHEET_TILE.gap) / (SHEET_TILE.height + SHEET_TILE.gap);
  if (!Number.isInteger(columns) || !Number.isInteger(rows)) return undefined;
  return { src: sheet.src, width: sheet.width, height: sheet.height, frames: sheet.frames, columns, rows };
}

const SECTION_LABEL = new Map(MOTION_SECTIONS.map((section) => [section.id, section.label]));

export const PUBLISHED_FILMS: readonly PublishedFilm[] = MOTION_FILMS.flatMap((film) => {
  const cuts = [
    { slug: film.slug, fields: film as MotionCutFields, lang: film.language },
    ...(film.versions ?? []).map((version) => ({ slug: version.slug, fields: version as MotionCutFields, lang: version.language })),
  ];
  return cuts.flatMap(({ slug, fields, lang }): PublishedFilm[] => {
    if (!fields.cut || !fields.media) return [];
    return [
      {
        slug,
        title: film.title,
        section: SECTION_LABEL.get(film.section) ?? 'Films',
        language: lang && slug !== film.slug ? lang.language : undefined,
        length: fields.cut.length,
        video: fields.media.video,
        poster: fields.media.poster,
        captions: fields.captions,
        captionsLang: lang ? { locale: lang.locale, label: lang.name } : undefined,
        sheet: sheetOf(fields),
      },
    ];
  });
});
