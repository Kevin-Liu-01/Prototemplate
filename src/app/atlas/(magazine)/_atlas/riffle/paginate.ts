/* Sets a story's article (riffle/article.ts) into magazine pages on a
   Swiss grid: two text columns a page (one on a phone's narrow page, as
   riffle.css sets it), the opening's head across the top of the first. Each
   picture takes one of five places by its shape (place): a page of its own
   printed to the edges over a band for its caption (bleed), a page of its
   own held inside the grid with white around it, with the pictures after it
   while they fit (gallery), a band across
   the top of the next text page (top), the whole of the next text page's
   second column (column), or a place in a column among the text (inset).
   The pictures that leave the text keep their order, and the text runs on
   past them. A paragraph or a list that runs past a column's foot is split
   there, at the most words or items that fit, and runs on at the top of the
   next column with a few words at least; a head goes on with what follows
   it; an inset picture that does not fit waits, in order, to open the next
   column while the text after it fills this one, so no column ends on a
   gap. Every page is measured in a hidden page of the magazine's own size
   and stylesheet, so what is measured is what shows. A picture holds its
   place by its shape, so nothing waits for it to load. */

import type { Piece } from './article';
import { escapeHtml } from './html';

/** The fewest words a column ends a paragraph on (about two lines) before it carries the whole paragraph on. */
const MIN_WORDS = 10;
/** The fewest words a paragraph carries on to the next column, so no column opens on a lone word. */
const MIN_REST = 8;
/** The room, in pixels, a column keeps at its foot, so a rounding between the measured page and the shown one never clips a line. */
const SLACK = 2;
/** The lines of text a head keeps with it at a column's foot. */
const KEEP_LINES = 3;
/** The share of a bleed page the picture covers; the band under it holds the caption and the folio (riffle.css). */
const BLEED = 0.84;
/** The most of a picture's height or width a bleed may crop, so a scanned page never loses its text. */
const MAX_CROP = 0.12;
/** How many pictures may wait for the text before a page of them goes out. */
const BACKLOG = 3;

/** Where a picture is set. */
export type Place = 'inset' | 'top' | 'column' | 'bleed' | 'gallery';

/** A page as it is set: text in columns, or pictures on a page of their own; a gallery page's pictures stand at its head or its foot. */
export type Laid =
  /** `headed`: the page opens on the story's head, so it runs no head over it. */
  | { kind: 'text'; html: string; headed: boolean }
  | {
      kind: 'plate';
      place: 'bleed' | 'gallery';
      html: string;
      at?: 'head' | 'foot';
    };

/** A piece part way through: a paragraph run on from the column before, a numbered list counting on; a picture with its place. */
type Part = Piece & { cont?: boolean; start?: number; place?: Place };

type Fig = Extract<Part, { kind: 'fig' }>;

/** A picture as the page prints it: the page-wide copy for a page or a band, the column-wide one for an inset. */
function figure(piece: Fig, big: boolean, cls = ''): string {
  const src = escapeHtml(big ? piece.wide : piece.src);
  const credit = piece.credit ? `<span class="cr">${piece.credit}</span>` : '';
  return `<figure${cls ? ` class="${cls}"` : ''}><img src="${src}" alt="${piece.alt}" style="aspect-ratio:${piece.ratio ?? '4 / 3'}" loading="lazy" decoding="async"><figcaption><span>${piece.caption}</span>${credit}</figcaption></figure>`;
}

function markup(piece: Part): string {
  switch (piece.kind) {
    case 'p': {
      // a paragraph run on keeps its part (a source stays small) but not the lead's drop cap
      const cls = [
        piece.cont && piece.cls === 'lead' ? '' : piece.cls,
        piece.cont ? 'cont' : '',
      ]
        .filter(Boolean)
        .join(' ');
      return `<p${cls ? ` class="${cls}"` : ''}>${piece.words.join(' ')}</p>`;
    }
    case 'h':
      return piece.minor ? `<h4>${piece.html}</h4>` : `<h3>${piece.html}</h3>`;
    case 'fig':
      return figure(piece, false);
    case 'cover':
      return '';
    case 'list': {
      const tag = piece.ordered ? 'ol' : 'ul';
      const start =
        piece.ordered && piece.start ? ` start="${piece.start}"` : '';
      const lang = piece.lang
        ? ` class="defs" lang="${piece.lang}" dir="${piece.dir ?? 'ltr'}"`
        : '';
      return `<${tag}${start}${lang}>${piece.items.map((item) => `<li>${item}</li>`).join('')}</${tag}>`;
    }
  }
}

