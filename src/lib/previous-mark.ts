import LISTS from './previous-mark.json';

/*
 * What the site says where it shows the previous mark, from the logo
 * lock's manifest (scripts/lint/logo.json) through src/lib/previous-mark.json,
 * which pnpm build:previous-mark writes from the manifest's history and
 * pnpm lint:logo holds to it. The manifest is the one list: a film or
 * picture the lint holds as history is labelled wherever the site shows it,
 * and one re-rendered or captured again on the globe loses its label when
 * its entry leaves history. The JSON holds the paths only, so a client
 * component (the hub's grid and its preview card) can read this module.
 *
 * Films: every history entry whose reason is one of the two film reasons
 * (it ends on the previous mark, or its captures show it). Pictures:
 * every history entry under public/ that waives every rule (no `rules`, no
 * `symbol`), the pictures pnpm lint:logo --pixels lets through.
 */

/** What a page says beside a film that ends on the previous mark. */
export const PREVIOUS_MARK_NOTE = 'made before the logo, ends on the previous mark';

/** What a page says beside a film cut again to end on the logo whose captures still show the previous mark. */
export const PREVIOUS_MARK_CAPTURES_NOTE = 'ends on the logo; its captures, taken before it, show the previous mark';

/** What a page says beside a picture that shows the previous mark. */
export const PREVIOUS_MARK_PICTURE_NOTE = 'Captured before the logo; it shows the previous mark.';

/** The same, where a caption has one short line: a grid tile under its name, the preview card over its foot. */
export const PREVIOUS_MARK_TAG = 'Shows the previous mark';

/** A manifest path as a pattern: `*` is any run of characters inside one folder, a trailing `/` a whole folder. */
function pattern(path: string): RegExp {
  const body = path
    .split('*')
    .map((part) => part.replace(/[.+?^${}()|[\]\\]/g, '\\$&'))
    .join('[^/]*');
  return new RegExp(`^${body}${path.endsWith('/') ? '' : '$'}`);
}

const FILMS: readonly RegExp[] = LISTS.films.map(pattern);

const FILM_CAPTURES: readonly RegExp[] = LISTS.filmCaptures.map(pattern);

const PICTURES: readonly RegExp[] = LISTS.pictures.map(pattern);

/** The repository path of a site path (`/media/a.mp4?v=2` -> `public/media/a.mp4`). */
function repoPath(src: string): string {
  return `public${src.split(/[?#]/)[0]}`;
}

/** What a page says beside the film at a site path (`/media/open-source-reel.mp4`): PREVIOUS_MARK_NOTE when it ends on the previous mark, PREVIOUS_MARK_CAPTURES_NOTE when its captures show it, else null. */
export function filmNote(src: string): string | null {
  const rel = repoPath(src);
  if (FILMS.some((film) => film.test(rel))) return PREVIOUS_MARK_NOTE;
  if (FILM_CAPTURES.some((film) => film.test(rel))) return PREVIOUS_MARK_CAPTURES_NOTE;
  return null;
}

/** True when the picture at a site path (`/static/blogs/rewriting-docs-sidebar.png`) shows the previous mark. */
export function showsPreviousMark(src: string): boolean {
  const rel = repoPath(src);
  return PICTURES.some((picture) => picture.test(rel));
}

/** True when either theme's capture of a thumbnail (a surface's shot) shows the previous mark: the grid tile and the preview card say so. */
export function shotShowsPreviousMark(shot: { light: string; dark?: string } | undefined): boolean {
  return Boolean(shot && (showsPreviousMark(shot.light) || (shot.dark !== undefined && showsPreviousMark(shot.dark))));
}

/** PREVIOUS_MARK_PICTURE_NOTE when the picture at a site path shows the previous mark, else null. */
export function pictureNote(src: string | undefined): string | null {
  return src && showsPreviousMark(src) ? PREVIOUS_MARK_PICTURE_NOTE : null;
}

/** What a page says beside a film whose web copy shows the previous mark (filmNote), else null. */
export function markNoteFor(film: { media?: { video: string } }): string | null {
  return film.media ? filmNote(film.media.video) : null;
}

/** The film with its previous-mark note (markNoteFor) after its own note when its web copy shows the previous mark; any other film as it is. */
export function withMarkNote<T extends { note?: string; media?: { video: string } }>(film: T): T {
  const mark = markNoteFor(film);
  if (!mark) return film;
  return { ...film, note: film.note ? `${film.note} · ${mark}` : mark };
}
