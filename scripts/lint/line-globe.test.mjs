// Tests for the line globe animations (src/lib/graticule/): Language globe
// turn and Mark to globe, each for Graticule GT, heavy and
// Graticule jaw, thicker. For each animation and mark, frame 0 and the
// frame at the loop length are the still, and both draw the rest mark: IoU
// 0.995 or more at 512 px against the mark's file in public/marks/dynamic,
// both drawn by Chrome for Testing through playwright-core. The same time
// draws the same path, and 30 frames spread over the loop hash to the
// fingerprint of the approved loop, so the drawing cannot drift from it
// unseen. Loaded through Node's type stripping, with a resolve hook that
// adds .ts to the modules' extensionless relative imports.
//
// The IoU is read on a 512 px grid, each pixel inked when 16 samples (a
// 2048 px drawing, averaged 4 by 4) cover half of it, on Chrome's software
// canvas. One sample a pixel left the score with the rasterizer: the rest
// frames read 0.9951 to 0.9958 on the accelerated canvas and 0.9938 to
// 0.9945 on the software one, because a stroke and an outline of the same
// line antialias their edges differently. With 16 samples they read 0.9978
// to 0.9982, and the wrong mark reads 0.87.
//
// Usage: pnpm test:line-globe (node --test scripts/lint/line-globe.test.mjs)
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { join } from 'node:path';
import { after, before, describe, test } from 'node:test';

import { chromium } from 'playwright-core';

import { ROOT } from '../lib/root.mjs';
import { chromePath } from '../lib/site-pages.mjs';

registerHooks({
  resolve(specifier, context, nextResolve) {
    const relative = specifier.startsWith('./') || specifier.startsWith('../');
    if (relative && !/\.[cm]?[jt]sx?$/.test(specifier) && context.parentURL?.endsWith('.ts')) return nextResolve(`${specifier}.ts`, context);
    return nextResolve(specifier, context);
  },
});

const { LINE_ANIMATIONS } = await import(new URL('../../src/lib/graticule/line-animations.ts', import.meta.url).href);
const { LINE_ANIMATION_IDS, REST_WEIGHT } = await import(new URL('../../src/lib/graticule/line-loop.ts', import.meta.url).href);
const { MARK_IDS } = await import(new URL('../../src/lib/graticule/geometry.ts', import.meta.url).href);

/** Each mark's file: the rest mark as one filled path, nonzero. */
const MARK_FILES = { heavy: 'public/marks/dynamic/graticule-gt-heavy.svg', jaw: 'public/marks/dynamic/graticule-jaw-thicker.svg' };
const PX = 512;
/** Samples a pixel along each axis. */
const SUB = 4;
const REST_IOU = 0.995;
const SAMPLES = 30;

/**
 * The approved loops: the first 16 hex digits of the SHA-256 of the stroke
 * and the fill of the frames at t = D (i + 0.5) / 30, i from 0 to 29, each
 * followed by a newline, as the approved scenes drew them.
 */
const FINGERPRINTS = {
  'language-turn': { heavy: '636767f358cf4b0a', jaw: 'af5d50c09aad1d6e' },
  'mark-to-globe': { heavy: 'e9a2874c65ea4c30', jaw: 'd3599d49727863a5' },
};

const sampleTimes = (duration) => Array.from({ length: SAMPLES }, (_, i) => (duration * (i + 0.5)) / SAMPLES);

function markPath(mark) {
  const svg = readFileSync(join(ROOT, MARK_FILES[mark]), 'utf8');
  const paths = [...svg.matchAll(/<path\b[^>]*\sd="([^"]+)"/g)];
  assert.equal(paths.length, 1, `${MARK_FILES[mark]} draws one path`);
  return paths[0][1];
}

let browser;
let page;

before(async () => {
  browser = await chromium.launch({ executablePath: chromePath(), headless: true });
  page = await browser.newPage();
});

after(async () => {
  await browser?.close();
});