/** How much of a picture of shape `r` a frame of shape `frame` crops, as a share of its width or height. */
const crop = (r: number, frame: number) => 1 - Math.min(r / frame, frame / r);

/**
 * Gives every picture its place, by its shape and in turn among the pictures
 * of that shape, so the pages vary: a picture near the bleed's own shape
 * goes to the edges, every other one taking the column instead; a wide one
 * takes the top band twice and then a gallery page; a tall or square one a
 * column, a gallery page or an inset in turn. On a phone's one-column page
 * a column picture sets as an inset.
 */
function placed(
  pieces: Piece[],
  width: number,
  height: number,
  narrow: boolean
): Part[] {
  const frame = width / (height * BLEED);
  const turn = { bleed: 0, wide: 0, tall: 0 };
  return pieces.map((piece): Part => {
    if (piece.kind !== 'fig') return piece;
    const r = piece.ratio ?? 4 / 3;
    let place: Place;
    if (crop(r, frame) <= MAX_CROP)
      place = turn.bleed++ % 2 ? 'column' : 'bleed';
    else if (r >= 1.25) place = turn.wide++ % 3 === 1 ? 'gallery' : 'top';
    else place = (['column', 'gallery', 'inset'] as const)[turn.tall++ % 3]!;
    if (narrow && place === 'column') place = 'inset';
    return { ...piece, place };
  });
}

/** The piece cut to its first `k` words or items, and what is left of it. */
function cut(piece: Part, k: number): [Part, Part | null] {
  if (piece.kind === 'p') {
    const rest = piece.words.slice(k);
    return [
      { ...piece, words: piece.words.slice(0, k) },
      rest.length ? { ...piece, words: rest, cont: true } : null,
    ];
  }
  if (piece.kind === 'list') {
    const rest = piece.items.slice(k);
    return [
      { ...piece, items: piece.items.slice(0, k) },
      rest.length
        ? { ...piece, items: rest, start: (piece.start ?? 1) + k }
        : null,
    ];
  }
  return [piece, null];
}

const units = (piece: Part) =>
  piece.kind === 'p'
    ? piece.words.length
    : piece.kind === 'list'
      ? piece.items.length
      : 0;

/** Whether a picture leaves the text for a page of its own, a band or a column. */
const leaves = (piece: Part) =>
  piece.kind === 'fig' && piece.place !== undefined && piece.place !== 'inset';

function element(html: string): HTMLElement {
  const holder = document.createElement('div');
  holder.innerHTML = html;
  return holder.firstElementChild as HTMLElement;
}

/**
 * Whether a head just set at the column's foot may stay: three lines of its
 * section's text must start here too. A picture between the head and its
 * text floats to the next column if it does not fit, so the text after it
 * is what counts; a head followed by nothing but pictures stays only if the
 * first of them fits whole.
 */
function keepsHead(
  col: HTMLElement,
  head: HTMLElement,
  after: Part[],
  over: () => boolean
): boolean {
  const text = after.find((part) => part.kind !== 'fig');
  if (!text || text.kind === 'h') {
    const first = after.find((part) => !leaves(part));
    if (!first || first.kind === 'h') return true;
    const follow = element(markup(first));
    col.append(follow);
    const fits = !over();
    follow.remove();
    return fits;
  }
  const line = parseFloat(getComputedStyle(col).lineHeight) || 16;
  return (
    col.clientHeight -
      (head.getBoundingClientRect().bottom - col.getBoundingClientRect().top) >=
    KEEP_LINES * line
  );
}

/** The most words or items of a piece that fit where `el` stands, found by halves; `el` is put back as it was. */
function most(el: HTMLElement, piece: Part, over: () => boolean): number {
  let lo = 0;
  let hi = units(piece);
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    const trial = element(markup(cut(piece, mid)[0]));
    el.replaceWith(trial);
    if (over()) hi = mid - 1;
    else lo = mid;
    trial.replaceWith(el);
  }
  return lo;
}

