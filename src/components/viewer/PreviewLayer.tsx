'use client';

import { useGSAP } from '@gsap/react';
import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@/lib/cn';
import { getSurface } from '@/lib/surfaces';
import { useMountEffect } from '@/lib/use-mount-effect';

import './PreviewLayer.css';

/**
 * The one preview layer (directive 8.6). Mounted once at the shell root
 * (ViewerShell, and DirectionCorner on the /d pages), it owns every hover
 * preview on the page: any element carrying data-preview="<surface id>"
 * opens a 320x180 capture of that surface beside it after 80ms of hover,
 * or at once on keyboard focus. The sidebar's rows, the search results, the
 * index panel's rows, the grid's captions, the book's page numbers and the
 * toolbar's count (which previews the next item) all carry the attribute
 * and draw nothing of their own.
 *
 * Mechanics. Four delegated listeners on the document (mouseover,
 * mouseout, focusin, focusout), never one per item. The card is one fixed
 * element in a portal at the end of the body, positioned with translate3d
 * alone and clamped to the viewport, so opening it lays nothing out.
 * Beside a list it sits 8px outside the list's edge with its top on the
 * row's top, and its place is computed once per row: nothing that happens
 * later (the capture landing, a theme change) moves it. It fades in over
 * the fast duration; while it is open, a hover on another row does not
 * close it but moves it there in one eased transform transition over the
 * 160ms duration (PreviewLayer.css .is-moving), the name changing at once
 * and the capture crossfading in as soon as it is decoded, the previous
 * capture staying underneath until then so the frame never goes blank
 * between rows. Leaving every row starts a 120ms grace before the card
 * hides, so the gap between two rows, or between a row and its children,
 * never blinks it; re-entering inside the grace cancels the hide. On close
 * the card keeps its last place and content through the fade out.
 *
 * Images resolve through src/lib/surfaces.ts (the 640x360 thumbnail under
 * /shots/thumb, or its dark twin under html[data-theme='dark']) and are
 * decoded off the main thread with img.decode() into a module-level cache
 * of the most recent 48 (about 0.9MB of bitmap each at 640x360, so the
 * cache stays under 50MB), so a capture is decoded once per visit while it
 * is in use; a decoded element is moved into the frame, never re-decoded.
 * Latest wins for hovers: the row under the pointer starts decoding at
 * once, at most two hover decodes are in flight, and a newer hover
 * supersedes the oldest of them (its source is cleared, which aborts the
 * fetch and settles its promise; the file is not marked broken). One
 * IntersectionObserver per scroll region (the list the rows sit in)
 * preloads the captures of rows while they are in view, one at a time in
 * the background and only while no hover decode is in flight, and again
 * for the other theme's twins when the theme changes; a hover for a
 * capture still waiting in the preload line takes it out and starts it.
 * Every queued job remembers the element that asked for it and is dropped
 * when that element has left the document (a search wiped by typing, a
 * group folded), so no fetch lands for a row nobody can see. Until an
 * image is ready the frame shows the plate with the surface's initial
 * under the name, so it paints within a frame of the delay either way, and
 * the image fades in over the plate when it lands. A file that fails is
 * left alone for thirty seconds, then tried again. A touch screen (no
 * hovering fine pointer) never opens a preview from a pointer, only from
 * focus; reduced motion drops every transition and keeps the behaviour. A
 * pointer press, Escape, a resize or a hidden tab closes it. A scroll keeps
 * the card while the pointer is still resting on its row: the card takes
 * the row's new place at once, without the slide, so a list scrolled under
 * a resting pointer carries the card with it. A wheel tick that brings the
 * next row under the pointer reaches the layer as that row's mouseover
 * first, which moves the card there, and then as the scroll event, which
 * settles it in place; both commit in one render. A scroll that leaves no
 * row under the pointer closes the card at once.
 */

/** How long an element is hovered before its preview opens. */
export const PREVIEW_DELAY_MS = 80;

/** how long the card stays after the pointer has left every row, so a gap between rows does not blink it */
const GRACE_MS = 120;

/** The card's box: a 1px mat around a 320x180 frame and a 32px title row. */
const CARD_W = 322;
const CARD_H = 214;

/** the card's distance from the element's list and from the viewport edges */
const GAP = 8;

/** hover decodes in flight at once; a newer hover supersedes the oldest */
const HOVER_INFLIGHT = 2;

/** the pause between background preloads */
const PRELOAD_GAP_MS = 80;

/** how far outside a list's box a row counts as in view for preloading */
const PRELOAD_MARGIN = '25% 0px';

