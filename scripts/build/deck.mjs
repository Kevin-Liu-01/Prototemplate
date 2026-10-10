// Builds public/brand-deck.html, the standalone brand deck viewer, from the
// deck source checked in at deck/. The deck keeps its own chrome, slide list
// and surface index; nothing under src/components/viewer reaches into it,
// and next.config.ts serves the file itself at /deck.
//
//   deck/assemble.mjs       parts/head.html, slides/NN-*.html in name order and
//                           parts/tail.html, with fonts/deck-fonts.css inlined in
//                           place of <!--FONTS--> and the leading <title> stripped
//                           (the wrapper below carries the document title)
//   shots/*                 every src="shots/...", data-dark="shots/...",
//                           data-light="shots/..." (the surface index's
//                           thumbnails, which take a src when the panel first
//                           opens) and data-tone="shots/..." is encoded once:
//                           photographs are resampled to 1280px wide at JPEG quality 78 through
//                           sips, except the full-bleed openers (shots/opener-*)
//                           and the 2x detail crops (shots/detail-*), which keep
//                           their native size so they stay sharp on the 1600px
//                           sheet: a two-tone dither (the screened shader openers)
//                           is stored as a two-color PNG through Pillow, lossless
//                           and about a fortieth of the JPEG, and a continuous-tone
//                           image (the gem smoke openers, the detail crops) is
//                           re-encoded as JPEG at quality 88; shots/thumb/* files
//                           pass through as they are, and so do the mood slides'
//                           tone grids (shots/tone/*), continuous-tone 8-bit gray
//                           JPEGs that the engine in parts/tail.html screens live
//                           at 1 CSS px cells, so their bytes stay the ones
//                           shots/tone/manifest.json records
//
// Each encoded image is written to public/deck-assets/<name>.<sha8>.<ext>,
// once per distinct content, and the page names it by that relative path, so
// the page stays under 1MB and a browser caches every image by its content. Every <img> with a src is marked
// loading="lazy", and the viewer warms the slides around the current one
// (warm() in parts/tail.html). Files the new page no longer names are removed
// last, so a failed build leaves the old page and its files whole.
//
// The result is wrapped as a full document (doctype, charset, viewport, the
// title, the description, the 96px GT mark as its icon, the link preview
// card (Open Graph title, description and the site's og.png, and a large
// image Twitter card), and a style for color-scheme, which follows the
// data-theme attribute the head script stamps rather than the OS scheme, and
// the body margin) and written to public/brand-deck.html. The --out copy has
// no site beside it, so it takes a noindex meta in place of the icon and the
// card. The thumbnails under
// shots/thumb are also copied to public/shots/deck, where the index panel's
// General Translation set (src/lib/surfaces.ts) reads them.
//
// Usage: pnpm build:deck
//        node scripts/build/deck.mjs --out <file> [--quality <n>] [--max-width <px>]
//                                          [--native-quality <n>] [--thumb-quality <n>]
//                           writes one self-contained copy somewhere else (the
//                           artifact copy, which must stay under 16MB) with
//                           every image inlined as a data URI, the photographs
//                           at that JPEG quality and width, the continuous-tone
//                           native images at that quality, and the thumbnails
//                           re-encoded at that quality instead of passing
//                           through; public/ is left alone
import { execFileSync, execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
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

import { assemble, DECK, SLIDE_COUNT } from '../../deck/assemble.mjs';
import { ROOT } from '../lib/root.mjs';
import { helpIfAsked } from '../lib/help.mjs';

helpIfAsked(import.meta.url);

const ARGS = process.argv.slice(2);
const flag = (name) => {
  const at = ARGS.indexOf(name);
  return at >= 0 ? ARGS[at + 1] : undefined;
};
/* an alternate output path: one self-contained file, and public/ is left alone */
const OUT_OVERRIDE = flag('--out');
const OUT = OUT_OVERRIDE ?? join(ROOT, 'public/brand-deck.html');
const ASSETS_OUT = join(ROOT, 'public/deck-assets');
const THUMBS_OUT = join(ROOT, 'public/shots/deck');
/* the public page carries markup, styles, the script and the font; its images are files */
const MAX_PUBLIC_BYTES = 1024 * 1024;
const QUALITY = Number(flag('--quality') ?? 78);
const MAX_WIDTH = Number(flag('--max-width') ?? 1280);
/* the thumbnails pass through untouched unless a copy asks for them re-encoded */
const THUMB_QUALITY = flag('--thumb-quality') ? Number(flag('--thumb-quality')) : undefined;
/* full-bleed openers and 2x detail crops keep their pixels; the 1280 resample blurs them on the 1600 sheet */
const NATIVE = /^(opener|detail)-/;
const NATIVE_QUALITY = Number(flag('--native-quality') ?? 88);
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
    console.warn('build-deck: python3 with Pillow is not available, so two-tone images are stored as JPEG and the deck is far larger');
    return false;
  }
}
const TITLE = 'General Translation brand deck';
const DESCRIPTION = `The General Translation brand in ${SLIDE_COUNT} slides: thesis, values, writing style, mark, color, type, line rules, diagrams, dither, motion, the shipped site and every public surface, docs, blog, content rules, Prototemplate, Glyphfield, fixed points, current status, and mood images between the sections.`;
/* the same picture as public/brand/no-bg-gt-logo-light.png at 96px, 3.6 KB in place of 45 KB */
const ICON = '/brand/no-bg-gt-logo-light-96.png';
/* /deck serves this file itself, so the root layout's Open Graph card never reaches it; a crawler needs the image's full address */
const OG_IMAGE = 'https://www.prototemplate.com/og.png';
const IMAGE_REF = /(src|data-dark|data-light|data-tone)="(shots\/[^"]+)"/g;
const IMAGE = /\.(jpg|jpeg|png|webp|gif)$/i;
const MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif' };
const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };

/* every shipped picture is fetched when its slide is near, not with the page */
let source = assemble().replace(/<img (?=[^>]*\bsrc="shots\/)/g, '<img loading="lazy" ');

/* ---------- images ---------- */

const tmp = mkdtempSync(join(tmpdir(), 'build-deck-'));
const uris = new Map();
/* the files under public/deck-assets this build names, by content hash: identical bytes share one file */
const written = new Map();
let imageBytes = 0;
let photographs = 0;
let natives = 0;
let twoTones = 0;
let thumbs = 0;
let tones = 0;

/** One encoded image: a data URI in the --out copy, else a content-hashed file under public/deck-assets. */
function toUri(rel, abs, mime) {
  const bytes = readFileSync(abs);
  if (OUT_OVERRIDE) {
    imageBytes += bytes.length;
    return `data:${mime};base64,${bytes.toString('base64')}`;
  }
  const hash = createHash('sha256').update(bytes).digest('hex').slice(0, 8);
  if (!written.has(hash)) {
    const file = `${basename(rel).replace(/\.[^.]+$/, '')}.${hash}.${EXT[mime]}`;
    writeFileSync(join(ASSETS_OUT, file), bytes);
    written.set(hash, file);
    imageBytes += bytes.length;
  }
  return `deck-assets/${written.get(hash)}`;
}

/** The reference for one shots/ path: a thumbnail or a tone grid as it is, a photograph resampled. */
function dataUri(rel) {
  const abs = join(DECK, rel);
  if (!existsSync(abs)) {
    throw new Error(`build-deck: the deck references deck/${rel}, which does not exist`);
  }
  if (rel.startsWith('shots/tone/')) {
    /* a tone grid is screened in the browser, so a re-encode would change the picture */
    if (!/\.jpg$/.test(rel)) throw new Error(`build-deck: deck/${rel} is not a tone grid JPEG`);
    tones += 1;
    return toUri(rel, abs, 'image/jpeg');
  }
  if (rel.startsWith('shots/thumb/')) {
    const mime = MIME[extname(abs).toLowerCase()];
    if (!mime) throw new Error(`build-deck: no image type for deck/${rel}`);
    thumbs += 1;
    if (THUMB_QUALITY === undefined) return toUri(rel, abs, mime);
    const small = join(tmp, `thumb-${basename(rel).replace(/\.[^.]+$/, '.jpg')}`);
    try {
      execSync(`sips -s format jpeg -s formatOptions ${THUMB_QUALITY} "${abs}" --out "${small}"`, { stdio: ['ignore', 'ignore', 'pipe'] });
    } catch (error) {
      const detail = error && typeof error === 'object' && 'stderr' in error && error.stderr ? String(error.stderr).trim() : '';
      throw new Error(`build-deck: sips could not re-encode deck/${rel}; the build runs on macOS${detail ? `: ${detail}` : ''}`);
    }
    return toUri(rel, small, 'image/jpeg');
  }
  const native = NATIVE.test(basename(rel));
  if (native) {
    const png = join(tmp, basename(rel).replace(/\.[^.]+$/, '.png'));
    if (twoTonePng(abs, png)) {
      twoTones += 1;
      return toUri(rel, png, 'image/png');
    }
  }
  const resampled = join(tmp, basename(rel).replace(/\.[^.]+$/, '.jpg'));
  const options = native
    ? `-s formatOptions ${NATIVE_QUALITY}`
    : `-s formatOptions ${QUALITY} --resampleWidth ${MAX_WIDTH}`;
  try {
    execSync(`sips -s format jpeg ${options} "${abs}" --out "${resampled}"`, { stdio: ['ignore', 'ignore', 'pipe'] });
  } catch (error) {
    const detail = error && typeof error === 'object' && 'stderr' in error && error.stderr ? String(error.stderr).trim() : '';
    throw new Error(`build-deck: sips could not ${native ? 'encode' : 'resample'} deck/${rel}; the build runs on macOS${detail ? `: ${detail}` : ''}`);
  }
  if (native) natives += 1;
  else photographs += 1;
  return toUri(rel, resampled, 'image/jpeg');
}

if (!OUT_OVERRIDE) mkdirSync(ASSETS_OUT, { recursive: true });
try {
  source = source.replace(IMAGE_REF, (_, attr, rel) => {
    if (!uris.has(rel)) uris.set(rel, dataUri(rel));
    return `${attr}="${uris.get(rel)}"`;
  });
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
if (/(src|data-dark|data-light|data-tone)="shots\//.test(source)) {
  throw new Error('build-deck: an image path was not encoded');
}

/* ---------- wrap and write ---------- */

const open =
  '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
  '<meta name="viewport" content="width=device-width,initial-scale=1">' +
  `<title>${TITLE}</title><meta name="description" content="${DESCRIPTION}">` +
  (OUT_OVERRIDE
    ? '<meta name="robots" content="noindex">'
    : `<link rel="icon" type="image/png" href="${ICON}">` +
      `<meta property="og:title" content="${TITLE}"><meta property="og:description" content="${DESCRIPTION}">` +
      `<meta property="og:image" content="${OG_IMAGE}"><meta name="twitter:card" content="summary_large_image">`) +
  '<style>:root{color-scheme:light}:root[data-theme="dark"]{color-scheme:dark}body{margin:0}</style></head><body>';
const html = `${open}${source}\n</body></html>\n`;

const sections = (html.match(/<section class="slide[\s"]/g) ?? []).length;
if (sections !== SLIDE_COUNT) {
  throw new Error(`build-deck: expected ${SLIDE_COUNT} <section class="slide"> in the output, found ${sections}`);
}
if (!OUT_OVERRIDE && Buffer.byteLength(html) > MAX_PUBLIC_BYTES) {
  throw new Error(`build-deck: the public page is ${Buffer.byteLength(html)} bytes, over ${MAX_PUBLIC_BYTES}; an image was inlined`);
}
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, html);
/* the files the new page no longer names, removed last so a failed build leaves the old page whole */
let removed = 0;
if (!OUT_OVERRIDE) {
  const named = new Set(written.values());
  for (const file of readdirSync(ASSETS_OUT)) {
    if (named.has(file)) continue;
    rmSync(join(ASSETS_OUT, file));
    removed += 1;
  }
}

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
const images = `${photographs} photographs resampled, ${twoTones} two-tone images as PNG, ${natives} continuous-tone images at native size, ${tones} tone grids and ${thumbs} thumbnails`;
console.log(
  OUT_OVERRIDE
    ? `build:deck  ${SLIDE_COUNT} slides, ${images} inlined (${mb(imageBytes)}) -> ${OUT_OVERRIDE} (${mb(Buffer.byteLength(html))})`
    : `build:deck  ${SLIDE_COUNT} slides -> public/brand-deck.html (${mb(Buffer.byteLength(html))}); ${images} as ${written.size} files -> public/deck-assets (${mb(imageBytes)}, ${removed} old files removed); ${copied} thumbnails -> public/shots/deck`
);
