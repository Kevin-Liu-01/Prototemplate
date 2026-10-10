// This site's own reads and judgements: the landmarks the generic probe
// boxes, the subtrees it leaves out, the extra reads a page needs (the
// deck's sheet, the docs contents grid, the shell's data attributes), the
// invariants judged per cell, and where in the code a failed check points.
//
// The invariants, each with where it comes from:
//   toolbarBar      the shell's toolbar is the first 52px row of the main
//                   region at every viewport (tokens.css --pt-bar-h 52px;
//                   ViewerShell.css .pt-main grid-template-rows; Toolbar.css
//                   head note: "At or below 900px the bar stays one 52px row")
//   stageRows       the stage starts at the toolbar's bottom rule and ends
//                   2px above the viewport's bottom, the progress line's
//                   row; nothing is inserted between them after hydration,
//                   so the stage never moves (ViewerShell.css .pt-main,
//                   directive 7.5)
//   sidebarColumn   above 900px an open list is the first grid column, 208px
//                   in outline density or 256px with thumbnails, and the
//                   main region starts at its right edge; at or below 900px
//                   the list leaves the grid and shows only as the overlay
//                   (ViewerShell.css: the 900px cut, --pt-sb-w; Sidebar.css
//                   .pt-sb.is-overlay; DESIGN.md "Line law for chrome":
//                   the sidebar's right edge owns that seam)
//   deckSheet       the deck's sheet (1600x900 in deck/parts/head.html,
//                   scaled by fit() in deck/parts/tail.html) stays inside
//                   the viewport with its 16:9 aspect kept
//   docsToc         the docs book's contents grid stays inside the viewport
//                   and runs four columns above 900px, two at or below
//                   (the shared .pt-book-toc in BookView.css and its 900px
//                   cut, the deck's .book-toc)
//   galleryCells    no tile of the gallery's anatomy wall crosses the
//                   viewport edge on any viewport (src/app/anatomy-wall.css;
//                   DESIGN.md section 3, the rails hold the column)
// No page scrolls horizontally: the generic noOverflow and noPastEdge
// checks in probes.mjs hold that one for every page.
//
// PRESENTER names what the present-walk interaction reads on each of the
// presenter's slides (the title it lands on, the close beat's title, the
// prototypes grid) and how many prototypes the presenter shows. DECK_SKIP
// names what the deck's grid and book reads leave out.
//
// where() names the file and line a failed check points at through
// locate.mjs (the stylesheet line declaring the element's class, the
// component line rendering its text, the line naming a requested path),
// ranked by the page's source folders from pages.mjs, and writes the fix
// from what the element is.
//
// Another site can supply its own module through --hooks-module; it must
// export LANDMARKS, SKIP, TAP_SCOPE, CONSOLE_ALLOW, siteReads, judge and
// where with the same shapes (PRESENTER and DECK_SKIP serve this site's
// own interactions).
import { ROOT } from '../site-pages.mjs';
import { parseErrors } from './context.mjs';
import { locateAsset, locateClass, locateElement, locateText, parseDesc } from './locate.mjs';

/** Name to selector; the generic probe returns each one's box, and the report prints them per viewport across pages. */
export const LANDMARKS = {
  viewer: '.pt-viewer',
  toolbar: '.pt-toolbar',
  sidebar: '.pt-sb',
  stage: '.pt-stagewrap',
  progress: '.pt-progress',
  panel: '.pt-panel',
  docsToc: '.ptd-toc',
  presenterDock: '.pr-dock',
  main: 'main',
};

/**
 * Subtrees the edge and clip reads leave out: the hidden list under a
 * closed column (visibility hidden already excludes it; the selector is
 * kept so a half-faded close never counts), the leaving slide during a
 * page turn, the sheet's hover edges, the preview card while it is off,
 * the toast and help layers at rest, every canvas (the fields draw past
 * their boxes on purpose), and the moving tracks that are clipped by
 * design the way lint-lines' ALLOW names is-marquee: the translate
 * window's locale belt (src/app/d/_v0, .v0-tw-belt, a ticker strip), the
 * production careers page's language orbit (.prc-horizon-scene, a ring of
 * locale names turning through the box), the presenter's pinned phase
 * stack (src/app/present, .pr-pin, scrolled by GSAP) and its sticky
 * prototype stage (.pr-stage, a 100vh box the horizontal slide track
 * moves through while the 800vh section scrolls).
 */
