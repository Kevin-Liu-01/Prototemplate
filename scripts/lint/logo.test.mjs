/**
 * Tests for scripts/lint/logo.mjs: node --test scripts/lint/logo.test.mjs
 * (pnpm test:logo). Each case runs the lint with --root on a temporary
 * checkout that holds the real src/lib/logo.ts, a generated master, a
 * generated picture and the fingerprint, then seeds one violation.
 */
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { after, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

import { ROOT } from '../lib/root.mjs';
import { fingerprint, fingerprintText, loadLogo, previousMarkText, sha256 } from '../lib/logo-lock.mjs';
import { unlabelled } from './logo-labels.mjs';

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), 'logo.mjs');
const ROOTS = [];
const { LOGO, LOCKUP } = await loadLogo(ROOT);
const LOGO_SHA = sha256(LOGO.d);
/* the doubled-line monogram's bar drawing opens this way */
const MONOGRAM = 'M363 222.5L1197 222.5L1196.5 283L834 283.5L832.5 976L773 975.5L772.5 398L359.5 398Z';
/* the 11-06 globe, the previous logo, from its history file on /marks */
const GLOBE_1106 = readFileSync(join(ROOT, 'public/marks/graticule/variations/axis-and-meridian-behind.svg'), 'utf8').match(/ d="([^"]+)"/)[1];
const LOSER = readFileSync(join(ROOT, 'public/marks/graticule/variations/meridian-axis-behind.svg'), 'utf8').match(/ d="([^"]+)"/)[1];
const PICTURE = Buffer.from('a generated picture');

after(() => {
  for (const root of ROOTS) rmSync(root, { recursive: true, force: true });
});

function put(root, rel, body) {
  mkdirSync(dirname(join(root, rel)), { recursive: true });
  writeFileSync(join(root, rel), body);
}

