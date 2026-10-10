// What every browser script in scripts/ knows about this site, in one
// place, so the routes, the devices, the Chrome build and the theme door
// are written once. The page check (scripts/pagecheck/), the live modes of
// lint-type, lint-radius and lint-heads, lint-lines --shell and
// capture-pages all import from here.
//
//   - chromePath: the Chrome for Testing build playwright-core launches,
//     CHROME_PATH in the environment or the build playwright-core installs
//   - seedTheme: the site's pre-boot theme door. The root layout's script
//     (and the deck's head) reads the gt-theme localStorage key and stamps
//     html[data-theme] before first paint, so a context that writes the
//     key in an init script paints the theme from the first frame
//   - HIDE_DEV_UI_CSS: the dev server's own indicator (nextjs-portal), kept
//     out of every capture
//   - DEVICES and PRESETS: the screen sizes the page check reads, each a
//     phone, a tablet or a desktop, and the quick and full sets of them
//   - siteRoutes: every route a browser tool walks, tagged with the tools
//     that walk it
//   - productionPages: the static pages of the shipped direction under
//     src/app/d/production, as [segments], each named by the rule
//     src/lib/surfaces.ts uses (`production`, `production-<segments>`)
//   - firstSlug, firstExplorationSlug and newestPostSlug: the first slug a
//     registry declares, read from the source with a regex, so no script
//     needs a TypeScript loader
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from 'playwright-core';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** The browser to launch: CHROME_PATH, else the Chrome for Testing build this playwright-core installs. Exits with the install line when it is missing. */
export function chromePath() {
  const path = process.env.CHROME_PATH ?? chromium.executablePath();
  if (existsSync(path)) return path;
  console.error(`no Chrome at ${path}: run pnpm exec playwright-core install chromium, or set CHROME_PATH`);
  process.exit(2);
}

/** The localStorage key the root layout reads before first paint (src/components/viewer/ThemeButton.tsx, THEME_KEY). */
export const THEME_KEY = 'gt-theme';

/** The dev server's indicator, hidden before any capture. */
export const HIDE_DEV_UI_CSS = 'nextjs-portal { display: none !important; }';

/**
 * The screen sizes, each { name, w, h, kind, dpr }. The kind decides touch,
 * not the width: a phone or a tablet is a touch device in either
 * orientation (isMobile and hasTouch, so the page reads pointer: coarse),
 * and its tap targets are read; a desktop has a mouse. The name is the
 * size, so `--viewports 390x844` names a row; 720x450@2x is 1440x900 at
 * 200% zoom.
 */