export const SKIP = [
  '.pt-sb.is-hidden',
  '.pt-slide.is-leaving',
  '.pt-sheet-edge',
  '.pt-preview:not(.is-on)',
  '.pt-toast',
  '.pt-help',
  'canvas',
  'nextjs-portal',
  '.v0-tw-belt',
  '.prc-horizon-scene',
  '.pr-pin',
  '.pr-stage',
];

/** Where the phone tap targets are read: the page's main region and the shell's chrome. */
export const TAP_SCOPE = 'main, .pt-viewer, .pt-corner, .pt-corner-layer, .pr-root, .blog-root';

/**
 * Console errors the check does not count: React's hydration attribute
 * warning (extensions stamp body attributes; layout.tsx documents the
 * suppress flag) and the dev server's own notices.
 */
export const CONSOLE_ALLOW = /hydrat|did not match|extra attributes from the server|Download the React DevTools|Fast Refresh/i;

/**
 * The presenter's walk (interactions.mjs present-walk). Each stop is a
 * slide in the presenter's order (src/app/present/PresenterApp.tsx,
 * SLIDES): the walk presses j from the first, waits for the scroll to
 * rest, and the stop's title must be on screen with nothing painted over
 * it. The close beat is the end of the Details slide, where "So I built
 * 12" heads the contact sheet (TypeDetailSlide.tsx), read at `at` of the
 * slide's pin length; the grid opens with G on the Prototypes slide
 * (PrototypeViewer.tsx). `count` is how many prototypes the presenter
 * shows (Kevin, 2026-10-08: the first 16, so the close title fits), read
 * on the contact sheet and in the grid. The chrome boxes must not overlap
 * one another.
 */
export const PRESENTER = {
  count: 16,
  stops: [
    { slide: 'intro', title: '.pr-intro-title' },
    { slide: 'why', title: '.pr-why-big' },
    { slide: 'need', title: '[data-slide="need"] h2' },
    { slide: 'craft', title: '[data-slide="craft"] h2' },
    { slide: 'detail', title: '.pr-detail-head h2' },
    { slide: 'prototypes', title: '.pr-dock-label strong' },
    { slide: 'scoreboard', title: '.pr-score-title' },
  ],
  close: { slide: 'detail', at: 0.97, title: '.pr-detail-close h3', tiles: '.pr-close-tile' },
  grid: { slide: 'prototypes', key: 'g', title: '.pr-grid-head strong', cards: '.pr-grid-cards > button', dock: '.pr-dock', fitFrom: 1280 },
  chrome: ['.pr-hud-brand', '.pr-hud-author', '.pr-hud-rail', '.pr-dock', '.pr-notes'],
};

/** What the deck's grid and book reads leave out: the scaled slides inside each thumb and page clip on purpose. */
export const DECK_SKIP = ['.mini', '.thumb-frame', '.page-frame', 'canvas'];

/** The sidebar's two widths (tokens.css --pt-sb-w, ViewerShell.css thumbs density). */
const SIDEBAR_WIDTHS = [208, 256];

/** The shell's toolbar height (tokens.css --pt-bar-h). */
const BAR_H = 52;

/** The progress line's row (ViewerShell.css .pt-main). */
const PROGRESS_H = 2;

/** The cut where the sidebar leaves the grid and the contents grid drops a column. */
const NARROW_MAX = 900;

/** How far the deck's sheet may stray from 16:9. */
const ASPECT_SLACK = 0.01;

/** Under this many pixels a tap target is a dot or a glyph without a box of its own. */
const GLYPH_MAX = 16;

/**
 * The reads beyond the generic probe, run after it on the same page:
 * the shell's data attributes, the docs contents grid's column count, the
 * anatomy wall's tiles past the edge, and the deck's sheet inside the
 * viewport (/deck serves the built deck as the page, next.config.ts).
 */
