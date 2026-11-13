// The logo lock's shared parts: the logo's fingerprint, the manifest at
// scripts/lint/logo.json and the record of a generated file. pnpm build:logo
// writes the fingerprint and records the files it draws; pnpm lint:logo
// (scripts/lint/logo.mjs) holds every file to them.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

export const MANIFEST = 'scripts/lint/logo.json';
export const FINGERPRINT = 'public/brand/gt-globe-logo.json';
export const LOCKUP_JSON = 'public/brand/gt-globe-lockup.json';
/* the manifest's history as the site reads it, written by pnpm build:previous-mark */
export const PREVIOUS_MARK = 'src/lib/previous-mark.json';
/* a film history entry's reason: the site says the film ends on the previous mark */
export const FILM_REASON = 'made before the globe; re-render pending';
/* a film cut again to end on the logo whose frames still hold captures from before the globe: the site says that instead */
export const FILM_CAPTURES_REASON = 'ends on the logo, but its captures were taken before the globe; recapture pending';
/* a dated film or picture that ends on the previous logo, the globe of 2026-11-06: history, kept as made and not labelled */
export const GLOBE_1106_REASON = 'ends on the 11-06 globe; kept as made';
/**
 * The previous logos, by their path's sha256: the globe chosen on
 * 2026-11-06, the logo until the refined globe of 2026-11-12. Dated films
 * and pictures that end on it stay as history (GLOBE_1106_REASON); any code,
 * markup or SVG outside history whose path hashes to one, or has its
 * outline (the same drawing renumbered, respaced, shifted or scaled), fails
 * rule 12, so everything drawn from now on uses LOGO. `file` is the history
 * file on /marks that holds the drawing.
 */
export const PREVIOUS_LOGOS = [
  {
    sha256: '50fbc3ecf6a586e6bd1aec15d6cb0518efea8fd83ec0a0e45d69a4fce65b243c',
    name: '11-06 globe',
    until: '2026-11-12',
    file: 'public/marks/graticule/variations/axis-and-meridian-behind.svg',
  },
];
/* files whose bytes are a picture: a generated one is held by its recorded sha256 */
export const RASTER = /\.(png|ico|webp|jpe?g|gif|avif|mp4|webm|mov)$/i;

export const sha256 = (data) => createHash('sha256').update(data).digest('hex');

/** LOGO and LOCKUP from src/lib/logo.ts under `root`. */
export async function loadLogo(root) {
  const { LOGO, LOCKUP } = await import(pathToFileURL(join(root, 'src/lib/logo.ts')).href);
  return { LOGO, LOCKUP };
}

const round4 = (n) => Math.round(n * 10000) / 10000;

/**
 * The published fingerprint: what any outside check compares against, so
 * no other repository parses TypeScript. `lockup` is the sha256 of the
 * stacked lockup's measured numbers; the two gaps are the white from the
 * globe's ink to the name's ink over the globe's height, in the stacked and the
 * one-line lockups.
 */
export function fingerprint(root, LOGO, LOCKUP) {
  const lockup = join(root, LOCKUP_JSON);
  return {
    id: LOGO.id,
    sha256: sha256(LOGO.d),
    viewBox: LOGO.viewBox,
    lockup: existsSync(lockup) ? sha256(readFileSync(lockup)) : null,
    gapStacked: round4(LOCKUP.gap / LOCKUP.mark),
    /* the one-line lockup's globe is LOCKUP.oneLine cap heights tall (1.9 since 2026-11-12) */
    gapOneLine: round4(LOCKUP.gap / LOCKUP.oneLine),
  };
}

export const fingerprintText = (print) => `${JSON.stringify(print, null, 2)}\n`;

export function readManifest(root) {
  const manifest = JSON.parse(readFileSync(join(root, MANIFEST), 'utf8'));
  for (const list of ['generated', 'history', 'notLogo', 'external']) {
    if (!Array.isArray(manifest[list])) throw new Error(`no "${list}" array`);
  }
  /* checked is optional: pictures looked at frame by frame that show the logo or no mark */
  manifest.checked ??= [];
  if (!Array.isArray(manifest.checked)) throw new Error('"checked" is not an array');
  return manifest;
}

/** A path, a folder (ending in /) or a glob with * inside one segment. */
const GLOBS = new Map();
export function matches(pattern, rel) {
  if (pattern.endsWith('/')) return rel.startsWith(pattern);
  if (!pattern.includes('*')) return rel === pattern;
  let re = GLOBS.get(pattern);
  if (!re) {
    re = new RegExp(`^${pattern.split('*').map((part) => part.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('[^/]*')}$`);
    GLOBS.set(pattern, re);
  }
  return re.test(rel);
}

/**
 * The paths among `rels` the manifest lists under neither "generated" nor
 * "checked", each by its own path: recordGenerated refuses them, so a
 * generator checks its outputs here before it writes any.
 */
export function unlisted(manifest, rels) {
  return rels.filter((rel) => !manifest.generated.some((item) => item.path === rel) && !manifest.checked.some((item) => item.path === rel));
}

export const unlistedMessage = (rel) => `${rel} is listed under neither "generated" nor "checked" in ${MANIFEST}; list it first`;

/**
 * Records the generated rasters at `rels` as built from the current LOGO.d:
 * each one's sha256 and the LOGO.d hash it was drawn from; and the checked
 * pictures at `rels` at their present bytes (their sha256). A path the
 * manifest lists under neither is an error, raised before anything is
 * recorded, so a new output is listed by hand once, with its generator or
 * the reason it was checked.
 */
