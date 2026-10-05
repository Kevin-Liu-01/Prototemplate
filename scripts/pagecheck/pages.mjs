// The pages the check walks on this site, each { id, path, source,
// settleMs?, hide?, phoneOnly?, desktopOnly? }:
//   id        the capture name; the shell routes carry the ids
//             scripts/capture-pages.mjs and src/lib/surfaces.ts use, so a
//             cell's PNG and the index panel's preview name one page the
//             same way
//   path      the route, with its query where the page needs one
//   source    the folders (or files, or `folder/*` for a folder's own
//             files) the page's code lives in, in the order the report's
//             "where" column should prefer them; locate.mjs ranks a hit
//             there above the shared components and libraries, and the
//             column falls back to the first entry when no line matches
//   settleMs  how long after load the reads wait (default 3000; the deck
//             streams an 18MB document and gets longer)
//   hide      selectors hidden before the reads and the capture, on top of
//             the dev server's indicator every page hides
//   phoneOnly / desktopOnly   restrict the page to viewports under 768 or
//             from 768 up (none here today; the fields exist for a page
//             that only has one form)
//
// First slugs (the first doc, skill, post, research package, archived
// version and exploration) are read from the registries in src/lib and
// src/app with a regex over the source, through scripts/site-pages.mjs, the way
// scripts/lint-lines.mjs reads them: the list follows the data without a
// TypeScript loader. The archived directions under src/app/d other than
// production are not maintained and are not walked.
//
// Another site can supply its own module through --pages-module; it must
// export a `pages()` function returning the same shape.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { ROOT, firstExplorationSlug, firstSlug, productionId, productionPages, productionPath } from '../site-pages.mjs';

/** The deck page frames /brand-deck.html, an 18MB document; the reads wait for it. */
const DECK_SETTLE_MS = 6000;

/** The presenter mounts a wall of live frames; the reads wait for the first ones. */
const PRESENT_SETTLE_MS = 4500;

/**
 * The shipped direction's code: its own route folder, then the shared
 * sheets and sections it imports (src/app/d/production/page.tsx mounts
 * .toolchain-root; the footer, the nav and the translate window come from
 * _v0, the diagrams and components from toolchain, the company sections
 * from singularity, the try figure from src/components/try).
 */
const PRODUCTION_SOURCE = ['src/app/d/production', 'src/app/d/_v0', 'src/app/d/toolchain', 'src/app/d/singularity', 'src/components/try'];

/**
 * The newest post under content/blog, the one /blog lists first
 * (src/lib/blog.ts, getPosts sorts by the frontmatter date, newest first).
 */
function newestPostSlug() {
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

/** Every page, in the order the report lists them. */
export function pages() {
  const doc = firstSlug('src/app/docs/registry.ts', /slug: '([^']+)'/, 'export const DOCS');
  const skill = firstSlug('src/lib/skills.ts', /id: '([^']+)'/, 'export const SKILLS');
  const pkg = firstSlug('src/lib/motion.ts', /'([^']+)'/, 'export const MOTION_PACKAGE_SLUGS');
  const archive = firstSlug('src/lib/archive.ts', /entry\('([^']+)'/);
  const exploration = firstExplorationSlug();
  const post = newestPostSlug();
  const shell = [
    { id: 'gallery', path: '/', source: ['src/app/*'] },
    { id: 'brand', path: '/brand', source: ['src/app/brand'] },
    { id: 'docs', path: '/docs', source: ['src/app/docs'] },
    { id: `docs-${doc}`, path: `/docs/${doc}`, source: ['src/app/docs'] },
    { id: 'compare', path: '/compare', source: ['src/app/compare'] },
    { id: 'present', path: '/present', settleMs: PRESENT_SETTLE_MS, source: ['src/app/present'] },
    { id: 'deck', path: '/deck', settleMs: DECK_SETTLE_MS, source: ['src/app/deck', 'deck/parts'] },
    { id: 'craft', path: '/craft', source: ['src/app/craft'] },
    { id: 'marks', path: '/marks', source: ['src/app/marks'] },
    { id: 'skills', path: '/skills', source: ['src/app/skills'] },
    { id: `skills-${skill}`, path: `/skills/${skill}`, source: ['src/app/skills'] },
    { id: 'graphics', path: '/graphics', source: ['src/app/graphics'] },
    { id: 'motion', path: '/motion', source: ['src/app/motion'] },
    { id: `motion-${pkg}`, path: `/motion/${pkg}`, source: ['src/app/motion'] },
    { id: 'blog', path: '/blog', source: ['src/app/blog', 'src/components/blog', 'content/blog'] },
    { id: `blog-${post}`, path: `/blog/${post}`, source: ['src/app/blog', 'src/components/blog', 'content/blog'] },
    { id: `archive-${archive}`, path: `/archive/${archive}`, source: ['src/app/archive', 'src/app/*'] },
    { id: 'directions', path: `/directions/${exploration}`, source: ['src/app/directions'] },
  ];
  /* the shipped direction's static pages, with the direction corner kept out of the picture */
  const shipped = productionPages().map((segments) => ({
    id: productionId(segments),
    path: `${productionPath(segments)}?chrome=0`,
    source: PRODUCTION_SOURCE,
  }));
  return [...shell, ...shipped];
}
