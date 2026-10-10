#!/usr/bin/env node
// Reads the brand deck's source in a Prototemplate checkout and reports where
// the slide files and the places that restate them disagree. It writes
// nothing.
//
//   node check-deck.mjs [--root <prototemplate checkout>] [--titles]
//
// The checkout is --root, else $PROTOTEMPLATE, else the working directory.
// --titles also prints every slide's position, file and title.
//
// Errors (exit 1):
//   - the slide count differs between deck/slides and SLIDE_COUNT in
//     deck/assemble.mjs, #bar-total in deck/parts/head.html,
//     DECK_SLIDES in src/lib/search-index.ts, the description in the built
//     public/brand-deck.html (scripts/build/deck.mjs writes it from
//     SLIDE_COUNT) or the "N-slide" sentence in src/app/brand/page.tsx;
//   - SECTIONS in deck/parts/tail.html does not start a section at each
//     opener's position, or a section's name differs from its opener's title;
//   - a DECK_SLIDES entry differs from the slide's title, read the way the
//     viewer reads it (the first h1, h2 or .big, as text);
//   - a slide file holds other than one <section class="slide ...">, carries
//     a <script>, or names a shots/ file that does not exist;
//   - a rule in a slide's <style> is not scoped to a class on its section;
//   - a mood slide is missing from deck/shots/OPENERS.md, or an opener's image
//     is not named there;
//   - a mark pasted on a speed mark slide (every <svg width height xmlns>)
//     differs from every file in public/marks.
// Warnings (printed, exit 0): CSS font sizes under 15px, hard-coded colors,
// em dashes, exclamation marks, headings that end in a period, an opener's
// or mood slide's shared <style> block that differs from the others of its
// kind, and a stale count on the /deck line of README.md or public/llms.txt.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const args = process.argv.slice(2);
const at = args.indexOf('--root');
const ROOT = resolve(at >= 0 ? args[at + 1] : process.env.PROTOTEMPLATE || process.cwd());
const SHOW_TITLES = args.includes('--titles');
const DECK = join(ROOT, 'deck');
if (!existsSync(join(DECK, 'slides'))) {
  console.error(`check-deck: ${ROOT} has no deck/slides; pass --root <prototemplate checkout> or set PROTOTEMPLATE`);
  process.exit(2);
}

const errors = [];
const warnings = [];
const read = (rel) => (existsSync(join(ROOT, rel)) ? readFileSync(join(ROOT, rel), 'utf8') : null);

/* ---------- slides ---------- */

const files = readdirSync(join(DECK, 'slides'))
  .filter((f) => /^\d\d-.*\.html$/.test(f))
  .sort();

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: '\u2019', lsquo: '\u2018', mdash: '\u2014', ndash: '\u2013' };
function decode(s) {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m);
}

/** The text of the element whose start tag begins at `from`, with nested tags of the same name balanced. */
function elementText(html, from, tag) {
  const open = html.indexOf('>', from) + 1;
  const re = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'gi');
  re.lastIndex = open;
  let depth = 1;
  let end = html.length;
  for (let m = re.exec(html); m; m = re.exec(html)) {
    depth += m[1] ? -1 : 1;
    if (depth === 0) {
      end = m.index;
      break;
    }
  }
  return decode(html.slice(open, end).replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ''))
    .replace(/\s+/g, ' ')
    .trim();
}

/** The viewer's title for a slide: querySelector('h1, h2, .big'), the first of those in document order. */
function titleOf(html) {
  const body = html.replace(/<style[\s\S]*?<\/style>/gi, (m) => ' '.repeat(m.length)).replace(/<!--[\s\S]*?-->/g, (m) => ' '.repeat(m.length));
  const re = /<(h1|h2|[a-z][a-z0-9]*)\b[^>]*?(\bclass="([^"]*)")?[^>]*>/gi;
  for (let m = re.exec(body); m; m = re.exec(body)) {
    const tag = m[1].toLowerCase();
    const classes = (m[0].match(/\bclass="([^"]*)"/) || [, ''])[1].split(/\s+/);
    if (tag === 'h1' || tag === 'h2' || classes.includes('big')) return elementText(body, m.index, tag);
  }
  return null;
}