/** A checkout where every rule holds; `edit` changes the manifest before it is written. */
function checkout(edit = (manifest) => manifest) {
  const root = mkdtempSync(join(tmpdir(), 'logo-'));
  ROOTS.push(root);
  mkdirSync(join(root, 'src/lib'), { recursive: true });
  copyFileSync(join(ROOT, 'src/lib/logo.ts'), join(root, 'src/lib/logo.ts'));
  put(root, 'public/brand/gt-globe-lockup.json', readFileSync(join(ROOT, 'public/brand/gt-globe-lockup.json')));
  put(root, 'public/brand/gt-globe-logo.json', fingerprintText(fingerprint(root, LOGO, LOCKUP)));
  put(root, 'public/brand/gt-globe-logo.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${LOGO.viewBox}" aria-label="General Translation"><path d="${LOGO.d}"/></svg>\n`);
  put(root, 'public/brand/no-bg-gt-globe-logo-light.png', PICTURE);
  put(root, 'src/components/Mark.tsx', "import { LOGO } from '@/lib/logo';\nexport const Mark = () => <path d={LOGO.d} />;\n");
  put(root, 'src/app/d/old-study/Nav.tsx', `export const Old = () => <path d='${MONOGRAM}' />;\n`);
  const manifest = edit({
    generated: [
      { path: 'public/brand/gt-globe-logo.svg', generator: 'test' },
      { path: 'public/brand/gt-globe-logo.json', generator: 'test' },
      { path: 'public/brand/no-bg-gt-globe-logo-light.png', generator: 'test', sourceSha256: LOGO_SHA, sha256: sha256(PICTURE) },
    ],
    history: [{ path: 'src/app/d/old-study/', reason: 'dated design study' }],
    notLogo: [],
    external: [],
  });
  put(root, 'scripts/lint/logo.json', JSON.stringify(manifest));
  put(root, 'src/lib/previous-mark.json', previousMarkText(manifest));
  return root;
}

const run = (root) => spawnSync(process.execPath, [SCRIPT, '--root', root], { encoding: 'utf8' });

function passes(root) {
  const result = run(root);
  assert.equal(result.status, 0, result.stdout);
}

function fails(root, pattern) {
  const result = run(root);
  assert.equal(result.status, 1, result.stdout);
  assert.match(result.stdout, pattern);
}

describe('lint:logo', () => {
  it('passes when every file holds', () => {
    passes(checkout());
  });

  it('rule 1: fails on the monogram outside history', () => {
    const root = checkout();
    put(root, 'src/components/Nav.tsx', `export const Nav = () => <path d='${MONOGRAM}' />;\n`);
    fails(root, /rule 1 monogram src\/components\/Nav\.tsx:1/);
  });

  it('rule 1: reads the docs and blog MDX under content/ and the top-level files', () => {
    let root = checkout();
    put(root, 'content/docs/seed.mdx', `<svg><path d="${MONOGRAM}" /></svg>\n`);
    fails(root, /rule 1 monogram content\/docs\/seed\.mdx:1/);
    root = checkout();
    put(root, 'README.md', `<svg><path d="${MONOGRAM}" /></svg>\n`);
    fails(root, /rule 1 monogram README\.md:1/);
  });

  it('rule 2: fails on an edited copy of LOGO.d', () => {
    const root = checkout();
    const edited = LOGO.d.replace(/(\d)(?=[^\d]*$)/, (digit) => String((Number(digit) + 1) % 10));
    assert.notEqual(edited, LOGO.d);
    put(root, 'src/components/Edited.ts', `export const D = '${edited}';\n`);
    fails(root, /rule 2 edited copy src\/components\/Edited\.ts:1/);
  });

  it('rule 3: fails on a vote loser outside /marks and passes on it inside', () => {
    const root = checkout();
    put(root, 'public/marks/graticule/variations/meridian-axis-behind.svg', `<svg><path d="${LOSER}"/></svg>\n`);
    passes(root);
    put(root, 'src/components/Loser.tsx', `export const L = () => <path d="${LOSER}" />;\n`);
    fails(root, /rule 3 vote loser src\/components\/Loser\.tsx:1: the losing candidate meridian-axis-behind/);
  });

  it('rule 12: fails on the 11-06 globe in new code and an SVG, passes on it under history', () => {
    let root = checkout();
    put(root, 'src/components/Globe.tsx', `export const Globe = () => <path d='${GLOBE_1106}' />;\n`);
    fails(root, /rule 12 previous logo src\/components\/Globe\.tsx:1: carries the 11-06 globe; use LOGO/);
    root = checkout();
    put(root, 'public/brand/new-banner.svg', `<svg xmlns="http://www.w3.org/2000/svg"><path d="${GLOBE_1106}"/></svg>\n`);
    fails(root, /rule 12 previous logo public\/brand\/new-banner\.svg:1/);
    root = checkout((m) => ({ ...m, history: [...m.history, { path: 'public/marks/old-globe.svg', rules: [12], reason: 'the 11-06 globe, kept as made' }] }));
    put(root, 'public/marks/old-globe.svg', `<svg xmlns="http://www.w3.org/2000/svg"><path d="${GLOBE_1106}"/></svg>\n`);
    passes(root);
  });

  it('rule 12: catches the 11-06 globe renumbered, respaced, shifted or scaled, and nothing else on /marks', () => {
    const renumber = (d, f) => d.replace(/-?(?:\d+\.?\d*|\.\d+)/g, (n) => String(+f(Number(n)).toFixed(1)));
    /* one decimal, every separator a space */
    let root = checkout();
    put(root, 'public/brand/rounded.svg', `<svg xmlns="http://www.w3.org/2000/svg"><path d="${renumber(GLOBE_1106, (n) => n).replace(/([A-Za-z])/g, ' $1 ')}"/></svg>\n`);
    fails(root, /rule 12 previous logo public\/brand\/rounded\.svg:1: carries the 11-06 globe, renumbered, respaced or scaled \(by its outline\); use LOGO/);
    /* every coordinate halved and moved, as a 128 unit copy drawn elsewhere (the path is absolute) */
    root = checkout();
    let axis = 0;
    const scaled = GLOBE_1106.replace(/([A-Za-z])|(-?(?:\d+\.?\d*|\.\d+))/g, (m, letter, n) => {
      if (letter) return letter;
      const shift = axis++ % 2 === 0 ? 10 : 20;
      return String(+(Number(n) / 2 + shift).toFixed(3));
    });
    put(root, 'src/components/Small.tsx', `export const Small = () => <path d="${scaled}" />;\n`);
    fails(root, /rule 12 previous logo src\/components\/Small\.tsx:1: carries the 11-06 globe, renumbered/);
    /* the logo itself and every other drawing on /marks/graticule keep their own outline */
    root = checkout();
    const dir = join(ROOT, 'public/marks/graticule/variations');
    let others = 0;
    for (const name of readdirSync(dir).filter((f) => f.endsWith('.svg') && f !== 'axis-and-meridian-behind.svg')) {
      const body = readFileSync(join(dir, name), 'utf8');
      if (!body.includes(' d="')) continue;
      put(root, `public/marks/others/${name}`, body);
      others += 1;
    }
    assert.ok(others > 10, `read ${others} drawings`);
    const result = run(root);
    assert.doesNotMatch(result.stdout, /rule 12/, result.stdout);
  });

  it('rule 4: fails on LOGO.d copied into a component', () => {
    const root = checkout();
    put(root, 'src/components/Copy.tsx', `export const Copy = () => <path d='${LOGO.d}' />;\n`);
    fails(root, /rule 4 hand copy src\/components\/Copy\.tsx:1/);
  });

  it('rule 5: fails on an edited picture, a picture from an older LOGO.d, an edited fingerprint and a master without LOGO.d', () => {
    let root = checkout();
    put(root, 'public/brand/no-bg-gt-globe-logo-light.png', Buffer.from('retouched'));
    fails(root, /rule 5 stale public\/brand\/no-bg-gt-globe-logo-light\.png: edited since/);
    root = checkout((m) => ({ ...m, generated: m.generated.map((e) => (e.sha256 ? { ...e, sourceSha256: '0'.repeat(64) } : e)) }));
    fails(root, /rule 5 stale public\/brand\/no-bg-gt-globe-logo-light\.png: drawn from LOGO\.d 000000000000/);
    root = checkout();
    put(root, 'public/brand/gt-globe-logo.json', '{"id":"axis-and-meridian-behind"}\n');
    fails(root, /rule 5 stale public\/brand\/gt-globe-logo\.json/);
    root = checkout();
    put(root, 'public/brand/gt-globe-logo.svg', '<svg><circle r="1"/></svg>\n');
    fails(root, /rule 5 stale public\/brand\/gt-globe-logo\.svg: does not hold the current LOGO\.d/);    root = checkout((m) => ({ ...m, history: [...m.history, { path: 'public/shots/old.jpg', reason: 'captured before the globe' }] }));
    put(root, 'public/shots/old.jpg', Buffer.from('a capture'));
    put(root, 'src/lib/previous-mark.json', '{"films":[],"pictures":[]}\n');
    fails(root, /rule 5 stale src\/lib\/previous-mark\.json/);
  });

  it('rule 6: fails on code loading a retired address, not on prose naming it', () => {
    const root = checkout();
    put(root, 'docs/history.md', 'The monogram lived at /brand/no-bg-gt-logo-light.png.\n');
    /* a kit file whose name starts like an old address is not one */
    put(root, 'motion/kit/endcard/endcard.js', "import '../brand/gt-logo-motion.js';\n");
    passes(root);
    put(root, 'src/components/Old.tsx', "export const Old = () => <img src='/brand/gt-logo-dark.svg' />;\n");
    fails(root, /rule 6 retired address src\/components\/Old\.tsx:1/);
    put(root, 'src/components/Nav.tsx', "export const Nav = () => <img src='/brand/no-bg-gt-logo-light.png' />;\n");
    fails(root, /rule 6 retired address src\/components\/Nav\.tsx:1/);
  });

  it('rule 7: fails on the name set as type in a brand SVG', () => {
    const root = checkout();
    put(root, 'public/brand/gt-globe-lockup.svg', `<svg aria-label="General Translation"><path d="${LOGO.d}"/><text x="0" y="0">General Translation</text></svg>\n`);
    fails(root, /rule 7 typeset name public\/brand\/gt-globe-lockup\.svg/);
  });

  it('rule 8: fails on an unlisted logo-named picture', () => {
    const root = checkout();
    put(root, 'public/atlas/og/issue.png', PICTURE);
    fails(root, /rule 8 unlisted picture public\/atlas\/og\/issue\.png/);
  });

  it('a symbol-scoped waiver covers that symbol only, and #gt-mark must draw LOGO.d', () => {
    const head = (mark, extra = '') =>
      `<svg><symbol id="gt-mark" viewBox="${LOGO.viewBox}"><path d="${mark}"/></symbol><symbol id="gt-monogram" viewBox="0 0 10 10"><path d="${MONOGRAM}"/></symbol></svg>\n${extra}`;
    const scoped = (m) => ({
      ...m,
      generated: [...m.generated, { path: 'deck/parts/head.html', generator: 'test' }],
      history: [...m.history, { path: 'deck/parts/head.html', symbol: 'gt-monogram', rules: [1, 9], reason: 'test' }],
    });
    let root = checkout(scoped);
    put(root, 'deck/parts/head.html', head(LOGO.d));
    passes(root);
    root = checkout(scoped);
    put(root, 'deck/parts/head.html', head(MONOGRAM));
    fails(root, /rule 1 monogram deck\/parts\/head\.html:1/);
    fails(root, /rule 2 edited copy deck\/parts\/head\.html:1: the #gt-mark symbol does not draw LOGO\.d alone/);
    root = checkout(scoped);
    put(root, 'deck/parts/head.html', head(LOGO.d, `<svg><path d="${MONOGRAM}"/></svg>\n`));
    fails(root, /rule 1 monogram deck\/parts\/head\.html:2/);
  });

  it('rule 9: fails on the monogram named by file or symbol outside history', () => {
    let root = checkout();
    put(root, 'src/components/Nav.tsx', "export const Nav = () => <img src='/marks/previous/gt-monogram.svg' alt='' />;\n");
    fails(root, /rule 9 monogram reference src\/components\/Nav\.tsx:1/);
    root = checkout();
    put(root, 'deck/slides/09-mark.html', '<svg><use href="#gt-monogram"/></svg>\n');
    fails(root, /rule 9 monogram reference deck\/slides\/09-mark\.html:1/);
    root = checkout((m) => ({ ...m, history: [...m.history, { path: 'deck/slides/16-mark.html', reason: 'the previous mark' }] }));
    put(root, 'deck/slides/16-mark.html', '<svg><use href="#gt-monogram"/></svg>\n');
    passes(root);
  });

  it('rule 1: notLogo never waives the monogram, so it belongs only in public/marks/previous/', () => {
    const catalog = (m) => ({
      ...m,
      history: [...m.history, { path: 'public/marks/previous/gt-monogram.svg', reason: 'the previous mark' }],
      notLogo: [{ path: 'public/marks/', reason: 'the catalog' }],
    });
    let root = checkout(catalog);
    put(root, 'public/marks/previous/gt-monogram.svg', `<svg><path d="${MONOGRAM}"/></svg>\n`);
    passes(root);
    root = checkout(catalog);
    put(root, 'public/marks/previous/gt-monogram.svg', `<svg><path d="${MONOGRAM}"/></svg>\n`);
    put(root, 'public/marks/candidates/doubled.svg', `<svg><path d="${MONOGRAM}"/></svg>\n`);
    fails(root, /rule 1 monogram public\/marks\/candidates\/doubled\.svg:1/);
  });

  it('rule 8: every film, poster and contact sheet is listed, and a checked one is held at its bytes', () => {
    const FILM = Buffer.from('a film that ends on the globe');
    const checked = (m) => ({ ...m, checked: [{ path: 'public/media/new-film.mp4', reason: 'test', sha256: sha256(FILM) }] });
    let root = checkout();
    put(root, 'public/media/new-film.mp4', FILM);
    fails(root, /rule 8 unlisted picture public\/media\/new-film\.mp4: a film, poster or contact sheet/);
    root = checkout();
    put(root, 'public/motion/sheets/new-film.webp', FILM);
    fails(root, /rule 8 unlisted picture public\/motion\/sheets\/new-film\.webp/);
    root = checkout(checked);
    put(root, 'public/media/new-film.mp4', FILM);
    passes(root);
    root = checkout(checked);
    put(root, 'public/media/new-film.mp4', Buffer.from('a new cut'));
    fails(root, /rule 8 changed picture public\/media\/new-film\.mp4/);
    root = checkout((m) => ({ ...m, history: [...m.history, { path: 'public/media/old-film.mp4', reason: 'made before the globe; re-render pending' }] }));
    put(root, 'public/media/old-film.mp4', FILM);
    passes(root);
  });

  it('a counted rule-9 waiver allows that many references and no more', () => {
    const counted = (m) => ({ ...m, history: [...m.history, { path: 'src/lib/marks.ts', rules: [9], count: 1, reason: 'test' }] });
    let root = checkout(counted);
    put(root, 'src/lib/marks.ts', '/* the previous mark lives at public/marks/previous/gt-monogram.svg */\n');
    passes(root);
    root = checkout(counted);
    put(root, 'src/lib/marks.ts', "/* the previous mark lives at public/marks/previous/gt-monogram.svg */\nexport const OLD = '/marks/previous/gt-monogram.svg';\n");
    fails(root, /rule 9 monogram reference src\/lib\/marks\.ts:2: names gt-monogram, the previous mark \(2 times; the manifest allows 1\)/);
    root = checkout((m) => ({ ...m, history: [...m.history, { path: 'src/lib/marks.ts', count: 1, reason: 'test' }] }));
    put(root, 'src/lib/marks.ts', '/* gt-monogram */\n');
    fails(root, /"count" is a positive whole number on a history entry whose rules are \[9\]/);
  });

  it('rule 1: fails on the monogram respaced, or shifted and scaled', () => {
    const drawing = readFileSync(join(ROOT, 'public/marks/previous/gt-monogram.svg'), 'utf8').match(/ d="([^"]+)"/)[1];
    let root = checkout();
    put(root, 'src/components/Spaced.tsx', `export const D = '${drawing.replace(/([A-Za-z])/g, ' $1 ').trim()}';\n`);
    fails(root, /rule 1 monogram src\/components\/Spaced\.tsx:1: .*by its shape/);
    let axis = 0;
    const scaled = drawing.replace(/[A-Za-z]|-?\d+\.?\d*/g, (t) => {
      if (/[A-Za-z]/.test(t)) {
        axis = 0;
        return ` ${t} `;
      }
      const v = Number(t) * 0.25 + (axis === 0 ? 40 : 7);
      axis ^= 1;
      return String(Math.round(v * 100) / 100);
    });
    root = checkout();
    put(root, 'src/components/Scaled.tsx', `export const D = '${scaled.trim()}';\n`);
    fails(root, /rule 1 monogram src\/components\/Scaled\.tsx:1: .*by its shape/);
  });

  it('rule 6: a blanket history entry does not waive a retired address; one naming rule 6 does', () => {
    let root = checkout();
    put(root, 'src/app/d/old-study/Foot.tsx', "export const Foot = () => <img src='/brand/no-bg-gt-logo-light.png' />;\n");
    fails(root, /rule 6 retired address src\/app\/d\/old-study\/Foot\.tsx:1/);
    root = checkout((m) => ({ ...m, history: [...m.history, { path: 'src/app/d/old-study/Foot.tsx', rules: [6], reason: 'test' }] }));
    put(root, 'src/app/d/old-study/Foot.tsx', "export const Foot = () => <img src='/brand/no-bg-gt-logo-light.png' />;\n");
    passes(root);
  });

  it('rule 10: fails on a logo mask that stretches or cuts the globe, in history too', () => {
    const rule = (size) => `.mark {\n  width: 1.14em;\n  height: 0.72em;\n  mask: url('/brand/no-bg-gt-globe-logo-light.png') center / ${size} no-repeat;\n}\n`;
    let root = checkout();
    put(root, 'src/app/d/old-study/mark.css', rule('100% 158.5%'));
    fails(root, /rule 10 cropped logo src\/app\/d\/old-study\/mark\.css:1: sizes a logo picture at "100% 158\.5%"/);
    root = checkout();
    put(root, 'src/styles/mark.css', `.mark { mask-image: url('/brand/no-bg-gt-globe-logo-light.png'); mask-size: cover; }\n`);
    fails(root, /rule 10 cropped logo src\/styles\/mark\.css:1: sizes a logo picture at "cover"/);
    root = checkout();
    put(root, 'src/app/d/old-study/mark.css', rule('123.25% 123.25%'));
    put(root, 'src/styles/mark.css', `.mark { mask-image: url('/brand/no-bg-gt-globe-logo-light.png'); mask-size: contain; }\n`);
    passes(root);
  });

  it('rule 11: fails on a deck slide that shows a history picture without saying so', () => {
    const PHOTO = Buffer.from('a capture from before the globe');
    const listed = (m) => ({ ...m, history: [...m.history, { path: 'deck/shots/old-capture.jpg', reason: 'captured before the globe' }] });
    const slide = (caption) => `<section class="slide"><figure><img src="shots/old-capture.jpg" alt=""><figcaption>${caption}</figcaption></figure></section>\n`;
    let root = checkout(listed);
    put(root, 'deck/shots/old-capture.jpg', PHOTO);
    put(root, 'deck/slides/40-old.html', slide('The archive at 1110 pixels wide.'));
    fails(root, /rule 11 unlabelled previous mark deck\/slides\/40-old\.html:1: shows deck\/shots\/old-capture\.jpg/);
    root = checkout(listed);
    put(root, 'deck/shots/old-capture.jpg', PHOTO);
    put(root, 'deck/slides/40-old.html', slide('The archive, captured before the logo, so it shows the previous mark.'));
    passes(root);    root = checkout(listed);
    put(root, 'deck/shots/old-capture.jpg', PHOTO);
    put(root, 'deck/slides/40-old.html', '<section class="slide"><figure><img src="../shots/old-capture.jpg" alt=""></figure></section>\n');
    fails(root, /rule 11 unlabelled previous mark deck\/slides\/40-old\.html:1: shows deck\/shots\/old-capture\.jpg/);
  });

  it('fails when a listed path is gone', () => {
    const root = checkout((m) => ({ ...m, history: [...m.history, { path: 'public/media/gone.mp4', reason: 'test' }] }));
    fails(root, /public\/media\/gone\.mp4 is listed under "history" but not on disk/);
  });
});

describe('lint:logo labels (logo-labels.mjs)', () => {
  const site = (address) => (address.startsWith('/') ? `public${address}` : null);
  const old = (rel) => rel === 'public/shots/old.jpg';
  const NOTE = 'Captured before the logo; it shows the previous mark.';

  it('finds the address in src, srcset and the /_next/image form, and skips the head', () => {
    const html = `<html><head><link rel="preload" as="image" href="/shots/old.jpg"></head><body><main><p><img src="/_next/image?url=%2Fshots%2Fold.jpg%3Fv%3D2&amp;w=640"></p></main></body></html>`;
    assert.deepEqual(unlabelled(html, site, old).map((m) => [m.rel, m.scope]), [['public/shots/old.jpg', 'p']]);
  });

  it('takes the nearest figure or paragraph, so a label elsewhere in the article does not count', () => {
    const html = `<article><p><img src="/shots/old.jpg"></p><p><img src="/shots/new.jpg"><span>${NOTE}</span></p></article>`;
    assert.equal(unlabelled(html, site, old).length, 1);
    assert.equal(unlabelled(`<article><p><img src="/shots/old.jpg"><span>${NOTE}</span></p></article>`, site, old).length, 0);
  });

  it('needs one label per history picture when the scope is a whole section', () => {
    const both = (words) => `<section><img src="/shots/old.jpg"><img src="/shots/older.jpg"><p>${words}</p></section>`;
    const two = (rel) => rel === 'public/shots/old.jpg' || rel === 'public/shots/older.jpg';
    assert.equal(unlabelled(both(NOTE), site, two).length, 2);
    assert.equal(unlabelled(both(`${NOTE} ${NOTE}`), site, two).length, 0);
    /* a picture's light and dark twins, in one element or two, are one picture */
    const twins = (rel) => rel === 'public/shots/old.jpg' || rel === 'public/shots/old-dark.jpg';
    assert.equal(unlabelled(`<section><img src="/shots/old.jpg"><img src="/shots/old-dark.jpg"><p>${NOTE}</p></section>`, site, twins).length, 0);
  });

  it('reads an SVG picture too', () => {
    const svg = (rel) => rel === 'public/marks/old.svg';
    assert.equal(unlabelled('<figure><img src="/marks/old.svg"><figcaption>The mark until 2026.</figcaption></figure>', site, svg).length, 1);
    assert.equal(unlabelled('<figure><img src="/marks/old.svg"><figcaption>The previous mark.</figcaption></figure>', site, svg).length, 0);
  });

  it('takes a card marked with data-previous-mark as the scope', () => {
    const card = (note) => `<section><a data-previous-mark=""><figure><img src="/shots/old.jpg"></figure><span>${note}</span></a></section>`;
    assert.equal(unlabelled(card(NOTE), site, old).length, 0);
    assert.equal(unlabelled(card('A card.'), site, old).length, 1);
  });
});
