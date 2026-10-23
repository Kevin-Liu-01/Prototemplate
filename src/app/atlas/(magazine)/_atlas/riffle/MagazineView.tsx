'use client';

import { useRef, useState } from 'react';

import type { StoryCard } from '../content';
import { COVERS, FALLBACK_COVER } from '../gpu/covers';
import { drawLayers } from '../gpu/emblems';
import { useMountEffect } from '../hooks';
import { MAGAZINE_ART } from '../ui/Book';
import type { Piece } from './article';
import { issuePages, openerOf, openingHead } from './pages';
import { paginate } from './paginate';
import { Flip } from './flip';
import { BASE } from './print';

type Props = {
  story: StoryCard;
  /** The story's web page. */
  href: string;
  /** Opens the web page, as a click on the magazine on the rack does. */
  onRead: (hash: string) => void;
  onClose: () => void;
};

/** How far a wheel has to travel, and how long it rests, before it turns another page. */
const WHEEL_STEP = 40;
const WHEEL_REST = 300;

/* A story's magazine opened over the hall, as Riffle (Taylor Fang's PR 1)
   shows its issue, its pages (issuePages) turned by riffle/flip.ts. A
   click on the right page turns it forward and a click on the left page
   turns it back, as do the arrows under the magazine, the arrow keys and a
   scroll. The
   pages hold the whole article (riffle/article.ts), fetched as the corner
   lifts and set into pages the magazine's size (riffle/paginate.ts). Esc or
   the close control goes back to the rack; "Read the story" opens the web
   page. The cover prints the story's design flat in its inks (coverArt),
   drawn once per story and size. */

/** Each story's cover art by size, kept for the visit, so a magazine opens again at once. */
const ARTS = new Map<string, Promise<string | null>>();

function coverArt(slug: string, width: number, height: number): Promise<string | null> {
  const key = `${slug} ${width}x${height}`;
  let art = ARTS.get(key);
  if (!art) {
    art = drawCover(slug, width, height).catch(() => null);
    ARTS.set(key, art);
  }
  return art;
}

/**
 * The story's cover design (gpu/emblems.ts) drawn flat at the rack's place for it, as a blob URL: the
 * dithered layer in the cover's accent, then its crisp drawing in the art ink over it, so a drawing (Fuma's
 * crescent, the 1607 page) stays solid where the glow runs under it. A blob URL rather than a data URL, as
 * every strip of a turning leaf copies the cover's markup.
 */
async function drawCover(slug: string, width: number, height: number): Promise<string | null> {
  const spec = COVERS[slug] ?? FALLBACK_COVER;
  const { emblem, art } = await drawLayers(slug, width, height, height, MAGAZINE_ART);
  const out = document.createElement('canvas');
  out.width = width;
  out.height = height;
  const ctx = out.getContext('2d');
  if (!ctx || (!emblem && !art)) return null;
  const print = (layer: HTMLCanvasElement | null, ink: string | undefined) => {
    if (!layer || !ink) return;
    const tinted = document.createElement('canvas');
    tinted.width = layer.width;
    tinted.height = layer.height;
    const t = tinted.getContext('2d');
    if (!t) return;
    t.drawImage(layer, 0, 0);
    t.globalCompositeOperation = 'source-in';
    t.fillStyle = ink;
    t.fillRect(0, 0, tinted.width, tinted.height);
    ctx.drawImage(tinted, 0, 0);
  };
  print(emblem, spec.accent ?? spec.colors[1]);
  print(art, spec.art ?? spec.paper);
  const blob = await new Promise<Blob | null>((done) => out.toBlob(done, 'image/png'));
  return blob ? URL.createObjectURL(blob) : null;
}

/** Each story's article, fetched once for the visit (atlas/[slug]/issue). */
const ARTICLES = new Map<string, Promise<Piece[]>>();

/** A story's article by its page's path; the rack asks for it as a corner lifts, so the magazine opens at once. */
export function loadArticle(href: string): Promise<Piece[]> {
  let article = ARTICLES.get(href);
  if (!article) {
    article = fetch(`${BASE}${href}/issue`)
      .then((response) => (response.ok ? (response.json() as Promise<Piece[]>) : Promise.reject(new Error(String(response.status)))))
      .catch(() => {
        // a failed fetch is not kept, so the next opening asks again
        ARTICLES.delete(href);
        return [];
      });
    ARTICLES.set(href, article);
  }
  return article;
}

/** The least width and height, in pixels, a page is set at. */
const MIN_PAGE = 160;

/** The width from which two pages show at once. */
const SPREAD = 760;

/** The faces the pages are set in, the italics too, loaded before they are measured, so the measured page is the shown one. */
const FACES = [
  '400 16px "Katagami Text"',
  '700 16px "Katagami Text"',
  'italic 400 16px "Katagami Text"',
  '400 16px "Katagami Serif"',
  '700 16px "Katagami Serif"',
  'italic 400 16px "Katagami Serif"',
];