export const DEVICES = [
  { name: '320x568', w: 320, h: 568, kind: 'phone', dpr: 2 }, // iPhone SE (1st), the narrowest phone
  { name: '360x800', w: 360, h: 800, kind: 'phone', dpr: 2 }, // Android
  { name: '375x667', w: 375, h: 667, kind: 'phone', dpr: 2 }, // iPhone SE, 8
  { name: '390x844', w: 390, h: 844, kind: 'phone', dpr: 2 }, // iPhone 12 to 14
  { name: '393x852', w: 393, h: 852, kind: 'phone', dpr: 2 }, // iPhone 15 and 16, Pixel
  { name: '412x915', w: 412, h: 915, kind: 'phone', dpr: 2 }, // Pixel, Galaxy
  { name: '430x932', w: 430, h: 932, kind: 'phone', dpr: 2 }, // iPhone Pro Max
  { name: '844x390', w: 844, h: 390, kind: 'phone', dpr: 2 }, // a phone in landscape
  { name: '932x430', w: 932, h: 430, kind: 'phone', dpr: 2 }, // a large phone in landscape
  { name: '768x1024', w: 768, h: 1024, kind: 'tablet', dpr: 2 }, // iPad mini, 9.7
  { name: '820x1180', w: 820, h: 1180, kind: 'tablet', dpr: 2 }, // iPad Air
  { name: '1024x1366', w: 1024, h: 1366, kind: 'tablet', dpr: 2 }, // iPad Pro 12.9
  { name: '1024x768', w: 1024, h: 768, kind: 'tablet', dpr: 2 }, // the three in landscape
  { name: '1180x820', w: 1180, h: 820, kind: 'tablet', dpr: 2 },
  { name: '1366x1024', w: 1366, h: 1024, kind: 'tablet', dpr: 2 },
  { name: '720x450@2x', w: 720, h: 450, kind: 'desktop', dpr: 2 }, // 1440x900 at 200% zoom
  { name: '1280x720', w: 1280, h: 720, kind: 'desktop', dpr: 1 },
  { name: '1280x800', w: 1280, h: 800, kind: 'desktop', dpr: 1 },
  { name: '1366x768', w: 1366, h: 768, kind: 'desktop', dpr: 1 },
  { name: '1440x900', w: 1440, h: 900, kind: 'desktop', dpr: 1 },
  { name: '1527x814', w: 1527, h: 814, kind: 'desktop', dpr: 1 }, // Kevin's laptop
  { name: '1536x864', w: 1536, h: 864, kind: 'desktop', dpr: 1 },
  { name: '1920x1080', w: 1920, h: 1080, kind: 'desktop', dpr: 1 },
  { name: '2560x1440', w: 2560, h: 1440, kind: 'desktop', dpr: 1 },
  { name: '3440x1440', w: 3440, h: 1440, kind: 'desktop', dpr: 1 }, // ultrawide
];

/**
 * The device sets the page check runs: every device in dark, and light on
 * a few (light changes colors more than layout, and a missing -light
 * picture shows as a console 404 only in light). quick is the round's
 * check on the touched pages; full runs before a release.
 */
export const PRESETS = {
  quick: {
    dark: ['320x568', '390x844', '844x390', '820x1180', '1366x768', '1440x900', '1920x1080', '3440x1440'],
    light: ['1440x900'],
  },
  full: {
    dark: DEVICES.map((d) => d.name),
    light: ['390x844', '1440x900', '1920x1080'],
  },
};

/** A device by name; a `WxH` outside the table is a desktop with a mouse. Throws on anything else, so a typo never becomes a 0x0 context. */
export function device(name) {
  const known = DEVICES.find((d) => d.name === name);
  if (known) return known;
  const m = /^(\d+)x(\d+)$/.exec(name.trim());
  if (!m) throw new Error(`a device is one of DEVICES (scripts/site-pages.mjs) or WxH, got ${JSON.stringify(name)}`);
  return { name: name.trim(), w: Number(m[1]), h: Number(m[2]), kind: 'desktop', dpr: 1 };
}

/** The context options for a device: the viewport, the scale and, on a phone or a tablet, touch. */
export function deviceOptions(d) {
  const touch = d.kind !== 'desktop';
  return { viewport: { width: d.w, height: d.h }, deviceScaleFactor: d.dpr, isMobile: touch, hasTouch: touch };
}

const PRODUCTION = join(ROOT, 'src/app/d/production');
const DIRECTIONS_SOURCE = join(ROOT, 'src/lib/directions.ts');

/**
 * Seeds a Playwright context with the theme: the key is written before any
 * page of the context navigates, so the boot script in src/app/layout.tsx
 * finds it on first paint. The caller sets the context's colorScheme to
 * match, so native controls and the overscroll canvas agree.
 */
export async function seedTheme(context, theme) {
  await context.addInitScript(
    ([key, value]) => {
      try {
        localStorage.setItem(key, value);
      } catch {
        // a context without storage: the boot script falls back to dark
      }
    },
    [THEME_KEY, theme]
  );
}

/**
 * The static pages under src/app/d/production, as [segments]: every folder
 * holding a page.tsx whose path has no bracketed segment (blog/[slug] and
 * the catch-all are not pages of their own), the root first, then the
 * rest in path order.
 */
