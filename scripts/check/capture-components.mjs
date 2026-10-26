// Captures the preview of every component /components lists: on each page
// of the docs Components section (content/docs/components, its groups and
// pages in their meta.json order), the first plate stage under each h2
// (.dmo-stage, or the blog globe figure's .bgf or .bgg), in both themes,
// into public/shots/components/<page>-<heading id>.webp and
// <page>-<heading id>-dark.webp. src/lib/component-library.ts reads these
// files by the same name and their size from the WebP header.
//
// Each page is loaded at 1440x900 with reduced motion requested, so a
// moving plate shows its still. A plate mounts when it nears the viewport,
// so each one is scrolled into view and given a settle before the shot; a
// figure drawn in frames waits for every frame's load first. The
// shot is the element alone at a device scale of 1, written as PNG and
// encoded as WebP at quality 80 through cwebp (brew install webp). A page
// that fails to load is reported and skipped; the run exits 1 at the end
// when any page or plate failed.
//
// Usage: pnpm capture:components [--base <url>, default PT_BASE] [--only <page>[,<page>]]
// Needs the dev server running and the Chrome for Testing build
// playwright-core expects; CHROME_PATH overrides the executable.
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { chromium } from 'playwright-core';

import { BASE_URL, chromePath, HIDE_DEV_UI_CSS, ROOT, seedTheme } from '../lib/site-pages.mjs';
import { helpIfAsked } from '../lib/help.mjs';
import { option } from '../lib/args.mjs';

helpIfAsked(import.meta.url);

const argv = process.argv.slice(2);
const BASE = (option(argv, '--base') ?? BASE_URL).replace(/\/$/, '');
const ONLY = option(argv, '--only')?.split(',').filter(Boolean);
const DOCS = join(ROOT, 'content/docs/components');
const OUT = join(ROOT, 'public/shots/components');
const STAGES = '.dmo-stage, .bgf, .bgg';
const SETTLE_MS = 1800;
const FRAME_SETTLE_MS = 4000;
const QUALITY = 80;
const THEMES = ['light', 'dark'];

/** The page slugs of the Components section, group by group. */
function pages() {
  const top = JSON.parse(readFileSync(join(DOCS, 'meta.json'), 'utf8'));
  return top.pages
    .filter((p) => p.startsWith('('))
    .flatMap((group) => JSON.parse(readFileSync(join(DOCS, group, 'meta.json'), 'utf8')).pages);
}

/** Runs in the page: for each h2 of the article, the index (among every stage) of the first stage under it. */
function stagesByHeading(selector) {
  const stages = [...document.querySelectorAll(selector)];
  const heads = [...document.querySelectorAll('article h2[id], #nd-page h2[id]')];
  const out = [];
  heads.forEach((h, i) => {
    const next = heads[i + 1];
    const at = stages.findIndex(
      (s) =>
        h.compareDocumentPosition(s) & Node.DOCUMENT_POSITION_FOLLOWING &&
        (!next || next.compareDocumentPosition(s) & Node.DOCUMENT_POSITION_PRECEDING)
    );
    if (at >= 0) out.push([h.id, at]);
  });
  return out;
}

const list = ONLY ? pages().filter((p) => ONLY.includes(p)) : pages();
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: chromePath(), headless: true });
let written = 0;
let bytes = 0;
const failed = [];

for (const theme of THEMES) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, colorScheme: theme, reducedMotion: 'reduce' });
  await seedTheme(context, theme);
  for (const slug of list) {
    const page = await context.newPage();
    try {
      const res = await page.goto(`${BASE}/docs/components/${slug}`, { waitUntil: 'networkidle', timeout: 120_000 });
      if (!res || !res.ok()) throw new Error(`HTTP ${res?.status() ?? 'no response'}`);
      await page.addStyleTag({ content: HIDE_DEV_UI_CSS });
      /* the docs bars stay put while the page scrolls; hidden, they cannot fall across a tall plate */
      await page.evaluate(() => {
        for (const el of document.querySelectorAll('body *')) {
          const { position } = getComputedStyle(el);
          if (position === 'fixed' || position === 'sticky') el.style.setProperty('visibility', 'hidden', 'important');
        }
      });
      await page.evaluate(() => document.fonts.ready);
      const found = await page.evaluate(stagesByHeading, STAGES);
      for (const [anchor, index] of found) {
        const target = join(OUT, `${slug}-${anchor}${theme === 'dark' ? '-dark' : ''}.webp`);
        try {
          const stage = page.locator(STAGES).nth(index);
          /* a framed figure (the blog globes) mounts its frames near the viewport and loads its own route in each */
          await stage.scrollIntoViewIfNeeded();
          await page.waitForTimeout(400);
          for (const cell of await stage.locator('.bgg-cell, .bgf').all()) {
            await cell.scrollIntoViewIfNeeded();
            await page.waitForTimeout(300);
          }
          const frames = await stage.locator('iframe').all();
          for (const frame of frames) {
            await frame.scrollIntoViewIfNeeded();
            const inner = await (await frame.elementHandle())?.contentFrame();
            await inner?.waitForLoadState('load', { timeout: 120_000 });
            await inner?.addStyleTag({ content: HIDE_DEV_UI_CSS });
          }
          await stage.scrollIntoViewIfNeeded();
          await page.waitForTimeout(frames.length > 0 ? FRAME_SETTLE_MS : SETTLE_MS);
          const png = `${target}.png`;
          writeFileSync(png, await stage.screenshot({ type: 'png', animations: 'disabled' }));
          execFileSync('cwebp', ['-quiet', '-q', String(QUALITY), png, '-o', target]);
          rmSync(png);
          written += 1;
          bytes += statSync(target).size;
          console.log(`  ${theme} ${slug}#${anchor}`);
        } catch (error) {
          failed.push(`${theme} ${slug}#${anchor}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    } catch (error) {
      failed.push(`${theme} ${slug}: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      await page.close();
    }
  }
  await context.close();
}

await browser.close();
console.log(`capture-components: ${written} previews, ${(bytes / 1024).toFixed(0)} KB, in ${OUT.slice(ROOT.length + 1)}`);
if (failed.length > 0) {
  console.error(`capture-components: ${failed.length} failed\n${failed.map((f) => `  ${f}`).join('\n')}`);
  process.exit(1);
}