/** the fade of the card and of a landing capture; matches --pt-dur-fast */
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
  promise: Promise<HTMLImageElement>;
  resolve: (img: HTMLImageElement) => void;
  reject: (error: unknown) => void;
  /** the element decoding the file while the job is in flight */
  img: HTMLImageElement | null;
  /** a newer hover took its place: its failure marks nothing broken */
  superseded: boolean;
};

/** insertion-ordered, so the first key is the least recently used */
const decoded = new Map<string, HTMLImageElement>();
/** when each failed source failed */
const broken = new Map<string, number>();
/** every job asked for and not yet settled, by source: waiting in the preload line or in flight */
const pending = new Map<string, Job>();
const preloadQueue: Job[] = [];
/** hover decodes in flight, oldest first */
const hoverFlight: Job[] = [];
let preloading = false;

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

/** A job and its promise; the promise leaves the pending map as it settles, whatever the outcome. */
function makeJob(src: string, el: HTMLElement | null): Job {
  let resolve: (img: HTMLImageElement) => void = () => undefined;
  let reject: (error: unknown) => void = () => undefined;
  const promise = new Promise<HTMLImageElement>((res, rej) => {
    resolve = res;
    reject = rej;
  }).finally(() => {
    if (pending.get(src)?.promise === promise) pending.delete(src);
    /* a hover that took the line may have left preloads waiting */
    pumpPreload();
  });
  const job: Job = { src, el, promise, resolve, reject, img: null, superseded: false };
  pending.set(src, job);
  return job;
}

/** Fetch and decode a job's file. A superseded job's failure marks nothing broken. */
function run(job: Job): Promise<void> {
  if (stale(job)) {
    job.reject(new Error(`no longer shown: ${job.src}`));
    return Promise.resolve();
  }
  const img = new Image();
  img.decoding = 'async';
  job.img = img;
  img.src = job.src;
  return img.decode().then(
    () => {
      job.img = null;
      remember(job.src, img);
      job.resolve(img);
    },
    (error: unknown) => {
      job.img = null;
      if (!job.superseded) broken.set(job.src, performance.now());
      job.reject(error);
    }
  );
}

/** A newer hover took the line: the fetch is aborted and the promise settles now, so the row can ask again later. */
function supersede(job: Job): void {
  job.superseded = true;
  if (job.img) job.img.src = '';
  job.reject(new Error(`superseded: ${job.src}`));
}

/** Start a hover decode at once; when two are already in flight, the oldest gives way. */
function launchHover(job: Job): void {
  while (hoverFlight.length >= HOVER_INFLIGHT) {
    const old = hoverFlight.shift();
    if (old) supersede(old);
  }
  hoverFlight.push(job);
  void run(job).finally(() => {
    const at = hoverFlight.indexOf(job);
    if (at >= 0) hoverFlight.splice(at, 1);
    pumpPreload();
  });
}

/** Background preloads: one at a time, with a pause between them, and only while no hover decode is in flight. */
function pumpPreload(): void {
  if (preloading || hoverFlight.length > 0) return;
  let job = preloadQueue.shift();
  /* stale jobs settle at once and take no slot */
  while (job && stale(job)) {
    void run(job);
    job = preloadQueue.shift();
  }
  if (!job) return;
  preloading = true;
  void run(job).finally(() => {
    window.setTimeout(() => {
      preloading = false;
      pumpPreload();
    }, PRELOAD_GAP_MS);
  });
}

/**
 * The decoded image for a source: from the cache, or after a decode started
 * at once as a hover request or queued as a preload (the back of the line,
 * one at a time). Rejects for a file that will not load, for a row that
 * left the document before its turn, and for a hover a newer hover
 * superseded; only the first of those marks the file broken.
 */
function requestImage(src: string, urgent: boolean, el: HTMLElement | null): Promise<HTMLImageElement> {
  const hit = cached(src);
  if (hit) return Promise.resolve(hit);
  if (isBroken(src)) return Promise.reject(new Error(`no image at ${src}`));
  const waiting = pending.get(src);
  if (waiting) {
    if (urgent) {
      waiting.el = el;
      /* a preload still waiting in line leaves it and starts now; one already in flight is simply awaited */
      const at = preloadQueue.indexOf(waiting);
      if (at >= 0) {
        preloadQueue.splice(at, 1);
        launchHover(waiting);
      }
    }
    return waiting.promise;
  }
  const job = makeJob(src, el);
  if (urgent) {
    launchHover(job);
  } else {
    preloadQueue.push(job);
    pumpPreload();
  }
  return job.promise;
}

/* ---- resolving and placing ---- */

/** solo: the surface has a light capture only, so the dark theme mats it (PreviewLayer.css .is-solo). */
type Subject = { id: string; name: string; src: string | null; initial: string; solo: boolean };