/** Every selector in a <style> block, with at-rules and keyframe steps left out. */
function selectorsOf(css) {
  const out = [];
  const stack = [];
  let prelude = '';
  for (const ch of css.replace(/\/\*[\s\S]*?\*\//g, '')) {
    if (ch === '{') {
      const p = prelude.trim();
      const inKeyframes = stack.some((s) => /^@(-webkit-)?keyframes/i.test(s));
      if (p && !p.startsWith('@') && !inKeyframes) out.push(...p.split(',').map((s) => s.trim()).filter(Boolean));
      stack.push(p);
      prelude = '';
    } else if (ch === '}') {
      stack.pop();
      prelude = '';
    } else if (ch === ';') {
      prelude = '';
    } else {
      prelude += ch;
    }
  }
  return out;
}

const slides = files.map((file, k) => {
  const html = readFileSync(join(DECK, 'slides', file), 'utf8');
  const sections = html.match(/<section\b[^>]*>/gi) || [];
  const classes = ((sections[0] || '').match(/\bclass="([^"]*)"/) || [, ''])[1].split(/\s+/).filter(Boolean);
  const kind = classes.includes('s-mood') ? 'mood' : classes.includes('s-opener') && !classes.includes('s-closing') ? 'opener' : classes.includes('s-closing') ? 'closing' : 'content';
  return { n: k + 1, file, html, sections, classes, kind, title: titleOf(html) };
});

for (const s of slides) {
  if (s.sections.length !== 1 || !s.classes.includes('slide')) errors.push(`${s.file}: holds ${s.sections.length} <section> elements; a slide file is exactly one <section class="slide ...">`);
  if (!/^\s*<!--/.test(s.html)) warnings.push(`${s.file}: no leading <!-- name --> comment`);
  if (/<script\b/i.test(s.html)) errors.push(`${s.file}: carries a <script>; build-deck refuses it`);
  if (!s.title) errors.push(`${s.file}: no h1, h2 or .big, so the slide list and the book show "Slide ${s.n}"`);
  for (const m of s.html.matchAll(/(?:src|data-dark|data-tone)="(shots\/[^"]+)"/g)) {
    if (!existsSync(join(DECK, m[1]))) errors.push(`${s.file}: names deck/${m[1]}, which does not exist`);
  }
  const scope = s.classes.filter((c) => c !== 'slide');
  for (const style of s.html.matchAll(/<style>([\s\S]*?)<\/style>/gi)) {
    for (const sel of selectorsOf(style[1])) {
      const scoped = scope.some((c) => sel.startsWith(`.${c}`) || sel.replace(/\s+/g, ' ').startsWith(`#stage > .${c}`));
      if (!scoped) errors.push(`${s.file}: the rule "${sel}" is not scoped to a class on its section (${scope.join(', ') || 'none'})`);
    }
    const css = style[1].replace(/\/\*[\s\S]*?\*\//g, '');
    for (const m of css.matchAll(/font-size:\s*(\d+(?:\.\d+)?)px/g)) if (Number(m[1]) < 15) warnings.push(`${s.file}: font-size ${m[1]}px in slide CSS; text under 15px on the sheet is a defect`);
    for (const m of css.matchAll(/#[0-9a-f]{3,8}\b|rgba?\(/gi)) warnings.push(`${s.file}: hard-coded color ${m[0]} in slide CSS; use the tokens`);
  }
  for (const m of s.html.matchAll(/\sstyle="([^"]*)"/g)) {
    for (const f of m[1].matchAll(/font-size:\s*(\d+(?:\.\d+)?)px/g)) if (Number(f[1]) < 15) warnings.push(`${s.file}: inline font-size ${f[1]}px; text under 15px on the sheet is a defect`);
  }
  const text = decode(s.html.replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, ' '));
  if (text.includes('\u2014')) warnings.push(`${s.file}: an em dash in slide copy`);
  if (/!(\s|$)/.test(text)) warnings.push(`${s.file}: an exclamation mark in slide copy`);
  if (s.title && /\.$/.test(s.title) && s.kind !== 'mood') warnings.push(`${s.file}: the heading "${s.title}" ends in a period`);
}

/* ---------- the count, wherever it is restated ---------- */

const count = slides.length;
const restated = [
  ['deck/assemble.mjs', /const SLIDE_COUNT = (\d+);/, 'SLIDE_COUNT'],
  ['deck/parts/head.html', /id="bar-total">(\d+)</, '#bar-total'],
  ['public/brand-deck.html', /brand in (\d+) slides/, 'the built description (pnpm build:deck)'],
  ['src/app/brand/page.tsx', /(\d+)-slide/, 'the "N-slide" sentence'],
];
for (const [rel, re, what] of restated) {
  const src = read(rel);
  if (src === null) { warnings.push(`${rel}: not found`); continue; }
  const m = src.match(re);
  if (!m) warnings.push(`${rel}: ${what} not found`);
  else if (Number(m[1]) !== count) errors.push(`${rel}: ${what} says ${m[1]}, deck/slides holds ${count}`);
}
/* the README's route list and llms.txt may name a count too; a stale one is a warning */
for (const [rel, re] of [
  ['README.md', /`\/deck`[^\n]*?(\d+) slides/],
  ['public/llms.txt', /\]\([^)\s]*\/deck\)[^\n]*?(\d+) slides/],
]) {
  const m = (read(rel) || '').match(re);
  if (m && Number(m[1]) !== count) warnings.push(`${rel}: the /deck line says ${m[1]} slides, deck/slides holds ${count}`);
}