/** The IoU of each pair of drawings on the PX grid. A drawing is { stroke, fill } path data in the 256 unit square. */
function ious(pairs) {
  return page.evaluate(
    ({ px, sub, weight, pairs }) => {
      const n = px * sub;
      const mask = ({ stroke, fill }) => {
        const canvas = new OffscreenCanvas(n, n);
        // willReadFrequently keeps the canvas on the software rasterizer, which draws the same pixels on every platform
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.scale(n / 256, n / 256);
        if (stroke) {
          ctx.lineWidth = weight;
          ctx.lineCap = 'butt';
          ctx.lineJoin = 'round';
          ctx.stroke(new Path2D(stroke));
        }
        if (fill) ctx.fill(new Path2D(fill));
        const data = ctx.getImageData(0, 0, n, n).data;
        const half = 128 * sub * sub;
        const out = new Uint8Array(px * px);
        for (let y = 0; y < px; y++) {
          for (let x = 0; x < px; x++) {
            let alpha = 0;
            for (let j = 0; j < sub; j++) for (let i = 0; i < sub; i++) alpha += data[((y * sub + j) * n + x * sub + i) * 4 + 3];
            out[y * px + x] = alpha >= half ? 1 : 0;
          }
        }
        return out;
      };
      return pairs.map(([a, b]) => {
        const A = mask(a);
        const B = mask(b);
        let both = 0;
        let either = 0;
        for (let i = 0; i < A.length; i++) {
          both += A[i] & B[i];
          either += A[i] | B[i];
        }
        return both / either;
      });
    },
    { px: PX, sub: SUB, weight: REST_WEIGHT, pairs }
  );
}

test('the registry holds the two animations, each with a loop length', () => {
  assert.deepEqual(Object.keys(LINE_ANIMATIONS), [...LINE_ANIMATION_IDS]);
  for (const id of LINE_ANIMATION_IDS) {
    const { duration } = LINE_ANIMATIONS[id];
    assert.ok(Number.isFinite(duration) && duration > 0, `${id}: a loop length`);
  }
});

for (const id of LINE_ANIMATION_IDS) {
  const animation = LINE_ANIMATIONS[id];
  describe(animation.title, () => {
    test('frame 0 and the frame at the loop length are the still', () => {
      for (const mark of MARK_IDS) {
        const still = animation.still(mark);
        for (const t of [0, animation.duration]) {
          const frame = animation.frame(t, mark);
          assert.equal(frame.stroke, still.stroke, `${mark} at ${t} s: stroke`);
          assert.equal(frame.fill, still.fill, `${mark} at ${t} s: fill`);
        }
      }
    });

    test(`frame 0 and the frame at the loop length draw the rest mark (IoU ${REST_IOU} or more at ${PX} px)`, async () => {
      const cases = MARK_IDS.flatMap((mark) => [0, animation.duration].map((t) => ({ mark, t })));
      const got = await ious(cases.map(({ mark, t }) => [animation.frame(t, mark), { stroke: '', fill: markPath(mark) }]));
      cases.forEach(({ mark, t }, i) => assert.ok(got[i] >= REST_IOU, `${mark} at ${t} s: IoU ${got[i].toFixed(5)} against ${MARK_FILES[mark]}`));
    });

    test('the same time draws the same path', () => {
      for (const mark of MARK_IDS) {
        const times = sampleTimes(animation.duration);
        const first = times.map((t) => animation.frame(t, mark));
        const again = [...times].reverse().map((t) => animation.frame(t, mark)).reverse();
        times.forEach((t, i) => {
          assert.equal(again[i].stroke, first[i].stroke, `${mark} at ${t} s: stroke`);
          assert.equal(again[i].fill, first[i].fill, `${mark} at ${t} s: fill`);
        });
      }
    });

    test(`${SAMPLES} frames match the approved loop`, () => {
      for (const mark of MARK_IDS) {
        const hash = createHash('sha256');
        for (const t of sampleTimes(animation.duration)) {
          const frame = animation.frame(t, mark);
          hash.update(`${frame.stroke}\n${frame.fill}\n`);
        }
        assert.equal(hash.digest('hex').slice(0, 16), FINGERPRINTS[id][mark], `${mark}: the frames differ from the approved loop`);
      }
    });
  });
}
