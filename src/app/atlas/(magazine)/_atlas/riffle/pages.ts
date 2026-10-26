/* A story's magazine for the turner (riffle/flip.ts), set on a Swiss grid:
   the cover on the story's own stock with its name up the right
   edge; under it the story's map sheet, the page the rack's lifted corner
   shows, faced on a spread by the cover's pale inside; an opening spread of the story's own picture across the gutter,
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
import { HOME_SHEET, magazineName, SHEETS } from '../stories';
import type { Laid } from './paginate';
import { darkStock, issueMonth, longDate, pad, paleOf } from './print';
import { escapeHtml } from './html';

/** The grain over every page (Riffle's sheet.css prints it from --grain). */
const GRAIN = '<i class="grain" aria-hidden="true"></i>';

/** A page on the stock the story's pages print on: white uncoated paper, with the scan's folds. */
const paper = (html: () => string): PageSpec => ({
  html: () => html() + GRAIN,
  cls: 'gtr-paper',
  finish: 'matte',
  mottle: true,
});
/** A page on the story's own stock, its cover's color. */
const stock = (html: () => string, board: string): PageSpec => ({
  html: () => html() + GRAIN,
  cls: `gtr-stock${darkStock(board) ? ' gtr-dark' : ''}`,
  finish: 'matte',
  mottle: true,
});

/** A title long enough to set a size down. */
const LONG_TITLE = 44;

/** The colors a story's pages print in, as style properties. */
function inks(story: StoryCard) {
  const spec = COVERS[story.slug] ?? FALLBACK_COVER;
  const board = spec.colors[0] ?? spec.paper;
  return {
    board,
    vars: `--board:${board};--ink:${spec.paper};--accent:${spec.accent ?? spec.colors[1] ?? spec.paper}`,
  };
}

/**
 * The magazine's own words in the page's locale. The pages are HTML strings,
 * so riffle/MagazineView.tsx makes these with gt-next (useGT, useMessages)
 * and hands them in; they are escaped here like the story's text.
 */
export type Words = {
  locale: string;
  /** 'By Kevin Liu and Taylor Fang' */
  by: (names: string) => string;
  /** '8 minutes' */
  minutes: (n: number) => string;
  /** 'Atlas No. 05' */
  issue: (n: string) => string;
  /** How the issue was set and who published it, the colophon's middle line. */
  setIn: string;
  /** 'Filed from San Francisco, 37°46′ N 122°25′ W' */
  filedFrom: (coordinates: string) => string;
  /** A message from stories.ts (a map's note) in the locale. */
  message: (message: string) => string;
};

/** The story's authors as one name, joined as the locale joins a list ('Kevin Liu and Taylor Fang'). */
const authorsOf = (story: StoryCard, locale: string) =>
  new Intl.ListFormat(locale, { type: 'conjunction' }).format(story.authors);

/** The opening's head in its two parts: the headline, and the deck, the issue and the byline. */
function headParts(story: StoryCard, words: Words): [string, string] {
  const by = authorsOf(story, words.locale);
  // the byline on one rule, as the story's web page sets it: who, then when and how long
  const line = [
    by ? `<b>${escapeHtml(words.by(by))}</b>` : '',
    ...[longDate(story.date, words.locale), words.minutes(story.minutes)]
      .filter(Boolean)
      .map((part) => `<span>${escapeHtml(part)}</span>`),
  ].join('');
  return [
    `<h2 class="gtr-h"${story.title.length > LONG_TITLE ? ' data-long' : ''}>${escapeHtml(story.title)}</h2>`,
    // the deck and the byline in one box as wide as the wider of them, so the byline's rule runs as far as the text
    `<div class="gtr-stand">${story.summary ? `<p class="gtr-dek">${escapeHtml(story.summary)}</p>` : ''}<p class="gtr-byline">${line}</p></div>`,
  ];
}

/**
 * The back cover's legend, as a map's: a box holding an inset map of the
 * story's place (its sheet, ui/MapSheet.tsx, in the magazine's own colours,
 * with its places and road) beside the issue, the byline, the
 * date and reading time, and what the map shows.
 */
