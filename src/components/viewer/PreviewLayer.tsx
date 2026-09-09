'use client';

import { useGSAP } from '@gsap/react';
import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { getSurface } from '@/lib/surfaces';
import { useMountEffect } from '@/lib/use-mount-effect';

import './PreviewLayer.css';

/**
 * The one preview layer (directive 8.6). Mounted once at the shell root
 * (ViewerShell, and DirectionCorner on the /d pages), it owns every hover
 * preview on the page: any element carrying data-preview="<surface id>"
 * opens a 320x180 capture of that surface beside it after 200ms of hover,
 * or at once on keyboard focus. The sidebar's rows, the search results, the
 * index panel's rows, the grid's captions, the book's page numbers and the
 * toolbar's count (which previews the next item) all carry the attribute
 * and draw nothing of their own.
 *
 * Mechanics. Four delegated listeners on the document (mouseover,
 * mouseout, focusin, focusout), never one per item; the card is one fixed
 * element in a portal at the end of the body, positioned with
 * translate3d alone and clamped to the viewport, so opening it lays
 * nothing out; it fades over the fast duration with will-change set for
 * that long and cleared after. Images resolve through src/lib/surfaces.ts
 * (the 640x360 thumbnail under /shots/thumb, or its dark twin under
 * html[data-theme='dark']) and are decoded off the main thread with
 * img.decode() into a module-level cache of the most recent 48 (about
 * 0.9MB of bitmap each at 640x360, so the cache stays under 50MB), so a
 * capture is decoded once per visit while it is in use; a decoded element
 * is moved into the frame, never re-decoded. One IntersectionObserver per
 * scroll region (the list the rows sit in) preloads the captures of rows
 * while they are in view, one at a time in the background, and again for
 * the other theme's twins when the theme changes; hover requests jump the
 * queue and are capped at two decodes per second for the row under the
 * pointer, so arrowing or sweeping down a list never floods the decoder.
 * Every queued job remembers the element that asked for it and is dropped
 * when that element has left the document (a search wiped by typing, a
 * group folded), so no fetch lands for a row nobody can see. Until an
 * image is ready the card shows the plate with the surface's initial, so
 * it paints within a frame of the delay either way. A file that fails is
 * left alone for thirty seconds, then tried again. A touch screen (no
 * hovering fine pointer) never opens a preview from a pointer, only from
 * focus; reduced motion drops the fade. A pointer press, Escape, a resize
 * or a hidden tab closes it; a scroll puts it away and brings it back after
 * the delay when the pointer is still on the row.
 */

/** How long an element is hovered before its preview opens. */
export const PREVIEW_DELAY_MS = 200;

/** The card's box: a 1px mat around a 320x180 frame and a 32px title row. */
const CARD_W = 322;
const CARD_H = 214;

/** the card's distance from the element's list and from the viewport edges */
const GAP = 8;

/** hover decodes allowed per second */
const HOVER_CAP = 2;
const HOVER_WINDOW_MS = 1000;

/** the pause between background preloads */
const PRELOAD_GAP_MS = 80;

/** how far outside a list's box a row counts as in view for preloading */
const PRELOAD_MARGIN = '25% 0px';

/** how long will-change stays on the card while it fades in; matches --pt-dur-fast */
const FADE_MS = 120;

/** decoded images kept; the oldest leaves when a newer one lands */
const CACHE_MAX = 48;

/** how long a failed file is left alone before it may be tried again */
const BROKEN_MS = 30000;

/* ---- the decoded image cache, shared by every mount for the visit ---- */

type Job = {
  src: string;
  /** the element that asked; a job whose element has left the document is dropped unfetched */
  el: HTMLElement | null;
  resolve: (img: HTMLImageElement) => void;
  reject: (error: unknown) => void;
};