export async function siteReads(page, cell, item) {
  const site = await page.evaluate(() => {
    const viewer = document.querySelector('.pt-viewer');
    const toc = document.querySelector('.ptd-toc');
    const cells = [...document.querySelectorAll('.aw-cell')];
    const past = cells.filter((el) => {
      const b = el.getBoundingClientRect();
      return b.width > 0 && (b.left < -1 || b.right > window.innerWidth + 1);
    });
    return {
      shell: viewer
        ? { sb: viewer.dataset.sb ?? null, density: viewer.dataset.density ?? null, settled: 'settled' in viewer.dataset, present: viewer.classList.contains('is-present') }
        : null,
      sidebarOverlay: Boolean(document.querySelector('.pt-sb.is-overlay')),
      sidebarVisible: (() => {
        const sb = document.querySelector('.pt-sb');
        if (!sb) return null;
        const cs = getComputedStyle(sb);
        return cs.visibility !== 'hidden' && cs.display !== 'none' && parseFloat(cs.opacity) > 0.02;
      })(),
      tocColumns: toc ? getComputedStyle(toc).gridTemplateColumns.split(' ').filter(Boolean).length : null,
      awCells: cells.length,
      awCellsPastEdge: past.map((el) => el.className).slice(0, 6),
    };
  });
  if (item.id === 'deck') {
    site.deck = await page.evaluate(() => {
      const sheet = document.getElementById('sheet');
      const b = sheet?.getBoundingClientRect() ?? null;
      const r1 = (n) => Math.round(n * 10) / 10;
      return {
        counter: document.getElementById('counter')?.textContent?.trim() ?? null,
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        sheet: b ? { x: r1(b.x), y: r1(b.y), w: r1(b.width), h: r1(b.height), right: r1(b.right), bottom: r1(b.bottom) } : null,
        noSidebar: document.querySelector('.viewer')?.classList.contains('no-sb') ?? null,
      };
    });
  }
  return site;
}

const near = (a, b, slack = 0.6) => a != null && b != null && Math.abs(a - b) <= slack;

/**
 * The site judgements for one cell: `judge` holds the invariant booleans
 * (null when the invariant does not apply to the page), `info` their
 * readings for the report.
 */
export function judge(reads, site, cell, item) {
  const judge = {};
  const info = {};
  const L = reads.landmarks;
  const shell = site.shell;
  if (shell && L.toolbar && !shell.present) {
    judge.toolbarBar = near(L.toolbar.y, 0) && near(L.toolbar.h, BAR_H);
    info.toolbar = [L.toolbar.x, L.toolbar.y, L.toolbar.w, L.toolbar.h];
    if (L.stage) {
      judge.stageRows =
        near(L.stage.y, L.toolbar.bottom) && near(L.stage.bottom, reads.innerHeight - PROGRESS_H, 1) && near(L.stage.right, reads.innerWidth, 1);
      info.stage = [L.stage.x, L.stage.y, L.stage.right, L.stage.bottom];
    }
    const narrow = cell.w <= NARROW_MAX;
    if (narrow) {
      /* the column is closed; the list may float only as the overlay */
      judge.sidebarColumn = !site.sidebarVisible || site.sidebarOverlay;
      info.sidebar = { narrow: true, visible: site.sidebarVisible, overlay: site.sidebarOverlay, sb: shell.sb };
    } else if (shell.sb === '0') {
      judge.sidebarColumn = near(L.toolbar.x, 0, 1);
      info.sidebar = { closed: true, toolbarX: L.toolbar.x };
    } else if (L.sidebar) {
      const widthOk = SIDEBAR_WIDTHS.some((w) => near(L.sidebar.w, w, 1));
      judge.sidebarColumn = near(L.sidebar.x, 0) && widthOk && near(L.toolbar.x, L.sidebar.right, 1);
      info.sidebar = { x: L.sidebar.x, w: L.sidebar.w, toolbarX: L.toolbar.x, density: shell.density };
    }
  }
  if (site.deck) {
    const d = site.deck;
    if (!d.sheet) {
      judge.deckSheet = false;
      info.deck = d;
    } else {
      const inside = d.sheet.x >= -1 && d.sheet.y >= -1 && d.sheet.right <= d.innerWidth + 1 && d.sheet.bottom <= d.innerHeight + 1;
      const ratio = d.sheet.w / d.sheet.h;
      judge.deckSheet = inside && Math.abs(ratio - 16 / 9) <= ASPECT_SLACK * (16 / 9);
      /* scale: the 1600px sheet's drawn width over its design width, a reading for the phone layout */
      info.deck = {
        sheet: d.sheet,
        viewport: [d.innerWidth, d.innerHeight],
        ratio: Math.round(ratio * 1000) / 1000,
        scale: Math.round((d.sheet.w / 1600) * 100) / 100,
        counter: d.counter,
        noSidebar: d.noSidebar,
      };
    }
  }
  if (L.docsToc) {
    const t = L.docsToc;
    const wanted = cell.w <= NARROW_MAX ? 2 : 4;
    judge.docsToc = t.x >= -1 && t.right <= reads.innerWidth + 1 && site.tocColumns === wanted;
    info.docsToc = { x: t.x, right: t.right, columns: site.tocColumns, wanted };
  }
  if (item.id === 'gallery' && site.awCells > 0) {
    judge.galleryCells = site.awCellsPastEdge.length === 0;
    info.galleryCells = { cells: site.awCells, pastEdge: site.awCellsPastEdge };
  }
  return { judge, info };
}