export function recordGenerated(root, rels, logoSha) {
  const manifest = readManifest(root);
  const missing = unlisted(manifest, rels);
  if (missing.length) throw new Error(missing.map(unlistedMessage).join('\n'));
  for (const rel of rels) {
    const checked = manifest.checked.find((item) => item.path === rel);
    if (checked) {
      checked.sha256 = sha256(readFileSync(join(root, rel)));
      continue;
    }
    const entry = manifest.generated.find((item) => item.path === rel);
    if (!RASTER.test(rel)) continue;
    entry.sourceSha256 = logoSha;
    entry.sha256 = sha256(readFileSync(join(root, rel)));
  }
  writeFileSync(join(root, MANIFEST), `${JSON.stringify(manifest, null, 2)}\n`);
}

/**
 * What the site labels, from the manifest's history: films, the entries
 * whose reason is FILM_REASON (they end on the previous mark), filmCaptures,
 * those whose reason is FILM_CAPTURES_REASON (they end on the logo but show
 * captures from before it), and pictures, every raster, film or folder
 * entry under public/ that waives every rule (no rules, no symbol), as
 * their manifest paths. The site
 * reads this (src/lib/previous-mark.ts) and not the manifest, so a client
 * component that shows a picture can say what it shows without loading the
 * whole manifest.
 */
export function previousMarkLists(manifest) {
  const history = manifest.history;
  return {
    films: history.filter((entry) => entry.reason === FILM_REASON).map((entry) => entry.path),
    filmCaptures: history.filter((entry) => entry.reason === FILM_CAPTURES_REASON).map((entry) => entry.path),
    /* rasters and films only: a vector history file (the monogram's own SVG) is shown by its one labelled figure */
    pictures: history
      .filter((entry) => entry.path.startsWith('public/') && !entry.rules && !entry.symbol && (entry.path.endsWith('/') || RASTER.test(entry.path) || /\*$/.test(entry.path)))
      .map((entry) => entry.path),
  };
}

/**
 * The pictures that show a previous logo or mark, from the manifest's
 * history: every picture entry under public/ or deck/ (a raster, a film, an
 * SVG, a folder or a glob), whatever rules it waives: the monogram's
 * captures and films, the 11-06 globe's files and the dated films and
 * pictures that end on it (GLOBE_1106_REASON). A symbol or counted entry
 * waives a rule inside a page and names no picture. Rule 13 reads these.
 */
export function previousPictures(manifest) {
  return manifest.history
    .filter((entry) => /^(public|deck)\//.test(entry.path) && !entry.symbol && !entry.count && (entry.path.endsWith('/') || entry.path.endsWith('*') || RASTER.test(entry.path) || entry.path.endsWith('.svg')))
    .map((entry) => entry.path);
}

/**
 * The current pages, which show the logo and nothing before it (Kevin,
 * 2026-11-12: "update stuff like our banners and everything under
 * /brand"): /brand and every route under it, the brand deck (/deck serves
 * public/brand-deck.html; its slides and parts are read as files) and, on
 * /marks, the production card and the head's strip of the marks in
 * production. `scope` limits a page to those elements: `attrs` matches an
 * element's open tag in prerendered markup, `selector` the same elements
 * in a browser. A previous picture on a current page fails rule 13 unless
 * it sits inside an element marked data-previous-mark, the previous-logo
 * figure, which rule 11 holds to its label.
 */
export const CURRENT_PAGES = [
  { route: '/brand', under: true },
  { route: '/deck' },
  { route: '/marks', scope: { attrs: /\sdata-id="production"|\sclass="[^"]*\bmk-live\b/, selector: '[data-id="production"], .mk-live' } },
];

/* an SVG that carries a picture: an <image> element, a data: raster or a linked file, which no text rule reads */
const PICTURE_IN_SVG = /<image\b/i;

/**
 * Rule 14: why a current page may not show the file at `rel`, or null when
 * it may. It holds pictures and films, and SVGs that carry a picture (an
 * <image>), since rules 1, 2 and 12 read only an SVG's paths. A current
 * page shows a file only at bytes someone vouched for: checked at its
 * sha256, generated under its own path (rule 5 holds its sha256 and the
 * LOGO.d it was drawn from), or history (rule 13 then wants a labelled
 * previous-logo figure). notLogo never counts here, and neither does a
 * folder or glob entry under generated: those name a place, not a
 * picture, so a file dropped into the /marks catalog would pass unseen.
 */
export function unlistedOnCurrent(manifest, root, rel) {
  const abs = join(root, rel);
  if (!existsSync(abs)) return null;
  if (!RASTER.test(rel) && !(rel.endsWith('.svg') && PICTURE_IN_SVG.test(readFileSync(abs, 'utf8')))) return null;
  const checked = manifest.checked.find((entry) => entry.path === rel);
  if (checked) return sha256(readFileSync(abs)) === checked.sha256 ? null : 'changed';
  if (manifest.generated.some((entry) => entry.path === rel)) return null;
  if (manifest.history.some((entry) => matches(entry.path, rel))) return null;
  const place = [...manifest.notLogo, ...manifest.generated].find((entry) => matches(entry.path, rel));
  return place ? `only ${place.path}` : 'unlisted';
}

/** The current page a route is, or undefined. */
export const currentPage = (route) => CURRENT_PAGES.find((page) => route === page.route || (page.under && route.startsWith(`${page.route}/`)));

export const previousMarkText = (manifest) => `${JSON.stringify(previousMarkLists(manifest), null, 2)}\n`;