/** insertion-ordered, so the first key is the least recently used */
const decoded = new Map<string, HTMLImageElement>();
/** when each failed source failed */
const broken = new Map<string, number>();
const pending = new Map<string, Promise<HTMLImageElement>>();
const hoverQueue: Job[] = [];
const preloadQueue: Job[] = [];
const hoverStamps: number[] = [];
let hoverTimer = 0;
let preloading = false;
/** hover decodes in flight; background preloads wait for them */
let hovering = 0;

/** The cached image, made the most recent. */
function cached(src: string): HTMLImageElement | undefined {
  const img = decoded.get(src);
  if (!img) return undefined;
  decoded.delete(src);
  decoded.set(src, img);
  return img;
}

function remember(src: string, img: HTMLImageElement): void {
  decoded.delete(src);
  decoded.set(src, img);
  while (decoded.size > CACHE_MAX) {
    const oldest = decoded.keys().next();
    if (oldest.done) break;
    const old = decoded.get(oldest.value);
    decoded.delete(oldest.value);
    /* an evicted element still sitting in the card keeps painting; it is only no longer cached */
    if (old && !old.isConnected) old.removeAttribute('src');
  }
}

/** True while a failed source is inside its quiet period. */
function isBroken(src: string): boolean {
  const at = broken.get(src);
  if (at === undefined) return false;
  if (performance.now() - at < BROKEN_MS) return true;
  broken.delete(src);
  return false;
}

/** True for a job whose element is gone: nobody can see the row it was for. */
function stale(job: Job): boolean {
  return job.el !== null && !job.el.isConnected;
}

function start(job: Job): Promise<void> {
  if (stale(job)) {
    job.reject(new Error(`no longer shown: ${job.src}`));
    return Promise.resolve();
  }
  const img = new Image();
  img.decoding = 'async';
  img.src = job.src;
  return img.decode().then(
    () => {
      remember(job.src, img);
      job.resolve(img);
    },
    (error: unknown) => {
      broken.set(job.src, performance.now());
      job.reject(error);
    }
  );
}

/** Hover decodes: at most HOVER_CAP starts in any HOVER_WINDOW_MS; the rest wait for the window to pass. Stale jobs cost nothing. */
function pumpHover(): void {
  const now = performance.now();
  while (hoverStamps.length > 0 && now - (hoverStamps[0] ?? now) > HOVER_WINDOW_MS) hoverStamps.shift();
  while (hoverQueue.length > 0 && hoverStamps.length < HOVER_CAP) {
    const job = hoverQueue.shift();
    if (!job) break;
    if (stale(job)) {
      void start(job);
      continue;
    }
    hoverStamps.push(now);
    hovering += 1;
    void start(job).finally(() => {
      hovering -= 1;
      pumpPreload();
    });
  }
  if (hoverQueue.length > 0 && !hoverTimer) {
    const wait = HOVER_WINDOW_MS - (now - (hoverStamps[0] ?? now)) + 1;
    hoverTimer = window.setTimeout(() => {
      hoverTimer = 0;
      pumpHover();
    }, Math.max(1, wait));
  }
}

/** Background preloads: one at a time, with a pause between them, and only while no hover decode is in flight. */
function pumpPreload(): void {
  if (preloading || hovering > 0) return;
  let job = preloadQueue.shift();
  /* stale jobs settle at once and take no slot */
  while (job && stale(job)) {
    void start(job);
    job = preloadQueue.shift();
  }
  if (!job) return;
  preloading = true;
  void start(job).finally(() => {
    window.setTimeout(() => {
      preloading = false;
      pumpPreload();
    }, PRELOAD_GAP_MS);
  });
}

/** The hover line keeps only the job for `src`; every other waiting hover becomes the next preload. */
function demoteHover(src: string): void {
  for (let i = hoverQueue.length - 1; i >= 0; i -= 1) {
    const job = hoverQueue[i];
    if (!job || job.src === src) continue;
    hoverQueue.splice(i, 1);
    preloadQueue.unshift(job);
  }
}

