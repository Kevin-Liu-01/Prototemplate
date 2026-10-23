/* Sets a story's article (riffle/article.ts) into magazine pages: the
   pieces flow down one column and into the next, two columns a page (one on
   a phone's narrow page, as riffle.css sets it), the opening's head across
   the top of the first. A paragraph or a list that runs past a column's foot
   is split there, at the most words or items that fit, and runs on at the
   top of the next column with a few words at least; a head goes on with
   what follows it; a picture or a quote that does not fit waits, in order,
   to open the next column while the text and heads after it fill this one,
   so no column ends on a gap. Every page is measured in a hidden
   page of the magazine's own size and stylesheet, so what is measured is
   what shows. A picture holds its place by its shape, so nothing waits for
   it to load. */

import type { Piece } from './article';

/** The fewest words a column ends a paragraph on (about two lines) before it carries the whole paragraph on. */
const MIN_WORDS = 10;
/** The fewest words a paragraph carries on to the next column, so no column opens on a lone word. */
const MIN_REST = 8;
/** The room, in pixels, a column keeps at its foot, so a rounding between the measured page and the shown one never clips a line. */
const SLACK = 2;
/** The lines of text a head keeps with it at a column's foot. */
const KEEP_LINES = 3;

/** A piece part way through: a paragraph run on from the column before, a numbered list counting on. */
type Part = Piece & { cont?: boolean; start?: number };

function markup(piece: Part): string {
  switch (piece.kind) {
    case 'p': {
      // a paragraph run on keeps its part (a source stays small) but not the lead's drop cap
      const cls = [piece.cont && piece.cls === 'lead' ? '' : piece.cls, piece.cont ? 'cont' : ''].filter(Boolean).join(' ');
      return `<p${cls ? ` class="${cls}"` : ''}>${piece.words.join(' ')}</p>`;
    }
    case 'h':
      return piece.minor ? `<h4>${piece.html}</h4>` : `<h3>${piece.html}</h3>`;
    case 'fig':
      return `<figure><img src="${piece.src}" alt="${piece.alt}" style="aspect-ratio:${piece.ratio ?? '4 / 3'}" loading="lazy" decoding="async"><figcaption>${piece.caption}</figcaption></figure>`;
    case 'quote':
      return `<blockquote class="gtr-pull"><p>${piece.html}</p>${piece.by ? `<cite>${piece.by}</cite>` : ''}</blockquote>`;
    case 'list': {
      const tag = piece.ordered ? 'ol' : 'ul';
      const start = piece.ordered && piece.start ? ` start="${piece.start}"` : '';
      const lang = piece.lang ? ` class="defs" lang="${piece.lang}" dir="${piece.dir ?? 'ltr'}"` : '';
      return `<${tag}${start}${lang}>${piece.items.map((item) => `<li>${item}</li>`).join('')}</${tag}>`;
    }
  }
}

/** The piece cut to its first `k` words or items, and what is left of it. */
function cut(piece: Part, k: number): [Part, Part | null] {
  if (piece.kind === 'p') {
    const rest = piece.words.slice(k);
    return [{ ...piece, words: piece.words.slice(0, k) }, rest.length ? { ...piece, words: rest, cont: true } : null];
  }
  if (piece.kind === 'list') {
    const rest = piece.items.slice(k);
    return [{ ...piece, items: piece.items.slice(0, k) }, rest.length ? { ...piece, items: rest, start: (piece.start ?? 1) + k } : null];
  }
  return [piece, null];
}

const units = (piece: Part) => (piece.kind === 'p' ? piece.words.length : piece.kind === 'list' ? piece.items.length : 0);

function element(html: string): HTMLElement {
  const holder = document.createElement('div');
  holder.innerHTML = html;
  return holder.firstElementChild as HTMLElement;
}

/**
 * Whether a head just set at the column's foot may stay: three lines of its
 * section's text must start here too. A picture or a quote between the head
 * and its text floats to the next column if it does not fit, so the text
 * after it is what counts; a head followed by nothing but pictures stays only
 * if the first of them fits whole.
 */