function legend(story: StoryCard, words: Words): string {
  const sheet = SHEETS[story.slug] ?? HOME_SHEET;
  const [w, h] = [160, 104];
  const { at, land } = project(sheet, 0, 0, w, h, 5);
  const spots = sheet.places.map((place) => ({
    place,
    xy: at(place.lat, place.lon),
  }));
  const route = sheet.route
    ? `<polyline class="gtr-inset-route" points="${spots.map(({ xy: [x, y] }) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')}"/>`
    : '';
  const dots = spots
    .map(
      ({ place, xy: [x, y] }) =>
        `<circle class="${place.home ? 'gtr-inset-home' : 'gtr-inset-city'}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${place.home ? 3 : 2}"/>`
    )
    .join('');
  const map = `<svg class="gtr-inset" viewBox="0 0 ${w} ${h}" aria-hidden="true"><rect class="gtr-inset-sea" width="${w}" height="${h}"/><path class="gtr-inset-land" d="${land}"/>${route}${dots}</svg>`;
  const by = escapeHtml(authorsOf(story, words.locale));
  const date = longDate(story.date, words.locale);
  // the story's own place and road in its accent, or in its cover's ink where it has none, so they stand clear of the sea
  const spec = COVERS[story.slug] ?? FALLBACK_COVER;
  return `<div class="gtr-legend" style="--accent:${spec.accent ?? spec.paper}">${map}<div><p class="gtr-legend-h">${escapeHtml(words.issue(pad(story.n)))}</p><p class="gtr-legend-by">${by}</p><p>${escapeHtml([date, words.minutes(story.minutes)].filter(Boolean).join(', '))}</p><p>${escapeHtml(words.message(sheet.note))}</p></div></div>`;
}

/** The opening's head, across the top of the article's first page where the story opens on no spread of its own. */
export function openingHead(story: StoryCard, words: Words): string {
  return `<div class="gtr-head">${headParts(story, words).join('')}</div>`;
}

/**
 * The opening spread's picture: the story's own picture across the gutter,
 * edge to edge where it is wide enough to fill the spread's top two thirds
 * at little crop, else at its own shape centred on the spine from the
 * grid's head. Sizes are in the page's own units: `width` in cqw of one
 * page, `height` and `top` in cqh.
 */
export type Opener = {
  src: string;
  width: number;
  height: number;
  top: number;
};

/** The most of its height the opening picture may lose to run the spread edge to edge; a picture with lettering near its edges (a screenshot) loses none of it at this. */
const MAX_OPEN_CROP = 0.1;

export function openerOf(
  src: string,
  ratio: number,
  width: number,
  height: number
): Opener {
  const tall = 0.66 * height;
  const full = (2 * width) / ratio;
  if (full <= tall)
    return { src, width: 200, height: (full / height) * 100, top: 0 };
  // too tall to run the spread's whole width at its shape: to the edges if that crops little of it, else at its own shape
  // from the grid's head
  const box = (2 * width) / tall;
  if (1 - ratio / box <= MAX_OPEN_CROP)
    return { src, width: 200, height: (tall / height) * 100, top: 0 };
  const top = 0.095 * height;
  const h = tall - top;
  return {
    src,
    width: ((h * ratio) / width) * 100,
    height: (h / height) * 100,
    top: (top / height) * 100,
  };
}

/**
 * The story's pages. `article` is each article page's text block from
 * paginate(); `art` is the cover's design drawn flat in its inks (a blob URL),
 * printed where the rack's live cover draws it; `spread` is whether two pages
 * show at once, which is when the back cover's place needs keeping; `cover`
 * is the opening spread's picture (openerOf), where two pages show; `map` is
 * the story's map sheet as the rack draws it (ui/MapSheet.tsx), as markup;
 * `words` is the magazine's own words in the page's locale.
 */