export function productionPages() {
  const found = [];
  const walk = (dir, segments) => {
    if (segments.some((s) => s.startsWith('['))) return;
    if (existsSync(join(dir, 'page.tsx'))) found.push(segments);
    for (const entry of readdirSync(dir).sort()) {
      const abs = join(dir, entry);
      if (statSync(abs).isDirectory()) walk(abs, [...segments, entry]);
    }
  };
  walk(PRODUCTION, []);
  return found;
}

/** The surface id of a production page: `production` for the home, `production-<segments joined by ->` for the rest. */
export function productionId(segments) {
  return segments.length === 0 ? 'production' : `production-${segments.join('-')}`;
}

/** The route of a production page, without the query. */
export function productionPath(segments) {
  return ['/d/production', ...segments].join('/');
}

/**
 * The first slug a registry file declares: the first match of `pattern`
 * in the file, read from `from` onward when given (the generated
 * src/lib/skills.ts carries category ids above the SKILLS array). Throws
 * when the file holds no match, so a renamed registry fails the run
 * instead of auditing a 404.
 */
export function firstSlug(file, pattern, from) {
  let text = readFileSync(join(ROOT, file), 'utf8');
  if (from) {
    const at = text.indexOf(from);
    if (at < 0) throw new Error(`${from} not found in ${file}`);
    text = text.slice(at);
  }
  const slug = text.match(pattern)?.[1];
  if (!slug) throw new Error(`no slug matching ${pattern} in ${file}`);
  return slug;
}

/**
 * The slug of the first exploration in src/lib/directions.ts: the first
 * entry of DIRECTIONS without `site: true`. /directions/<slug> is the
 * route every site and exploration row opens. Throws when the array or
 * an exploration cannot be found.
 */
export function firstExplorationSlug() {
  const source = readFileSync(DIRECTIONS_SOURCE, 'utf8');
  const start = source.indexOf('export const DIRECTIONS');
  const end = source.indexOf('\n];', start);
  if (start < 0 || end < 0) throw new Error('no DIRECTIONS array in src/lib/directions.ts');
  for (const block of source.slice(start, end).split(/\n  \},?\n/)) {
    const slug = block.match(/\bslug: '([^']+)'/)?.[1];
    if (slug && !/\bsite: true\b/.test(block)) return slug;
  }
  throw new Error('no exploration found in src/lib/directions.ts');
}

/**
 * The newest post under content/blog, the one /blog lists first
 * (src/lib/blog.ts, getPosts sorts by the frontmatter date, newest first).
 */