/* openers share one .s-opener block and mood slides one .s-mood block; a copy that drifts is a warning */
for (const kind of ['opener', 'mood']) {
  const blocks = slides
    .filter((s) => s.kind === kind)
    .map((s) => [s.file, ((s.html.match(/<style>([\s\S]*?)<\/style>/) || [, ''])[1]).replace(/\s+/g, ' ').trim()]);
  const tally = new Map();
  for (const [, css] of blocks) tally.set(css, (tally.get(css) || 0) + 1);
  const common = [...tally.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  for (const [file, css] of blocks) if (css !== common) warnings.push(`${file}: its <style> block differs from the shared .s-${kind} block the other ${kind} slides carry`);
}

/* ---------- DECK_SLIDES in the search index ---------- */

const index = read('src/lib/search-index.ts');
const block = index && index.match(/const DECK_SLIDES[^=]*=\s*\[([\s\S]*?)\n\];/);
if (!block) {
  warnings.push('src/lib/search-index.ts: DECK_SLIDES not found');
} else {
  const titles = [...block[1].matchAll(/'((?:[^'\\]|\\.)*)'/g)].map((m) => m[1].replace(/\\'/g, "'"));
  if (titles.length !== count) errors.push(`src/lib/search-index.ts: DECK_SLIDES has ${titles.length} titles, deck/slides holds ${count}`);
  slides.forEach((s, k) => {
    if (titles[k] !== undefined && s.title && titles[k] !== s.title) errors.push(`src/lib/search-index.ts: DECK_SLIDES[${k}] is "${titles[k]}", slide ${s.n} (${s.file}) reads "${s.title}"`);
  });
  for (const m of index.matchAll(/(\d+) deck slides|The (\d+) slide titles/g)) {
    const n = Number(m[1] || m[2]);
    if (n !== count) warnings.push(`src/lib/search-index.ts: a comment says ${n} slides, deck/slides holds ${count}`);
  }
}

/* ---------- SECTIONS in the viewer ---------- */

