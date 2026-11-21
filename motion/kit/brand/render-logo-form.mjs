// Renders the logo form from kit/brand/gt-logo-motion.js to
// public/marks/graticule/motion/logo-form-{light,dark}.mp4, the clips
// /marks/loading plays: 1080 px square at 60 fps, the logo 648 px across,
// still for 0.5 s, the form, then still for 0.5 s. Every frame is set from
// its time, so a render is the same on every run.
//
// Usage: node motion/kit/brand/render-logo-form.mjs
// Requires: ffmpeg on PATH, playwright-core from the repository's node_modules.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from 'playwright-core';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, '..', '..', '..', 'public', 'marks', 'graticule', 'motion');
const SIZE = 1080;
const LOGO = 648;
const FPS = 60;
const HOLD = 0.5;
/* the site's paper and ink in each theme (src/components/viewer/tokens.css) */
const THEMES = { light: { ground: '#ffffff', ink: '#070707' }, dark: { ground: '#070707', ink: '#f2f2f0' } };

const browser = await chromium.launch({ headless: true });
try {
  for (const [theme, { ground, ink }] of Object.entries(THEMES)) {
    const page = await browser.newPage({ viewport: { width: SIZE, height: SIZE } });
    const at = (SIZE - LOGO) / 2;
    await page.setContent(`<body style="margin:0;background:${ground}"><div id="box" style="position:absolute;left:${at}px;top:${at}px;width:${LOGO}px;height:${LOGO}px"></div></body>`);
    await page.addScriptTag({ path: join(HERE, 'gt-logo-motion.js') });
    const length = await page.evaluate((c) => {
      window.logo = window.GTLogoMotion.create({ ink: c });
      document.getElementById('box').appendChild(window.logo.svg);
      return window.logo.duration;
    }, ink);
    const frames = Math.round((length + 2 * HOLD) * FPS);
    const dir = mkdtempSync(join(tmpdir(), 'logo-form-'));
    for (let i = 0; i <= frames; i++) {
      await page.evaluate((t) => window.logo.set(t), i / FPS - HOLD);
      await page.screenshot({ path: join(dir, `${String(i).padStart(4, '0')}.png`) });
    }
    await page.close();
    const out = join(OUT, `logo-form-${theme}.mp4`);
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', join(dir, '%04d.png'), '-pix_fmt', 'yuv420p', '-c:v', 'libx264', '-crf', '18', '-movflags', '+faststart', out]);
    rmSync(dir, { recursive: true, force: true });
    console.log(`${out} (${frames + 1} frames)`);
  }
} finally {
  await browser.close();
}
