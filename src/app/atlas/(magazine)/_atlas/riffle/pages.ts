/* A story's magazine for the turner (riffle/flip.ts), after Taylor Fang's
   Riffle issue (PR 1, directions/_directions/editorial.ts) and set on a
   Swiss grid: the cover on the story's own stock with its name up the right
   edge; an opening spread of the story's own picture across the gutter,
   the headline under it on the left page and the deck, issue and byline on
   the right (one page at a time, the head over the first columns); the
   whole article (riffle/article.ts) set by riffle/paginate.ts in two
   columns, with its pictures to the edges, on pages of their own, in bands
   and in columns; every page under a running head and over a folio line at
   its outer corners; then the back cover, its legend in a box as a map's
   with an inset map of the story's place, which is the back of the last
   leaf, so a blank page comes before it when the article ends on a left
   page. Every line is in the Katagami faces: the text in Katagami Text, the
   headline and the heads in Katagami Serif. The pages are HTML strings, so
   every piece of the story's text is escaped. */

import { atlasMark } from '../../directions/_directions/furniture';
import type { PageSpec } from '../../directions/_directions/sheet';
import type { StoryCard } from '../content';
import { dms } from '../coords';
import { COVERS, FALLBACK_COVER } from '../gpu/covers';
import { project } from '../geo/sheet';
import { HOME_SHEET, SHEETS, SHORT_TITLES } from '../stories';
import type { Laid } from './paginate';
import { darkStock, issueMonth, longDate, pad } from './print';

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (text: string) => text.replace(/[&<>"']/g, (c) => ESCAPES[c] ?? c);

/** The grain over every page (Riffle's sheet.css prints it from --grain). */
const GRAIN = '<i class="grain" aria-hidden="true"></i>';

/** A page on the stock the story's pages print on: white uncoated paper, with the scan's folds. */
const paper = (html: () => string): PageSpec => ({ html: () => html() + GRAIN, cls: 'gtr-paper', finish: 'matte', mottle: true });
/** A page on the story's own stock, its cover's color. */
const stock = (html: () => string, board: string): PageSpec => ({ html: () => html() + GRAIN, cls: `gtr-stock${darkStock(board) ? ' gtr-dark' : ''}`, finish: 'matte', mottle: true });

/** A title long enough to set a size down. */
const LONG_TITLE = 44;

/** The colors a story's pages print in, as style properties. */
function inks(story: StoryCard) {
  const spec = COVERS[story.slug] ?? FALLBACK_COVER;
  const board = spec.colors[0] ?? spec.paper;
  return { board, vars: `--board:${board};--ink:${spec.paper};--accent:${spec.accent ?? spec.colors[1] ?? spec.paper}` };
}

/** The opening's head in its two parts: the headline, and the deck, the issue and the byline. */
function headParts(story: StoryCard): [string, string] {
  const by = story.authors.map(esc).join(' and ');
  const date = longDate(story.date);
  const meta = [`Atlas No. ${pad(story.n)}`, date, `${story.minutes} minutes`].filter(Boolean).map((line) => `<span>${esc(line)}</span>`).join('');
  return [`<h2 class="gtr-h"${story.title.length > LONG_TITLE ? ' data-long' : ''}>${esc(story.title)}</h2>`, `${story.summary ? `<p class="gtr-dek">${esc(story.summary)}</p>` : ''}<p class="gtr-meta">${meta}</p><p class="gtr-by">${by}</p>`];
}

/**
 * The back cover's legend, as a map's: a box holding an inset map of the
 * story's place (its sheet, ui/MapSheet.tsx, in the magazine's own colours,
 * with its places and road) beside the issue and its sheet, the byline, the
 * date and reading time, and what the map shows.
 */
function legend(story: StoryCard): string {
  const sheet = SHEETS[story.slug] ?? HOME_SHEET;
  const [w, h] = [160, 104];
  const { at, land } = project(sheet, 0, 0, w, h, 5);
  const spots = sheet.places.map((place) => ({ place, xy: at(place.lat, place.lon) }));
  const route = sheet.route ? `<polyline class="gtr-inset-route" points="${spots.map(({ xy: [x, y] }) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')}"/>` : '';
  const dots = spots.map(({ place, xy: [x, y] }) => `<circle class="${place.home ? 'gtr-inset-home' : 'gtr-inset-city'}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${place.home ? 3 : 2}"/>`).join('');
  const map = `<svg class="gtr-inset" viewBox="0 0 ${w} ${h}" aria-hidden="true"><rect class="gtr-inset-sea" width="${w}" height="${h}"/><path class="gtr-inset-land" d="${land}"/>${route}${dots}</svg>`;
  const by = story.authors.map(esc).join(' and ');
  const date = longDate(story.date);
  // the story's own place and road in its accent, or in its cover's ink where it has none, so they stand clear of the sea
  const spec = COVERS[story.slug] ?? FALLBACK_COVER;
  return `<div class="gtr-legend" style="--accent:${spec.accent ?? spec.paper}">${map}<div><p class="gtr-legend-h">Atlas No. ${pad(story.n)}, sheet ${pad(story.n)}</p><p class="gtr-legend-by">${by}</p><p>${esc([date, `${story.minutes} minutes`].filter(Boolean).join(', '))}</p><p>${esc(sheet.note)}</p></div></div>`;
}

/** The opening's head, across the top of the article's first page where the story opens on no spread of its own. */
export function openingHead(story: StoryCard): string {
  return `<div class="gtr-head">${headParts(story).join('')}</div>`;
}

/**
 * The opening spread's picture: the story's own picture across the gutter,
 * edge to edge where it is wide enough to fill the spread's top two thirds
 * at little crop, else at its own shape centred on the spine from the
 * grid's head. Sizes are in the page's own units: `width` in cqw of one
 * page, `height` and `top` in cqh.
 */
export type Opener = { src: string; width: number; height: number; top: number };

/** The most of its height the opening picture may lose to run the spread edge to edge; a picture with lettering near its edges (a screenshot) loses none of it at this. */
const MAX_OPEN_CROP = 0.1;

export function openerOf(src: string, ratio: number, width: number, height: number): Opener {
  const tall = 0.66 * height;
  const full = (2 * width) / ratio;
  if (full <= tall) return { src, width: 200, height: (full / height) * 100, top: 0 };
  // too tall to run the spread's whole width at its shape: to the edges if that crops little of it, else at its own shape
  // from the grid's head
  const box = (2 * width) / tall;
  if (1 - ratio / box <= MAX_OPEN_CROP) return { src, width: 200, height: (tall / height) * 100, top: 0 };
  const top = 0.095 * height;
  const h = tall - top;
  return { src, width: ((h * ratio) / width) * 100, height: (h / height) * 100, top: (top / height) * 100 };
}

/**
 * The story's pages. `article` is each article page's text block from
 * paginate(); `art` is the cover's design drawn flat in its inks (a blob URL),
 * printed where the rack's live cover draws it; `spread` is whether two pages
 * show at once, which is when the back cover's place needs keeping; `cover`
 * is the opening spread's picture (openerOf), where two pages show.
 */
export function issuePages(story: StoryCard, art: string | null, article: Laid[], spread: boolean, cover: Opener | null): PageSpec[] {
  const { board, vars } = inks(story);
  const name = esc(SHORT_TITLES[story.slug] ?? story.title.split(/\s*:\s*/)[0] ?? story.title);
  const month = esc(issueMonth(story.date));
  // the opening spread: the story's own picture across the gutter, the headline under it on the left page and the
  // deck, the issue and the byline on the right
  // the headline under the picture on the left page, and the deck, the issue and the byline on the right
  const [headline, rest] = headParts(story);
  const open = (side: string, inner: string) =>
    paper(() => `<div class="gtr gtr-opener${side}" style="${vars};--pw:${cover!.width.toFixed(2)}cqw;--ph:${cover!.height.toFixed(2)}cqh;--pt:${cover!.top.toFixed(2)}cqh"><div class="gtr-spread"><img src="${cover!.src}" alt="" decoding="async"></div><div class="gtr-opener-in gtr-head">${inner}</div></div>`);
  const opening = cover ? [open(' l', headline), open('', rest)] : [];
  const laid: Laid[] = article;
  // the cover is page 1, a right page, so every page after it at an even number is a left one; the running head sits at
  // a page's top outer corner and the folio line at its foot's, and the margin at the spine is the wider
  const body = laid.map((page, i) => {
    const n = i + 2 + opening.length;
    const left = n % 2 === 0;
    const side = left ? ' l' : '';
    const run = `<p class="gtr-run">${name}</p>`;
    const folio = `<p class="gtr-folio${left ? '' : ' rt'}"><b>${pad(n)}</b><span>Atlas</span><span>${month}</span></p>`;
    if (page.kind === 'plate' && page.place === 'bleed') return paper(() => `<div class="gtr gtr-plate gtr-bleed${side}" style="${vars}">${page.html}${folio}</div>`);
    if (page.kind === 'plate') return paper(() => `<div class="gtr gtr-in gtr-plate gtr-gallery${side}"${page.at ? ` data-at="${page.at}"` : ''} style="${vars}">${run}${page.html}${folio}</div>`);
    // a page that carries the head runs no head over it
    const headed = page.html.includes('class="gtr-head"');
    return paper(() => `<div class="gtr gtr-in gtr-flow${side}" style="${vars}">${headed ? '' : run}${page.html}${folio}</div>`);
  });
  // on a spread the back cover must fall on the back of the last leaf, so an odd count of pages comes before it; the page
  // that keeps its place is the issue's colophon: the imprint, the issue, how it was set and where it was filed from
  const colophon = paper(
    () => `<div class="gtr gtr-in gtr-colophon${(opening.length + body.length) % 2 ? '' : ' l'}" style="${vars}">
      <div class="gtr-colo">${atlasMark('var(--paper)')}<p><b>GT Atlas</b> No. ${pad(story.n)}, ${month}</p><p>Set in Katagami Text and Katagami Serif. Compiled and published on the web by General Translation.</p><p>Filed from San Francisco, ${esc(dms(story.dateline.lat, 'lat'))} ${esc(dms(story.dateline.lon, 'lon'))}</p></div>
    </div>`
  );
  const blank = spread && (opening.length + body.length) % 2 ? [colophon] : [];
  return [
    // the cover: the story's design on its stock as the rack prints it, its name up the right edge, the issue at the foot
    stock(
      () => `<div class="gtr gtr-cover" style="${vars}">
        ${art ? `<img class="gtr-cover-art" alt="" src="${art}">` : ''}
        <p class="gtr-cred">${name}</p>
        <p class="gtr-folio"><b>${pad(story.n)}</b><span>${month}</span></p>
      </div>`,
      board
    ),
    ...opening,
    ...body,
    ...blank,
    // the back cover: the imprint and the name, and the issue's legend in a box as a map's
    stock(
      () => `<div class="gtr gtr-back" style="${vars}">
        <div class="mk">${atlasMark(board)}<p><b>Atlas</b></p></div>
        ${legend(story)}
      </div>`,
      board
    ),
  ];
}
