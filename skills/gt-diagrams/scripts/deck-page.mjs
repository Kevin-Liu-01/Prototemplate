#!/usr/bin/env node
// Writes the brand deck as one HTML file with its fonts inlined, assembled the
// way deck/shoot-slide.mjs assembles it (parts/head.html, every slide in
// order, parts/tail.html, deck/fonts/deck-fonts.css in place of <!--FONTS-->),
// so figure-check.mjs can open one slide in present mode:
//
//   node skills/gt-diagrams/scripts/deck-page.mjs /tmp/gt-deck.html
//   node skills/gt-diagrams/scripts/figure-check.mjs "file:///tmp/gt-deck.html#33" \
//     --selector '#stage .slide.is-on .ex' --width 1600 --height 900 --press p
//
// The output path is required, so nothing is written inside deck/.
// --deck <dir> points at another checkout's deck folder.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const deckAt = args.indexOf('--deck');
const deck = deckAt >= 0 ? resolve(args[deckAt + 1]) : resolve(dirname(fileURLToPath(import.meta.url)), '../../../deck');
const out = args.find((a, i) => !a.startsWith('--') && (deckAt < 0 || i !== deckAt + 1));
if (!out) {
  console.error('usage: deck-page.mjs <out.html> [--deck <dir>]');
  process.exit(2);
}

const head = readFileSync(join(deck, 'parts/head.html'), 'utf8');
const tail = readFileSync(join(deck, 'parts/tail.html'), 'utf8');
const files = readdirSync(join(deck, 'slides'))
  .filter((f) => /^\d\d-.*\.html$/.test(f))
  .sort();
const body = files.map((f) => readFileSync(join(deck, 'slides', f), 'utf8').replace(/\s+$/, '') + '\n\n').join('');
const fonts = readFileSync(join(deck, 'fonts/deck-fonts.css'), 'utf8');
const src = (head + body + tail).replace('<!--FONTS-->', `<style>${fonts}</style>`).replace(/^<title>[^<]*<\/title>\s*/, '');
const page = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>html{color-scheme:light dark}body{margin:0}</style></head><body>${src}</body></html>`;
writeFileSync(resolve(out), page);
console.log(`deck-page: ${files.length} slides -> ${resolve(out)}`);
files.forEach((f, i) => {
  if (/(lines|doubled-line|diagrams|iso|line-law)\.html$/.test(f)) console.log(`  #${i + 1} ${f}`);
});