export function issuePages(
  story: StoryCard,
  art: string | null,
  article: Laid[],
  spread: boolean,
  cover: Opener | null,
  map: string,
  words: Words
): PageSpec[] {
  const { board, vars } = inks(story);
  const spec = COVERS[story.slug] ?? FALLBACK_COVER;
  // past the cover, the page under it that the rack's lifted corner shows: the map sheet in the rack's colors, its folds
  // printed over it as on the rack; on a spread the cover's inside faces it, pale paper tinted with the cover's color, as
  // the rack's lifted corner shows the back of the cover
  const sheet: PageSpec = {
    html: () =>
      `<div class="gtr gtr-sheet" style="${vars};--accent:${spec.accent ?? spec.paper};--map-sea:${board};--map-ink:${spec.paper}">${map}</div>${GRAIN}`,
    cls: 'gtr-paper gtr-sheet-page',
    finish: 'matte',
    mottle: true,
  };
  const inside: PageSpec = {
    html: () => GRAIN,
    cls: 'gtr-paper',
    paper: paleOf(board),
    finish: 'matte',
    mottle: true,
  };
  const front = spread ? [inside, sheet] : [sheet];
  const name = escapeHtml(magazineName(story.slug, story.title));
  const month = escapeHtml(issueMonth(story.date, words.locale));
  // the opening spread: the story's own picture across the gutter, the headline under it on the left page and the
  // deck, the issue and the byline on the right
  const [headline, rest] = headParts(story, words);
  const open = (pic: Opener, side: string, inner: string) =>
    paper(
      () =>
        `<div class="gtr gtr-opener${side}" style="${vars};--pw:${pic.width.toFixed(2)}cqw;--ph:${pic.height.toFixed(2)}cqh;--pt:${pic.top.toFixed(2)}cqh"><div class="gtr-spread"><img src="${escapeHtml(pic.src)}" alt="" decoding="async"></div><div class="gtr-opener-in gtr-head">${inner}</div></div>`
    );
  const opening = cover
    ? [open(cover, ' l', headline), open(cover, '', rest)]
    : [];
  const laid: Laid[] = article;
  // the cover is page 1, a right page, so every page after it at an even number is a left one; the running head sits at
  // a page's top outer corner and the folio line at its foot's, and the margin at the spine is the wider
  const body = laid.map((page, i) => {
    const n = i + 2 + front.length + opening.length;
    const left = n % 2 === 0;
    const side = left ? ' l' : '';
    const run = `<p class="gtr-run">${name}</p>`;
    const folio = `<p class="gtr-folio${left ? '' : ' rt'}"><b>${pad(n)}</b><span>Atlas</span><span>${month}</span></p>`;
    if (page.kind === 'plate' && page.place === 'bleed')
      return paper(
        () =>
          `<div class="gtr gtr-plate gtr-bleed${side}" style="${vars}">${page.html}${folio}</div>`
      );
    if (page.kind === 'plate')
      return paper(
        () =>
          `<div class="gtr gtr-in gtr-plate gtr-gallery${side}"${page.at ? ` data-at="${page.at}"` : ''} style="${vars}">${run}${page.html}${folio}</div>`
      );
    // a page that carries the head runs no head over it
    return paper(
      () =>
        `<div class="gtr gtr-in gtr-flow${side}" style="${vars}">${page.headed ? '' : run}${page.html}${folio}</div>`
    );
  });
  // on a spread the back cover must fall on the back of the last leaf, so an odd count of pages comes before it; the page
  // that keeps its place is the issue's colophon: the imprint, the issue, how it was set and where it was filed from
  const colophon = paper(
    () => `<div class="gtr gtr-in gtr-colophon${(front.length + opening.length + body.length) % 2 ? '' : ' l'}" style="${vars}">
      <div class="gtr-colo">${atlasMark('var(--paper)')}<p><b>${escapeHtml(words.issue(pad(story.n)))}</b>, ${month}</p><p>${escapeHtml(words.setIn)}</p><p>${escapeHtml(words.filedFrom(`${dms(story.dateline.lat, 'lat')} ${dms(story.dateline.lon, 'lon')}`))}</p></div>
    </div>`
  );
  const blank =
    spread && (front.length + opening.length + body.length) % 2
      ? [colophon]
      : [];
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
    ...front,
    ...opening,
    ...body,
    ...blank,
    // the back cover: the imprint and the name, and the issue's legend in a box as a map's
    stock(
      () => `<div class="gtr gtr-back" style="${vars}">
        <div class="mk">${atlasMark(board)}<p><b>Atlas</b></p></div>
        ${legend(story, words)}
      </div>`,
      board
    ),
  ];
}
