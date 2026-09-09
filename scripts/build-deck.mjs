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
//                           which keep their native size so they stay sharp on
//                           the 1600px sheet: a two-tone dither (the screened
//                           shader openers and the mood photographs) is stored
//                           as a two-color PNG through Pillow, lossless and about
//                           a fortieth of the JPEG, and a continuous-tone image
//                           (the gem smoke openers, the detail crops) is
//                           re-encoded as JPEG at quality 88; shots/thumb/* files
//                           pass through as they are
//
// The result is wrapped as a full document (doctype, charset, viewport, the
// title, a noindex meta, and a style for color-scheme, which follows the
// data-theme attribute the head script stamps rather than the OS scheme, and
// the body margin) and written to public/brand-deck.html. The thumbnails under
// shots/thumb are also copied to public/shots/deck, where the index panel's
// General Translation set (src/lib/surfaces.ts) reads them.
//
// Usage: pnpm build:deck
//        node scripts/build-deck.mjs --out <file> [--quality <n>] [--max-width <px>]
//                           writes one lighter copy somewhere else (the
//                           artifact copy, which must stay under 16MB) with
//                           the photographs at that JPEG quality and width;
//                           public/ is left alone
import { execFileSync, execSync } from 'node:child_process';
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
const ARGS = process.argv.slice(2);
const flag = (name) => {
  const at = ARGS.indexOf(name);
  return at >= 0 ? ARGS[at + 1] : undefined;
};
/* an alternate output path: one lighter file, and public/ is left alone */
const OUT_OVERRIDE = flag('--out');
const OUT = OUT_OVERRIDE ?? join(ROOT, 'public/brand-deck.html');
const THUMBS_OUT = join(ROOT, 'public/shots/deck');
const SLIDE_COUNT = 85;
const QUALITY = Number(flag('--quality') ?? 78);
const MAX_WIDTH = Number(flag('--max-width') ?? 1280);
/* full-bleed openers and mood images and 2x detail crops keep their pixels; the 1280 resample blurs them on the 1600 sheet */
const NATIVE = /^(opener|mood|detail)-/;
const NATIVE_QUALITY = 88;
/* the share of pixels at the two extremes above which a native image counts as a two-tone dither */
const TWO_TONE_SHARE = 0.98;

/*
 * Writes a native image as a two-color PNG when it is a two-tone dither and
 * reports whether it did. The two colors are the means of the dark and light
 * clusters, so a warm paper or an inked blue survives; the JPEG's ringing
 * around each cell does not. Exit 3 from the script means the image carries
 * continuous tone and takes the JPEG path; any other failure means Pillow is
 * missing, which the build reports once and then also falls back to JPEG.
 */
const TWO_TONE_SCRIPT = `
import sys
from PIL import Image, ImageStat
im = Image.open(sys.argv[1]).convert('RGB')
lum = im.convert('L')
h = lum.histogram()
n = im.width * im.height
if (sum(h[:48]) + sum(h[208:])) / n < float(sys.argv[3]):
    sys.exit(3)
dark = lum.point(lambda v: 255 if v <= 127 else 0)
light = lum.point(lambda v: 255 if v > 127 else 0)
lo = [round(c) for c in ImageStat.Stat(im, dark).mean]
hi = [round(c) for c in ImageStat.Stat(im, light).mean]
index = lum.point(lambda v: 1 if v > 127 else 0)
out = Image.frombytes('P', im.size, index.tobytes())
out.putpalette(lo + hi)
out.save(sys.argv[2], 'PNG', optimize=True, bits=1)
`;
let pillowMissing = false;
function twoTonePng(abs, out) {
  if (pillowMissing) return false;
  try {
    execFileSync('python3', ['-c', TWO_TONE_SCRIPT, abs, out, String(TWO_TONE_SHARE)], { stdio: 'ignore' });
    return true;
  } catch (error) {
    if (error && typeof error === 'object' && 'status' in error && error.status === 3) return false;
    pillowMissing = true;
    console.warn('build-deck: python3 with Pillow is not available, so two-tone images are inlined as JPEG and the deck is far larger');
    return false;
  }
}
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
let twoTones = 0;
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
  const native = NATIVE.test(basename(rel));
  if (native) {
    const png = join(tmp, basename(rel).replace(/\.[^.]+$/, '.png'));
    if (twoTonePng(abs, png)) {
      twoTones += 1;
      return toUri(png, 'image/png');
    }
  }
  const resampled = join(tmp, basename(rel).replace(/\.[^.]+$/, '.jpg'));
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
  '<style>:root{color-scheme:light}:root[data-theme="dark"]{color-scheme:dark}body{margin:0}</style></head><body>';
const html = `${open}${source}\n</body></html>\n`;

const sections = (html.match(/<section class="slide[\s"]/g) ?? []).length;
if (sections !== SLIDE_COUNT) {
  throw new Error(`build-deck: expected ${SLIDE_COUNT} <section class="slide"> in the output, found ${sections}`);
}
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, html);

/* ---------- thumbnails for the index panel (the public build only) ---------- */

let copied = 0;
if (!OUT_OVERRIDE) {
  mkdirSync(THUMBS_OUT, { recursive: true });
  for (const file of readdirSync(join(DECK, 'shots/thumb'))) {
    if (!IMAGE.test(file)) continue;
    copyFileSync(join(DECK, 'shots/thumb', file), join(THUMBS_OUT, file));
    copied += 1;
  }
}

const mb = (n) => `${(n / 1024 / 1024).toFixed(2)}MB`;
console.log(
  `build:deck  ${SLIDE_COUNT} slides, ${photographs} photographs resampled, ${twoTones} two-tone images as PNG, ${natives} continuous-tone images at native size, ${thumbs} thumbnails inlined (${mb(imageBytes)}) -> ${OUT_OVERRIDE ?? 'public/brand-deck.html'} (${mb(Buffer.byteLength(html))})${OUT_OVERRIDE ? '' : `; ${copied} thumbnails -> public/shots/deck`}`
);