export default function MagazineView({ story, href, onRead, onClose }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const turner = useRef<Flip | null>(null);
  /** The spread showing and the last one, for the arrows. */
  const [at, setAt] = useState({ state: 0, max: 0 });

  useMountEffect(() => {
    const el = host.current;
    if (!el) return;
    let sheet: Flip | null = null;
    let gone = false;
    const sync = () => {
      if (sheet) setAt({ state: sheet.state, max: sheet.max });
    };
    // the page size the article was set for; a resize to another sets it again, at the same place in the story
    let size = '';
    // each setting counts, so a slower one that finishes after a newer one never replaces its pages
    let made = 0;
    const make = async (place = 0) => {
      const mine = ++made;
      const scale = Math.min(2, devicePixelRatio || 1);
      const [art, pieces] = await Promise.all([
        coverArt(story.slug, Math.round(el.offsetWidth * scale), Math.round(el.offsetHeight * scale)),
        loadArticle(href),
        Promise.all(FACES.map((face) => document.fonts.load(face))).catch(() => []),
      ]);
      if (gone || mine !== made) return;
      size = `${el.offsetWidth}x${el.offsetHeight}`;
      // the page's exact size, fractions and all, so the measured lines break where the shown ones do; a page with no
      // room yet (a hidden window) waits for the resize that gives it some, rather than setting a word a page
      const box = el.getBoundingClientRect();
      if (box.width < MIN_PAGE || box.height < MIN_PAGE) return;
      // on a spread the story opens on its own picture across the gutter, with the head under it; one page at a time, the
      // head sits over the first page's columns
      const spread = innerWidth >= SPREAD;
      const cover = pieces.find((p) => p.kind === 'cover');
      const opener = spread && cover?.kind === 'cover' && cover.ratio ? openerOf(cover.src, cover.ratio, box.width, box.height) : null;
      const body = pieces.filter((p) => p.kind !== 'cover');
      const article = paginate(el.closest<HTMLElement>('.gtp-riffle') ?? el, box.width, box.height, opener ? '' : openingHead(story), body);
      sheet?.destroy();
      sheet = new Flip(el, { pages: issuePages(story, art, article, spread, opener), breakpoint: SPREAD, dur: 480, onChange: sync });
      if (place) {
        sheet.state = Math.round(place * sheet.max);
        sheet.build();
      }
      turner.current = sheet;
      sync();
    };
    void make();
    close.current?.focus();

    const wheel = { sum: 0, last: 0 };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      wheel.sum += Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      const now = performance.now();
      if (now - wheel.last < WHEEL_REST || Math.abs(wheel.sum) < WHEEL_STEP) return;
      if (wheel.sum > 0) sheet?.next();
      else sheet?.prev();
      wheel.sum = 0;
      wheel.last = now;
    };
    const onKey = (e: KeyboardEvent) => {
      // Space on a button or a link presses it; the page turns only when nothing that takes Space has the focus
      if (e.key === ' ' && e.target instanceof Element && e.target.closest('button, a, input, textarea, select')) return;
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        sheet?.next();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        sheet?.prev();
      }
    };
    let settle = 0;
    const onResize = () => {
      window.clearTimeout(settle);
      settle = window.setTimeout(() => {
        if (`${el.offsetWidth}x${el.offsetHeight}` !== size) void make(sheet?.max ? sheet.state / sheet.max : 0);
        else {
          sheet?.build();
          sync();
        }
      }, 200);
    };
    const stage = el.parentElement;
    stage?.addEventListener('wheel', onWheel, { passive: false });
    addEventListener('keydown', onKey);
    addEventListener('resize', onResize);
    return () => {
      gone = true;
      sheet?.destroy();
      turner.current = null;
      stage?.removeEventListener('wheel', onWheel);
      window.clearTimeout(settle);
      removeEventListener('keydown', onKey);
      removeEventListener('resize', onResize);
    };
  });

  return (
    <div className='gtp-riffle' role='dialog' aria-modal='true' aria-label={`${story.title}, as a magazine`}>
      {/* first in the order the keyboard moves through, where the focus starts; the page behind is inert while it is open */}
      <button ref={close} type='button' className='gtp-riffle-close' onClick={onClose} aria-label='Close the magazine'>
        <svg viewBox='0 0 20 20' aria-hidden='true'>
          <path d='M5.5 5.5l9 9M14.5 5.5l-9 9' />
        </svg>
      </button>
      <div className='gtp-riffle-stage'>
        <div ref={host} className='gtp-riffle-mag' />
      </div>
      <div className='gtp-riffle-foot'>
        <button type='button' className='gtp-riffle-turn' onClick={() => turner.current?.prev()} disabled={at.state <= 0} aria-label='Previous page'>
          <svg viewBox='0 0 20 20' aria-hidden='true'>
            <path d='M12.5 4.5 7 10l5.5 5.5' />
          </svg>
        </button>
        <a
          href={`${BASE}${href}`}
          onClick={(e) => {
            if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            e.preventDefault();
            onRead('');
          }}
        >
          Read the story
        </a>
        <button type='button' className='gtp-riffle-turn' onClick={() => turner.current?.next()} disabled={at.state >= at.max} aria-label='Next page'>
          <svg viewBox='0 0 20 20' aria-hidden='true'>
            <path d='M7.5 4.5 13 10l-5.5 5.5' />
          </svg>
        </button>
      </div>
    </div>
  );
}
