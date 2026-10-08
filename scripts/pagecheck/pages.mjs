// The pages the check walks on this site, each { id, path, source, ready,
// settleMs?, hide?, kinds? }:
//   id, path, source   from the shared route list (scripts/site-pages.mjs,
//             siteRoutes, the rows tagged `check`): the id names the cell's
//             capture the way scripts/capture-pages.mjs and
//             src/lib/surfaces.ts name the page; source lists the folders
//             the report's where column prefers
//   ready     the selector that says the page is ready to read: the shell
//             stamps .pt-viewer[data-settled] one frame after it boots, the
//             blog mounts .blog-root, the presenter .pr-root, and the deck
//             is ready when its sheet has a box (hooks.mjs ready() reads it
//             inside the deck's document). The reads then wait for the
//             layout to hold still (pagecheck.mjs)
//   settleMs  the longest the reads wait for that (default 3000; no page
//             here needs more once the ready selector has matched)
//   hide      selectors hidden before the reads and the capture, on top of
//             the dev server's indicator every page hides
//   kinds     the device kinds the page is read on (phone, tablet,
//             desktop; default all), for a page that only has one form
//
// The archived directions under src/app/d other than production are not
// maintained and are not walked.
//
// Another site can supply its own module through --pages-module; it must
// export a `pages()` function returning the same shape.
import { routesFor } from '../site-pages.mjs';

/** The shell's ready stamp (src/components/viewer/ViewerShell.tsx). */
const SHELL_READY = '.pt-viewer[data-settled]';

/** The ready selector of the pages that are not on the shell. */
const READY = {
  present: '.pr-root',
  deck: '#sheet',
  blog: '.blog-root',
};

/** The ready selector of a route: its own, the blog's root for a post, the body for a shipped page, the shell's stamp otherwise. */
function readyOf(route) {
  if (READY[route.id]) return READY[route.id];
  if (route.id.startsWith('blog-')) return READY.blog;
  if (route.id.startsWith('production')) return 'body';
  return SHELL_READY;
}

/** Every page, in the order the report lists them. */
export function pages() {
  return routesFor('check').map((route) => ({
    id: route.id,
    path: route.path,
    source: route.source,
    ready: readyOf(route),
  }));
}
