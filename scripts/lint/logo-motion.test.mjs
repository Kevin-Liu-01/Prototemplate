// Tests for the live logo motion (src/components/brand/GtLogoMotion.tsx):
// whatever is not being drawn or undrawn is the logo itself. The component
// is rendered to markup with its stylesheet, drawn by Chrome for Testing
// through playwright-core at 256 CSS px and 4x (1024 px for the drawn box),
// its animations and transitions paused and seeked to every 60 fps frame of
// the hover's enter and leave, the loader's draw-back and one whole lap,
// and each frame measured (scripts/lib/logo-motion-frames.mjs reads where
// each line's dash stands in that frame from the dashes' computed styles):
//
//   hand-off   the hover mark at rest is the still mark, and the motion
//              layer at the start of the hover and of the loader, at the end
//              of the leave, and at every seam of the loader's lap, is the
//              still logo with no pixel different
//   still      in every frame, every pixel is the logo where the meridian is
//              drawn and the logo without its meridian where it has been
//              undrawn, except within two pixels of the end that moves; in
//              the loader's lap, every pixel is the draw-back's end pose
//              except under the dashes of the lines that move in that frame
//   ring       in every frame the ring's core and outer edge are the logo's
//              own pixels, and its inner edge, all the way round (the poles,
//              the nodes and the ends of every merge), is the logo's where
//              the lines are drawn and the ring drawn alone where the
//              meridian has been undrawn, except within two pixels of what
//              moves
//   end pose   the draw-back ends on the logo without its meridian: the
//              logo's pixels outside the meridian's zone, inside it the
//              logo's other parts drawn plainly, and on the ring, with no
//              band spared at the zone's edge, exactly the ring drawn alone
//   tip        through the whole loop the G's tip is the logo's, except
//              while the G's own lap runs over it
//   meridian   wherever the meridian shows (drawn or on its lap), every
//              pixel it adds lies on the logo's meridian ellipse at the
//              logo's width (within two pixels at 4x), its width across the
//              line is the logo's (13.6, and within 0.05 of the still
//              logo's own where the logo's meridian shows), and each of its
//              two cut faces stands where the logo's does, within 0.05
//              units on three lines along it, in every frame the undrawn
//              stretch has not reached
//   steps      no move starts or lands with a pop: its first and last steps
//              change no more pixels than the next and the one before, and
//              no step inside a move is still (no move that holds a frame)
//   course     every dash stands where pnpm build:logo-motion's course puts
//              it at that time (within 0.05 units), and no dash end steps
//              more than half again its neighbours' mean, or stalls, where
//              the course does not
//   small      the ring rule again at 96 and 32 CSS px at 2x, in Chromium
//              and in WebKit (where Playwright has it), for every frame, with
//              SMALL_SLACK levels for two draws of one edge: there a pixel is
//              one to four units, wider than any reach a mask keeps in units,
//              and WebKit draws a mask at CSS pixels, so a line's ink left on
//              the ring next to the free ring's edge shows there first
//
// The pixel tests run in the light theme, where Chrome composites the masked
// layers exactly; in the dark theme Chrome rounds a masked layer's
// premultiplied ink by one level on antialiased edges, and that is all the
// dark run allows. LOGO_MOTION_BROWSERS=chromium,firefox,webkit and
// LOGO_MOTION_THEMES=light,dark widen the run to report the other engines
// (Firefox and WebKit round masks and blends by a level or more, so only
// Chromium is held to it); LOGO_MOTION_SMALL_BROWSERS=chromium sets the
// engines of the small sizes; LOGO_MOTION_SRC=<dir> runs the checks on another
// copy of the component's three files (an older one, say, to see what the
// checks catch); LOGO_MOTION_SHOTS=<dir> writes the checked frames there as
// PNG. Usage: node --test scripts/lint/logo-motion.test.mjs
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { join, resolve } from 'node:path';
import { after, before, describe, test } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { inflateSync } from 'node:zlib';

import { chromium, firefox, webkit } from 'playwright-core';
import ts from 'typescript';

import { browserTable, cleanThetas, FACE_LINES, FACES, frameBox, frameRule, grow, inkOf, lineMap, meridianIn, not, or, ringZones, stepRule, THEMES } from '../lib/logo-motion-frames.mjs';
import { ROOT } from '../lib/root.mjs';
import { chromePath } from '../lib/site-pages.mjs';

