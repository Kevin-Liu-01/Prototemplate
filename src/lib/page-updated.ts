/**
 * The shape of one page's last change and where its commit lives. Hand
 * written and safe in client modules; the data is in the generated
 * src/lib/updated.ts, which only server modules import (each page passes
 * its own entry to its viewer).
 */

/** One page's last change, as scripts/build-updated.mjs records it. */
export type PageUpdated = {
  /** the committer's calendar day, as the commit wrote it: `2026-10-05` */
  day: string;
  /** the committer date with its offset (ISO 8601), or the day alone while uncommitted */
  at: string;
  /** the short commit, or null while the change is uncommitted */
  commit: string | null;
  /** a hash of the page's path list in the script, read by the check */
  src: string;
};

/** The repository's commit page; the panel's date links to `${COMMIT_URL}${commit}`. */
export const COMMIT_URL = 'https://github.com/Kevin-Liu-01/Prototemplate/commit/';