/** Fills one column from the queue, taking what fits and leaving the rest for the next; pictures that leave the text go to `away`, in order. */
function fill(col: HTMLElement, queue: Part[], away: Part[]) {
  // what the column holds runs to its last piece's foot, margin and all; a column never reports less than its own height, so it is measured this way
  const over = () => {
    const last = col.lastElementChild;
    if (!last) return false;
    const foot =
      last.getBoundingClientRect().bottom +
      parseFloat(getComputedStyle(last).marginBottom) -
      col.getBoundingClientRect().top;
    return foot > col.clientHeight - SLACK;
  };
  // inset pictures that do not fit wait, in their order, to open the next column, while the text after them fills this one
  const held: Part[] = [];
  const done = () => {
    queue.unshift(...held);
  };
  while (queue.length) {
    const piece = queue[0]!;
    if (leaves(piece)) {
      away.push(queue.shift()!);
      continue;
    }
    // a picture after a held one waits with it, so pictures keep their order; text and heads flow on beneath them
    if (held.length && piece.kind === 'fig') {
      held.push(queue.shift()!);
      continue;
    }
    const el = element(markup(piece));
    col.append(el);
    if (!over()) {
      if (
        piece.kind === 'h' &&
        col.children.length > 1 &&
        !keepsHead(col, el, queue.slice(1), over)
      ) {
        el.remove();
        return done();
      }
      queue.shift();
      continue;
    }
    const alone = col.children.length === 1;
    const n = units(piece);
    if (n) {
      const lo = most(el, piece, over);
      // a paragraph leaves a few words at least to open the next column, and a list never its last item alone
      const k =
        piece.kind === 'p' && n - lo > 0 && n - lo < MIN_REST
          ? n - MIN_REST
          : piece.kind === 'list' && n - lo === 1 && lo > 1
            ? lo - 1
            : lo;
      const least = piece.kind === 'p' ? Math.min(n, MIN_WORDS) : 1;
      if (k >= least || alone) {
        const [head, rest] = cut(piece, Math.max(k, 1));
        el.replaceWith(element(markup(head)));
        if (rest) queue[0] = rest;
        else queue.shift();
        return done();
      }
      el.remove();
      return done();
    }
    el.remove();
    if (alone && piece.kind === 'fig') {
      // a picture taller than a whole column (one shortened by a band) goes to a page of its own, and the text runs on
      away.push({ ...piece, place: 'gallery' });
      queue.shift();
      continue;
    }
    if (alone) {
      // anything else taller than a whole column (a head on a very short page) stands in it as it is, and the text runs on
      col.append(el);
      queue.shift();
      return done();
    }
    if (piece.kind === 'fig') {
      held.push(queue.shift()!);
      continue;
    }
    return done();
  }
  done();
}

/** A picture's page of its own, to the edges with its caption in the band under it. */
function bleed(piece: Fig): Laid {
  return { kind: 'plate', place: 'bleed', html: figure(piece, true) };
}

/** The pictures of a gallery page: one, or two side by side in its columns (riffle.css). */
const pics = (figs: string[], row = false) =>
  `<div class="gtr-pics" data-n="${figs.length}"${row ? ' data-row' : ''}>${figs.join('')}</div>`;

/** An upright picture, which a gallery page sets a column wide so it ends on the grid. */
const upright = (piece: Fig) => (piece.ratio ?? 4 / 3) < 0.95;

/**
 * A gallery page: the picture held inside the grid, with the next waiting
 * picture beside it, a column each, if both fit (any that leaves the text,
 * but not one meant for the edges), measured in the hidden page. A page of one picture stands at the grid's head or its
 * foot, in turn, so the white falls differently across the spreads.
 */
function gallery(
  page: HTMLElement,
  first: Fig,
  away: Part[],
  foot: boolean
): Laid {
  const next = away[0];
  if (next?.kind === 'fig' && next.place !== 'bleed') {
    // two pictures stand side by side, a column each, so each ends on the grid
    const pair = pics([figure(first, true), figure(next, true)], true);
    // measured at the pictures' own sizes, which the stylesheet would otherwise shrink to fit the page
    page.innerHTML = `<div class="gtr gtr-in gtr-plate gtr-gallery" style="--shrink:0">${pair}</div>`;
    const block = page.firstElementChild as HTMLElement;
    const end =
      block.getBoundingClientRect().bottom -
      parseFloat(getComputedStyle(block).paddingBottom);
    if (
      [...block.querySelectorAll('figure')].every(
        (f) => f.getBoundingClientRect().bottom <= end - SLACK
      )
    ) {
      away.shift();
      return { kind: 'plate', place: 'gallery', html: pair };
    }
  }
  return {
    kind: 'plate',
    place: 'gallery',
    html: pics([figure(first, true, upright(first) ? 'col' : '')]),
    at: foot ? 'foot' : 'head',
  };
}

