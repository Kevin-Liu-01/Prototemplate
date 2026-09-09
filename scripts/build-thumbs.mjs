// Builds the preview thumbnails the preview layer reads (directive 8.6):
// public/shots/thumb/<stem>.jpg and <stem>-dark.jpg at 640x360 (the 320x180
// card at 2x), cut from the 1440-wide exhibit captures under public/shots.
// src/lib/surfaces.ts points the direction, shipped page and archive rows at
// these; the 1440 captures stay for the exhibit sheet and the grid, which
// read the routes' own ShellItem.shot.
//
//   public/shots/light/<slug>.jpg      -> public/shots/thumb/<slug>.jpg
//   public/shots/dark/<slug>.jpg       -> public/shots/thumb/<slug>-dark.jpg
//   public/shots/archive/<slug>.jpg    -> public/shots/thumb/archive-<slug>.jpg
//   public/shots/pages/<id>-light.jpg  -> public/shots/thumb/<id>.jpg
//   public/shots/pages/<id>-dark.jpg   -> public/shots/thumb/<id>-dark.jpg
//
// The pages folder holds what scripts/capture-pages.mjs shoots: every
// static page of the shipped direction and the routes of the Pages group,
// under their surface ids. It is cut last, so a stem captured both as an
// exhibit and as a page (production, production-enterprise) takes the page
// capture, the fresher one.
//
// Each source is resampled to 640 wide and cropped to 360 from the top
// through sips (macOS), at JPEG quality 72: about 25 to 45KB a file against
// 84 to 175KB for a 1440 capture, and a 0.9MB bitmap once decoded against
// 5.2MB. A source without a dark twin gets no dark file; the preview layer
// falls back to the light one. Existing thumbnails for other stems (the
// docs, brand and present captures, the live-* copies of the deck's GT
// captures) are left alone.
//
// Usage: pnpm build:thumbs
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SHOTS = join(ROOT, 'public/shots');
const OUT = join(SHOTS, 'thumb');
const WIDTH = 640;
const HEIGHT = 360;
const QUALITY = 72;

mkdirSync(OUT, { recursive: true });

/** The stems under one capture folder, without their extension. */
function stems(folder) {
  const dir = join(SHOTS, folder);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((file) => /\.jpg$/i.test(file) && !/-full\.jpg$/i.test(file))
    .map((file) => file.replace(/\.jpg$/i, ''))
    .sort();
}

/** One thumbnail: resample to WIDTH, then crop HEIGHT from the top. */
function cut(source, target) {
  execSync(
    `sips -s format jpeg -s formatOptions ${QUALITY} --resampleWidth ${WIDTH} --cropToHeightWidth ${HEIGHT} ${WIDTH} --cropOffset 0 0 "${source}" --out "${target}"`,
    { stdio: 'ignore' }
  );
}

let written = 0;
let bytes = 0;

function build(source, target) {
  try {
    cut(source, target);
  } catch {
    throw new Error(`build-thumbs: sips could not cut ${source}; the build runs on macOS`);
  }
  written += 1;
  bytes += statSync(target).size;
}

/* the direction and shipped page captures: light, and dark where a twin exists */
for (const stem of stems('light')) {
  build(join(SHOTS, 'light', `${stem}.jpg`), join(OUT, `${stem}.jpg`));
  const dark = join(SHOTS, 'dark', `${stem}.jpg`);
  if (existsSync(dark)) build(dark, join(OUT, `${stem}-dark.jpg`));
}

/* the archive's first folds: light only, prefixed so they never collide with a live slug */
for (const stem of stems('archive')) {
  build(join(SHOTS, 'archive', `${stem}.jpg`), join(OUT, `archive-${stem}.jpg`));
}

/* the page captures: <id>-light becomes <id>, <id>-dark stays <id>-dark; a file under neither suffix is not a capture */
for (const stem of stems('pages')) {
  const match = /^(.+)-(light|dark)$/.exec(stem);
  if (!match) continue;
  const [, id, theme] = match;
  build(join(SHOTS, 'pages', `${stem}.jpg`), join(OUT, theme === 'light' ? `${id}.jpg` : `${id}-dark.jpg`));
}

const kb = (n) => `${Math.round(n / 1024)}KB`;
console.log(
  `build:thumbs  ${written} thumbnails at ${WIDTH}x${HEIGHT} (${kb(bytes)}, ${kb(bytes / Math.max(1, written))} each) -> public/shots/thumb`
);
