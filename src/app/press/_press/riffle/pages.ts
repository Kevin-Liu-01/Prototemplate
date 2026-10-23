/* A story's magazine in the format of Taylor Fang's Riffle issue (PR 1,
   directions/_directions/editorial.ts), with the picture beside the text as
   her Euclid book sets it (PR 2), for the Sheet that turns the pages. Eight
   pages, so the back cover is the back of the last leaf:

   the cover on the story's own stock, its credit up the right edge;
   a picture across the page, its caption up the outer edge, then the
   feature's opening: headline, deck, byline and the text in two columns
   with a drop cap;
   the text continued in two columns with a pull quote across them, then
   the title in each of the press's languages, each with its city and its
   language's name at the side;
   a second picture with its caption and the story's other pull quote,
   then its sections, each a link into the web page, and the way to read it;
   the back cover.

   Every line is Katagami Text, the pull quotes and the titles excepted, set
   larger than Riffle's so they read. The pages are HTML strings, so every
   piece of the story's text is escaped. */

import { atlasMark } from '../../directions/_directions/furniture';
import type { PageSpec } from '../../directions/_directions/sheet';
import type { MagazineIssue, StoryCard } from '../content';
import { dms } from '../coords';
import { COVERS, FALLBACK_COVER } from '../gpu/covers';
import { LANGS, PULLS, SHORT_TITLES } from '../stories';
import { darkStock, folioOf, issueMonth, longDate, pad } from './print';

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (text: string) => text.replace(/[&<>"']/g, (c) => ESCAPES[c] ?? c);

/** The grain over every page (Riffle's sheet.css prints it from --grain). */
const GRAIN = '<i class="grain" aria-hidden="true"></i>';

/** A page on the stock the story's pages print on: white uncoated paper, with the scan's folds and dust. */
const paper = (html: () => string): PageSpec => ({ html: () => html() + GRAIN, cls: 'gtr-paper', finish: 'matte', mottle: true });
/** A page on the story's own stock, its cover's color. */
const stock = (html: () => string, board: string): PageSpec => ({ html: () => html() + GRAIN, cls: `gtr-stock${darkStock(board) ? ' gtr-dark' : ''}`, finish: 'matte', mottle: true });

/** The folio at the foot's outer corner: left on a left page, right on a right one. */
const folio = (n: number, right: boolean) => `<p class="gtr-folio${right ? ' rt' : ''}"><b>${pad(n)}</b><span>Atlas</span></p>`;

/** A title long enough to set a size down. */
const LONG_TITLE = 44;

/**
 * The story's pages. `href` is its web page, which the sections and the
 * back link to; `art` is the cover's design drawn flat in its inks (a blob
 * URL), printed where the rack's live cover draws it.
 */
export function issuePages(story: StoryCard, issue: MagazineIssue, href: string, art: string | null): PageSpec[] {
  const spec = COVERS[story.slug] ?? FALLBACK_COVER;
  const board = spec.colors[0] ?? spec.paper;
  const accent = spec.accent ?? spec.colors[1] ?? spec.paper;
  const vars = `--board:${board};--ink:${spec.paper};--accent:${accent}`;
  const name = esc(SHORT_TITLES[story.slug] ?? story.title.split(/\s*:\s*/)[0] ?? story.title);
  const by = story.authors.map(esc).join(' and ');
  const date = esc(longDate(story.date));
  const month = esc(issueMonth(story.date));
  const paras = issue.paras.map((p) => `<p>${esc(p)}</p>`);
  const pulls = (PULLS[story.slug] ?? []).map((p) => ({ text: esc(p.text).replace(/\*/g, ''), by: p.by ? esc(p.by) : '' }));
  const first = issue.pictures[0] ?? { src: story.cover, alt: '' };
  // a second picture only when the story has another one; the same picture twice reads as a mistake
  const second = issue.pictures.find((p) => p.src !== first.src && p.alt !== first.alt);
  const img = (p: { src: string; alt: string }) => `<img alt="${esc(p.alt)}" src="${esc(p.src)}" loading="eager" decoding="async">`;
  const quote = (q: { text: string; by: string } | undefined) =>
    q ? `<blockquote class="gtr-pull"><p>${q.text}</p>${q.by ? `<cite>${q.by}</cite>` : ''}</blockquote>` : '';

  return [
    // the cover, a right page: the story's design on its stock as the rack prints it, its credit up the right edge in
    // two sizes (who wrote it and when, then its name), the folio at the foot
    stock(
      () => `<div class="gtr gtr-cover" style="${vars}">
        ${art ? `<img class="gtr-cover-art" alt="" src="${art}">` : `<figure class="gtr-photo gtr-cover-photo">${img(first)}<i></i></figure>`}
        <div class="gtr-cred"><p class="sm">By <b>${by}</b> • ${date} • ${story.minutes} minute read</p><p class="lg">${name}</p></div>
        <p class="gtr-folio"><b>${pad(story.n)}</b><span>Atlas</span><span>${month}</span></p>
      </div>`,
      board
    ),
    // a left page: the first picture across it, its caption up the outer edge
    paper(
      () => `<div class="gtr gtr-plate" style="${vars}">
        <figure class="gtr-photo">${img(first)}<i></i></figure>
        ${first.alt ? `<p class="gtr-side">${esc(first.alt)}</p>` : ''}
        ${folio(folioOf(story.n, 1), false)}
      </div>`
    ),
    // a right page: the feature's opening, its text in two columns at the foot with a drop cap in the story's accent
    paper(
      () => `<div class="gtr gtr-in gtr-open" style="${vars}">
        <h2 class="gtr-h"${story.title.length > LONG_TITLE ? ' data-long' : ''}>${esc(story.title)}</h2>
        ${story.summary ? `<p class="gtr-dek">${esc(story.summary)}</p>` : ''}
        <p class="gtr-by">Words <b>${by}</b> • ${story.minutes} minute read</p>
        <div class="gtr-body gtr-lead">${paras.slice(0, 2).join('')}</div>
        ${folio(folioOf(story.n, 2), true)}
      </div>`
    ),
    // a left page: the text continued in two columns, the first pull quote across them
    paper(
      () => `<div class="gtr gtr-in l gtr-cont" style="${vars}">
        <div class="gtr-body">${paras.slice(2, 4).join('')}</div>
        ${quote(pulls[0])}
        <div class="gtr-body">${paras.slice(4, 6).join('')}</div>
        ${folio(folioOf(story.n, 3), false)}
      </div>`
    ),
    // a right page: the title in each of the press's languages, with the city it is set for and the language's name
    // at the side, as Riffle sets the first definition city by city
    paper(
      () => `<div class="gtr gtr-in gtr-langs" style="${vars}">
        <h3 class="gtr-h2">The title in ${LANGS.length} languages</h3>
        <ol class="gtr-defs">${LANGS.map(
          (l, i) =>
            `<li><span class="n">${i + 1}</span><q lang="${l.code}" dir="${l.dir}">${esc(story.titles[l.code] ?? story.title)}</q><small><b>${esc(l.city)}</b><span lang="${l.code}">${esc(l.name)}</span></small></li>`
        ).join('')}</ol>
        ${folio(folioOf(story.n, 4), true)}
      </div>`
    ),
    // a left page: the second picture with its caption under it, and the story's other pull quote; with no second
    // picture, the quote alone, set at the middle of the page
    paper(
      () => `<div class="gtr gtr-in l gtr-figure${second ? '' : ' gtr-alone'}" style="${vars}">
        ${second ? `<figure>${img(second)}${second.alt ? `<figcaption>${esc(second.alt)}</figcaption>` : ''}</figure>` : ''}
        ${quote(pulls[1] ?? pulls[0])}
        ${folio(folioOf(story.n, 5), false)}
      </div>`
    ),
    // a right page: the story's sections as Riffle sets Ricci's road, each a link into the web page, then the way to read it
    paper(
      () => `<div class="gtr gtr-in gtr-sections" style="${vars}">
        <h3 class="gtr-h2">${name}, in ${story.sections.length} parts</h3>
        <ol class="gtr-route">${story.sections.map((s, i) => `<li><a href="${esc(href)}#${esc(s.id)}" data-read="${esc(s.id)}"><b>${pad(i + 1)}</b><span>${esc(s.text)}</span></a></li>`).join('')}</ol>
        <div class="gtr-read"><a href="${esc(href)}" data-read="">Read the story →</a><p>${by}<br>${date}</p></div>
        ${folio(folioOf(story.n, 6), true)}
      </div>`
    ),
    // the back cover, the back of the last leaf, on the stock: the imprint and the name, the issue and where it was
    // filed from
    stock(
      () => `<div class="gtr gtr-back" style="${vars}">
        <div class="mk">${atlasMark(board)}<p><b>Atlas</b><span>General Translation</span></p></div>
        <p class="co">No. ${pad(story.n)} • ${month}<br>${esc(dms(story.dateline.lat, 'lat'))}<br>${esc(dms(story.dateline.lon, 'lon'))}</p>
      </div>`,
      board
    ),
  ];
}
