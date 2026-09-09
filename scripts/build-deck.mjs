// Builds the /deck route's inputs from the deck source checked in at deck/.
//
//   src/app/deck/deck-slides.css  the slide CSS from deck/parts/head.html
//                                 (the block after the tokens, through the
//                                 slide rules), every selector scoped under
//                                 .pt-slides, which tokens.css bridges to
//                                 the --pt- tokens; no viewer chrome
//   src/app/deck/slides.html      the 52 slides concatenated in order, with
//                                 src and data-dark rewritten to
//                                 /deck/shots/..., preceded by the #gt-mark
//                                 symbol the slides reference
//   public/deck/shots/            the image files under deck/shots, plus
//                                 thumb/, which the slides and the index
//                                 panel reference
//
// Usage: pnpm build:deck
import { copyFileSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DECK = join(ROOT, 'deck');
const OUT = join(ROOT, 'src/app/deck');
const SHOTS_IN = join(DECK, 'shots');
const SHOTS_OUT = join(ROOT, 'public/deck/shots');
const SCOPE = '.pt-slides';
const IMAGE = /\.(jpg|jpeg|png|gif|webp|svg)$/i;

const head = readFileSync(join(DECK, 'parts/head.html'), 'utf8');
const headLines = head.split('\n');

/* ---------- the slide CSS ---------- */

const cssStart = headLines.findIndex((line) => line.trim() === '* { box-sizing: border-box; }');
const cssEnd = headLines.findIndex((line) => line.includes('---------- viewer chrome ----------'));
if (cssStart < 0 || cssEnd < 0 || cssEnd <= cssStart) {
  throw new Error('build-deck: could not find the slide CSS block in deck/parts/head.html');
}

/* the code panel draws the two colors the tokens already name */
const slideLines = headLines.slice(cssStart, cssEnd).map((line) => {
  if (!/^\s*\.panel\s*\{/.test(line)) return line;
  return line
    .replace('background: #101010', 'background: var(--pt-panel-ink)')
    .replace('color: rgba(255, 255, 255, 0.87)', 'color: var(--pt-panel-text)');
});

/* slide rules that sit inside the viewer chrome block: the slide box, its
   links, and the ruled link rows; nothing else from that block is a slide rule */
const chromeSlideLines = headLines
  .slice(cssEnd)
  .filter((line) => /^\s*(\.slide\b|\.rows\.links\b)/.test(line));

/** Index of the brace that closes the block opened at `open`. */
function closeOf(css, open) {
  let depth = 0;
  for (let i = open; i < css.length; i += 1) {
    if (css[i] === '{') depth += 1;
    else if (css[i] === '}') {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  throw new Error('build-deck: unbalanced braces in the slide CSS');
}

/** One selector list, every selector placed under the scope. */
function scopeSelectors(list) {
  return list
    .split(',')
    .map((raw) => raw.trim())
    .filter(Boolean)
    .map((selector) => {
      if (selector.startsWith(':root')) {
        /* :root[data-theme="dark"] .panel -> :root[data-theme="dark"] .pt-slides .panel */
        return selector.replace(/^(:root(?:\[[^\]]*\]|:not\([^)]*\))*)\s+/, `$1 ${SCOPE} `);
      }
      if (selector === '*') return `${SCOPE} *`;
      return `${SCOPE} ${selector}`;
    })
    .join(', ');
}

/**
 * Walks a stylesheet rule by rule. Plain rules get their selectors scoped;
 * @media and @supports recurse; @keyframes pass through untouched; the
 * prefers-color-scheme block is dropped because the boot script owns the
 * theme. Comments are kept.
 */
function scopeCss(css) {
  let out = '';
  let i = 0;
  while (i < css.length) {
    const ws = css.slice(i).match(/^\s*/)[0];
    out += ws;
    i += ws.length;
    if (i >= css.length) break;
    if (css.startsWith('/*', i)) {
      const end = css.indexOf('*/', i);
      const stop = end < 0 ? css.length : end + 2;
      out += css.slice(i, stop);
      i = stop;
      continue;
    }
    const open = css.indexOf('{', i);
    if (open < 0) {
      out += css.slice(i);
      break;
    }
    const prelude = css.slice(i, open).trim();
    const close = closeOf(css, open);
    const body = css.slice(open + 1, close);
    if (prelude.startsWith('@')) {
      if (/prefers-color-scheme/.test(prelude)) {
        /* dropped: html[data-theme] is the one switch */
      } else if (prelude.startsWith('@keyframes')) {
        out += `${prelude} {${body}}`;
      } else {
        out += `${prelude} {${scopeCss(body)}}`;
      }
    } else {
      out += `${scopeSelectors(prelude)} {${body}}`;
    }
    i = close + 1;
  }
  return out;
}

const rawCss = [...slideLines, '', '  /* the slide box and its links */', ...chromeSlideLines].join('\n');
const scopedCss = scopeCss(rawCss)
  .replace(/@keyframes cut\b/g, '@keyframes pt-cut')
  .replace(/animation: cut\b/g, 'animation: pt-cut')
  .replace(/^ {2}/gm, '');

const cssHeader = `/* Generated by scripts/build-deck.mjs from deck/parts/head.html. Do not edit
   this file: edit the deck source and run pnpm build:deck. Every selector is
   scoped under .pt-slides, the bridge tokens.css draws for the authored
   slides; the viewer chrome is not here. The swatch rules keep their own
   colors on purpose: a swatch shows a color, it does not take the theme. */

`;
mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'deck-slides.css'), `${cssHeader}${scopedCss.trim()}\n`);

