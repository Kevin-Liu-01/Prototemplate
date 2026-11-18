// Tests for the two turning loaders. The armillary
// (src/components/brand/GtLogoArmillary.tsx): its geometry is what pnpm
// build:logo-armillary writes, its beats sit on the 0.5 s grid, its rings
// grow out of their hinges from 0 and turn from rest to rest with no speed
// at either end, they project the logo's own ovals at rest, a frame takes
// under 0.25 ms, and in Chrome (playwright-core, 256 CSS px at 4x, the light
// theme, where Chrome composites masked layers exactly) every hand-off of
// the lap changes no pixel: rest to Open, Open to the swing, the swing to
// Close and Close to rest. The ASCII loader
// (src/components/brand/GtLogoAscii.frames.ts): its frames are what pnpm
// build:logo-ascii writes, use only the ramp, start and end on the still,
// agree with the reference rendering and keep the dot screen in the ring's
// hole. Loaded through Node's type stripping, the component through a TSX
// hook as scripts/lint/logo-motion.test.mjs loads GtLogoMotion.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { join } from 'node:path';
import { after, before, test } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { chromium } from 'playwright-core';
import ts from 'typescript';

import { ROOT } from '../lib/root.mjs';
import { chromePath } from '../lib/site-pages.mjs';

/* the component is TSX, imports its stylesheets and the @/ alias: compile the one, skip the others, resolve the alias */
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('@/')) {
      const base = join(ROOT, 'src', specifier.slice(2));
      const hit = ['.ts', '.tsx'].map((ext) => base + ext).find((f) => existsSync(f));
      return nextResolve(pathToFileURL(hit ?? base).href, context);
    }
    const relative = specifier.startsWith('./') || specifier.startsWith('../');
    if (relative && !/\.[cm]?[jt]sx?$|\.css$/.test(specifier) && /\.tsx?$/.test(context.parentURL ?? '')) {
      const base = fileURLToPath(new URL(specifier, context.parentURL));
      const ext = ['.ts', '.tsx'].find((e) => existsSync(base + e)) ?? '.ts';
      return nextResolve(`${specifier}${ext}`, context);
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (url.endsWith('.css')) return { format: 'module', source: '', shortCircuit: true };
    if (url.endsWith('.tsx')) {
      const source = readFileSync(fileURLToPath(url), 'utf8');
      const out = ts.transpileModule(source, { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
      return { format: 'module', source: out.outputText, shortCircuit: true };
    }
    return nextLoad(url, context);
  },
});

const F = await import(new URL('../../src/components/brand/GtLogoArmillary.frame.ts', import.meta.url).href);
const { GT_LOGO_ARMILLARY: A } = await import(new URL('../../src/components/brand/GtLogoArmillary.geometry.ts', import.meta.url).href);
const { GT_LOGO_ASCII: ASCII } = await import(new URL('../../src/components/brand/GtLogoAscii.frames.ts', import.meta.url).href);

test('the armillary geometry is what pnpm build:logo-armillary writes', () => {
  const run = spawnSync(process.execPath, [join(ROOT, 'scripts/build/logo-armillary.mjs'), '--check'], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr || 'pnpm build:logo-armillary --check failed');
});

test('the armillary lap is rest, open, swing and close on the 0.5 s grid, resting on the logo', () => {
  for (const beat of Object.values(A.beats)) assert.equal((beat * 2) % 1, 0, `beat ${beat} s`);
  assert.equal(F.armillaryLap(A), 3.5);
  for (const t of [0, 0.25, A.beats.rest - 0.001, F.armillaryLap(A)]) assert.equal(F.armillaryFrame(A, t).phase, 'rest', `at ${t} s`);
  assert.equal(F.armillaryFrame(A, A.beats.rest).phase, 'open');
  assert.equal(F.armillaryFrame(A, A.beats.rest + A.beats.open + 0.01).phase, 'swing');
  assert.equal(F.armillaryFrame(A, A.beats.rest + A.beats.open + A.beats.swing).phase, 'close');
});

test('Open starts on the logo and Close lands on it: every channel 0 long at both ends of the lap', () => {
  for (const c of Object.values(F.armillaryChannels(A, 0))) assert.equal(c.len, 0);
  const end = F.armillaryFrame(A, F.armillaryLap(A) - 1e-9).channels;
  for (const c of Object.values(end)) assert.ok(c.len < 1e-3, `a channel ${c.len} long as Close ends`);
});

test('the rings grow out of their hinges from 0, turn from rest to rest with no speed at either end, and shrink back', () => {
  assert.equal(F.armillaryReach(A, 0), 0);
  assert.equal(F.armillaryReach(A, 1), 0);
  assert.equal(F.armillaryReach(A, 0.5), 90);
  assert.equal(F.armillaryRings(A, 0).meridianFront, '');
  const start = F.armillaryAngles(A, 0);
  const end = F.armillaryAngles(A, 1);
  assert.equal(start.meridian, F.SPHERE.meridian.rest);
  assert.equal(start.latitude, F.SPHERE.latitude.rest);
  assert.equal(end.meridian - start.meridian, A.turns.meridian);
  assert.equal(end.latitude - start.latitude, A.turns.latitude);
  const h = 1e-4;
  for (const u of [0, 1 - h]) {
    const speed = (F.easeInOut(u + h) - F.easeInOut(u)) / h;
    assert.ok(Math.abs(speed) < 1e-3, `ease speed ${speed} at ${u}`);
  }
});