/**
 * The decoded image for a source: from the cache, or after a decode queued
 * as a hover request (front of the line, rate limited) or a preload (the
 * back, one at a time). Rejects for a file that will not load, or for a
 * row that left the document before its turn.
 */
function requestImage(src: string, urgent: boolean, el: HTMLElement | null): Promise<HTMLImageElement> {
  const hit = cached(src);
  if (hit) return Promise.resolve(hit);
  if (isBroken(src)) return Promise.reject(new Error(`no image at ${src}`));
  const inflight = pending.get(src);
  if (inflight) {
    /* a preload already queued for it moves to the hover line, for the element that wants it now */
    if (urgent) {
      const at = preloadQueue.findIndex((job) => job.src === src);
      if (at >= 0) {
        const [job] = preloadQueue.splice(at, 1);
        if (job) {
          hoverQueue.unshift({ ...job, el });
          pumpHover();
        }
      }
    }
    return inflight;
  }
  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const job: Job = { src, el, resolve, reject };
    if (urgent) {
      hoverQueue.unshift(job);
      pumpHover();
    } else {
      preloadQueue.push(job);
      pumpPreload();
    }
  }).finally(() => {
    pending.delete(src);
    /* a hover that jumped the line may have left preloads waiting */
    pumpPreload();
  });
  pending.set(src, promise);
  return promise;
}

/* ---- resolving and placing ---- */

type Subject = { id: string; name: string; src: string | null; initial: string };

function darkTheme(): boolean {
  return document.documentElement.dataset.theme === 'dark';
}

/** What a data-preview id shows: the surface's name and the capture for the current theme, or no capture. */
function subjectFor(id: string): Subject | null {
  const surface = getSurface(id);
  if (!surface) return null;
  const src = surface.shot ? (darkTheme() && surface.shotDark ? surface.shotDark : surface.shot) : null;
  return { id, name: surface.name, src, initial: surface.name.charAt(0).toUpperCase() };
}

type Place = { x: number; y: number };

/**
 * Where the card goes. Beside a list (the sidebar, the index panel, the
 * search card) it sits 8px outside the list's edge, to the right unless
 * that does not fit, centered on the row; elsewhere (the toolbar count, a
 * grid caption, a book page number) it hangs under the element, or above
 * it when there is no room below. Always inside the viewport.
 */
function placeFor(el: HTMLElement): Place {
  const rect = el.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const box = el.closest<HTMLElement>('.pt-sb, .pt-panel, .pt-search-card');
  let x: number;
  let y: number;
  if (box) {
    const b = box.getBoundingClientRect();
    x = b.right + GAP;
    if (x + CARD_W > vw - GAP) x = b.left - GAP - CARD_W;
    y = rect.top + rect.height / 2 - CARD_H / 2;
  } else {
    x = rect.left;
    y = rect.bottom + GAP;
    if (y + CARD_H > vh - GAP) y = rect.top - GAP - CARD_H;
  }
  x = Math.max(GAP, Math.min(vw - CARD_W - GAP, x));
  y = Math.max(GAP, Math.min(vh - CARD_H - GAP, y));
  return { x: Math.round(x), y: Math.round(y) };
}

/** True on a device with a hovering, fine pointer. A touch screen previews from focus alone. */
function canHover(): boolean {
  try {
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  } catch {
    return false;
  }
}

function previewTarget(target: EventTarget | null): HTMLElement | null {
  if (!(target instanceof Element)) return null;
  return target.closest<HTMLElement>('[data-preview]');
}

/** True when the element took focus from the keyboard, not from a click. */
function focusVisible(el: HTMLElement): boolean {
  try {
    return el.matches(':focus-visible');
  } catch {
    return true;
  }
}

/** The scroll region a row sits in, which becomes its observer's root; null for the viewport. */
function listOf(el: HTMLElement): HTMLElement | null {
  return el.closest<HTMLElement>('.pt-scroll');
}