function darkTheme(): boolean {
  return document.documentElement.dataset.theme === 'dark';
}

/** What a data-preview id shows: the surface's name and the capture for the current theme, or no capture. */
function subjectFor(id: string): Subject | null {
  const surface = getSurface(id);
  if (!surface) return null;
  const src = surface.shot ? (darkTheme() && surface.shotDark ? surface.shotDark : surface.shot) : null;
  return { id, name: surface.name, src, initial: surface.name.charAt(0).toUpperCase(), solo: !surface.shotDark };
}

type Place = { x: number; y: number };

/**
 * Where the card goes. Beside a list (the sidebar, the index panel, the
 * search card) it sits 8px outside the list's edge, to the right unless
 * that does not fit, with its top on the row's top; elsewhere (the toolbar
 * count, a grid caption, a book page number) it hangs under the element,
 * or above it when there is no room below. Always inside the viewport.
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
    y = rect.top;
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

/**
 * The card's state. It outlives its own closing: `on` false keeps the last
 * place, name and capture through the fade out, so the card never fades
 * out empty or at the viewport origin. `ready` is true once the capture is
 * decoded; `moved` once the card has moved between rows while open, which
 * turns the transform transition on. A fresh card lands at once, and so
 * does one following its row through a scroll, which clears `moved` again.
 */
type Card = Subject & Place & { ready: boolean; moved: boolean; on: boolean };