/* ---------- the slides ---------- */

const slideFiles = readdirSync(join(DECK, 'slides'))
  .filter((file) => /^\d\d-.*\.html$/.test(file))
  .sort();
if (slideFiles.length !== 52) {
  throw new Error(`build-deck: expected 52 slide files under deck/slides, found ${slideFiles.length}`);
}

const referenced = new Set();
const slidesBody = slideFiles
  .map((file) => readFileSync(join(DECK, 'slides', file), 'utf8').replace(/\s+$/, ''))
  .join('\n')
  .replace(/(src|data-dark)="shots\/([^"]+)"/g, (_, attr, path) => {
    referenced.add(path);
    return `${attr}="/deck/shots/${path}"`;
  });

if (/<script\b/i.test(slidesBody)) {
  throw new Error('build-deck: a slide carries a <script>; the grammar forbids it');
}
if (/(src|data-dark)="shots\//.test(slidesBody)) {
  throw new Error('build-deck: an image path was not rewritten');
}

const symbol = head.match(/<svg width="0" height="0"[^>]*>\s*<symbol id="gt-mark"[\s\S]*?<\/symbol><\/svg>/);
if (!symbol) throw new Error('build-deck: the #gt-mark symbol is missing from deck/parts/head.html');

const slidesHeader =
  '<!-- Generated by scripts/build-deck.mjs from deck/slides. Do not edit this file: edit the slide sources and run pnpm build:deck. -->\n';
writeFileSync(join(OUT, 'slides.html'), `${slidesHeader}${symbol[0]}\n${slidesBody}\n`);

/* ---------- the shots ---------- */

for (const path of referenced) {
  try {
    statSync(join(SHOTS_IN, path));
  } catch {
    throw new Error(`build-deck: a slide references deck/shots/${path}, which does not exist`);
  }
}

rmSync(SHOTS_OUT, { recursive: true, force: true });
mkdirSync(join(SHOTS_OUT, 'thumb'), { recursive: true });
let copied = 0;
for (const file of readdirSync(SHOTS_IN)) {
  if (!IMAGE.test(file)) continue;
  copyFileSync(join(SHOTS_IN, file), join(SHOTS_OUT, file));
  copied += 1;
}
let thumbs = 0;
for (const file of readdirSync(join(SHOTS_IN, 'thumb'))) {
  if (!IMAGE.test(file)) continue;
  copyFileSync(join(SHOTS_IN, 'thumb', file), join(SHOTS_OUT, 'thumb', file));
  thumbs += 1;
}

console.log(
  `build:deck  ${slideFiles.length} slides -> src/app/deck/slides.html, ${scopedCss.split('\n').length} lines -> src/app/deck/deck-slides.css, ${copied} images + ${thumbs} thumbs -> public/deck/shots`
);
