/* A story's magazine for the Sheet that turns its pages, in the form of
   Taylor Fang's Riffle issue (PR 1, directions/_directions/editorial.ts):
   the cover on the story's own stock with its name up the right edge, then
   the whole article (riffle/article.ts) set in two columns by
   riffle/paginate.ts, the opening's headline, deck and byline across the top
   of its first page and a drop cap in the story's accent, then the back
   cover, which is the back of the last leaf, so a blank page comes before it
   when the article ends on a left page. Every line is in the Katagami
   faces: the text in Katagami Text, the headline, the heads and the pull
   quotes in Katagami Serif. The pages are HTML strings, so every piece of
   the story's text is escaped. */

import { atlasMark } from '../../directions/_directions/furniture';
import type { PageSpec } from '../../directions/_directions/sheet';
import type { StoryCard } from '../content';
import { dms } from '../coords';
import { COVERS, FALLBACK_COVER } from '../gpu/covers';
import { SHORT_TITLES } from '../stories';
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

/** The opening's head, across the top of the article's first page: the headline, the deck and the byline. */
export function openingHead(story: StoryCard): string {
  const by = story.authors.map(esc).join(' and ');
  const date = longDate(story.date);
  return `<div class="gtr-head"><h2 class="gtr-h"${story.title.length > LONG_TITLE ? ' data-long' : ''}>${esc(story.title)}</h2>${story.summary ? `<p class="gtr-dek">${esc(story.summary)}</p>` : ''}<p class="gtr-by">By <b>${by}</b>${date ? ` • ${esc(date)}` : ''}</p></div>`;
}

/**
 * The story's pages. `article` is each article page's text block from
 * paginate(); `art` is the cover's design drawn flat in its inks (a blob URL),
 * printed where the rack's live cover draws it; `spread` is whether two pages
 * show at once, which is when the back cover's place needs keeping.
 */
export function issuePages(story: StoryCard, art: string | null, article: string[], spread: boolean): PageSpec[] {
  const { board, vars } = inks(story);
  const name = esc(SHORT_TITLES[story.slug] ?? story.title.split(/\s*:\s*/)[0] ?? story.title);
  const month = esc(issueMonth(story.date));
  // the cover is a right page, so the article's first page is a left one; a page's folio sits at its outer corner
  const body = article.map((inner, i) =>
    paper(() => `<div class="gtr gtr-in gtr-flow${i % 2 ? '' : ' l'}" style="${vars}">${inner}<p class="gtr-folio${i % 2 ? ' rt' : ''}"><b>${pad(i + 2)}</b></p></div>`)
  );
  // on a spread the back cover must fall on the back of the last leaf, so an odd count of pages comes before it
  const blank = spread && article.length % 2 ? [paper(() => `<div class="gtr" style="${vars}"></div>`)] : [];
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
    ...body,
    ...blank,
    // the back cover: the imprint and the name, the issue and where it was filed from
    stock(
      () => `<div class="gtr gtr-back" style="${vars}">
        <div class="mk">${atlasMark(board)}<p><b>Atlas</b></p></div>
        <p class="co">No. ${pad(story.n)} • ${month}<br>${esc(dms(story.dateline.lat, 'lat'))}<br>${esc(dms(story.dateline.lon, 'lon'))}</p>
      </div>`,
      board
    ),
  ];
}