/** `file:line (.class)` for a class the page's stylesheets declare, or the bare class when none is found. */
function classRef(cls, item) {
  const at = locateClass(cls, item?.source ?? [], ROOT);
  return at ? `${at} (.${cls})` : `.${cls}`;
}

/** `file:line` for a text in the given folders, or the fallback the caller names. */
function textRef(text, sources, fallbackText) {
  return locateText(text, sources, ROOT) || fallbackText;
}

/** The page's first source folder, when no line could be found for an element. */
const pageFolder = (item) => (item?.source?.[0] ? `${item.source[0].replace(/\/\*$/, '')} (no line found)` : '');

/** Where an element reading (or the first of a list) lives: `file:line (via)`, else the page's folder. */
function placeElement(detail, item) {
  const first = Array.isArray(detail) ? detail[0] : detail;
  if (!first || typeof first !== 'object') return pageFolder(item);
  const hit = locateElement(first, item?.source ?? [], ROOT);
  return hit ? `${hit.where} (${hit.via})` : pageFolder(item);
}

/**
 * The fix for a tap target under 40px, from what the element is: a field
 * gets a 44px row, a text link (wider than twice its height) a 44px line
 * box, and a dot, a glyph or a control a hit area grown past its box by a
 * transparent ::after on a touch device, with the gaps beside it wide
 * enough that neighbors' areas do not overlap (the shell toolbar's touch
 * phone block in Toolbar.css). The drawing keeps its size in every case.
 */
function tapFix(t) {
  const grow = 'on a touch device give it a transparent ::after inset past its box (and gaps that leave room, so neighbors do not overlap), the way Toolbar.css does for the toolbar';
  if (!t || typeof t !== 'object') return `${grow}; the drawing stays its size`;
  const { tag } = parseDesc(t.el);
  const size = t.size ?? 0;
  if (tag === 'input') return 'give the field a 44px row under 900px (min-height 44); the type and the border stay';
  if (tag === 'a' && t.w > 2 * t.h) return 'set the link inline-flex with min-height 44 and align-items center under 900px, or lift it into a 44px row; the type stays, the hit box grows';
  if (size < GLYPH_MAX) return `the ${size}px glyph needs a 44px hit area: ${grow}`;
  /* the side under 40 is the one to grow: a tall narrow icon link needs width, a wide short button needs height */
  if (Math.abs(t.w - t.h) <= 4) return `the ${size}px square needs a 44px hit area: ${grow}`;
  return t.w < t.h ? `grow its width to a 44px hit area: ${grow}` : `grow its height to a 44px hit area: ${grow}`;
}

