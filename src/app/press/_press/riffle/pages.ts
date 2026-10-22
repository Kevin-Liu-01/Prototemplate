/* A story's magazine as Riffle's pages (Taylor Fang's PR 1,
   directions/_directions/editorial.ts), for the Sheet that turns them: the
   cover on the story's own stock, a picture page, the feature's opening
   with its headline, deck, byline and the text in two columns, the text
   continued with a pull quote, a second picture with the story's other
   pull quote, its sections, and the back cover. Every line is Katagami
   Text, larger than Riffle's so it reads. The pages are HTML strings, so
   every piece of the story's text is escaped. */

import type { PageSpec } from '../../directions/_directions/sheet';
import type { MagazineIssue, StoryCard } from '../content';
import { dmsPair } from '../coords';
import { COVERS, FALLBACK_COVER } from '../gpu/covers';
import { PULLS, SHORT_TITLES } from '../stories';
import { darkStock, issueMonth, longDate, pad } from './print';

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (text: string) => text.replace(/[&<>"']/g, (c) => ESCAPES[c] ?? c);

/** The grain over every page (Riffle's sheet.css prints it from --grain). */
const GRAIN = '<i class="grain" aria-hidden="true"></i>';

/** A page on the stock the story's pages print on: white uncoated paper, with the scan's folds and dust. */
const paper = (html: () => string): PageSpec => ({ html: () => html() + GRAIN, cls: 'gtr-paper', finish: 'matte', mottle: true });
/** A page on the story's own stock, its cover's color. */
const stock = (html: () => string, board: string): PageSpec => ({ html: () => html() + GRAIN, cls: `gtr-stock${darkStock(board) ? ' gtr-dark' : ''}`, finish: 'matte', mottle: true });

const folio = (n: number, right = false) => `<p class="gtr-folio${right ? ' rt' : ''}"><b>${pad(n)}</b><span>Atlas</span></p>`;

/**
 * The story's pages. `href` is its web page, which the sections and the
 * back link to; `art` is the cover's design drawn flat in its inks (a data
 * URL), printed where the rack's live cover draws it.
 */
export function issuePages(story: StoryCard, issue: MagazineIssue, href: string, art: string | null): PageSpec[] {
  const spec = COVERS[story.slug] ?? FALLBACK_COVER;
  const board = spec.colors[0] ?? '#121212';
  const accent = spec.accent ?? spec.colors[1] ?? '#121212';
  const vars = `--board:${board};--ink:${spec.paper};--accent:${accent}`;
  const name = SHORT_TITLES[story.slug] ?? story.title.split(/\s*:\s*/)[0] ?? story.title;
  const by = story.authors.map(esc).join(' and ');
  const date = longDate(story.date);
  const month = issueMonth(story.date);
  const paras = issue.paras.map(esc);
  const pulls = (PULLS[story.slug] ?? []).map((p) => ({ text: esc(p.text), by: p.by ? esc(p.by) : '' }));
  const first = issue.pictures[0] ?? { src: story.cover, alt: '' };
  const second = issue.pictures[1] ?? issue.pictures[0] ?? first;
  const picture = (p: { src: string; alt: string }) => `<img alt="${esc(p.alt)}" src="${esc(p.src)}" loading="eager" decoding="async">`;
  const quote = (q: { text: string; by: string } | undefined) =>
    q ? `<blockquote class="gtr-pull"><p>${q.text}</p>${q.by ? `<cite>${q.by}</cite>` : ''}</blockquote>` : '';
  const base = story.n * 6;

  return [
    // the cover: the story's design on its stock, as the rack prints it, its name up the right edge, the folio
    stock(
      () => `<div class="gtr gtr-cover" style="${vars}">
        ${art ? `<img class="gtr-cover-art" alt="" src="${art}">` : `<figure class="gtr-cover-photo">${picture({ src: story.cover, alt: '' })}</figure>`}
        <p class="gtr-cred">${esc(name)}</p>
        <p class="gtr-folio"><b>${pad(story.n)}</b><span>Atlas</span><span>${esc(month)}</span></p>
      </div>`,
      board
    ),
    // a picture across the page, its caption under it
    paper(
      () => `<div class="gtr gtr-picture" style="${vars}">
        <figure>${picture(first)}${first.alt ? `<figcaption>${esc(first.alt)}</figcaption>` : ''}</figure>
        ${folio(base + 2)}
      </div>`
    ),
    // the opening: headline, deck, byline, then the text in two columns with a drop cap
    paper(
      () => `<div class="gtr gtr-open" style="${vars}">
        <h2 class="gtr-h">${esc(story.title)}</h2>
        ${story.summary ? `<p class="gtr-dek">${esc(story.summary)}</p>` : ''}
        <p class="gtr-by">By <b>${by}</b>${date ? ` • ${esc(date)}` : ''} • ${story.minutes} minute read</p>
        <div class="gtr-body gtr-lead">${paras.slice(0, 2).map((p) => `<p>${p}</p>`).join('')}</div>
        ${folio(base + 3, true)}
      </div>`
    ),
    // the text continued, with the first pull quote across both columns
    paper(
      () => `<div class="gtr gtr-cont" style="${vars}">
        <div class="gtr-body">${paras.slice(2, 3).map((p) => `<p>${p}</p>`).join('')}</div>
        ${quote(pulls[0])}
        <div class="gtr-body">${paras.slice(3, 5).map((p) => `<p>${p}</p>`).join('')}</div>
        ${folio(base + 4)}
      </div>`
    ),
    // a second picture, and the story's other pull quote set large under it
    paper(
      () => `<div class="gtr gtr-quote" style="${vars}">
        <figure>${picture(second)}${second.alt ? `<figcaption>${esc(second.alt)}</figcaption>` : ''}</figure>
        ${quote(pulls[1] ?? pulls[0])}
        ${folio(base + 5, true)}
      </div>`
    ),
    // the story's sections, each a link into the web page, and the way to read it
    paper(
      () => `<div class="gtr gtr-sections" style="${vars}">
        <h3 class="gtr-h3">${esc(name)}, in ${story.sections.length} parts</h3>
        <ol>${story.sections.map((s, i) => `<li><a href="${esc(href)}#${esc(s.id)}" data-read="${esc(s.id)}"><span>${pad(i + 1)}</span>${esc(s.text)}</a></li>`).join('')}</ol>
        <p class="gtr-read"><a href="${esc(href)}" data-read="">Read the story</a></p>
        ${folio(base + 6)}
      </div>`
    ),
    // the back cover, on the stock: the name, the issue and where it was filed from, and the way to read it
    stock(
      () => `<div class="gtr gtr-back" style="${vars}">
        <p class="gtr-back-name">Atlas</p>
        <p class="gtr-back-issue">No. ${pad(story.n)}, ${esc(month)}<br>${esc(dmsPair(story.dateline))}</p>
        <p class="gtr-back-read"><a href="${esc(href)}" data-read="">Read the story</a></p>
      </div>`,
      board
    ),
  ];
}
