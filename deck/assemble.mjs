// Assembles the deck source: parts/head.html, slides/NN-*.html in name order
// and parts/tail.html, with fonts/deck-fonts.css inlined in place of
// <!--FONTS--> and the head's leading <title> stripped (the caller's wrapper
// carries the document title). Image paths stay shots/... for the caller.
// scripts/build/deck.mjs and deck/shoot-slide.mjs both read the deck here.
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const DECK = dirname(fileURLToPath(import.meta.url));
export const SLIDE_COUNT = 93;
const LEADING_TITLE = /^<title>[^<]*<\/title>\n/;

/** The slide files under <dir>/slides, in deck order. */
export function slideFiles(dir = DECK) {
  return readdirSync(join(dir, 'slides'))
    .filter((file) => /^\d\d-.*\.html$/.test(file))
    .sort();
}

/** The source assembled from <dir> (deck/, or a copy's folder); throws when the parts break the grammar. */
export function assemble(dir = DECK) {
  const read = (rel) => readFileSync(join(dir, rel), 'utf8');
  const files = slideFiles(dir);
  if (files.length !== SLIDE_COUNT) {
    throw new Error(`deck: expected ${SLIDE_COUNT} slide files under deck/slides, found ${files.length}`);
  }
  const slides = files.map((file) => `${read(`slides/${file}`).replace(/\s+$/, '')}\n\n`).join('');
  if (/<script\b/i.test(slides)) throw new Error('deck: a slide carries a <script>; the grammar forbids it');
  const head = read('parts/head.html');
  if (!LEADING_TITLE.test(head)) {
    throw new Error('deck: deck/parts/head.html does not open with the <title> the wrapper replaces');
  }
  if (!head.includes('<!--FONTS-->')) throw new Error('deck: deck/parts/head.html has no <!--FONTS--> marker for the font styles');
  /* a function replacer, so nothing in the CSS is read as a replacement pattern */
  return (head.replace(LEADING_TITLE, '') + slides + read('parts/tail.html')).replace(
    '<!--FONTS-->',
    () => `<style>${read('fonts/deck-fonts.css')}</style>`
  );
}
