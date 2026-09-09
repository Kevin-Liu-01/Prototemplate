// Builds public/brand-deck.html, the standalone brand deck viewer, from the
// deck source checked in at deck/. The deck keeps its own chrome, slide list
// and surface index; nothing under src/components/viewer reaches into it,
// and src/app/deck only frames the file.
//
//   parts/head.html, slides/NN-*.html in name order, parts/tail.html
//                           assembled in that order, the way deck/assemble.mjs
//                           does, with the source's leading <title> stripped
//                           (the wrapper below carries the document title)
//   fonts/deck-fonts.css    inlined as a <style> in place of <!--FONTS-->
//   shots/*                 every src="shots/..." and data-dark="shots/..."
//                           becomes a data URI: photographs are resampled to
//                           1280px wide at JPEG quality 78 through sips, except
//                           the full-bleed openers and mood images (shots/opener-*,
//                           shots/mood-*) and the 2x detail crops (shots/detail-*),
//                           which are re-encoded
//                           at their native size at JPEG quality 88 so they stay
//                           sharp on the 1600px sheet; shots/thumb/* files pass
//                           through as they are
//
// The result is wrapped as a full document (doctype, charset, viewport, the
// title, a noindex meta, and a two-rule style for color-scheme and the body
// margin) and written to public/brand-deck.html. The thumbnails under
// shots/thumb are also copied to public/shots/deck, where the index panel's
// General Translation set (src/lib/surfaces.ts) reads them.
//
// Usage: pnpm build:deck
import { execSync } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DECK = join(ROOT, 'deck');
const OUT = join(ROOT, 'public/brand-deck.html');
const THUMBS_OUT = join(ROOT, 'public/shots/deck');
const SLIDE_COUNT = 85;
const MAX_WIDTH = 1280;
const QUALITY = 78;
/* full-bleed openers and mood images and 2x detail crops keep their pixels; the 1280 resample blurs them on the 1600 sheet */
const NATIVE = /^(opener|mood|detail)-/;
const NATIVE_QUALITY = 88;
const TITLE = 'General Translation brand deck';
const LEADING_TITLE = /^<title>[^<]*<\/title>\n/;
const IMAGE_REF = /(src|data-dark)="(shots\/[^"]+)"/g;
const IMAGE = /\.(jpg|jpeg|png|webp|gif)$/i;
const MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif' };

const read = (rel) => readFileSync(join(DECK, rel), 'utf8');

/* ---------- assemble ---------- */

const slideFiles = readdirSync(join(DECK, 'slides'))
  .filter((file) => /^\d\d-.*\.html$/.test(file))
  .sort();
if (slideFiles.length !== SLIDE_COUNT) {
  throw new Error(`build-deck: expected ${SLIDE_COUNT} slide files under deck/slides, found ${slideFiles.length}`);
}
const slides = slideFiles.map((file) => `${read(`slides/${file}`).replace(/\s+$/, '')}\n\n`).join('');
if (/<script\b/i.test(slides)) {
  throw new Error('build-deck: a slide carries a <script>; the grammar forbids it');
}

const head = read('parts/head.html');
if (!LEADING_TITLE.test(head)) {
  throw new Error('build-deck: deck/parts/head.html does not open with the <title> the wrapper replaces');
}
if (!head.includes('<!--FONTS-->')) {
  throw new Error('build-deck: deck/parts/head.html has no <!--FONTS--> marker for the font styles');
}
let source = head.replace(LEADING_TITLE, '') + slides + read('parts/tail.html');

/* ---------- fonts ---------- */

/* a function replacer, so nothing in the CSS is read as a replacement pattern */
source = source.replace('<!--FONTS-->', () => `<style>${read('fonts/deck-fonts.css')}</style>`);

/* ---------- images ---------- */

const tmp = mkdtempSync(join(tmpdir(), 'build-deck-'));
const uris = new Map();
let imageBytes = 0;
let photographs = 0;
let natives = 0;
let thumbs = 0;

function toUri(abs, mime) {
  const bytes = readFileSync(abs);
  imageBytes += bytes.length;
  return `data:${mime};base64,${bytes.toString('base64')}`;
}

/** The data URI for one shots/ path: a thumbnail as it is, a photograph resampled. */
function dataUri(rel) {
  const abs = join(DECK, rel);
  if (!existsSync(abs)) {
    throw new Error(`build-deck: the deck references deck/${rel}, which does not exist`);
  }
  if (rel.startsWith('shots/thumb/')) {
    const mime = MIME[extname(abs).toLowerCase()];
    if (!mime) throw new Error(`build-deck: no image type for deck/${rel}`);
    thumbs += 1;
    return toUri(abs, mime);
  }
  const resampled = join(tmp, basename(rel).replace(/\.[^.]+$/, '.jpg'));
  const native = NATIVE.test(basename(rel));
  const options = native
    ? `-s formatOptions ${NATIVE_QUALITY}`
    : `-s formatOptions ${QUALITY} --resampleWidth ${MAX_WIDTH}`;
  try {
    execSync(`sips -s format jpeg ${options} "${abs}" --out "${resampled}"`, { stdio: 'ignore' });
  } catch {
    throw new Error(`build-deck: sips could not ${native ? 'encode' : 'resample'} deck/${rel}; the build runs on macOS`);
  }
  if (native) natives += 1;
  else photographs += 1;
  return toUri(resampled, 'image/jpeg');
}

try {
  source = source.replace(IMAGE_REF, (_, attr, rel) => {
    if (!uris.has(rel)) uris.set(rel, dataUri(rel));
    return `${attr}="${uris.get(rel)}"`;
  });
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
if (/(src|data-dark)="shots\//.test(source)) {
  throw new Error('build-deck: an image path was not inlined');
}

/* ---------- wrap and write ---------- */

const open =
  '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
  '<meta name="viewport" content="width=device-width,initial-scale=1">' +
  `<title>${TITLE}</title><meta name="robots" content="noindex">` +
  '<style>html{color-scheme:light dark}body{margin:0}</style></head><body>';
const html = `${open}${source}\n</body></html>\n`;

const sections = (html.match(/<section class="slide[\s"]/g) ?? []).length;
if (sections !== SLIDE_COUNT) {
  throw new Error(`build-deck: expected ${SLIDE_COUNT} <section class="slide"> in the output, found ${sections}`);
}
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, html);

/* ---------- thumbnails for the index panel ---------- */

mkdirSync(THUMBS_OUT, { recursive: true });
let copied = 0;
for (const file of readdirSync(join(DECK, 'shots/thumb'))) {
  if (!IMAGE.test(file)) continue;
  copyFileSync(join(DECK, 'shots/thumb', file), join(THUMBS_OUT, file));
  copied += 1;
}

const mb = (n) => `${(n / 1024 / 1024).toFixed(2)}MB`;
console.log(
  `build:deck  ${SLIDE_COUNT} slides, ${photographs} photographs resampled, ${natives} openers, mood images and details at native size, ${thumbs} thumbnails inlined (${mb(imageBytes)}) -> public/brand-deck.html (${mb(Buffer.byteLength(html))}); ${copied} thumbnails -> public/shots/deck`
);