/* the component is TSX and imports its stylesheet: compile the one, skip the other */
registerHooks({
  resolve(specifier, context, nextResolve) {
    const relative = specifier.startsWith('./') || specifier.startsWith('../');
    if (relative && !/\.[cm]?[jt]sx?$|\.css$/.test(specifier) && /\.tsx?$/.test(context.parentURL ?? '')) return nextResolve(`${specifier}.ts`, context);
    /* a copy of the component outside the repository (LOGO_MOTION_SRC) finds its packages here */
    if (!relative && !specifier.startsWith('node:') && context.parentURL && !fileURLToPath(context.parentURL).startsWith(ROOT)) return nextResolve(specifier, { ...context, parentURL: pathToFileURL(join(ROOT, 'package.json')).href });
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

const SRC = process.env.LOGO_MOTION_SRC ? resolve(process.env.LOGO_MOTION_SRC) : join(ROOT, 'src/components/brand');
const OWN = !process.env.LOGO_MOTION_SRC;
const { createElement } = await import('react');
const { renderToStaticMarkup } = await import('react-dom/server');
const { default: GtLogoMotion } = await import(pathToFileURL(join(SRC, 'GtLogoMotion.tsx')).href);
const { GT_LOGO_MOTION: G } = await import(pathToFileURL(join(SRC, 'GtLogoMotion.geometry.ts')).href);
const CSS = readFileSync(join(SRC, 'GtLogoMotion.css'), 'utf8');
const { timing: TIMING, logo: MEASURES, tables: TABLES } = JSON.parse(readFileSync(join(ROOT, 'scripts/build/logo-motion.json'), 'utf8'));
/* the course the generator writes the keyframes from (only for the component the generator writes) */
const COURSE = OWN ? (await import('../build/logo-motion.mjs')).COURSE : null;

/** the logo's stroke width */
const W = G.width ?? MEASURES.w;
const SIZE = 256;
const DPR = 4;
const PX = SIZE * DPR;
const BOX = frameBox(PX, 0, 0, PX, G.viewBox);
const HOVER = TIMING.hover * 1000;
const { D1, R1, D2 } = Object.fromEntries(Object.entries(TIMING.beats).map(([k, v]) => [k, v * 1000]));
const LOOP = (TIMING.beats.D1 + TIMING.beats.R1 + TIMING.beats.D2 + TIMING.beats.R2) * 1000;
const FRAME = 1000 / 60;
/* the loader's rests and seams: the draw-back's end, the rests after the meridian's lap and after the G's, the end of a lap and the next */
const SEAMS = [HOVER, HOVER + D1 + R1 / 2, HOVER + D1 + R1 + D2 + (LOOP - D1 - R1 - D2) / 2, HOVER + LOOP - 0.01, HOVER + LOOP, HOVER + 2 * LOOP];
/** a pixel has changed between two frames when it moves more than this many levels */
const CHANGED = 8;
/** pixels round a moving end (and round a moving dash in the lap) that may change */
const NEAR = 2;
/**
 * levels the end pose may differ from the logo without its meridian drawn
 * plainly, inside the meridian's zone: the same parts, drawn under a mask
 * and blended. Chrome flattens a curve to within about a quarter pixel, so
 * two draws of one edge can differ by a quarter of the ink there; a
 * meridian left behind or a break left open differs by all of it.
 */
const BARE_SLACK = 64;
/** levels a pixel may differ by where the frame should be the logo: none in the light theme, one in the dark (Chrome rounds a masked layer's antialiased ink by a level there, even under an all-white mask) */
const SLACK = { light: 0, dark: 1 };
/** levels a still pixel may differ by in a moving frame: one, where a mask's soft edge splits a pixel of ink between two layers and each rounds its share */
const STILL_SLACK = 1;
/** units: how far a cut face may stand from the logo's, how far the meridian's width from the logo's */
const FACE_TOL = 0.05;
const WIDTH_TOL = 0.05;
/** units: how far the meridian's measured width may stand from its drawn 13.6 (antialiasing and the logo's two-decimal outline) */
const WIDTH_ABS = 0.15;
const ENGINES = { chromium, firefox, webkit };
const BROWSERS = (process.env.LOGO_MOTION_BROWSERS ?? 'chromium').split(',');
const THEME_IDS = (process.env.LOGO_MOTION_THEMES ?? 'light,dark').split(',');
const SHOTS = process.env.LOGO_MOTION_SHOTS;
/**
 * the small sizes the ring is checked at as well, CSS px by device pixel
 * ratio: there a pixel is one to four units, wider than any band a mask
 * keeps in units, and WebKit draws a mask at CSS pixels, so a mask's edge
 * that stands a fraction of a unit from a line's ink at 4x shares a pixel
 * with it here
 */
const SMALL = [
  [96, 2],
  [32, 2],
];
/** the engines the small sizes run in, each held to the rule: Chromium, and WebKit where Playwright has it */
const SMALL_BROWSERS = (process.env.LOGO_MOTION_SMALL_BROWSERS ?? 'chromium,webkit').split(',').filter((e) => e === 'chromium' || existsSync(ENGINES[e].executablePath()));
/** levels a ring pixel may differ by at a small size: an edge drawn in two paths (the logo's and the ring's alone) at a pixel of one to four units, and WebKit's rounding of masks */
const SMALL_SLACK = 24;

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

/* ------------------------------------------------------------ the page */
const pageOf = (body, theme) =>
  `<!doctype html><html><head><style>${CSS}</style></head><body style="margin:0;background:${THEMES[theme].paper};color:${THEMES[theme].ink}">${body}</body></html>`;
const markOf = (props, size = SIZE) => renderToStaticMarkup(createElement(GtLogoMotion, { size, ...props }));
/** an svg in the logo's box, for the regions and the plain references */
const svgOf = (body, size = SIZE) => `<svg viewBox="${G.viewBox}" width="${size}" height="${size}" style="display:block" fill="currentColor">${body}</svg>`;
const stroke = (d, width, extra = '') => `<path d="${d}" fill="none" stroke="currentColor" stroke-width="${width}" ${extra}/>`;
/* where the logo without its meridian replaces the logo once the meridian has gone: the meridian's dash inside its zone (an older component without a zone: the meridian's band). It takes in the ring where the meridian merges into it, and nothing of the component's own idea of where its masks stop, so the ring rule judges that too */
const ZONE = G.zone
  ? `<defs><mask id="zone" maskUnits="userSpaceOnUse" x="0" y="0" width="256" height="256">` +
    `<path d="${G.zone.band.d}" fill="none" stroke="#fff" stroke-width="${G.zone.band.width}"/>` +
    `<path d="${G.zone.breaks.d}" fill="none" stroke="#fff" stroke-width="${G.zone.breaks.width}"/>` +
    (G.zone.near ? `<path d="${G.zone.near.d}" fill="none" stroke="#fff" stroke-width="${G.zone.near.px}" vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round"/>` : '') +
    `<path d="${G.zone.ends.d}" fill="none" stroke="#000" stroke-width="${G.zone.ends.width}"/>` +
    `</mask></defs>${stroke(G.meridian.d, G.meridian.width, 'mask="url(#zone)"')}`
  : stroke(G.meridian.d, W + 2);
/* the logo without its meridian, drawn plainly from its parts, as far as the meridian's zone reaches: the ring, the bar from its free end, the stem and the C */
const BARE =
  (G.ring.d ? `<path d="${G.ring.d}"/>` : `<circle cx="${G.ring.cx}" cy="${G.ring.cy}" r="${G.ring.r}" fill="none" stroke="currentColor" stroke-width="${W}"/>`) +
  `<path d="${G.bar}"/><path d="${G.stem}"/>${G.c ? `<path d="${G.c}"/>` : ''}`;
/* the G's tip: 16 units square round its free end */
const TIP = {
  x: G.ring.cx - MEASURES.R * Math.cos((MEASURES.gEnd * Math.PI) / 180),
  y: G.ring.cy - MEASURES.A * Math.sin((MEASURES.gEnd * Math.PI) / 180),
  half: 8,
};

/* the paths the dashes run on (the meridian's from just past its join to just past its cut face, the latitude's once round from the right node, the lap's once round from the north pole), and each box pixel's place along them, as the browser measures them */
const PATH_OF = {
  meridian: ['meridian', G.meridian.from ?? MEASURES.meridianStart[1] - 0.5, G.meridian.to ?? MEASURES.meridianEnd[1] + 0.5, G.meridian],
  latitude: ['latitude', 180, 540, G.latitude],
  lap: ['meridian', 0, 360, G.meridianLap],
};
let PATHS = null;
let MAPS = null;
/** the engine whose measure PATHS holds: each engine dashes along its own measure of a path */
let MEASURED_BY = null;
/** each path's place along it by theta, as the page's engine measures it */
async function pathTables(page) {
  const points = await page.evaluate((ds) => {
    const out = {};
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    document.body.append(svg);
    for (const [k, d] of Object.entries(ds)) {
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', d);
      svg.append(p);
      const total = p.getTotalLength();
      out[k] = {
        total,
        points: Array.from({ length: 4001 }, (_, i) => {
          const q = p.getPointAtLength((total * i) / 4000);
          return [q.x, q.y];
        }),
      };
    }
    svg.remove();
    return out;
  }, Object.fromEntries(Object.entries(PATH_OF).map(([k, v]) => [k, v[3].d])));
  return Object.fromEntries(Object.entries(PATH_OF).map(([k, [line, t0, t1]]) => [k, browserTable(line, t0, t1, points[k].points, points[k].total)]));
}
async function measurePaths(page, engine) {
  if (PATHS && MEASURED_BY === engine) return;
  MEASURED_BY = engine;
  PATHS = await pathTables(page);
  MAPS = Object.fromEntries(Object.entries(PATHS).map(([k, p]) => [k, lineMap(BOX, p)]));
}
const HALF = { meridian: G.meridian.width / 2, under: (G.under?.width ?? W + 1) / 2, head: (G.under?.width ?? W + 1) / 2, fill: (G.fill?.width ?? 2 * W + 2) / 2, lap: W / 2 };
const near = NEAR * BOX.unit;
/** units: the furthest a mask reaches into the ring at size CSS px, past its inner edge: the free ring keeps a reach in units and one in CSS pixels from a line's ink in the hole (none for an older component without them) */
const reachAt = (size) => (G.free?.near ? Math.max(G.free.near.width / 2, (G.free.near.px / 2) * (Number(G.viewBox.split(' ')[2]) / size)) : 0);
/** the ring's core, and its inner edge all the way round */
const RING = ringZones(BOX, reachAt(SIZE));
/** the meridian's thetas where its ink can be measured alone: nothing else of the logo without its meridian lies within 12 units across it */
let CLEAN = null;

async function session(engine, theme, size = SIZE, dpr = DPR) {
  /* Chrome's software rasterizer: with the GPU, two draws of the same path now and then differ by a pixel or two */
  const browser = await ENGINES[engine].launch(engine === 'chromium' ? { executablePath: chromePath(), headless: true, args: ['--disable-gpu'] } : { headless: true });
  const context = await browser.newContext({ viewport: { width: size, height: size }, deviceScaleFactor: dpr, reducedMotion: 'no-preference' });
  const page = await context.newPage();
  const shot = async (name) => {
    const png = await page.screenshot({ clip: { x: 0, y: 0, width: size, height: size } });
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
  /** where each channel's dash stands: its length and its start along its path */
  const dashes = () =>
    page.evaluate(() => {
      const one = (c) => {
        const el = document.querySelector(`.gt-logo-motion-${c}`);
        if (!el) return null;
        const cs = getComputedStyle(el);
        return { len: parseFloat(cs.strokeDasharray) || 0, off: -parseFloat(cs.strokeDashoffset) || 0 };
      };
      return Object.fromEntries(['meridian', 'under', 'fill', 'head', 'lap'].map((c) => [c, one(c)]));
    });
  const ink = async (body) => {
    await load(svgOf(body, size));
    const g = await shot();
    return g.map((v) => (v !== parseInt(THEMES[theme].paper.slice(1, 3), 16) ? 1 : 0));
  };
  return { engine, size, browser, page, shot, load, seek, dashes, ink };
}

/* ------------------------------------------------------------ the frames */
async function framesOf(s, theme) {
  const out = {};
  /* the still logo, and the regions */
  await s.load(markOf({ mode: 'static' }));
  await measurePaths(s.page, s.engine);
  out.rest = await s.shot('rest');
  out.zone = await s.ink(ZONE);
  const zone = out.zone;
  out.zoneIn = not(grow(not(zone), PX, 2));
  out.zoneOut = not(grow(zone, PX, 2));
  await s.load(svgOf(BARE));
  out.bare = await s.shot('bare');
  const tip = new Uint8Array(PX * PX);
  const [vx, vy, vw] = G.viewBox.split(' ').map(Number);
  const toPx = (u, o) => Math.round(((u - o) / vw) * PX);
  for (let y = toPx(TIP.y - TIP.half, vy); y < toPx(TIP.y + TIP.half, vy); y++) for (let x = toPx(TIP.x - TIP.half, vx); x < toPx(TIP.x + TIP.half, vx); x++) tip[y * PX + x] = 1;
  out.tip = tip;

  /* the loader: its end pose first, then every 60 fps frame of the draw-back and of one lap, and the seams */
  await s.load(markOf({ mode: 'loader' }));
  await s.seek(HOVER);
  out.pose = await s.shot('pose');
  out.loader = [];
  for (let t = 0; t <= HOVER + LOOP + 0.01; t += FRAME) {
    await s.seek(t);
    out.loader.push({ t, g: await s.shot(SHOTS ? `loader-${Math.round(t)}` : null), dash: await s.dashes() });
  }
  out.seams = {};
  for (const t of SEAMS) {
    await s.seek(t);
    out.seams[t] = await s.shot(SHOTS ? `seam-${Math.round(t)}` : null);
  }

  /* the hover: at rest, then enter, hold, leave */
  await s.load(markOf({ mode: 'hover' }));
  out.hoverRest = await s.shot('hover-rest');
  await s.page.evaluate(() => document.querySelector('.gt-logo-motion').setAttribute('data-active', ''));
  out.enter = [];
  for (let t = 0; t <= HOVER + 0.01; t += FRAME) {
    await s.seek(t);
    out.enter.push({ t, g: await s.shot(SHOTS ? `enter-${Math.round(t)}` : null), dash: await s.dashes() });
  }
  await s.seek(HOVER);
  await s.page.evaluate(() => document.querySelector('.gt-logo-motion').removeAttribute('data-active'));
  out.leave = [];
  for (let t = 0; t <= HOVER + 0.01; t += FRAME) {
    await s.seek(Math.min(t, HOVER - 0.001));
    out.leave.push({ t, g: await s.shot(SHOTS ? `leave-${Math.round(t)}` : null), dash: await s.dashes() });
  }
  return out;
}

/* the ring at a small size: the still logo, the zone and the logo without its meridian as references, and every frame of the loader's draw-back and lap and of the hover's enter and leave, each with its dashes */
async function smallFramesOf(s, box) {
  const out = {};
  await s.load(markOf({ mode: 'static' }, s.size));
  const paths = await pathTables(s.page);
  out.maps = Object.fromEntries(Object.entries(paths).map(([k, p]) => [k, lineMap(box, p)]));
  out.rest = await s.shot();
  out.zone = await s.ink(ZONE);
  await s.load(svgOf(BARE, s.size));
  out.bare = await s.shot();
  await s.load(markOf({ mode: 'loader' }, s.size));
  out.loader = [];
  for (let t = 0; t <= HOVER + LOOP + 0.01; t += FRAME) {
    await s.seek(t);
    out.loader.push({ t, g: await s.shot(), dash: await s.dashes() });
  }
  await s.load(markOf({ mode: 'hover' }, s.size));
  await s.page.evaluate(() => document.querySelector('.gt-logo-motion').setAttribute('data-active', ''));
  out.enter = [];
  for (let t = 0; t <= HOVER + 0.01; t += FRAME) {
    await s.seek(t);
    out.enter.push({ t, g: await s.shot(), dash: await s.dashes() });
  }
  await s.seek(HOVER);
  await s.page.evaluate(() => document.querySelector('.gt-logo-motion').removeAttribute('data-active'));
  out.leave = [];
  for (let t = 0; t <= HOVER + 0.01; t += FRAME) {
    await s.seek(Math.min(t, HOVER - 0.001));
    out.leave.push({ t, g: await s.shot(), dash: await s.dashes() });
  }
  return out;
}

/** the changed-pixel counts of each step of a run of frames */
function steps(frames) {
  const n = [];
  for (let i = 1; i < frames.length; i++) n.push(differing(frames[i - 1].g, frames[i].g, CHANGED).n);
  return n;
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
        F.slack = SLACK[theme];
        F.poseInk = inkOf(F.pose, BOX, theme);
        CLEAN ??= cleanThetas(F.poseInk, BOX);
        F.rule = frameRule({ maps: MAPS, zone: F.zone, rest: F.rest, pose: F.pose, bare: F.bare, half: HALF, near, slack: Math.max(STILL_SLACK, F.slack) });
      });
      after(async () => {
        await s?.browser.close();
      });
      const check = (ok, message) => {
        if (!strict) console.log(`${engine} ${theme} ${message}`);
        else assert.ok(ok, message);
      };
      const report = (label, got, slack) => check(got.n === 0, `${label}: ${got.n} px differ by more than ${slack} levels (worst ${got.worst})`);

      test('every hand-off between the still and the motion is the logo', () => {
        const slack = SLACK[theme];
        report('the hover mark at rest against the still mark', differing(F.rest, F.hoverRest, 0), 0);
        report('the loader on mount', differing(F.rest, F.loader[0].g, slack), slack);
        report('the hover on enter', differing(F.rest, F.enter[0].g, slack), slack);
        report('the hover at the end of the leave', differing(F.rest, F.leave.at(-1).g, slack), slack);
        report("the hover's end pose against the loader's", differing(F.pose, F.enter.at(-1).g, slack), slack);
        for (const t of SEAMS.slice(1)) report(`the loader's seam at ${Math.round(t)} ms against its draw-back's end`, differing(F.pose, F.seams[t], slack), slack);
      });

      test('every frame is the logo or the logo without its meridian but where a line moves', () => {
        for (const [name, frames, from] of [
          ['loader', F.loader, HOVER],
          ['enter', F.enter, Infinity],
          ['leave', F.leave, Infinity],
        ]) {
          let worst = { n: 0, worst: 0, t: 0, at: -1 };
          for (const { t, g, dash } of frames) {
            const d = F.rule.against(g, dash, t >= from - 0.01);
            if (d.n > worst.n) worst = { ...d, t };
          }
          const where = worst.at >= 0 ? ` at ${worst.at % PX},${Math.floor(worst.at / PX)}` : '';
          check(worst.n === 0, `the ${name}: ${worst.n} still px differ by more than ${Math.max(STILL_SLACK, F.slack)} levels at ${Math.round(worst.t)} ms (worst ${worst.worst}${where})`);
        }
      });

      test("the ring is the logo's own in every frame", () => {
        for (const [name, frames, from] of [
          ['loader', F.loader, HOVER],
          ['enter', F.enter, Infinity],
          ['leave', F.leave, Infinity],
        ]) {
          let core = { n: 0, worst: 0, t: 0 };
          let edge = { n: 0, worst: 0, t: 0, at: -1 };
          for (const { t, g, dash } of frames) {
            const c = differing(F.rest, g, F.slack, RING.core);
            const e = F.rule.ring(g, dash, t >= from - 0.01, RING.edge, F.slack);
            if (c.n > core.n) core = { ...c, t };
            if (e.n > edge.n) edge = { ...e, t };
          }
          const where = edge.at >= 0 ? ` at ${edge.at % PX},${Math.floor(edge.at / PX)}` : '';
          check(core.n === 0, `the ${name}'s ring core and outer edge: ${core.n} px differ at ${Math.round(core.t)} ms (worst ${core.worst})`);
          check(edge.n === 0, `the ${name}'s ring inner edge: ${edge.n} px differ from the logo's, or from the ring drawn alone where the meridian is undrawn, at ${Math.round(edge.t)} ms (worst ${edge.worst}${where})`);
        }
      });

      test('the draw-back ends on the logo without its meridian', () => {
        const slack = SLACK[theme];
        for (const [name, g] of [
          ['the loader', F.seams[HOVER]],
          ['the hover', F.enter.at(-1).g],
        ]) {
          report(`${name}'s end pose outside the meridian's zone`, differing(F.rest, g, slack, F.zoneOut), slack);
          const inside = differing(F.bare, g, BARE_SLACK, F.zoneIn);
          check(inside.n === 0, `${name}'s end pose is not the logo without its meridian: ${inside.n} px differ from its plain parts by more than ${BARE_SLACK} levels (worst ${inside.worst})`);
          /* the ring, the zone's edge included: the ring drawn alone inside the zone, the logo's outside it */
          const ring = F.rule.ring(g, null, true, or(RING.core, RING.edge), slack);
          const where = ring.at >= 0 ? ` at ${ring.at % PX},${Math.floor(ring.at / PX)}` : '';
          check(ring.n === 0, `${name}'s end pose on the ring: ${ring.n} px differ by more than ${slack} levels from the ring drawn alone in the meridian's zone and the logo outside it (worst ${ring.worst}${where})`);
        }
      });

      test("the G's tip is the logo's for the whole loop but its own lap", () => {
        const off = F.loader.filter(({ g }) => differing(F.rest, g, SLACK[theme], F.tip).n > 0).map(({ t }) => t);
        const g0 = HOVER + D1 + R1;
        const stray = off.filter((t) => t < g0 || t > g0 + D2);
        const runs = off.filter((t, i) => i === 0 || t - off[i - 1] > FRAME + 0.1).length;
        check(stray.length === 0, `the G's tip leaves the logo's outside its own lap at ${stray.map(Math.round).join(', ')} ms`);
        check(runs <= 1, `the G's tip leaves the logo's in ${runs} separate runs during its lap`);
      });

      test("the meridian keeps the logo's ellipse, width and cut faces", () => {
        /* the logo's meridian runs between its two cut faces, each slanted between two thetas; a theta shows it two degrees clear of both */
        const merTheta = (th) => (th < PATHS.meridian.t0 ? th + 360 : th);
        const inLogo = (th) => merTheta(th) >= MEASURES.meridianStart[0] + 2 && merTheta(th) <= MEASURES.meridianEnd[0] - 2;
        const rest = meridianIn({ ink: inkOf(F.rest, BOX, theme), poseInk: F.poseInk, box: BOX, lapMap: MAPS.lap, lapHalf: HALF.lap + near, clean: CLEAN, shown: inLogo });
        for (const { t, w } of rest.widths) check(Math.abs(w - W) <= WIDTH_ABS, `the still logo's meridian at ${t} degrees is ${w.toFixed(3)} wide, not ${W}`);
        const restW = Object.fromEntries(rest.widths.map(({ t, w }) => [t, w]));
        /* where the draw-back's moving end stands, by the course's own table (the same for any version of the component): its progress p from 0 (at the cut face) to 1 (at the join), and the theta it has reached, from just past the cut face to just past the join */
        const { hoverEnd } = TABLES;
        const thMax = MEASURES.meridianEnd[1] + 0.5;
        const thMin = MEASURES.meridianStart[1] - 0.5;
        const progress = (x) => {
          const u = Math.min(1, Math.max(0, x)) * (hoverEnd.length - 1);
          const i = Math.min(hoverEnd.length - 2, Math.floor(u));
          const v = hoverEnd[i] + (hoverEnd[i + 1] - hoverEnd[i]) * (u - i);
          return (hoverEnd[0] - v) / (hoverEnd[0] - hoverEnd.at(-1));
        };
        const reached = (p) => thMax - (thMax - thMin) * p;
        let worstFace = { d: 0, at: '' };
        let worstWidth = { d: 0, at: '' };
        let offEllipse = { n: 0, at: '' };
        const faces = [];
        const runs = [
          ['enter', F.enter, true],
          ['leave', F.leave, true],
          ['loader', within(F.loader, 0, HOVER + D1), true],
        ];
        for (const [name, frames] of runs) {
          for (const { t, g, dash } of frames) {
            const lapOn = dash?.lap && dash.lap.len > 0 && t > HOVER;
            const p = progress((name === 'leave' ? HOVER - t : t) / HOVER);
            const drawnTo = reached(p);
            /* a clean theta shows the logo's meridian where it is drawn, and the lap's line where the lap is */
            const shown = (th) => {
              if (lapOn) {
                const sl = PATHS.lap.s(th);
                return sl > dash.lap.off + 3 && sl < dash.lap.off + dash.lap.len - 3;
              }
              if (t > HOVER) return false;
              return inLogo(th) && merTheta(th) < drawnTo - 3;
            };
            const got = meridianIn({ ink: inkOf(g, BOX, theme), poseInk: F.poseInk, box: BOX, lapMap: MAPS.lap, lapHalf: HALF.lap + near, clean: CLEAN, shown });
            if (got.off > offEllipse.n) offEllipse = { n: got.off, at: `${name} ${Math.round(t)} ms` };
            for (const { t: th, w } of got.widths) {
              const d = lapOn ? Math.abs(w - W) - (WIDTH_ABS - WIDTH_TOL) : Math.abs(w - restW[th]);
              if (d > worstWidth.d) worstWidth = { d, at: `${name} ${Math.round(t)} ms, ${th} degrees, ${w.toFixed(3)} wide` };
            }
            /* the faces at rest: the bottom one until the undrawn stretch reaches its window, the top one while nothing is undrawn */
            if (t <= HOVER + 0.01 && !lapOn) {
              const at = [];
              if (drawnTo > FACES.bottom.inside + 2) at.push('bottom');
              if (p <= 0) at.push('top');
              for (const k of at) {
                got.faces[k].forEach((p, j) => {
                  const d = p - rest.faces[k][j];
                  faces.push({ name, t, k, j, d });
                  if (Math.abs(d) > Math.abs(worstFace.d)) worstFace = { d, at: `${name} ${Math.round(t)} ms, the ${k} face on the line ${FACE_LINES[j]} units off the meridian` };
                });
              }
            }
          }
        }
        const perLine = ['bottom', 'top'].flatMap((k) => FACE_LINES.map((o, j) => {
          const w = faces.filter((r) => r.k === k && r.j === j).reduce((a, r) => (Math.abs(r.d) > Math.abs(a.d) ? r : a), { d: 0, t: 0 });
          return `${k} ${o}: ${w.d.toFixed(3)} at ${Math.round(w.t)} ms`;
        }));
        console.log(`${engine} ${theme} meridian cut faces, worst shift on each line: ${perLine.join('; ')}`);
        console.log(
          `${engine} ${theme} meridian: worst face shift ${worstFace.d.toFixed(3)} units (${worstFace.at || 'none'}); worst width ${worstWidth.d.toFixed(3)} (${worstWidth.at || 'none'}); ${offEllipse.n} px off its ellipse (${offEllipse.at || 'none'}); ${faces.length} face readings`,
        );
        check(Math.abs(worstFace.d) <= FACE_TOL, `a cut face of the meridian moves ${worstFace.d.toFixed(3)} units from the logo's (${worstFace.at})`);
        check(worstWidth.d <= WIDTH_TOL, `the meridian's width moves ${worstWidth.d.toFixed(3)} units from the logo's (${worstWidth.at})`);
        check(offEllipse.n === 0, `the meridian adds ${offEllipse.n} px off its ellipse at the logo's width (${offEllipse.at})`);
      });

      test('no move starts or lands with a pop, or holds still inside', () => {
        const runs = [
          ['the hover enter', F.enter],
          ['the hover leave', F.leave],
          ['the draw-back', within(F.loader, 0, HOVER)],
          ["the meridian's lap", within(F.loader, HOVER, HOVER + D1)],
          ["the G's lap", within(F.loader, HOVER + D1 + R1, HOVER + D1 + R1 + D2)],
        ];
        for (const [name, frames] of runs) {
          const { ok, line } = stepRule(steps(frames));
          console.log(`${engine} ${theme} ${name}: ${line}`);
          if (strict) assert.ok(ok, `${name}: ${line}`);
        }
      });

      test('every dash runs on the course, smoothly', { skip: !COURSE || !strict ? 'only for the component pnpm build:logo-motion writes, in Chromium' : false }, () => {
        const moves = [
          ['meridian', F.enter.map(({ t, dash }) => ({ t, d: dash.meridian, c: COURSE.meridian(t / 1000) }))],
          ...['lap', 'under', 'fill', 'head'].map((ch) => [ch, F.loader.filter(({ t }) => t >= HOVER - 0.01).map(({ t, dash }) => ({ t, d: dash[ch], c: COURSE[ch]((t - HOVER) / 1000) }))]),
        ];
        const notes = [];
        for (const [ch, rows] of moves) {
          let worst = { e: 0, t: 0 };
          for (const { t, d, c } of rows) {
            if (!(c.len > 0 || d.len > 0)) continue;
            const e = Math.max(Math.abs(d.len - c.len), Math.abs(d.off - c.off));
            if (e > worst.e) worst = { e, t };
          }
          assert.ok(worst.e <= 0.05, `${ch}: a dash stands ${worst.e.toFixed(3)} units off its course at ${Math.round(worst.t)} ms`);
          /* each end's steps, the drawn frames against the course's */
          for (const e of [0, 1]) {
            const end = (x) => (e === 0 ? x.off : x.off + x.len);
            const live = rows.map((r) => (r.d.len > 0 ? end(r.d) : null));
            const plan = rows.map((r) => (r.c.len > 0 ? end(r.c) : null));
            const stepsOf = (v) => v.map((x, i) => (i && x !== null && v[i - 1] !== null ? x - v[i - 1] : null));
            const sl = stepsOf(live);
            const sp = stepsOf(plan);
            const odd = (v, i) => {
              const [a, b, c] = [v[i - 1], v[i], v[i + 1]];
              if ([a, b, c].some((x) => x === null)) return false;
              const mean = (Math.abs(a) + Math.abs(c)) / 2;
              return mean > 0.05 && (Math.abs(b) > 1.5 * mean || Math.abs(b) < 0.1 * mean);
            };
            for (let i = 1; i < sl.length - 1; i++) {
              if (odd(sp, i)) notes.push(`${ch} ${e ? 'end' : 'start'} at ${Math.round(rows[i].t)} ms: the course itself steps ${sp[i].toFixed(2)} between ${sp[i - 1].toFixed(2)} and ${sp[i + 1].toFixed(2)}`);
              else assert.ok(!odd(sl, i), `${ch}'s ${e ? 'end' : 'start'} at ${Math.round(rows[i].t)} ms steps ${sl[i]?.toFixed(2)} between ${sl[i - 1]?.toFixed(2)} and ${sl[i + 1]?.toFixed(2)}, where the course steps ${sp[i]?.toFixed(2)}`);
            }
          }
        }
        if (notes.length) console.log(`${engine} ${theme} where the course itself is uneven (the source's own timing): ${notes.join('; ')}`);
      });
    });
  }
}

