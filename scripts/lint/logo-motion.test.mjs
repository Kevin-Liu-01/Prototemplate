// Tests for the live logo motion (src/components/brand/GtLogoMotion.tsx):
// whatever is not being drawn or undrawn is the logo itself. The component
// is rendered to markup with its stylesheet, drawn by Chrome for Testing
// through playwright-core at 256 CSS px and 4x (1024 px for the drawn box),
// its animations and transitions paused and seeked, and each frame compared
// with the still logo pixel by pixel:
//
//   hand-off   the motion layer at the start of the hover and of the loader,
//              at the end of the leave, and at every seam of the loader's
//              lap, is the still logo with no pixel different
//   still      in every frame, every pixel outside the lines that move (the
//              meridian's band and the C's breaks round it, the latitude's
//              band and the stem's cut, the lap's band) is the logo's
//   end pose   the draw-back ends on the logo without its meridian: the
//              logo's pixels outside the meridian's band, and inside it the
//              logo's other parts drawn plainly (the ring, the bar from its
//              free end, the stem, the C closed), within a level of
//              antialiasing
//   tip        through the whole loop the G's tip is the logo's, except
//              while the G's own lap runs over it
//   steps      the first and the last step of each move (the hover's enter
//              and leave, the draw-back, the meridian's lap, the G's lap)
//              change no more pixels than the step after (or before) it, so
//              nothing pops in one frame as a move starts or lands
//
// The pixel tests run in the light theme, where Chrome composites the masked
// layers exactly; in the dark theme Chrome rounds a masked layer's
// premultiplied ink by one level on antialiased edges, and that is all the
// dark run allows. LOGO_MOTION_BROWSERS=chromium,firefox,webkit and
// LOGO_MOTION_THEMES=light,dark widen the run to report the other engines
// (Firefox and WebKit round masks and blends by a level or more, so only
// Chromium is held to it); LOGO_MOTION_SHOTS=<dir> writes the checked
// frames there as PNG. Usage: node --test scripts/lint/logo-motion.test.mjs
import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { join } from 'node:path';
import { after, before, describe, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { inflateSync } from 'node:zlib';

import { chromium, firefox, webkit } from 'playwright-core';
import ts from 'typescript';

import { ROOT } from '../lib/root.mjs';
import { chromePath } from '../lib/site-pages.mjs';

/* the component is TSX and imports its stylesheet: compile the one, skip the other */
registerHooks({
  resolve(specifier, context, nextResolve) {
    const relative = specifier.startsWith('./') || specifier.startsWith('../');
    if (relative && !/\.[cm]?[jt]sx?$|\.css$/.test(specifier) && /\.tsx?$/.test(context.parentURL ?? '')) return nextResolve(`${specifier}.ts`, context);
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

const { createElement } = await import('react');
const { renderToStaticMarkup } = await import('react-dom/server');
const { default: GtLogoMotion } = await import(new URL('../../src/components/brand/GtLogoMotion.tsx', import.meta.url).href);
const { GT_LOGO_MOTION: G } = await import(new URL('../../src/components/brand/GtLogoMotion.geometry.ts', import.meta.url).href);
const CSS = readFileSync(join(ROOT, 'src/components/brand/GtLogoMotion.css'), 'utf8');
const { timing: TIMING, logo: MEASURES } = JSON.parse(readFileSync(join(ROOT, 'scripts/build/logo-motion.json'), 'utf8'));

const SIZE = 256;
const DPR = 4;
const PX = SIZE * DPR;
const HOVER = TIMING.hover * 1000;
const { D1, R1, D2 } = Object.fromEntries(Object.entries(TIMING.beats).map(([k, v]) => [k, v * 1000]));
const LOOP = (TIMING.beats.D1 + TIMING.beats.R1 + TIMING.beats.D2 + TIMING.beats.R2) * 1000;
const FRAME = 1000 / 60;
/* the loader's rests and seams: the draw-back's end, the rests after the meridian's lap and after the G's, the end of a lap and the next */
const SEAMS = [HOVER, HOVER + D1 + R1 / 2, HOVER + D1 + R1 + D2 + (LOOP - D1 - R1 - D2) / 2, HOVER + LOOP - 0.01, HOVER + LOOP, HOVER + 2 * LOOP];
/** a pixel has changed between two frames when it moves more than this many levels */
const CHANGED = 8;
const THEMES = { light: { paper: '#ffffff', ink: '#070707' }, dark: { paper: '#070707', ink: '#f2f2f0' } };
/**
 * levels the end pose may differ from the logo without its meridian drawn
 * plainly, inside the meridian's zone: the same parts, drawn under a mask
 * and blended. Chrome flattens a curve to within about a quarter pixel, so
 * two draws of one edge can differ by a quarter of the ink there; a
 * meridian left behind or a break left open differs by all of it.
 */
const BARE_SLACK = 64;
/** levels a pixel may differ by where the frame should be the logo: none in the light theme, one in the dark (Chrome's masked-layer rounding) */
const SLACK = { light: 0, dark: 1 };
const ENGINES = { chromium, firefox, webkit };
const BROWSERS = (process.env.LOGO_MOTION_BROWSERS ?? 'chromium').split(',');
const THEME_IDS = (process.env.LOGO_MOTION_THEMES ?? 'light,dark').split(',');
const SHOTS = process.env.LOGO_MOTION_SHOTS;

/* ------------------------------------------------------------ pixels */
/** a playwright PNG (8 bit RGB or RGBA, not interlaced) as one channel, the red */
function red(png) {
  let at = 8;
  let width = 0;
  let channels = 0;
  const data = [];
  while (at < png.length) {
    const len = png.readUInt32BE(at);
    const type = png.toString('latin1', at + 4, at + 8);
    const body = png.subarray(at + 8, at + 8 + len);
    if (type === 'IHDR') {
      width = body.readUInt32BE(0);
      assert.equal(body[8], 8, 'an 8 bit PNG');
      channels = { 2: 3, 6: 4 }[body[9]];
      assert.ok(channels && body[12] === 0, 'an RGB or RGBA PNG, not interlaced');
    }
    if (type === 'IDAT') data.push(body);
    at += 12 + len;
  }
  const raw = inflateSync(Buffer.concat(data));
  const stride = width * channels;
  const height = raw.length / (stride + 1);
  const out = new Uint8Array(width * height);
  let prev = new Uint8Array(stride);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    const cur = new Uint8Array(stride);
    for (let i = 0; i < stride; i++) {
      const a = i >= channels ? cur[i - channels] : 0;
      const b = prev[i];
      const c = i >= channels ? prev[i - channels] : 0;
      const p = a + b - c;
      const pa = Math.abs(p - a);
      const pb = Math.abs(p - b);
      const pc = Math.abs(p - c);
      const paeth = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      cur[i] = (line[i] + [0, a, b, (a + b) >> 1, paeth][filter]) & 255;
    }
    for (let x = 0; x < width; x++) out[y * width + x] = cur[x * channels];
    prev = cur;
  }
  return out;
}
/** pixels where two frames differ by more than slack, inside the region (all of it when none) */
function differing(a, b, slack = 0, region = null) {
  let n = 0;
  let worst = 0;
  for (let i = 0; i < a.length; i++) {
    if (region && !region[i]) continue;
    const d = Math.abs(a[i] - b[i]);
    if (d > slack) n++;
    if (d > worst) worst = d;
  }
  return { n, worst };
}
/** a region grown by r pixels (square) */
function grow(region, r) {
  let cur = region;
  for (const [dx, dy] of [
    [1, 0],
    [0, 1],
  ]) {
    const next = new Uint8Array(cur.length);
    for (let y = 0; y < PX; y++) {
      for (let x = 0; x < PX; x++) {
        let on = 0;
        for (let k = -r; k <= r && !on; k++) {
          const xx = x + dx * k;
          const yy = y + dy * k;
          if (xx >= 0 && yy >= 0 && xx < PX && yy < PX) on = cur[yy * PX + xx];
        }
        next[y * PX + x] = on;
      }
    }
    cur = next;
  }
  return cur;
}
const not = (region) => region.map((v) => (v ? 0 : 1));

/* ------------------------------------------------------------ the page */
const pageOf = (body, theme) =>
  `<!doctype html><html><head><style>${CSS}</style></head><body style="margin:0;background:${THEMES[theme].paper};color:${THEMES[theme].ink}">${body}</body></html>`;
const markOf = (props) => renderToStaticMarkup(createElement(GtLogoMotion, { size: SIZE, ...props }));
/** an svg in the logo's box, for the regions and the plain references */
const svgOf = (body) => `<svg viewBox="${G.viewBox}" width="${SIZE}" height="${SIZE}" style="display:block" fill="currentColor">${body}</svg>`;
const stroke = (d, width, extra = '') => `<path d="${d}" fill="none" stroke="currentColor" stroke-width="${width}" ${extra}/>`;
/* the bands the lines move in: the meridian's (with the C's breaks round it), the latitude's with the stem's cut, the lap's */
const MOVING = stroke(G.meridian.d, G.meridian.width) + stroke(G.latitude.d, G.fill.width) + stroke(G.meridianLap.d, G.width);
/* where the logo without its meridian replaces the logo once the meridian has gone: the meridian's band inside its zone */
const ZONE =
  `<defs><mask id="zone" maskUnits="userSpaceOnUse" x="0" y="0" width="256" height="256">` +
  `<path d="${G.zone.band.d}" fill="none" stroke="#fff" stroke-width="${G.zone.band.width}"/>` +
  `<circle cx="${G.ring.cx}" cy="${G.ring.cy}" r="${G.zone.ring.r}" fill="none" stroke="#000" stroke-width="${G.zone.ring.width}"/>` +
  `<path d="${G.zone.breaks.d}" fill="none" stroke="#fff" stroke-width="${G.zone.breaks.width}"/>` +
  `<path d="${G.zone.ends.d}" fill="none" stroke="#000" stroke-width="${G.zone.ends.width}"/>` +
  `</mask></defs>${stroke(G.meridian.d, G.meridian.width, 'mask="url(#zone)"')}`;
/* the logo without its meridian, drawn plainly from its parts, as far as the meridian's zone reaches: the ring, the bar from its free end, the stem and the C */
const BARE =
  `<circle cx="${G.ring.cx}" cy="${G.ring.cy}" r="${G.ring.r}" fill="none" stroke="currentColor" stroke-width="${G.width}"/>` +
  `<path d="${G.bar}"/><path d="${G.stem}"/>${stroke(G.c, G.width)}`;
/* the G's tip: 16 units square round its free end */
const TIP = {
  x: G.ring.cx - MEASURES.R * Math.cos((MEASURES.gEnd * Math.PI) / 180),
  y: G.ring.cy - MEASURES.A * Math.sin((MEASURES.gEnd * Math.PI) / 180),
  half: 8,
};

async function session(engine, theme) {
  /* Chrome's software rasterizer: with the GPU, two draws of the same path now and then differ by a pixel or two */
  const browser = await ENGINES[engine].launch(engine === 'chromium' ? { executablePath: chromePath(), headless: true, args: ['--disable-gpu'] } : { headless: true });
  const context = await browser.newContext({ viewport: { width: SIZE, height: SIZE }, deviceScaleFactor: DPR, reducedMotion: 'no-preference' });
  const page = await context.newPage();
  const shot = async (name) => {
    const png = await page.screenshot({ clip: { x: 0, y: 0, width: SIZE, height: SIZE } });
    if (SHOTS && name) {
      mkdirSync(SHOTS, { recursive: true });
      writeFileSync(join(SHOTS, `${engine}-${theme}-${name}.png`), png);
    }
    return red(png);
  };
  const load = (body) => page.setContent(pageOf(body, theme));
  /** every animation and transition paused at ms */
  const seek = (ms) =>
    page.evaluate((t) => {
      for (const a of document.getAnimations()) {
        a.pause();
        a.currentTime = t;
      }
    }, ms);
  const ink = async (body) => {
    await load(svgOf(body));
    const g = await shot();
    return g.map((v) => (v !== red255(theme) ? 1 : 0));
  };
  return { browser, page, shot, load, seek, ink };
}
const red255 = (theme) => parseInt(THEMES[theme].paper.slice(1, 3), 16);

/* ------------------------------------------------------------ the frames */
async function framesOf(s, theme) {
  const out = {};
  /* the still logo, and the regions */
  await s.load(markOf({ mode: 'static' }));
  out.rest = await s.shot('rest');
  out.moving = grow(await s.ink(MOVING), 2);
  const zone = await s.ink(ZONE);
  out.zoneIn = not(grow(not(zone), 2));
  out.zoneOut = not(grow(zone, 2));
  await s.load(svgOf(BARE));
  out.bare = await s.shot('bare');
  const tip = new Uint8Array(PX * PX);
  const [vx, vy, vw] = G.viewBox.split(' ').map(Number);
  const toPx = (u, o) => Math.round(((u - o) / vw) * PX);
  for (let y = toPx(TIP.y - TIP.half, vy); y < toPx(TIP.y + TIP.half, vy); y++) for (let x = toPx(TIP.x - TIP.half, vx); x < toPx(TIP.x + TIP.half, vx); x++) tip[y * PX + x] = 1;
  out.tip = tip;

  /* the loader: every 60 fps frame of the draw-back and of one lap, and the seams */
  await s.load(markOf({ mode: 'loader' }));
  out.loader = [];
  for (let t = 0; t <= HOVER + LOOP + 0.01; t += FRAME) {
    await s.seek(t);
    out.loader.push({ t, g: await s.shot(SHOTS ? `loader-${Math.round(t)}` : null) });
  }
  out.seams = {};
  for (const t of SEAMS) {
    await s.seek(t);
    out.seams[t] = await s.shot(SHOTS ? `seam-${Math.round(t)}` : null);
  }

  /* the hover: enter, hold, leave */
  await s.load(markOf({ mode: 'hover' }));
  await s.page.evaluate(() => document.querySelector('.gt-logo-motion').setAttribute('data-active', ''));
  out.enter = [];
  for (let t = 0; t <= HOVER + 0.01; t += FRAME) {
    await s.seek(t);
    out.enter.push({ t, g: await s.shot(SHOTS ? `enter-${Math.round(t)}` : null) });
  }
  await s.seek(HOVER);
  await s.page.evaluate(() => document.querySelector('.gt-logo-motion').removeAttribute('data-active'));
  out.leave = [];
  for (let t = 0; t <= HOVER + 0.01; t += FRAME) {
    await s.seek(Math.min(t, HOVER - 0.001));
    out.leave.push({ t, g: await s.shot(SHOTS ? `leave-${Math.round(t)}` : null) });
  }
  return out;
}

/** the changed-pixel counts of each step of a run of frames, and the first and last steps that change anything */
function steps(frames) {
  const n = [];
  for (let i = 1; i < frames.length; i++) n.push(differing(frames[i - 1].g, frames[i].g, CHANGED).n);
  const moving = n.map((v, i) => [v, i]).filter(([v]) => v > 0);
  return { n, moving };
}
const within = (frames, t0, t1) => frames.filter(({ t }) => t >= t0 - 0.01 && t <= t1 + 0.01);

for (const engine of BROWSERS) {
  for (const theme of THEME_IDS) {
    const strict = engine === 'chromium';
    describe(`GtLogoMotion in ${engine}, ${theme}`, () => {
      let s;
      let F;
      before(async () => {
        s = await session(engine, theme);
        F = await framesOf(s, theme);
      });
      after(async () => {
        await s?.browser.close();
      });
      const report = (label, got, slack) => {
        if (!strict) console.log(`${engine} ${theme} ${label}: ${got.n} px over ${slack} levels, worst ${got.worst}`);
        else assert.equal(got.n, 0, `${label}: ${got.n} px differ from the logo by more than ${slack} levels (worst ${got.worst})`);
      };

      test('every hand-off between the still and the motion is the logo', () => {
        const slack = SLACK[theme];
        report('the loader on mount', differing(F.rest, F.loader[0].g, slack), slack);
        report('the hover on enter', differing(F.rest, F.enter[0].g, slack), slack);
        report('the hover at the end of the leave', differing(F.rest, F.leave.at(-1).g, slack), slack);
        const pose = F.seams[HOVER];
        for (const t of SEAMS.slice(1)) {
          report(`the loader's seam at ${Math.round(t)} ms against its draw-back's end`, differing(pose, F.seams[t], slack), slack);
        }
      });

      test('outside the moving lines every frame is the logo', () => {
        const still = not(F.moving);
        const slack = SLACK[theme];
        for (const [name, frames] of [
          ['loader', F.loader],
          ['enter', F.enter],
          ['leave', F.leave],
        ]) {
          let worst = { n: 0, worst: 0, t: 0 };
          for (const { t, g } of frames) {
            const d = differing(F.rest, g, slack, still);
            if (d.n > worst.n) worst = { ...d, t };
          }
          report(`the ${name}'s still parts (worst at ${Math.round(worst.t)} ms)`, worst, slack);
        }
      });

      test("the draw-back ends on the logo without its meridian", () => {
        const slack = SLACK[theme];
        for (const [name, g] of [
          ['the loader', F.seams[HOVER]],
          ['the hover', F.enter.at(-1).g],
        ]) {
          report(`${name}'s end pose outside the meridian's zone`, differing(F.rest, g, slack, F.zoneOut), slack);
          const inside = differing(F.bare, g, BARE_SLACK, F.zoneIn);
          if (!strict) console.log(`${engine} ${theme} ${name}'s end pose in the meridian's zone against the plain parts: ${inside.n} px over ${BARE_SLACK} levels, worst ${inside.worst}`);
          else assert.equal(inside.n, 0, `${name}'s end pose is not the logo without its meridian: ${inside.n} px differ from its plain parts by more than ${BARE_SLACK} levels (worst ${inside.worst})`);
        }
      });

      test("the G's tip is the logo's for the whole loop but its own lap", () => {
        const off = F.loader.filter(({ g }) => differing(F.rest, g, SLACK[theme], F.tip).n > 0).map(({ t }) => t);
        const g0 = HOVER + D1 + R1;
        const stray = off.filter((t) => t < g0 || t > g0 + D2);
        const runs = off.filter((t, i) => i === 0 || t - off[i - 1] > FRAME + 0.1).length;
        if (!strict) console.log(`${engine} ${theme} tip: ${off.length} frames off the logo's tip, ${stray.length} outside the G's lap, in ${runs} runs`);
        else {
          assert.deepEqual(stray, [], `the G's tip leaves the logo's outside its own lap at ${stray.map(Math.round).join(', ')} ms`);
          assert.ok(runs <= 1, `the G's tip leaves the logo's in ${runs} separate runs during its lap`);
        }
      });

      test('no move starts or lands with a pop', () => {
        const runs = [
          ['the hover enter', F.enter],
          ['the hover leave', F.leave],
          ['the draw-back', within(F.loader, 0, HOVER)],
          ["the meridian's lap", within(F.loader, HOVER, HOVER + D1)],
          ["the G's lap", within(F.loader, HOVER + D1 + R1, HOVER + D1 + R1 + D2)],
        ];
        for (const [name, frames] of runs) {
          const { n, moving } = steps(frames);
          const [first, second] = moving;
          const [last, before2] = [moving.at(-1), moving.at(-2)];
          const line = `${name}: first steps ${moving.slice(0, 3).map(([v]) => v).join(', ')}; last steps ${moving.slice(-3).map(([v]) => v).join(', ')} (of ${n.length})`;
          if (!strict) {
            console.log(`${engine} ${theme} ${line}`);
            continue;
          }
          assert.ok(first && second && first[0] <= second[0], `${line}: the first step is larger than the next`);
          assert.ok(last && before2 && last[0] <= before2[0], `${line}: the last step is larger than the one before`);
        }
      });
    });
  }
}