/**
 * The article's pages: text pages, each its text block's markup (the head
 * on the first only, a band or a column picture opening the others), and
 * picture pages between them. `stage` is where the hidden page is measured,
 * inside the magazine view, so its stylesheet applies; `width` and `height`
 * are a page's.
 */
export function paginate(
  stage: HTMLElement,
  width: number,
  height: number,
  head: string,
  pieces: Piece[]
): Laid[] {
  const page = document.createElement('div');
  page.className = 'mag-page gtr-paper';
  // the measuring page is its own layout: setting a word in it never lays out the page around it
  page.style.cssText = `position:absolute;left:${-4 * width}px;top:0;width:${width}px;height:${height}px;visibility:hidden;pointer-events:none;contain:strict`;
  stage.append(page);
  const pages: Laid[] = [];
  try {
    // a phone's page shows one column (riffle.css), where a column picture cannot stand beside the text
    page.innerHTML =
      '<div class="gtr gtr-in gtr-flow"><div class="gtr-cols"><div class="gtr-col"></div><div class="gtr-col"></div></div></div>';
    const narrow =
      [...page.querySelectorAll<HTMLElement>('.gtr-col')].filter(
        (col) => getComputedStyle(col).display !== 'none'
      ).length < 2;
    const queue = placed(pieces, width, height, narrow);
    // the pictures that have left the text, in order, each waiting for its page, band or column
    const away: Part[] = [];
    let first = true;
    let galleries = 0;
    while (queue.length || away.length) {
      const next = away[0];
      // a page of pictures goes out as one is meant to, and once the text has run out
      if (
        next?.kind === 'fig' &&
        (next.place === 'bleed' || next.place === 'gallery' || !queue.length)
      ) {
        away.shift();
        pages.push(
          next.place === 'bleed'
            ? bleed(next)
            : gallery(page, next, away, galleries++ % 2 === 1)
        );
        continue;
      }
      // and when three are waiting, so they never pile up after the text: the first not meant for a band or the edges
      if (away.length >= BACKLOG) {
        const at = away.findIndex(
          (p) => p.kind === 'fig' && p.place !== 'top' && p.place !== 'bleed'
        );
        const pic = at >= 0 ? away.splice(at, 1)[0] : undefined;
        if (pic?.kind === 'fig') {
          pages.push(gallery(page, pic, away, galleries++ % 2 === 1));
          continue;
        }
      }
      // the opening page carries the head alone; any later page may open on the next band or column picture
      const lead = !first && next?.kind === 'fig' ? next : null;
      if (lead) away.shift();
      // a band takes the next waiting band picture beside its own, a column each, so wide pictures never queue up
      const waiting = away[0];
      const twin =
        lead?.place === 'top' &&
        waiting?.kind === 'fig' &&
        waiting.place === 'top'
          ? waiting
          : null;
      if (twin) away.shift();
      const band =
        lead?.place === 'top'
          ? twin
            ? `<div class="gtr-band gtr-band-pair">${figure(lead, false)}${figure(twin, false)}</div>`
            : `<div class="gtr-band">${figure(lead, true)}</div>`
          : '';
      const side =
        lead?.place === 'column'
          ? `<div class="gtr-col gtr-col-pic">${figure(lead, false)}</div>`
          : '<div class="gtr-col"></div>';
      page.innerHTML = `<div class="gtr gtr-in gtr-flow">${first ? head : ''}${band}<div class="gtr-cols"><div class="gtr-col"></div>${side}</div></div>`;
      const [count, front] = [queue.length, queue[0]];
      const cols = [
        ...page.querySelectorAll<HTMLElement>('.gtr-col:not(.gtr-col-pic)'),
      ].filter((col) => getComputedStyle(col).display !== 'none');
      for (const col of cols) fill(col, queue, away);
      pages.push({
        kind: 'text',
        html: page.firstElementChild?.innerHTML ?? '',
        headed: first && head !== '',
      });
      first = false;
      // a page that took nothing and opened on no picture would repeat for ever: it takes the next piece as it is
      if (!lead && queue.length === count && queue[0] === front && !away.length)
        queue.shift();
    }
  } finally {
    page.remove();
  }
  return pages;
}
