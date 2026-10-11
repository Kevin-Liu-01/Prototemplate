// modern-hebrew: shapes every Hebrew word the film sets or moves, with fontkit
// on the film's own Hebrew face (fonts/MHHebrew-VF.woff2, unpacked to
// tools/build/MHHebrew-VF.ttf by tools/fonts-unpack.py) at weight 500, and
// writes data/glyphs.js (window.MH_GLYPHS). Adapted from the roots lane's
// tools/glyphs.mjs (motion/concepts/modern-hebrew/roots/tools/glyphs.mjs).
//
//   node tools/glyphs.mjs
//
// MH_GLYPHS.words[id]   a word the film builds from its parts: every glyph as
//   its own outline, positioned by the font's GPOS mark and mkmk tables (the
//   tables Chrome's HarfBuzz reads), so a carried letter, a pattern letter and
//   a vowel point can move and take colour separately.
//   { text, upm, adv, clusters: [{ ch, role, glyphs: [{ cp, d, x, y, mark, role, bb }] }] }
//   x, y in font units, y up, origin at the word's left end on the baseline.
//   Clusters are in logical (reading) order; cluster 0 is the rightmost.
//   Roles: r = carried letter, p = added by the pattern or ending (letters and
//   every point), s = stand-in letter of a pattern name (ק ט ל).
// MH_GLYPHS.strings[id] a line the film sets as one text node: its advance and
//   the left and right edge of each space-separated word, in font units from
//   the line's left end, so rules and labels can be placed without measuring
//   the page at render time.
// MH_GLYPHS.letters[ch] a single unpointed letter (the root tray).
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';

const require = createRequire(import.meta.url);
const fontkit = require('fontkit');
const HERE = new URL('..', import.meta.url).pathname;
const font = fontkit.openSync(HERE + 'tools/build/MHHebrew-VF.ttf').getVariation({ wght: 500 });

// Ezekiel 1:4, from the public-domain "Tanach with Nikkud" text (Sefaria,
// source tanach.us), cut to its last clause without the sof pasuq.
const verse = JSON.parse(readFileSync(HERE + 'assets/raw/ezekiel-1-4.json', 'utf8')).versions[0].text;
const ezek = verse.slice(verse.indexOf('וּמִתּוֹכָהּ')).replace('׃', '').trim();

const WORDS = {
  maktel: ['מַקְטֵל', 'psss'],
  maklea: ['מַקְלֵעַ', 'prrr'],
  milon: ['מִלּוֹן', 'rrpp'],
  ofan: ['אוֹפָן', 'rrrr'],
  ayim: ['־ַיִם', 'ppp'],
  ofnayim: ['אָפְנַיִם', 'rrrpp'],
  // v2: the model's ending is joined to the bicycle's by a hairline, and the
  // tomato word takes the composing colour rule (its root ע ג ב in ink)
  oznayim: ['אָזְנַיִם', 'rrrpp'],
  agvaniya: ['עַגְבָנִיָּה', 'rrrppp'],
};
const STRINGS = {
  batei: 'בתי עיניים',
  sefer: 'ספר מלים',
  mila: 'מִלָּה',
  on: '־וֹן',
  milon: 'מִלּוֹן',
  maktel: 'מַקְטֵל',
  maklea: 'מַקְלֵעַ',
  mafteakh: 'מַפְתֵּחַ',
  oznayim: 'אָזְנַיִם',
  ofan: 'אוֹפָן',
  ayim: '־ַיִם',
  ofnayim: 'אָפְנַיִם',
  plusOn: '+ ־וֹן',
  ezek,
  agvaniya: 'עַגְבָנִיָּה',
  badura: 'בַּדּוּרָה',
  mishkal: 'משקל',
  shoresh: 'שורש',
  kla: 'ק־ל־ע',
};
const LETTERS = 'קלע';

const isMark = (cp) => cp >= 0x0591 && cp <= 0x05c7 && cp !== 0x05be && cp !== 0x05c0 && cp !== 0x05c3 && cp !== 0x05c6;

function clustersOf(text) {
  const out = [];
  for (const ch of text) {
    const cp = ch.codePointAt(0);
    if (isMark(cp) && out.length) out[out.length - 1].push(cp);
    else out.push([cp]);
  }
  return out;
}

const r1 = (v) => Math.round(v * 10) / 10;

function shapeWord(text, roles) {
  const run = font.layout(text, { script: 'hebr', direction: 'rtl' });
  const logical = clustersOf(text);
  // the run is in visual order and a mark precedes its base: group, then reverse
  const vis = [];
  let pen = 0;
  let pending = [];
  run.glyphs.forEach((g, i) => {
    const p = run.positions[i];
    const b = g.bbox;
    const item = { cp: g.codePoints, d: g.path.toSVG(), x: r1(pen + p.xOffset), y: r1(p.yOffset), mark: g.codePoints.every(isMark), bb: [b.minX, b.minY, b.maxX, b.maxY].map(r1) };
    pen += p.xAdvance;
    if (item.mark) pending.push(item);
    else { vis.push([item, ...pending]); pending = []; }
  });
  if (pending.length) vis[vis.length - 1].push(...pending);
  const groups = vis.reverse();
  if (groups.length !== logical.length) throw new Error(`${text}: ${groups.length} glyph groups for ${logical.length} clusters`);
  const clusters = groups.map((gl, i) => {
    const role = roles[i] || 'p';
    return { ch: String.fromCodePoint(...logical[i]), role, glyphs: gl.map((g) => ({ ...g, role: g.mark ? 'p' : role })) };
  });
  return { text, upm: font.unitsPerEm, adv: r1(pen), clusters };
}

function shapeString(text) {
  // the whole line, shaped as Chrome shapes the one text node
  const run = font.layout(text, { script: 'hebr', direction: 'rtl' });
  const adv = run.positions.reduce((a, p) => a + p.xAdvance, 0);
  // each word on its own, laid right to left with the space's advance; the
  // sum is checked against the whole line so the word edges are trusted
  const space = font.layout(' ').positions[0].xAdvance;
  let right = adv;
  const out = [];
  for (const w of text.split(' ')) {
    const wa = font.layout(w, { script: 'hebr', direction: 'rtl' }).positions.reduce((a, p) => a + p.xAdvance, 0);
    out.push({ w, x0: r1(right - wa), x1: r1(right) });
    right -= wa + space;
  }
  if (Math.abs(right + space) > 0.5) throw new Error(`${text}: word sum differs from the line by ${right + space}`);
  return { text, upm: font.unitsPerEm, adv: r1(adv), words: out };
}

const words = {};
for (const [id, [text, roles]] of Object.entries(WORDS)) words[id] = shapeWord(text, roles);
const strings = {};
for (const [id, text] of Object.entries(STRINGS)) strings[id] = shapeString(text);
const letters = {};
for (const ch of LETTERS) {
  const g = font.layout(ch).glyphs[0];
  const b = g.bbox;
  letters[ch] = { d: g.path.toSVG(), adv: r1(g.advanceWidth), bb: [b.minX, b.minY, b.maxX, b.maxY].map(r1) };
}
const out = { upm: font.unitsPerEm, ascent: font.ascent, descent: font.descent, words, strings, letters };
writeFileSync(HERE + 'data/glyphs.js', '// written by tools/glyphs.mjs; do not edit\nwindow.MH_GLYPHS = ' + JSON.stringify(out) + ';\n');
console.log('wrote data/glyphs.js:', Object.keys(words).length, 'words,', Object.keys(strings).length, 'strings');
for (const [id, s] of Object.entries(strings)) console.log(id, s.adv, JSON.stringify(s.words));
