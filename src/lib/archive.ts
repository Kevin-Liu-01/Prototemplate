/**
 * The archive: the retired /d routes, kept viewable as captures after their
 * code left the tree (decision 1). Each entry names the route as it was,
 * the capture that stands for it, and the commit that last held the code,
 * so any version can be restored from history:
 *
 *   git checkout <lastCommit> -- src/app/d/<slug>
 *
 * The routes were deleted on branch viewer-shell in the commit titled
 * "Every route runs on the viewer shell", the child of lastCommit. Every
 * capture was taken at 1440 pixels wide in the light theme from the live
 * site before the deletion: `crop` is the 1440x900 first fold, `full` the
 * whole page. Both live under public/shots/archive. Pure data, no React, so
 * the gallery, the archive route, the sitemap and the index panel read one
 * list.
 */
export type ArchiveEntry = {
  /** the route segment the version answered at: /d/<slug> */
  slug: string;
  /** the display name the review notes used */
  name: string;
  /** the capture date, ISO: 2026-09-08 */
  captured: string;
  /** the address the capture was taken from */
  source: string;
  /** the viewport width of the capture in CSS pixels */
  width: number;
  /** the full page height in CSS pixels */
  fullHeight: number;
  /** the 1440x900 first fold, a file name under /shots/archive */
  crop: string;
  /** the full page, a file name under /shots/archive */
  full: string;
  /** the short hash of the last commit that held the route's code */
  lastCommit: string;
};

/** Where the capture files live. */
export const ARCHIVE_DIR = '/shots/archive';

/** The commit that deleted the routes, named by its subject because it is the child of every lastCommit below. */
export const ARCHIVE_DELETION = {
  branch: 'viewer-shell',
  subject: 'Every route runs on the viewer shell',
} as const;

/** The last commit that held every retired route: HEAD before the deletion. */
const LAST_COMMIT = '7920ad9';

const CAPTURED = '2026-09-08';

function entry(slug: string, name: string, fullHeight: number): ArchiveEntry {
  return {
    slug,
    name,
    captured: CAPTURED,
    source: `https://prototemplate.vercel.app/d/${slug}`,
    width: 1440,
    fullHeight,
    crop: `${slug}.jpg`,
    full: `${slug}-full.jpg`,
    lastCommit: LAST_COMMIT,
  };
}

/** The eleven retired versions, in the order the manifest listed them. */
export const ARCHIVE: readonly ArchiveEntry[] = [
  entry('archive-press', 'Wide Field', 6636),
  entry('bento-foundry', 'Bento Foundry', 6467),
  entry('blueprint-atlas', 'Blueprint Atlas', 6627),
  entry('concrete-mono', 'Concrete Mono', 5504),
  entry('concrete-origin', 'Concrete Origin', 6293),
  entry('concrete-source', 'Concrete Source', 6361),
  entry('field-magnet', 'Field Magnet', 6427),
  entry('flipboard-terminus', 'Flipboard Terminus', 6697),
  entry('kinetic-verba', 'Kinetic Verba', 9844),
  entry('typographic-broadcast', 'Typographic Broadcast', 6980),
  entry('white-gallery', 'White Gallery', 6399),
];

export function getArchiveEntry(slug: string): ArchiveEntry | undefined {
  return ARCHIVE.find((item) => item.slug === slug);
}

/** The public path of the 1440x900 first fold. */
export function archiveShot(item: ArchiveEntry): string {
  return `${ARCHIVE_DIR}/${item.crop}`;
}

/** The public path of the full page capture. */
export function archiveFull(item: ArchiveEntry): string {
  return `${ARCHIVE_DIR}/${item.full}`;
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

/** `2026-09-08` becomes `September 8, 2026`. A fixed table, not Intl, so the server and the client agree. */
export function archiveDate(item: ArchiveEntry): string {
  const [year, month, day] = item.captured.split('-').map((part) => parseInt(part, 10));
  const name = MONTHS[(month ?? 1) - 1] ?? MONTHS[0];
  return `${name} ${day ?? 1}, ${year ?? ''}`.trim();
}

/** `prototemplate.vercel.app/d/concrete-mono`: the address without its scheme. */
export function archiveHost(item: ArchiveEntry): string {
  return item.source.replace(/^https?:\/\//, '');
}

/** One plain sentence for a row's description. */
export function archiveDesc(item: ArchiveEntry): string {
  return `Retired version, captured ${archiveDate(item)} at ${item.width} pixels wide.`;
}
