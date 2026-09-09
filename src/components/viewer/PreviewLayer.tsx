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
 * or at once on keyboard focus. The sidebar's rows and tiles, the search
 * results, the index panel's rows, the grid's captions, the book's page
 * numbers and the toolbar's count (which previews the next item) all carry
 * the attribute and draw nothing of their own.
 *
 * Mechanics. Four delegated listeners on the document (mouseover,
 * mouseout, focusin, focusout), never one per item; the card is one fixed
 * element in a portal at the end of the body, positioned with
 * translate3d alone and clamped to the viewport, so opening it lays
 * nothing out; it fades over the fast duration with will-change set for
 * that long and cleared after. Images resolve through src/lib/surfaces.ts
 * (the light capture, or the dark twin under html[data-theme='dark']) and
 * are decoded off the main thread with img.decode() into a module-level
 * Map, so a capture is decoded once per visit; a decoded element is moved
 * into the frame, never re-decoded. One IntersectionObserver per scroll
 * region (the list the rows sit in) preloads the captures of rows as they
 * come into view, one at a time in the background; hover requests jump the
 * queue and are capped at two decodes per second, so arrowing or sweeping
 * down a list never floods the decoder. Until an image is ready the card
 * shows the plate with the surface's initial, so it paints within a frame
 * of the delay either way. A touch screen (no hovering fine pointer) never
 * opens a preview from a pointer, only from focus; reduced motion drops
 * the fade. A pointer press, Escape, a resize or a hidden tab closes it;
 * a scroll puts it away and brings it back after the delay when the
 * pointer is still on the row.
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

/* ---- the decoded image cache, shared by every mount for the visit ---- */

type Job = { src: string; resolve: (img: HTMLImageElement) => void; reject: (error: unknown) => void };

const decoded = new Map<string, HTMLImageElement>();
const broken = new Set<string>();
const pending = new Map<string, Promise<HTMLImageElement>>();
const hoverQueue: Job[] = [];
const preloadQueue: Job[] = [];
const hoverStamps: number[] = [];
let hoverTimer = 0;
let preloading = false;

function start(job: Job): Promise<void> {
  const img = new Image();
  img.decoding = 'async';
  img.src = job.src;
  return img.decode().then(
    () => {
      decoded.set(job.src, img);
      job.resolve(img);
    },
    (error: unknown) => {
      broken.add(job.src);
      job.reject(error);
    }
  );
}

/** Hover decodes: at most HOVER_CAP starts in any HOVER_WINDOW_MS; the rest wait for the window to pass. */
function pumpHover(): void {
  const now = performance.now();
  while (hoverStamps.length > 0 && now - (hoverStamps[0] ?? now) > HOVER_WINDOW_MS) hoverStamps.shift();
  while (hoverQueue.length > 0 && hoverStamps.length < HOVER_CAP) {
    const job = hoverQueue.shift();
    if (!job) break;
    hoverStamps.push(now);
    void start(job);
  }
  if (hoverQueue.length > 0 && !hoverTimer) {
    const wait = HOVER_WINDOW_MS - (now - (hoverStamps[0] ?? now)) + 1;
    hoverTimer = window.setTimeout(() => {
      hoverTimer = 0;
      pumpHover();
    }, Math.max(1, wait));
  }
}

/** Background preloads: one at a time, with a pause between them, and only while no hover is waiting. */
function pumpPreload(): void {
  if (preloading || hoverQueue.length > 0) return;
  const job = preloadQueue.shift();
  if (!job) return;
  preloading = true;
  void start(job).finally(() => {
    window.setTimeout(() => {
      preloading = false;
      pumpPreload();
    }, PRELOAD_GAP_MS);
  });
}

/**
 * The decoded image for a source: from the cache, or after a decode queued
 * as a hover request (front of the line, rate limited) or a preload (the
 * back, one at a time). Rejects for a file that will not load.
 */
function requestImage(src: string, urgent: boolean): Promise<HTMLImageElement> {
  const hit = decoded.get(src);
  if (hit) return Promise.resolve(hit);
  if (broken.has(src)) return Promise.reject(new Error(`no image at ${src}`));
  const inflight = pending.get(src);
  if (inflight) {
    /* a preload already queued for it moves to the hover line */
    if (urgent) {
      const at = preloadQueue.findIndex((job) => job.src === src);
      if (at >= 0) {
        const [job] = preloadQueue.splice(at, 1);
        if (job) {
          hoverQueue.unshift(job);
          pumpHover();
        }
      }
    }
    return inflight;
  }
  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const job: Job = { src, resolve, reject };
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
        requestImage(src, true).then(
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

    /* the theme changed while a card is up: the other twin */
    const theme = new MutationObserver(() => {
      const el = anchor.current;
      if (el && !timer.current) show(el);
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

    /* preloading: one observer per scroll region, watching the rows inside
       it; a row is preloaded once, the first time it comes into view, and
       new rows (a group unfolding, the search opening) are picked up on
       the next frame after they land */
    const observers = new Map<HTMLElement | null, IntersectionObserver>();
    const watched = new WeakSet<Element>();
    const onSeen = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        const el = entry.target;
        if (!(el instanceof HTMLElement)) continue;
        const id = el.dataset.preview;
        const subject = id ? subjectFor(id) : null;
        if (subject?.src && !decoded.has(subject.src) && !broken.has(subject.src)) {
          requestImage(subject.src, false).catch(() => undefined);
        }
      }
    };
    const watch = () => {
      for (const [root, observer] of observers) {
        if (root && !root.isConnected) {
          observer.disconnect();
          observers.delete(root);
        }
      }
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

    return () => {
      cancel();
      window.clearTimeout(fadeTimer.current);
      theme.disconnect();
      mutations?.disconnect();
      if (frameId) cancelAnimationFrame(frameId);
      observers.forEach((observer) => observer.disconnect());
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
      const img = open?.src && open.ready ? decoded.get(open.src) : undefined;
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
