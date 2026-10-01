// What every browser script in scripts/ knows about this site, in one
// place, so page discovery and the theme door are written once:
// scripts/capture-pages.mjs (the index panel's previews) and
// scripts/pagecheck/ (the page check) both import from here.
//
//   - CHROME_PATH: the Chrome for Testing build playwright-core launches,
//     CHROME_PATH in the environment or the default install path
//   - seedTheme: the site's pre-boot theme door. The root layout's script
//     reads the gt-theme localStorage key and stamps html[data-theme]
//     before first paint, so a context that writes the key in an init
//     script paints the theme from the first frame
//   - HIDE_DEV_UI_CSS: the dev server's own indicator (nextjs-portal), kept
//     out of every capture
//   - productionPages: the static pages of the shipped direction under
//     src/app/d/production, as [segments], each named by the rule
//     src/lib/surfaces.ts uses (`production`, `production-<segments>`)
//   - firstSlug and firstExplorationSlug: the first slug a registry file
//     declares, read from the source with a regex, the way
//     scripts/lint-lines.mjs reads it, so no script needs a TypeScript
//     loader
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

export const CHROME_PATH =
  process.env.CHROME_PATH ??
  '/Users/kevinliu/Library/Caches/ms-playwright/chromium-1217/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';

/** The localStorage key the root layout reads before first paint (src/components/viewer/ThemeButton.tsx, THEME_KEY). */
export const THEME_KEY = 'gt-theme';

/** The dev server's indicator, hidden before any capture. */
export const HIDE_DEV_UI_CSS = 'nextjs-portal { display: none !important; }';

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