function keepsHead(col: HTMLElement, head: HTMLElement, after: Part[], over: () => boolean): boolean {
  const text = after.find((part) => part.kind !== 'fig' && part.kind !== 'quote');
  if (!text || text.kind === 'h') {
    const first = after[0];
    if (!first || first.kind === 'h') return true;
    const follow = element(markup(first));
    col.append(follow);
    const fits = !over();
    follow.remove();
    return fits;
  }
  const line = parseFloat(getComputedStyle(col).lineHeight) || 16;
  return col.clientHeight - (head.getBoundingClientRect().bottom - col.getBoundingClientRect().top) >= KEEP_LINES * line;
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

/** Fills one column from the queue, taking what fits and leaving the rest for the next. */
function fill(col: HTMLElement, queue: Part[]) {
  // what the column holds runs to its last piece's foot, margin and all; a column never reports less than its own height, so it is measured this way
  const over = () => {
    const last = col.lastElementChild;
    if (!last) return false;
    const foot = last.getBoundingClientRect().bottom + parseFloat(getComputedStyle(last).marginBottom) - col.getBoundingClientRect().top;
    return foot > col.clientHeight - SLACK;
  };
  // pictures and quotes that do not fit wait, in their order, to open the next column, while the text after them
  // fills this one
  const held: Part[] = [];
  const done = () => {
    queue.unshift(...held);
  };
  while (queue.length) {
    const piece = queue[0]!;
    // a picture after a held one waits with it, so pictures keep their order; text and heads flow on beneath them
    if (held.length && (piece.kind === 'fig' || piece.kind === 'quote')) {
      held.push(queue.shift()!);
      continue;
    }
    const el = element(markup(piece));
    col.append(el);
    if (!over()) {
      if (piece.kind === 'h' && col.children.length > 1 && !keepsHead(col, el, queue.slice(1), over)) {
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
      const k = piece.kind === 'p' && n - lo > 0 && n - lo < MIN_REST ? n - MIN_REST : piece.kind === 'list' && n - lo === 1 && lo > 1 ? lo - 1 : lo;
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
    if (alone) {
      // a picture taller than a whole column still takes one, held to it by the stylesheet
      col.append(el);
      queue.shift();
      return done();
    }
    if (piece.kind === 'fig' || piece.kind === 'quote') {
      held.push(queue.shift()!);
      continue;
    }
    return done();
  }
  done();
}

/**
 * The article's pages, each its text block's markup: the head (first page
 * only) and the columns. `stage` is where the hidden page is measured, inside
 * the magazine view, so its stylesheet applies; `width` and `height` are a
 * page's.
 */
export function paginate(stage: HTMLElement, width: number, height: number, head: string, pieces: Piece[]): string[] {
  const page = document.createElement('div');
  page.className = 'mag-page gtr-paper';
  page.style.cssText = `position:absolute;left:${-4 * width}px;top:0;width:${width}px;height:${height}px;visibility:hidden;pointer-events:none`;
  stage.append(page);
  const queue: Part[] = [...pieces];
  const pages: string[] = [];
  try {
    while (queue.length) {
      const [first, count] = [queue[0], queue.length];
      page.innerHTML = `<div class="gtr gtr-in gtr-flow">${pages.length ? '' : head}<div class="gtr-cols"><div class="gtr-col"></div><div class="gtr-col"></div></div></div>`;
      const cols = [...page.querySelectorAll<HTMLElement>('.gtr-col')].filter((col) => getComputedStyle(col).display !== 'none');
      for (const col of cols) fill(col, queue);
      pages.push(page.firstElementChild!.innerHTML);
      // a page that took nothing would repeat for ever: it takes the next piece as it is
      if (queue.length === count && queue[0] === first) queue.shift();
    }
  } finally {
    page.remove();
  }
  return pages;
}
