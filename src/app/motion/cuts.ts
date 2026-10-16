import type { MotionFilm, MotionLanguage } from '@/lib/motion';

/**
 * A film's cuts for the language toggle: the base cut first, then each
 * language version in roster order (scripts/build/motion.mjs folds a film's
 * `<slug>-<locale>` cuts into its entry). Each cut is read as the film
 * itself with that cut's own fields, so the player, the records and the
 * meta line take a cut where they take a film. Every cut field is set from
 * the cut, never inherited from the base: a version without captions must
 * not play the English ones. `key` is the cut's own slug and `rowId` its
 * old row anchor (`film-<slug>`), which the records the server renders are
 * keyed by. Pure, no React, so the server page and the client share it.
 */
export type FilmCut = { key: string; rowId: string; language?: MotionLanguage; film: MotionFilm };

export function filmCuts(film: MotionFilm): readonly FilmCut[] {
  const base: FilmCut = { key: film.slug, rowId: film.id, language: film.language, film };
  return [
    base,
    ...(film.versions ?? []).map(
      (version): FilmCut => ({
        key: version.slug,
        rowId: version.id,
        language: version.language,
        film: {
          ...film,
          runtime: version.runtime,
          status: version.status,
          media: version.media,
          local: version.local,
          credits: version.credits,
          captions: version.captions,
          cut: version.cut,
          sheet: version.sheet,
          script: version.script,
          review: version.review,
        },
      })
    ),
  ];
}
