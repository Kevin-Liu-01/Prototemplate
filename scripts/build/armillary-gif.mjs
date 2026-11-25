#!/usr/bin/env node
/* oxlint-disable no-console -- a capture step reporting what it wrote. */
/**
 * Writes public/marks/ascii/gt-armillary-dark.gif and gt-armillary-light.gif,
 * one lap of the armillary loader (GtLogoArmillary) as a seamless GIF, shot
 * from the live component on /marks/loading.
 *
 * The page loads under Playwright's fake clock, paused, which drives
 * requestAnimationFrame, so every frame lands at an exact time: the clock
 * steps 1 / FPS seconds a frame through two laps, the script keeps the lap
 * that starts on the first frame of the rest (the root loses data-moving),
 * and ffmpeg encodes it with a 16 color palette taken from the frames and no
 * dithering, so the ground stays one flat color. The last frame runs into
 * the first, so the GIF loops with no seam.
 *
 * Requires: the dev server at PT_BASE (default http://localhost:3005), the
 * Chrome for Testing build playwright-core expects (CHROME_PATH overrides
 * it) and ffmpeg on PATH.
 *
 * Usage:
 *   node scripts/build/armillary-gif.mjs   (pnpm build:armillary-gif)
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { chromium } from 'playwright-core';

import { GT_LOGO_ARMILLARY as A } from '../../src/components/brand/GtLogoArmillary.geometry.ts';
import { helpIfAsked } from '../lib/help.mjs';
import { BASE_URL, chromePath, HIDE_DEV_UI_CSS, ROOT, seedTheme } from '../lib/site-pages.mjs';

helpIfAsked(import.meta.url);

const OUT = 'public/marks/ascii';
/** frames a second: 20 keeps each frame a whole 5 hundredths, the GIF's unit */
const FPS = 20;
const LAP = A.beats.rest + A.beats.open + A.beats.swing + A.beats.close;
const FRAMES = Math.round(LAP * FPS);
/** the loader's drawn size in CSS pixels, its pixel ratio, and the ground around it as a share of the size */
const SIZE = 200;
const SCALE = 2;
const PAD = 0.12;

const browser = await chromium.launch({ executablePath: chromePath(), headless: true });
mkdirSync(join(ROOT, OUT), { recursive: true });
try {
  for (const theme of ['dark', 'light']) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: SCALE, colorScheme: theme, reducedMotion: 'no-preference' });
    await seedTheme(context, theme);
    const page = await context.newPage();
    await page.clock.install({ time: 0 });
    await page.goto(`${BASE_URL}/marks/loading#armillary`, { waitUntil: 'load' });
    /* the figure's caption sits inside the padded crop */
    await page.addStyleTag({ content: `${HIDE_DEV_UI_CSS} .ld-stage figcaption { visibility: hidden !important; }` });
    const root = page.locator(`.gt-logo-armillary:has(> svg[width="${SIZE}"])`).first();
    await root.waitFor();
    await root.scrollIntoViewIfNeeded();
    /* install alone lets the fake clock run in real time, so the time a screenshot takes would leak into the lap */
    await page.clock.pauseAt((await page.evaluate(() => Date.now())) + 1000);
    await page.clock.runFor(1000);
    const box = await root.boundingBox();
    const pad = SIZE * PAD;
    const clip = { x: box.x - pad, y: box.y - pad, width: box.width + 2 * pad, height: box.height + 2 * pad };

    const shots = [];
    for (let i = 0; i < FRAMES * 2 + 1; i++) {
      const moving = await root.evaluate((el) => el.hasAttribute('data-moving'));
      shots.push({ moving, png: await page.screenshot({ clip }) });
      await page.clock.runFor(1000 / FPS);
    }
    await context.close();

    const start = shots.findIndex((s, i) => i > 0 && shots[i - 1].moving && !s.moving);
    if (start < 0 || start + FRAMES > shots.length) throw new Error(`armillary-gif: no rest frame found in two laps on ${theme}`);
    const dir = mkdtempSync(join(tmpdir(), 'armillary-gif-'));
    shots.slice(start, start + FRAMES).forEach((s, i) => writeFileSync(join(dir, `f${String(i).padStart(3, '0')}.png`), s.png));
    const file = join(ROOT, OUT, `gt-armillary-${theme}.gif`);
    const filter = `scale=${Math.round(clip.width * SCALE)}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=16:stats_mode=full:reserve_transparent=0[p];[b][p]paletteuse=dither=none:diff_mode=rectangle`;
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', String(FPS), '-i', join(dir, 'f%03d.png'), '-lavfi', filter, '-loop', '0', file]);
    rmSync(dir, { recursive: true, force: true });
    console.log(`armillary-gif: wrote ${OUT}/gt-armillary-${theme}.gif, ${FRAMES} frames at ${FPS} fps, ${Math.round(statSync(file).size / 1024)} KB`);
  }
} finally {
  await browser.close();
}