export function PreviewLayer() {
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [card, setCard] = useState<Card | null>(null);
  const frame = useRef<HTMLDivElement>(null);
  /* the element the card is for (or about to be for), read by the listeners */
  const anchor = useRef<HTMLElement | null>(null);
  /* the element the card is open for; null while closed or still arming */
  const shown = useRef<HTMLElement | null>(null);
  /* the card has moved between rows since it opened or since it last followed a scroll; turns the transform transition on */
  const moved = useRef(false);
  const openTimer = useRef(0);
  const hideTimer = useRef(0);
  /* the imagery timers: the crossfade sweep and the clear after a fade out */
  const sweepTimer = useRef(0);
  const clearTimer = useRef(0);
  /* whether the card is on in the committed DOM (set before paint). A show
     counts as a move only when the card is on screen for another row: two
     shows that React commits as one render (a delayed timer and the next
     row's mouseover) must land at once, never slide in from the origin */
  const onScreen = useRef(false);

  useMountEffect(() => {
    setHost(document.body);
    const hover = canHover();

    const cancelArm = () => {
      if (openTimer.current) {
        window.clearTimeout(openTimer.current);
        openTimer.current = 0;
      }
    };

    const clearHide = () => {
      if (hideTimer.current) {
        window.clearTimeout(hideTimer.current);
        hideTimer.current = 0;
      }
    };

    /* the card goes off; it keeps its place and content for the fade out */
    const hide = () => {
      shown.current = null;
      moved.current = false;
      setCard((prev) => (prev ? { ...prev, on: false } : null));
    };

    const close = () => {
      cancelArm();
      clearHide();
      anchor.current = null;
      hide();
    };

    /* open the card for `el`, or move it there when it is already open */
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
      if (onScreen.current && shown.current !== el) moved.current = true;
      anchor.current = el;
      shown.current = el;
      const place = placeFor(el);
      const ready = subject.src !== null && decoded.has(subject.src);
      setCard({ ...subject, ...place, ready, moved: moved.current, on: true });
      if (subject.src && !ready) {
        const src = subject.src;
        requestImage(src, true, el).then(
          () => {
            if (anchor.current === el) setCard((prev) => (prev && prev.src === src ? { ...prev, ready: true } : prev));
          },
          () => {
            /* the file will not load: the plate stays; a superseded or stale request changes nothing */
            if (anchor.current === el && isBroken(src)) {
              setCard((prev) => (prev && prev.src === src ? { ...prev, src: null } : prev));
            }
          }
        );
      }
    };

    const arm = (el: HTMLElement) => {
      cancelArm();
      anchor.current = el;
      openTimer.current = window.setTimeout(() => {
        openTimer.current = 0;
        show(el);
      }, PREVIEW_DELAY_MS);
    };

    /* the pointer has left every row: an open card waits out the grace, an arming one lets go now */
    const leave = () => {
      if (shown.current) {
        if (!hideTimer.current) {
          hideTimer.current = window.setTimeout(() => {
            hideTimer.current = 0;
            close();
          }, GRACE_MS);
        }
        return;
      }
      cancelArm();
      anchor.current = null;
    };

    const onOver = (event: MouseEvent) => {
      if (!hover) return;
      const el = previewTarget(event.target);
      if (el) {
        clearHide();
        if (el === anchor.current) return;
        if (shown.current) {
          cancelArm();
          show(el);
        } else {
          arm(el);
        }
        return;
      }
      if (anchor.current) leave();
    };

    const onOut = (event: MouseEvent) => {
      const current = anchor.current;
      if (!current || !hover) return;
      const to = event.relatedTarget;
      if (to instanceof Node && current.contains(to)) return;
      if (previewTarget(event.target) !== current) return;
      leave();
    };

    const onFocusIn = (event: FocusEvent) => {
      const el = previewTarget(event.target);
      if (el && focusVisible(el)) {
        cancelArm();
        clearHide();
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

    /* the card's row moved under a resting pointer (its list scrolled): the
       open card takes the row's new place at once, without the slide, so it
       moves with the row instead of trailing it by 160ms; the next move
       between rows slides again */
    const follow = (el: HTMLElement) => {
      const place = placeFor(el);
      moved.current = false;
      setCard((prev) => (prev && prev.on ? { ...prev, ...place, moved: false } : prev));
    };

    /* a scroll with the pointer still resting on the card's row re-places
       the card on the row; an arming card is left to open at the row's place
       when its delay fires; a scroll that leaves no row under the pointer
       closes the card. Hiding here would fight the row's mouseover, which
       reaches the layer before the scroll event when a wheel tick brings the
       next row under the pointer: the two would commit in one render as the
       new row with the card off, so the card would jump to the row, fade out
       under its title over the old capture, and fade back in from the plate
       once re-armed */
    const onScroll = () => {
      const el = anchor.current;
      if (!el) return;
      let resting = false;
      try {
        resting = hover && el.isConnected && el.matches(':hover');
      } catch {
        resting = false;
      }
      if (resting) {
        if (shown.current === el) follow(el);
        return;
      }
      close();
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

    /* the theme changed: the open card shows the other twin in the same
       place, and the rows in view queue theirs as preloads, one pass at the
       preload cadence */
    const theme = new MutationObserver(() => {
      const el = shown.current;
      if (el) show(el);
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
      cancelArm();
      clearHide();
      window.clearTimeout(sweepTimer.current);
      window.clearTimeout(clearTimer.current);
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
     decode). A landing capture is appended over whatever the frame holds
     (the plate, or the previous row's capture) with .is-in, flushed, and
     released to fade in over the fast duration; once the fade is over the
     capture under it leaves, and never more than two stack, however fast
     they land. A fresh open starts on the plate, never on the
     last session's capture; a subject with no capture shows its plate at
     once; a subject whose capture is still decoding leaves the previous
     capture in place; a closing card keeps its capture through the fade
     out and lets it go after. Nothing here changes the frame's box, so the
     card never reflows when a capture arrives. */
  useGSAP(
    () => {
      const box = frame.current;
      if (!box) return;
      const on = card?.on === true;
      const fresh = on && !onScreen.current;
      onScreen.current = on;
      window.clearTimeout(clearTimer.current);
      if (!card || !on) {
        clearTimer.current = window.setTimeout(() => box.replaceChildren(), FADE_MS);
        return;
      }
      if (fresh || !card.src) box.replaceChildren();
      if (!card.src || !card.ready) return;
      const img = cached(card.src);
      if (!img || box.lastElementChild === img) return;
      /* at most two captures stack: the one showing now and the one landing over it */
      while (box.firstElementChild && box.firstElementChild !== box.lastElementChild) box.firstElementChild.remove();
      img.classList.add('is-in');
      box.append(img);
      /* the flush registers opacity 0 before the class goes, so the release transitions */
      void getComputedStyle(img).opacity;
      img.classList.remove('is-in');
      window.clearTimeout(sweepTimer.current);
      sweepTimer.current = window.setTimeout(() => {
        while (box.firstElementChild && box.firstElementChild !== box.lastElementChild) box.firstElementChild.remove();
      }, FADE_MS);
    },
    { dependencies: [card?.on, card?.id, card?.src, card?.ready] }
  );

  if (!host) return null;

  return createPortal(
    <div
      className={cn('pt-preview', card?.on && 'is-on', card?.on && card.moved && 'is-moving')}
      style={card ? { transform: `translate3d(${card.x}px, ${card.y}px, 0)` } : undefined}
      aria-hidden='true'
    >
      <div className={cn('pt-preview-frame', card?.solo && 'is-solo')}>
        <span className='pt-preview-plate'>{card?.initial ?? ''}</span>
        <div ref={frame} className='pt-preview-img' />
      </div>
      <div className='pt-preview-title'>{card?.name ?? ''}</div>
    </div>,
    host
  );
}
