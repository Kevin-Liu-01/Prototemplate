// Builds the preview thumbnails the preview layer reads (directive 8.6):
// public/shots/thumb/<stem>.webp and <stem>-dark.webp at 640x360 (the
// 320x180 card at 2x), cut from the 1440-wide exhibit captures under
// public/shots. src/lib/surfaces.ts points the direction, shipped page and
// archive rows at these; the 1440 captures stay for the exhibit sheet and
// the grid, which read the routes' own ShellItem.shot.
//
//   public/shots/light/<slug>.jpg      -> public/shots/thumb/<slug>.webp
//   public/shots/dark/<slug>.jpg       -> public/shots/thumb/<slug>-dark.webp
//   public/shots/archive/<slug>.jpg    -> public/shots/thumb/archive-<slug>.webp
//   public/shots/pages/<id>-light.jpg  -> public/shots/thumb/<id>.webp
//   public/shots/pages/<id>-dark.jpg   -> public/shots/thumb/<id>-dark.webp
//
// The pages folder holds what scripts/check/capture-pages.mjs shoots: every
// static page of the shipped direction and the routes of the Pages group,
// under their surface ids. It is cut last, so a stem captured both as an
// exhibit and as a page (production, production-enterprise) takes the page
// capture, the fresher one.
//
// Each source is resampled to 640 wide and cropped to 360 from the top
// through sips (macOS) into a lossless PNG, then encoded as WebP at quality
// 82 through cwebp (brew install webp): about 10 to 25KB a file against 25
// to 45KB for the JPEG q72 cut it replaced, and a 0.9MB bitmap once decoded
// against 5.2MB for a 1440 capture. A source without a dark twin gets no
// dark file; the preview layer falls back to the light one.
//
// A capture pass that writes straight into public/shots/thumb (the brand
// sections, the documents) leaves JPEGs there: each is cut to WebP the same
// way and the JPEG is removed, so the folder holds WebP only and every
// reference reads <stem>.webp.
//
// Usage: pnpm build:thumbs
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from '../lib/root.mjs';
import { helpIfAsked } from '../lib/help.mjs';

helpIfAsked(import.meta.url);

const SHOTS = join(ROOT, 'public/shots');
const OUT = join(SHOTS, 'thumb');
const WIDTH = 640;
const HEIGHT = 360;
const QUALITY = 82;

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

/** One thumbnail: resample to WIDTH and crop HEIGHT from the top into a lossless PNG, then encode it as WebP. */
function cut(source, target) {
  const png = target.replace(/\.webp$/, '.cut.png');
  try {
    execSync(
      `sips -s format png --resampleWidth ${WIDTH} --cropToHeightWidth ${HEIGHT} ${WIDTH} --cropOffset 0 0 "${source}" --out "${png}"`,
      { stdio: 'ignore' }
    );
    execSync(`cwebp -quiet -q ${QUALITY} -m 6 "${png}" -o "${target}"`, { stdio: 'ignore' });
  } finally {
    rmSync(png, { force: true });
  }
}

/* the targets this run cut from a capture, so a JPEG of the same stem left in thumb/ is not cut over them */
const fresh = new Set();
let bytes = 0;

function build(source, target) {
  try {
    cut(source, target);
  } catch {
    throw new Error(`build-thumbs: could not cut ${source}; the build runs on macOS with sips and cwebp (brew install webp)`);
  }
  fresh.add(target);
  bytes += statSync(target).size;
}

/* the direction and shipped page captures: light, and dark where a twin exists */
for (const stem of stems('light')) {
  build(join(SHOTS, 'light', `${stem}.jpg`), join(OUT, `${stem}.webp`));
  const dark = join(SHOTS, 'dark', `${stem}.jpg`);
  if (existsSync(dark)) build(dark, join(OUT, `${stem}-dark.webp`));
}

/* the archive's first folds: light only, prefixed so they never collide with a live slug */
for (const stem of stems('archive')) {
  build(join(SHOTS, 'archive', `${stem}.jpg`), join(OUT, `archive-${stem}.webp`));
}

/* the page captures: <id>-light becomes <id>, <id>-dark stays <id>-dark; a file under neither suffix is not a capture */
for (const stem of stems('pages')) {
  const match = /^(.+)-(light|dark)$/.exec(stem);
  if (!match) continue;
  const [, id, theme] = match;
  build(join(SHOTS, 'pages', `${stem}.jpg`), join(OUT, theme === 'light' ? `${id}.webp` : `${id}-dark.webp`));
}

/* the JPEGs a capture pass left in thumb/: cut to WebP unless this run already cut that stem from a capture, then removed */
for (const file of readdirSync(OUT).filter((name) => /\.jpg$/i.test(name))) {
  const target = join(OUT, file.replace(/\.jpg$/i, '.webp'));
  if (!fresh.has(target)) build(join(OUT, file), target);
  rmSync(join(OUT, file));
}

const kb = (n) => `${Math.round(n / 1024)}KB`;
console.log(
  `build:thumbs  ${fresh.size} WebP thumbnails at ${WIDTH}x${HEIGHT} (${kb(bytes)}, ${kb(bytes / Math.max(1, fresh.size))} each) -> public/shots/thumb`
);