/* the ring at small sizes: in every frame of the loader and the hover, the
   ring (its core and its inner edge, all the way round) is the logo's where
   the lines are drawn and the ring drawn alone where the meridian has been
   undrawn, but round what moves; the same rule as at 4x, with the slack of
   two draws of one edge at a pixel this wide */
for (const engine of SMALL_BROWSERS) {
  for (const theme of THEME_IDS) {
    for (const [size, dpr] of SMALL) {
      describe(`GtLogoMotion's ring at ${size} px ${dpr}x in ${engine}, ${theme}`, () => {
        let s;
        let F;
        let box;
        before(async () => {
          s = await session(engine, theme, size, dpr);
          box = frameBox(size * dpr, 0, 0, size * dpr, G.viewBox);
          F = await smallFramesOf(s, box);
        });
        after(async () => {
          await s?.browser.close();
        });
        test("the ring is the logo's own in every frame, or the ring alone where the meridian is undrawn", () => {
          const zones = ringZones(box, reachAt(size));
          const region = or(zones.core, zones.edge);
          const rule = frameRule({ maps: F.maps, zone: F.zone, rest: F.rest, pose: F.loader.at(-1).g, bare: F.bare, half: HALF, near: NEAR * box.unit, slack: SMALL_SLACK });
          const px = size * dpr;
          for (const [name, frames, from] of [
            ['loader', F.loader, HOVER],
            ['enter', F.enter, Infinity],
            ['leave', F.leave, Infinity],
          ]) {
            let worst = { n: 0, worst: 0, t: 0, at: -1 };
            for (const { t, g, dash } of frames) {
              const d = rule.ring(g, dash, t >= from - 0.01, region, SMALL_SLACK);
              if (d.n > worst.n || (worst.n === 0 && d.worst > worst.worst)) worst = { ...d, t };
            }
            const where = worst.at >= 0 ? ` at ${worst.at % px},${Math.floor(worst.at / px)}` : '';
            assert.ok(worst.n === 0, `the ${name}'s ring at ${size} px ${dpr}x: ${worst.n} px differ by more than ${SMALL_SLACK} levels at ${Math.round(worst.t)} ms (worst ${worst.worst}${where})`);
            console.log(`${engine} ${theme} ${size}x${dpr} the ${name}'s ring: no pixel off by more than ${SMALL_SLACK} levels`);
          }
          /* the draw-back's end, where the meridian's ink once stood on the ring */
          for (const [name, g] of [
            ['the loader', F.loader.find(({ t }) => t >= HOVER - 0.01).g],
            ['the hover', F.enter.at(-1).g],
          ]) {
            const d = rule.ring(g, null, true, region, SMALL_SLACK);
            assert.ok(d.n === 0, `${name}'s end pose on the ring at ${size} px ${dpr}x: ${d.n} px differ by more than ${SMALL_SLACK} levels from the ring drawn alone in the meridian's zone and the logo outside it (worst ${d.worst})`);
          }
        });
      });
    }
  }
}