const tail = read('deck/parts/tail.html');
const sec = tail && tail.match(/var SECTIONS = \[(.*?)\];/);
if (!sec) {
  errors.push('deck/parts/tail.html: SECTIONS not found');
} else {
  const sections = [...sec[1].matchAll(/\[(\d+),\s*'((?:[^'\\]|\\.)*)'\]/g)].map((m) => ({ start: Number(m[1]), name: m[2] }));
  const openers = slides.filter((s) => s.kind === 'opener');
  const starts = sections.map((x) => x.start).join(', ');
  const want = openers.map((s) => s.n).join(', ');
  if (starts !== want) errors.push(`deck/parts/tail.html: SECTIONS starts at ${starts}; the openers sit at ${want}`);
  openers.forEach((o) => {
    const s = sections.find((x) => x.start === o.n);
    if (s && s.name !== o.title) errors.push(`deck/parts/tail.html: section ${s.start} is "${s.name}", its opener (${o.file}) reads "${o.title}"`);
  });
}

/* ---------- OPENERS.md ---------- */

const openersMd = read('deck/shots/OPENERS.md');
if (openersMd === null) {
  warnings.push('deck/shots/OPENERS.md: not found');
} else {
  for (const s of slides) {
    const stem = s.file.replace(/\.html$/, '');
    if (s.kind === 'mood' && !openersMd.includes(`\`${stem}\``)) errors.push(`deck/shots/OPENERS.md: the mood table has no row for ${stem}`);
    if (s.kind === 'opener') {
      const img = (s.html.match(/class="opener-img"[^>]*\bdata-dark="shots\/([^"]+)"/) || s.html.match(/class="opener-img"[^>]*\bsrc="shots\/([^"]+)"/) || [])[1];
      if (img && !openersMd.includes(img)) errors.push(`deck/shots/OPENERS.md: the opener image ${img} (${s.file}) is not recorded`);
    }
  }
}

/* ---------- the speed marks: each slide pastes one public/marks file ---------- */

const MARKS = join(ROOT, 'public/marks');
const marks = existsSync(MARKS)
  ? readdirSync(MARKS)
      .filter((f) => f.endsWith('.svg'))
      .map((f) => [f, (readFileSync(join(MARKS, f), 'utf8').match(/<svg ([^>]*)>([\s\S]*)<\/svg>/) || []).slice(1).map((x) => x.trim())])
  : [];
for (const s of slides.filter((x) => /-speed-/.test(x.file))) {
  /* every pasted mark: the lockup slide also shows the monogram at three sizes on a paper and an ink ground */
  const pasted = [...s.html.matchAll(/<svg width="([\d.]+)" height="([\d.]+)" (xmlns[^>]*)>([\s\S]*?)<\/svg>/g)];
  if (!pasted.length) { errors.push(`${s.file}: no mark <svg width="..." height="..." xmlns=...> pasted from public/marks`); continue; }
  for (const [, w, h, attrs, inner] of pasted) {
    const hit = marks.find(([, pair]) => pair[0] === attrs.trim() && pair[1] === inner.trim());
    if (!hit) errors.push(`${s.file}: the ${w} by ${h} px mark differs from every file in public/marks; paste the current file's markup (pnpm build:marks writes them)`);
    const vb = (attrs.match(/viewBox="([^"]+)"/) || [, ''])[1].split(/\s+/).map(Number);
    if (vb.length === 4 && Math.abs(Number(w) * (vb[3] / vb[2]) - Number(h)) > 1) warnings.push(`${s.file}: ${w} by ${h} px does not keep the file's aspect (${vb[2]} by ${vb[3]})`);
  }
}

/* ---------- report ---------- */

if (SHOW_TITLES) {
  for (const s of slides) console.log(`${String(s.n).padStart(2, '0')}  ${s.file.padEnd(40)} ${s.kind.padEnd(8)} ${s.title ?? '(no title)'}`);
  console.log('');
}
const kinds = slides.reduce((acc, s) => ({ ...acc, [s.kind]: (acc[s.kind] || 0) + 1 }), {});
console.log(`check-deck: ${count} slides (${Object.entries(kinds).map(([k, v]) => `${v} ${k}`).join(', ')}) in ${ROOT}`);
for (const w of warnings) console.log(`warning  ${w}`);
for (const e of errors) console.log(`error    ${e}`);
console.log(errors.length ? `check-deck: ${errors.length} error(s), ${warnings.length} warning(s)` : `check-deck: no errors, ${warnings.length} warning(s)`);
process.exit(errors.length ? 1 : 0);