/** Queue the current theme's capture of a row as a background preload, unless it is cached, failed or already on its way. */
function preloadRow(el: HTMLElement): void {
  const id = el.dataset.preview;
  const subject = id ? subjectFor(id) : null;
  if (!subject?.src) return;
  const { src } = subject;
  if (decoded.has(src) || isBroken(src) || pending.has(src)) return;
  requestImage(src, false, el).catch(() => undefined);
}

type Open = Subject & Place & { ready: boolean };

export function PreviewLayer() {
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [open, setOpen] = useState<Open | null>(null);
  /* true while the card fades in; will-change rides on it */
  const [entering, setEntering] = useState(false);
  const frame = useRef<HTMLDivElement>(null);
  /* the element the card is for (or about to be for), read by the listeners */
  const anchor = useRef<HTMLElement | null>(null);
  const timer = useRef(0);
  const fadeTimer = useRef(0);

  useMountEffect(() => {
    setHost(document.body);
    const hover = canHover();

    const cancel = () => {
      if (timer.current) {
        window.clearTimeout(timer.current);
        timer.current = 0;
      }
    };

    const close = () => {
      cancel();
      anchor.current = null;
      setOpen(null);
    };

    const show = (el: HTMLElement) => {
      if (!el.isConnected) {
        close();
        return;
      }
      const id = el.dataset.preview;
      const subject = id ? subjectFor(id) : null;
      if (!subject) {
        close();
        return;
      }
      anchor.current = el;
      const place = placeFor(el);
      const ready = subject.src !== null && decoded.has(subject.src);
      setOpen({ ...subject, ...place, ready });
      if (subject.src && !ready) {
        const src = subject.src;
        /* the pointer moved on: earlier hovers wait behind this one as preloads */
        demoteHover(src);
        requestImage(src, true, el).then(
          () => {
            if (anchor.current === el) setOpen((prev) => (prev && prev.src === src ? { ...prev, ready: true } : prev));
          },
          () => {
            /* the file will not load: the plate stays */
            if (anchor.current === el) setOpen((prev) => (prev && prev.src === src ? { ...prev, src: null } : prev));
          }
        );
      }
    };

    const arm = (el: HTMLElement) => {
      cancel();
      anchor.current = el;
      timer.current = window.setTimeout(() => {
        timer.current = 0;
        show(el);
      }, PREVIEW_DELAY_MS);
    };

    const onOver = (event: MouseEvent) => {
      if (!hover) return;
      const el = previewTarget(event.target);
      if (el === anchor.current) return;
      if (el) arm(el);
      else if (anchor.current) close();
    };

    const onOut = (event: MouseEvent) => {
      const current = anchor.current;
      if (!current || !hover) return;
      const to = event.relatedTarget;
      if (to instanceof Node && current.contains(to)) return;
      if (previewTarget(event.target) !== current) return;
      close();
    };

    const onFocusIn = (event: FocusEvent) => {
      const el = previewTarget(event.target);
      if (el && focusVisible(el)) {
        cancel();
        show(el);
        return;
      }
      if (anchor.current && !el) close();
    };

    const onFocusOut = (event: FocusEvent) => {
      if (anchor.current && previewTarget(event.target) === anchor.current) close();
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && anchor.current) close();
    };

    /* a scroll puts the card away; when the pointer is still resting on the
       row when the scroll ends (a list scrolled under it, a row brought into
       view) the card comes back after the delay, so no row needs a second
       pass of the pointer */
    const onScroll = () => {
      const el = anchor.current;
      if (!el) return;
      setOpen(null);
      let resting = false;
      try {
        resting = hover && el.isConnected && el.matches(':hover');
      } catch {
        resting = false;
      }
      if (resting) arm(el);
      else close();
    };

    const onHide = () => {
      if (document.hidden) close();
    };

    /* preloading: one observer per scroll region, watching the rows inside
       it; the rows in view are kept in a set, so the new theme's twins can
       be queued for them when the theme changes; new rows (a group
       unfolding, the search opening) are picked up on the next frame after
       they land */
    const observers = new Map<HTMLElement | null, IntersectionObserver>();
    const watched = new WeakSet<Element>();
    const inView = new Set<HTMLElement>();
    const onSeen = (entries: IntersectionObserverEntry[]) => {
      for (const entry of entries) {
        const el = entry.target;
        if (!(el instanceof HTMLElement)) continue;
        if (!entry.isIntersecting || !el.isConnected) {
          inView.delete(el);
          continue;
        }
        inView.add(el);
        preloadRow(el);
      }
    };
    const watch = () => {
      for (const [root, observer] of observers) {
        if (root && !root.isConnected) {
          observer.disconnect();
          observers.delete(root);
        }
      }
      for (const el of inView) if (!el.isConnected) inView.delete(el);
      document.querySelectorAll<HTMLElement>('[data-preview]').forEach((el) => {
        if (watched.has(el)) return;
        watched.add(el);
        const root = listOf(el);
        let observer = observers.get(root);
        if (!observer) {
          observer = new IntersectionObserver(onSeen, { root, rootMargin: PRELOAD_MARGIN });
          observers.set(root, observer);
        }
        observer.observe(el);
      });
    };
    let frameId = 0;
    const schedule = () => {
      if (!frameId) frameId = requestAnimationFrame(() => {
        frameId = 0;
        watch();
      });
    };
    let mutations: MutationObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      watch();
      mutations = new MutationObserver(schedule);
      mutations.observe(document.body, { childList: true, subtree: true });
    }

    /* the theme changed: the open card shows the other twin, and the rows
       in view queue theirs as preloads, one pass at the preload cadence */
    const theme = new MutationObserver(() => {
      const el = anchor.current;
      if (el && !timer.current) show(el);
      for (const row of inView) {
        if (!row.isConnected) {
          inView.delete(row);
          continue;
        }
        preloadRow(row);
      }
    });
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    document.addEventListener('mouseover', onOver, { passive: true });
    document.addEventListener('mouseout', onOut, { passive: true });
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);
    document.addEventListener('scroll', onScroll, { passive: true, capture: true });
    document.addEventListener('pointerdown', close, { passive: true, capture: true });
    document.addEventListener('keydown', onKey);
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('resize', close);

    return () => {
      cancel();
      window.clearTimeout(fadeTimer.current);
      theme.disconnect();
      mutations?.disconnect();
      if (frameId) cancelAnimationFrame(frameId);
      observers.forEach((observer) => observer.disconnect());
      inView.clear();
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
      document.removeEventListener('scroll', onScroll, { capture: true });
      document.removeEventListener('pointerdown', close, { capture: true });
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('resize', close);
    };
  });

  /* before paint: the decoded element moves into the frame (never a second
     decode), and the fade's will-change is set for its duration */
  useGSAP(
    () => {
      const box = frame.current;
      if (!box) return;
      const img = open?.src && open.ready ? cached(open.src) : undefined;
      if (img) {
        if (img.parentElement !== box) box.replaceChildren(img);
      } else {
        box.replaceChildren();
      }
      window.clearTimeout(fadeTimer.current);
      if (open) {
        setEntering(true);
        fadeTimer.current = window.setTimeout(() => setEntering(false), FADE_MS);
      } else {
        setEntering(false);
      }
    },
    { dependencies: [open?.id, open?.src, open?.ready] }
  );

  if (!host) return null;

  return createPortal(
    <div
      className={open ? (entering ? 'pt-preview is-on is-entering' : 'pt-preview is-on') : 'pt-preview'}
      style={open ? { transform: `translate3d(${open.x}px, ${open.y}px, 0)` } : undefined}
      aria-hidden='true'
    >
      <div className='pt-preview-frame'>
        <div ref={frame} className='pt-preview-img' />
        {open && !(open.src && open.ready) ? <span className='pt-preview-plate'>{open.initial}</span> : null}
      </div>
      <div className='pt-preview-title'>{open?.name ?? ''}</div>
    </div>,
    host
  );
}
