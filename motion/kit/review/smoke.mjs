#!/usr/bin/env node
/* oxlint-disable no-console -- a report printed to stdout. */
/**
 * Smoke test for the review pages, script-review.html and voices.html.
 *
 * It serves motion/ with a small static server on a free port and opens each
 * page with its sample JSON in headless Chrome: dark and light at 1280 x 900,
 * and dark at 390 x 844. A run fails when:
 *   - the page logs a console error or throws. A 404 for a file the pages
 *     treat as optional is expected and printed as a note: the kit's
 *     tokens.css and fonts (a fresh clone has no vendored fonts) and the
 *     audio takes the sample names (the sample ships no audio);
 *   - the rows, bars, players or switches differ from the sample's counts;
 *   - the heading, the first story or sample text, or the first row's words
 *     differ from the sample's, or the page shows a stringified value
 *     ("[object", "undefined", "NaN");
 *   - the page scrolls sideways;
 *   - in the first run, a timeline bar does not mark its line, a play button
 *     does not report its missing take, or the mode switch does not change.
 *
 * Usage (from the repository root):
 *   node motion/kit/review/smoke.mjs [--shots <dir>]
 *
 *   --shots <dir>  save a full-page screenshot of every run, and a viewport
 *                  shot after the first run's clicks, to <dir>
 *   CHROME_PATH    the browser to launch (default: the Chrome for Testing
 *                  build playwright-core installs)
 *
 * Exit 0 on pass, 1 on a failed check, 2 when there is no browser.
 */
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { dirname, extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from 'playwright-core';

const HERE = dirname(fileURLToPath(import.meta.url));
const MOTION = resolve(HERE, '..', '..');
const PAGE_DIR = '/kit/review/';

const argv = process.argv.slice(2);
const shotsAt = argv.indexOf('--shots');
const SHOTS = shotsAt >= 0 && argv[shotsAt + 1] ? resolve(argv[shotsAt + 1]) : null;

const RUNS = [
  { name: 'dark', colorScheme: 'dark', viewport: { width: 1280, height: 900 }, clicks: true },
  { name: 'light', colorScheme: 'light', viewport: { width: 1280, height: 900 } },
  { name: 'phone-dark', colorScheme: 'dark', viewport: { width: 390, height: 844 } },
];

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.mp3': 'audio/mpeg',
  '.m4a': 'audio/mp4',
  '.wav': 'audio/wav',
};