export function newestPostSlug() {
  const dir = join(ROOT, 'content/blog');
  const posts = readdirSync(dir)
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => {
      const date = readFileSync(join(dir, file), 'utf8').match(/^date:\s*(\S+)/m)?.[1] ?? '';
      return { slug: file.replace(/\.mdx$/, ''), date };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
  if (posts.length === 0) throw new Error('no posts under content/blog');
  return posts[0].slug;
}

/**
 * The shipped direction's code: its own route folder, then the shared
 * sheets and sections it imports (src/app/d/production/page.tsx mounts
 * .toolchain-root; the footer, the nav and the translate window come from
 * _v0, the diagrams and components from toolchain, the company sections
 * from singularity, the try figure from src/components/try).
 */
const PRODUCTION_SOURCE = ['src/app/d/production', 'src/app/d/_v0', 'src/app/d/toolchain', 'src/app/d/singularity', 'src/components/try'];

/**
 * Every route a browser tool walks, each { id, path, tools, source }:
 *   id      the surface id in src/lib/surfaces.ts, which names a page
 *           check cell, a capture and a thumbnail alike
 *   path    the route, with the query a page needs
 *   tools   the tools that walk it: `check` (scripts/pagecheck), `live`
 *           (the --live modes of lint-type, lint-radius and lint-heads),
 *           `lines` (lint-lines --shell) and `capture` (capture-pages)
 *   source  the folders the page's code lives in, in the order the page
 *           check's where column prefers them (a folder, a file, or
 *           `folder/*` for a folder's own files)
 * A first slug (the first doc, skill, package, archive entry, exploration
 * and the newest post) is read from its registry, so the list follows the
 * data. Each tool keeps its own per-route reads: the page check its ready
 * selector, lint-lines its states, lint-type its overlay keys. A new page
 * is one row here.
 */
export function siteRoutes() {
  const doc = firstSlug('src/app/docs/registry.ts', /slug: '([^']+)'/, 'export const DOCS');
  const skill = firstSlug('src/lib/skills.ts', /id: '([^']+)'/, 'export const SKILLS');
  const pkg = firstSlug('src/lib/motion.ts', /'([^']+)'/, 'export const MOTION_PACKAGE_SLUGS');
  const archive = firstSlug('src/lib/archive.ts', /entry\('([^']+)'/);
  const exploration = firstExplorationSlug();
  const post = newestPostSlug();
  const blog = ['src/app/blog', 'src/components/blog', 'content/blog'];
  const book = ['src/app/handbook', 'src/app/docs', 'docs/handbook'];
  const shell = [
    { id: 'gallery', path: '/', tools: 'check live lines capture', source: ['src/app/*'] },
    { id: 'brand', path: '/brand', tools: 'check live lines capture', source: ['src/app/brand'] },
    { id: 'docs', path: '/docs', tools: 'check live lines capture', source: ['src/app/docs'] },
    { id: `docs-${doc}`, path: `/docs/${doc}`, tools: 'check', source: ['src/app/docs'] },
    { id: 'docs-design', path: '/docs/design', tools: 'live', source: ['src/app/docs'] },
    { id: 'compare', path: '/compare', tools: 'check live lines capture', source: ['src/app/compare'] },
    { id: 'present', path: '/present', tools: 'check capture', source: ['src/app/present'] },
    /* the built deck itself (next.config.ts rewrites /deck to public/brand-deck.html) */
    { id: 'deck', path: '/deck', tools: 'check live lines capture', source: ['deck/parts'] },
    { id: 'marks', path: '/marks', tools: 'check live lines capture', source: ['src/app/marks'] },
    { id: 'skills', path: '/skills', tools: 'check live lines capture', source: ['src/app/skills'] },
    { id: `skills-${skill}`, path: `/skills/${skill}`, tools: 'check live lines', source: ['src/app/skills'] },
    { id: 'handbook', path: '/handbook', tools: 'check live lines capture', source: book },
    { id: 'handbook-decisions', path: '/handbook/decisions', tools: 'check', source: book },
    { id: 'graphics', path: '/graphics', tools: 'check live lines', source: ['src/app/graphics'] },
    { id: 'motion', path: '/motion', tools: 'check live lines', source: ['src/app/motion'] },
    { id: `motion-${pkg}`, path: `/motion/${pkg}`, tools: 'check live lines', source: ['src/app/motion'] },
    { id: 'blog', path: '/blog', tools: 'check live', source: blog },
    { id: `blog-${post}`, path: `/blog/${post}`, tools: 'check live', source: blog },
    { id: `archive-${archive}`, path: `/archive/${archive}`, tools: 'check live lines', source: ['src/app/archive', 'src/app/*'] },
    { id: 'directions', path: `/directions/${exploration}`, tools: 'check live lines capture', source: ['src/app/directions'] },
    /* the shipped home with its direction corner, which lint-lines audits as chrome */
    { id: 'production-corner', path: '/d/production', tools: 'lines', source: PRODUCTION_SOURCE },
  ];
  /* the shipped direction's static pages, with the direction corner kept out of the picture */
  const shipped = productionPages().map((segments) => ({
    id: productionId(segments),
    path: `${productionPath(segments)}?chrome=0`,
    tools: 'check capture',
    source: PRODUCTION_SOURCE,
  }));
  return [...shell, ...shipped];
}

/** The routes one tool walks, in the list's order. */
export function routesFor(tool) {
  return siteRoutes().filter((r) => r.tools.split(' ').includes(tool));
}