/** The file column and the fix for a cell's console errors: the lines that build or name each failed path. */
function consoleWhere(errors, item) {
  const { http, other } = parseErrors(Array.isArray(errors) ? errors : []);
  const paths = [...new Set(http.map((h) => h.path))];
  /* the reference every failed path shares (the line building their folder) comes first, then the lines naming single files */
  const tally = new Map();
  for (const p of paths) for (const r of locateAsset(p, item?.source ?? [], ROOT)) tally.set(r, (tally.get(r) ?? 0) + 1);
  const refs = [...tally.entries()].sort((a, b) => b[1] - a[1]).map(([r]) => r);
  const missing = http.some((h) => h.status === 404 || (h.status === 400 && h.via));
  const fixes = [];
  if (missing) fixes.push('add the file under public/ at the path the page asks for (scripts/build-thumbs.mjs cuts the thumbnails) or point the row at a file that exists');
  else if (http.length) fixes.push('read the response; a 5xx is the server, a 4xx the request the page made');
  if (other.length) fixes.push('read the message; add it to CONSOLE_ALLOW in hooks.mjs only when the environment produces it; a message a page produces stays a defect');
  return { file: refs.slice(0, 3).join('; ') || pageFolder(item), fix: fixes.join('; ') };
}

/**
 * Where a failed check points and what would fix it, from the check's
 * name, its detail (the element descriptions the probe returned, or the
 * console errors) and the page it was read on. The file column reads
 * `file:line (what found it)`; the page's source folder stands in when
 * no line matches.
 */
export function where(key, detail, item) {
  const first = Array.isArray(detail) ? detail[0] : detail;
  const shell = ['src/components/viewer'];
  switch (key) {
    case 'toolbarBar':
      return {
        file: `${classRef('pt-toolbar', item)} and ${locateClass('pt-main', shell, ROOT)} (.pt-main grid-template-rows)`,
        fix: 'keep the bar at var(--pt-bar-h) as the first grid row; nothing above it',
      };
    case 'stageRows':
      return {
        file: `${locateClass('pt-main', shell, ROOT)} (.pt-main) and ${classRef('pt-stagewrap', item)}`,
        fix: 'the stage is the second row between the toolbar and the 2px progress line; remove whatever row or margin moved it',
      };
    case 'sidebarColumn':
      return {
        file: `${classRef('pt-sb', item)} and ${textRef('--pt-sb-w', shell, 'src/components/viewer/ViewerShell.css')} (the 900px cut, --pt-sb-w, .is-overlay)`,
        fix: 'above 900 the open list is the first column at 208 or 256px; at or below 900 it shows only as the overlay',
      };
    case 'deckSheet':
      return {
        file: `${textRef('function fit', ['deck/parts'], 'deck/parts/tail.html')} (fit) and ${locateClass('sheet', ['deck/parts'], ROOT) || 'deck/parts/head.html'} (.sheet)`,
        fix: 'fit the 1600x900 sheet to the smaller of the stage box ratios so it stays inside the frame at 16:9',
      };
    case 'docsToc':
      return { file: `${classRef('pt-book-toc', item)} and its 900px rule`, fix: 'four columns above 900, two at or below; keep the grid inside the sheet' };
    case 'galleryCells':
      return { file: `${classRef('aw-collage', item)} and ${classRef('aw-cell', item)}`, fix: 'let the collage wrap or shrink its tiles inside the rail at this width' };
    case 'tapTargets':
      return { file: placeElement(detail, item), fix: tapFix(first) };
    case 'noPastEdge':
      return { file: placeElement(detail, item), fix: 'constrain the element to the viewport at this width (max-width 100%, a wrap, or a narrower cut)' };
    case 'noClippedText':
      return { file: placeElement(detail, item), fix: 'let the text wrap, scroll (overflow-x auto) or truncate with an ellipsis instead of clipping mid-word' };
    case 'noOverflow':
      return { file: placeElement(detail, item), fix: 'find the box past the edge (noPastEdge names it) and keep it inside the viewport' };
    case 'noLayoutShift': {
      const source = detail?.shifts?.[0]?.sources?.[0];
      return {
        file: source ? placeElement({ el: source, text: '' }, item) : pageFolder(item),
        fix: 'reserve the box before first paint (a fixed height, aspect-ratio or min-height) so nothing moves once it renders',
      };
    }
    case 'themeApplied':
      return {
        file: `${textRef("'gt-theme'", ['src/app/*'], 'src/app/layout.tsx')} (the boot script) and ${textRef('gt-theme', shell, 'src/components/viewer/ThemeButton.tsx')}`,
        fix: 'the gt-theme key must stamp html[data-theme] before first paint',
      };
    case 'noConsoleErrors':
      return consoleWhere(detail, item);
    default:
      return { file: pageFolder(item), fix: '' };
  }
}