/** A static server for `root` on a free port of 127.0.0.1. Missing files answer 404. */
function serve(root) {
  const server = createServer(async (req, res) => {
    try {
      const path = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
      const file = resolve(root, '.' + path);
      if (file !== root && !file.startsWith(root + sep)) throw new Error('outside the root');
      if (!(await stat(file)).isFile()) throw new Error('not a file');
      const body = await readFile(file);
      res.writeHead(200, { 'content-type': TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream', 'cache-control': 'no-store' });
      res.end(req.method === 'HEAD' ? undefined : body);
    } catch {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      res.end('not found');
    }
  });
  return new Promise((done) => server.listen(0, '127.0.0.1', () => done(server)));
}

const readJson = (name) => JSON.parse(readFileSync(join(HERE, name), 'utf8'));
const hasTimes = (line) => typeof (line.start ?? line.at) === 'number' && typeof line.end === 'number' && line.end > (line.start ?? line.at);

/** What script-review.html must show for its sample: selector counts, texts, and the line its first bar marks. */
function scriptExpect(data) {
  const counts = {
    'section.film': data.films.length,
    'nav.films a': data.films.length,
    'ol.lines > li': data.films.reduce((sum, film) => sum + film.lines.length, 0),
    '.tl .seg': data.films.reduce((sum, film) => sum + film.lines.filter(hasTimes).length, 0),
    '.callout': data.films.reduce((sum, film) => sum + (film.notes ?? []).filter((note) => note.callout === true).length, 0),
  };
  for (const film of data.films) {
    counts[`#${film.id} ol.lines > li`] = film.lines.length;
    counts[`#${film.id} .tl .seg`] = film.lines.filter(hasTimes).length;
  }
  const first = data.films[0];
  const texts = [
    ['h1', data.title],
    [`#${first.id} .story`, first.story],
    ['ol.lines > li .said', first.lines[0].said],
  ];
  return { counts, ready: 'section.film', texts, target: `${first.id}-${first.lines[0].n}` };
}

/** What voices.html must show for its sample: selector counts and texts. */
function voicesExpect(data) {
  const groups = new Set(data.voices.map((voice) => voice.group).filter(Boolean));
  return {
    counts: {
      '.row': data.voices.length,
      'button.play': data.voices.length,
      'audio#player': 1,
      'h2.group': groups.size,
      '.toggle button': (data.modes ?? []).length > 1 ? data.modes.length : 0,
    },
    ready: '.row',
    texts: [
      ['h1', data.title],
      ['.sample p', data.sample],
      ['.row .name b', data.voices[0].name],
    ],
  };
}

/** The audio takes a voices sample names, as absolute addresses on the test server. */
function takeUrls(data, dataUrl) {
  return data.voices.flatMap((voice) => Object.values(voice.takes ?? {}).map((path) => new URL(path, dataUrl).href));
}

const PAGES = [
  { file: 'script-review.html', data: 'sample-script-review.json', expect: scriptExpect },
  { file: 'voices.html', data: 'sample-voices.json', expect: voicesExpect },
];

async function clickScript(page, expected, fail) {
  await page.click('.tl .seg >> nth=0');
  await page.waitForFunction((id) => location.hash === '#' + id, expected.target, { timeout: 5000 }).catch(() => {});
  const marked = await page.evaluate((id) => document.getElementById(id)?.classList.contains('is-target') ?? false, expected.target);
  if (!marked) fail(`the first timeline bar did not mark line #${expected.target}`);
}

async function clickVoices(page, fail) {
  await page.click('button.play >> nth=0');
  // The page fetches the take, then plays it or reports it. The sample's takes do not exist.
  const settled = await page
    .waitForFunction(() => {
      const player = document.getElementById('player');
      const status = document.getElementById('now')?.textContent ?? '';
      return /^Could not play/.test(status) || (/^Playing/.test(status) && (player.currentTime > 0 || player.error !== null));
    }, null, { timeout: 8000 })
    .then(() => true, () => false);
  const [status, label, name] = await page.evaluate(() => [
    document.getElementById('now')?.textContent ?? '',
    document.querySelector('button.play')?.getAttribute('aria-label') ?? '',
    document.querySelector('.row .name b')?.textContent ?? '',
  ]);
  if (!settled) fail(`the first play button neither played nor reported its take; the now-playing line says "${status}"`);
  if (/^Could not play/.test(status) && label !== 'Play ' + name) fail(`after a missing take the button reads "${label}"`);

  const buttons = page.locator('.toggle button');
  if ((await buttons.count()) > 1) {
    await buttons.nth(1).click();
    const pressed = await buttons.evaluateAll((all) => all.map((button) => button.getAttribute('aria-pressed')));
    if (pressed[0] !== 'false' || pressed[1] !== 'true') fail(`the mode switch reads ${pressed.join(', ')} after a click on the second mode`);
  }
  return status;
}

async function main() {
  const executablePath = process.env.CHROME_PATH ?? chromium.executablePath();
  if (!existsSync(executablePath)) {
    console.error(`no Chrome at ${executablePath}: run pnpm exec playwright-core install chromium, or set CHROME_PATH`);
    process.exit(2);
  }
  if (SHOTS) mkdirSync(SHOTS, { recursive: true });

  const server = await serve(MOTION);
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ executablePath, headless: true });
  const failures = [];
  try {
    for (const spec of PAGES) {
      const data = readJson(spec.data);
      const expected = spec.expect(data);
      const dataUrl = origin + PAGE_DIR + spec.data;
      const optional = new Set([origin + '/kit/tokens.css', ...(Array.isArray(data.voices) ? takeUrls(data, dataUrl) : [])]);
      const isOptional = (url) => optional.has(url) || url.startsWith(origin + '/kit/fonts/');
      const stem = spec.file.replace(/\.html$/, '');

      for (const run of RUNS) {
        const where = `${spec.file} ${run.name}`;
        const fail = (message) => failures.push(`${where}: ${message}`);
        const notes = new Set();
        const context = await browser.newContext({ colorScheme: run.colorScheme, viewport: run.viewport, deviceScaleFactor: 1 });
        const page = await context.newPage();
        page.setDefaultTimeout(15000);
        page.on('pageerror', (error) => fail(`page error: ${error.message}`));
        page.on('console', (message) => {
          if (message.type() !== 'error') return;
          const url = message.location()?.url ?? '';
          if (/^Failed to load resource/.test(message.text()) && isOptional(url)) {
            notes.add(new URL(url).pathname);
            return;
          }
          fail(`console error: ${message.text()}${url ? ` (${url.replace(origin, '')})` : ''}`);
        });

        let counts = {};
        let status = '';
        try {
          await page.goto(`${origin}${PAGE_DIR}${spec.file}?data=${encodeURIComponent(spec.data)}`, { waitUntil: 'load' });
          await page.waitForSelector(`${expected.ready}, .status.error`);
          await page.evaluate(() => document.fonts.ready);
          const reported = await page.evaluate(() => document.querySelector('.status.error')?.textContent ?? '');
          if (reported) fail(`the page reports: ${reported}`);

          counts = await page.evaluate((selectors) => Object.fromEntries(selectors.map((s) => [s, document.querySelectorAll(s).length])), Object.keys(expected.counts));
          for (const [selector, want] of Object.entries(expected.counts)) {
            if (counts[selector] !== want) fail(`${selector}: ${counts[selector]} on the page, ${want} in ${spec.data}`);
          }
          const texts = await page.evaluate((selectors) => selectors.map((s) => document.querySelector(s)?.textContent.trim() ?? null), expected.texts.map(([s]) => s));
          expected.texts.forEach(([selector, want], i) => {
            if (texts[i] !== want) fail(texts[i] === null ? `${selector} is not on the page` : `${selector} reads "${texts[i]}", ${spec.data} has "${want}"`);
          });
          const leak = await page.evaluate(() => document.body.innerText.match(/\[object |\bundefined\b|\bNaN\b/)?.[0]);
          if (leak) fail(`the page shows a stringified value: "${leak.trim()}"`);
          const sideways = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
          if (sideways > 0) fail(`the page scrolls sideways by ${sideways}px`);

          if (SHOTS) await page.screenshot({ path: join(SHOTS, `${stem}-${run.name}.png`), fullPage: true });
          if (run.clicks) {
            if (spec.file === 'script-review.html') await clickScript(page, expected, fail);
            else status = await clickVoices(page, fail);
            if (SHOTS) await page.screenshot({ path: join(SHOTS, `${stem}-${run.name}-after-click.png`) });
          }
        } catch (error) {
          fail(`stopped: ${String(error instanceof Error ? error.message : error).split('\n')[0]}`);
        } finally {
          await context.close();
        }

        const summary = Object.entries(counts).map(([s, n]) => `${n} ${s}`).join(', ');
        console.log(`  ${failures.some((f) => f.startsWith(where + ':')) ? 'FAIL' : 'ok  '} ${where}: ${summary}${status ? `; after a play click: ${status}` : ''}`);
        for (const path of notes) console.log(`       note: optional file missing: ${path}`);
      }
    }
  } finally {
    await browser.close();
    server.close();
  }

  for (const failure of failures) console.log(`  FAIL ${failure}`);
  console.log(`review smoke: ${failures.length === 0 ? 'pass' : `fail (${failures.length})`}${SHOTS ? `; screenshots in ${SHOTS}` : ''}`);
  process.exitCode = failures.length === 0 ? 0 : 1;
}

await main();