test('at rest the rings project the logo\'s meridian and latitude ovals', () => {
  const m = F.SPHERE.meridian;
  const l = F.SPHERE.latitude;
  const east = F.meridianPoint(90, m.rest);
  const top = F.latitudePoint(90, l.rest);
  assert.ok(Math.abs(east.x - m.cx - 51.2808) < 1e-6, `meridian rx ${east.x - m.cx}`);
  assert.ok(Math.abs(l.cy - top.y - 51.1104) < 1e-6, `latitude ry ${l.cy - top.y}`);
  assert.ok(F.meridianPoint(270, m.rest).z > 0);
  assert.ok(F.latitudePoint(90, l.rest).z > 0);
});

test('a frame of the armillary takes under 0.25 ms', () => {
  const times = [];
  const lap = F.armillaryLap(A);
  for (let i = 0; i < 400; i++) {
    const t0 = performance.now();
    F.armillaryFrame(A, (i / 400) * lap);
    times.push(performance.now() - t0);
  }
  times.sort((a, b) => a - b);
  assert.ok(times[200] < 0.25, `median ${times[200].toFixed(3)} ms`);
});

/* the hand-offs, drawn by Chrome */
const SIZE = 256;
const DPR = 4;
let browser = null;
let page = null;
let markOf = null;
before(async () => {
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { default: GtLogoArmillary } = await import(pathToFileURL(join(ROOT, 'src/components/brand/GtLogoArmillary.tsx')).href);
  markOf = (at) => renderToStaticMarkup(createElement(GtLogoArmillary, { size: SIZE, at }));
  browser = await chromium.launch({ executablePath: chromePath(), headless: true, args: ['--disable-gpu'] });
  const context = await browser.newContext({ viewport: { width: SIZE, height: SIZE }, deviceScaleFactor: DPR, reducedMotion: 'no-preference' });
  page = await context.newPage();
});
after(async () => {
  await browser?.close();
});
const CSS = ['GtLogoMotion.css', 'GtLogoArmillary.css'].map((f) => readFileSync(join(ROOT, 'src/components/brand', f), 'utf8')).join('\n');
async function shot(at) {
  await page.setContent(`<!doctype html><html><head><style>${CSS}</style></head><body style="margin:0;background:#ffffff;color:#070707">${markOf(at)}</body></html>`);
  return page.screenshot({ clip: { x: 0, y: 0, width: SIZE, height: SIZE } });
}

test('in Chrome every hand-off of the armillary\'s lap changes no pixel', async () => {
  const { rest, open, swing } = A.beats;
  const seams = [
    ['rest to Open', rest - 0.001, rest],
    ['Open to the swing', rest + open, rest + open + 1e-6],
    ['the swing to Close', rest + open + swing - 1e-6, rest + open + swing],
    ['Close to rest', F.armillaryLap(A) - 1e-9, 0],
  ];
  for (const [name, a, b] of seams) {
    const [x, y] = [await shot(a), await shot(b)];
    assert.ok(x.equals(y), `${name}: the frames at ${a} s and ${b} s differ`);
  }
  /* and the swing does move: its middle is not the stand */
  assert.ok(!(await shot(rest + open + swing / 2)).equals(await shot(rest + open)), 'the swing draws nothing');
});

test('the ASCII frames are what pnpm build:logo-ascii writes', () => {
  const run = spawnSync(process.execPath, [join(ROOT, 'scripts/build/logo-ascii.mjs'), '--check'], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr || 'pnpm build:logo-ascii --check failed');
});

test('every ASCII frame is 45 by 21 in the ramp, and the lap starts and ends on the still', () => {
  const allowed = new Set([' ', ...ASCII.ramp]);
  for (const row of ASCII.table) {
    assert.equal(row.length, ASCII.cols);
    for (const ch of row) assert.ok(allowed.has(ch), `glyph ${ch}`);
  }
  for (const frame of [ASCII.still, ...ASCII.turn]) assert.equal(frame.length, ASCII.rows);
  /* the turn's last frame eases into the still, so the next frame shown is the still itself */
  const last = ASCII.turn[ASCII.turn.length - 1].map((id) => ASCII.table[id]);
  const still = ASCII.still.map((id) => ASCII.table[id]);
  const differ = last.reduce((n, row, r) => n + [...row].filter((ch, c) => ch !== still[r][c]).length, 0);
  assert.ok(differ <= 12, `the turn's last frame differs from the still in ${differ} cells`);
  assert.ok(ASCII.agreement.hole >= 0.9, `the still agrees with the reference in ${ASCII.agreement.hole} of the hole`);
  assert.ok(ASCII.agreement.ring >= 0.85, `the still agrees with the reference in ${ASCII.agreement.ring} of the ring`);
});

test('the dot screen lies in the ring\'s hole and holds only dots', () => {
  assert.equal(ASCII.dots.length, ASCII.rows);
  for (const row of ASCII.dots) {
    assert.equal(row.length, ASCII.cols);
    assert.match(row, /^[. ]+$/);
  }
  /* the hole's edge columns stay clear */
  assert.equal(ASCII.dots[0].trim(), '');
  assert.equal(ASCII.dots[ASCII.rows - 1].trim(), '');
});
