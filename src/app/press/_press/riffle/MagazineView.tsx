'use client';

import { useRef } from 'react';

import { Sheet } from '../../directions/_directions/sheet';
import type { MagazineIssue, StoryCard } from '../content';
import { COVERS, FALLBACK_COVER } from '../gpu/covers';
import { drawLayers } from '../gpu/emblems';
import { useMountEffect } from '../hooks';
import { MAGAZINE_ART } from '../ui/Book';
import { issuePages } from './pages';

type Props = {
  story: StoryCard;
  issue: MagazineIssue;
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
   shows its issue: Taylor's Sheet turns the pages (issuePages), bending
   each leaf in strips. A click riffles every page past, a scroll or an
   arrow key turns one, and a drag turns a leaf by hand. Esc or the close
   control goes back to the rack; "Read the story" and the sections open
   the web page. The cover prints the story's design flat in its inks
   (coverArt), drawn before the pages are made. */
/**
 * The story's cover design (gpu/emblems.ts) drawn flat at the rack's place for it, as a PNG data URL: the
 * dithered layer in the cover's accent, then its crisp drawing in the art ink over it, so a drawing (Fuma's
 * crescent, the 1607 page) stays solid where the glow runs under it.
 */
async function coverArt(slug: string, width: number, height: number): Promise<string | null> {
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
  return out.toDataURL('image/png');
}

export default function MagazineView({ story, issue, href, onRead, onClose }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const close = useRef<HTMLButtonElement>(null);

  useMountEffect(() => {
    const el = host.current;
    if (!el) return;
    let sheet: Sheet | null = null;
    let gone = false;
    const scale = Math.min(2, devicePixelRatio || 1);
    void coverArt(story.slug, Math.round(el.offsetWidth * scale), Math.round(el.offsetHeight * scale))
      .catch(() => null)
      .then((art) => {
        if (!gone) sheet = new Sheet(el, { pages: issuePages(story, issue, href, art), strips: 22, dur: 900 });
      });
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
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        sheet?.next();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        sheet?.prev();
      }
    };
    // a link on a page (a section, "Read the story") opens the web page; the Sheet leaves links to their own clicks
    const onClick = (e: MouseEvent) => {
      const link = e.target instanceof Element ? e.target.closest<HTMLAnchorElement>('a[data-read]') : null;
      if (!link || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      onRead(link.dataset.read ?? '');
    };
    const onResize = () => sheet?.build();
    const stage = el.parentElement;
    stage?.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('click', onClick);
    addEventListener('keydown', onKey);
    addEventListener('resize', onResize);
    return () => {
      gone = true;
      sheet?.stop();
      stage?.removeEventListener('wheel', onWheel);
      el.removeEventListener('click', onClick);
      removeEventListener('keydown', onKey);
      removeEventListener('resize', onResize);
    };
  });

  return (
    <div className='gtp-riffle' role='dialog' aria-modal='true' aria-label={`${story.title}, as a magazine`}>
      <div className='gtp-riffle-stage'>
        <div ref={host} className='gtp-riffle-mag' />
      </div>
      <p className='gtp-riffle-foot'>
        <a
          href={href}
          onClick={(e) => {
            if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            e.preventDefault();
            onRead('');
          }}
        >
          Read the story
        </a>
      </p>
      <button ref={close} type='button' className='gtp-riffle-close' onClick={onClose} aria-label='Close the magazine'>
        <span aria-hidden='true'>×</span>
      </button>
    </div>
  );
}
