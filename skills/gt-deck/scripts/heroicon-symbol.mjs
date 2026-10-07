#!/usr/bin/env node
// Prints the sprite <symbol> for one or more Heroicons 20 solid glyphs, in
// the form deck/parts/head.html uses, read from the @heroicons/react package
// in a Prototemplate checkout. It writes nothing.
//
//   node heroicon-symbol.mjs lock-closed [chart-bar ...] [--root <prototemplate checkout>]
//
// The checkout is --root, else $PROTOTEMPLATE, else the working directory.
// A name already in the sprite is reported instead of printed again, and a
// symbol that a slide defines for itself is named, so it can move into the
// sprite and leave the slide.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const args = process.argv.slice(2);
const at = args.indexOf('--root');
const ROOT = resolve(at >= 0 ? args[at + 1] : process.env.PROTOTEMPLATE || process.cwd());
const names = args.filter((a, k) => !a.startsWith('--') && (at < 0 || k !== at + 1));
const DIR = join(ROOT, 'node_modules/@heroicons/react/20/solid');
if (!names.length) {
  console.error('usage: node heroicon-symbol.mjs <kebab-name> [...] [--root <prototemplate checkout>]');
  process.exit(2);
}
if (!existsSync(DIR)) {
  console.error(`heroicon-symbol: ${DIR} is missing; run pnpm install in the checkout or pass --root`);
  process.exit(2);
}
const headPath = join(ROOT, 'deck/parts/head.html');
const head = existsSync(headPath) ? readFileSync(headPath, 'utf8') : '';
const slidesDir = join(ROOT, 'deck/slides');
const slides = existsSync(slidesDir)
  ? readdirSync(slidesDir).filter((f) => f.endsWith('.html')).map((f) => [f, readFileSync(join(slidesDir, f), 'utf8')])
  : [];

let failed = false;
for (const name of names) {
  const kebab = name.replace(/^i-/, '').replace(/-icon$/, '');
  const pascal = kebab.replace(/(^|-)([a-z0-9])/g, (_, __, c) => c.toUpperCase());
  const file = join(DIR, `${pascal}Icon.js`);
  if (head.includes(`<symbol id="i-${kebab}"`)) {
    console.log(`<!-- i-${kebab} is already in the sprite in deck/parts/head.html -->`);
    continue;
  }
  if (!existsSync(file)) {
    console.error(`heroicon-symbol: no 20 solid glyph named ${kebab} (looked for ${pascal}Icon.js)`);
    failed = true;
    continue;
  }
  for (const [f, html] of slides) {
    if (html.includes(`<symbol id="i-${kebab}"`)) console.log(`<!-- deck/slides/${f} defines i-${kebab} for itself; once the sprite carries it, delete that copy -->`);
  }
  const src = readFileSync(file, 'utf8');
  const paths = [...src.matchAll(/createElement\("path", \{([\s\S]*?)\}\)/g)].map((m) => {
    const body = m[1];
    const d = (body.match(/\bd: "([^"]+)"/) || [])[1];
    const fill = (body.match(/fillRule: "([^"]+)"/) || [])[1];
    const clip = (body.match(/clipRule: "([^"]+)"/) || [])[1];
    return `<path${fill ? ` fill-rule="${fill}"` : ''} d="${d}"${clip ? ` clip-rule="${clip}"` : ''}/>`;
  });
  console.log(`<symbol id="i-${kebab}" viewBox="0 0 20 20">${paths.join(' ')}</symbol>`);
}
process.exit(failed ? 1 : 0);
