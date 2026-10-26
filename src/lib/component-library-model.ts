/**
 * The shapes of the /components set, safe in client modules. The data is
 * read on the server by src/lib/component-library.ts and passed to the
 * viewer by the page.
 */

/** A plate's captured stage in both themes, with the light file's pixel size. */
export type LibraryShot = { light: string; dark?: string; w: number; h: number };

export type LibraryEntry = {
  /** `<docs page>-<heading id>`, or `src-<export>` for an undocumented component */
  id: string;
  /** the padded position in the whole set */
  n: string;
  name: string;
  /** the export the entry shows: `StudioField`, `createDitherLoop` */
  code: string;
  /** the file or folder in the repository */
  path: string;
  /** the docs section that documents it; absent for an undocumented component */
  docs?: { href: string; title: string };
  /** one sentence, for an undocumented component */
  desc?: string;
  shot?: LibraryShot;
};

export type LibraryBlock = { id: string; label: string; entries: readonly LibraryEntry[] };
