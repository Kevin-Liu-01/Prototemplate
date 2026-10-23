/* The move between the shelf and a story, as a view transition: a short
   crossfade, the page arriving a few pixels low and settling (press.css,
   ::view-transition). The same move runs going home.

   The leaving page starts the transition; the arriving page calls landed()
   once it has mounted, which lets the transition capture it. Without view
   transitions, or under reduced motion, it is a plain navigation. */

type Navigate = (href: string) => void;

let arrive: (() => void) | null = null;

/** How long the leaving page waits for the arriving one before the transition runs without it: short, so a move never holds the reader (every story is prefetched from the shelf, so it is nearly always ready). */
const WAIT_MS = 700;

function canTransition(): boolean {
  return typeof document !== 'undefined' && 'startViewTransition' in document && !matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Moves to `href` through the press's crossfade. */
export function move(navigate: Navigate, href: string): void {
  if (!canTransition()) {
    navigate(href);
    return;
  }
  const html = document.documentElement;
  // press.css scopes the crossfade to this attribute, so no other view transition on the site takes it
  html.dataset.gtpVt = '';
  const ready = new Promise<void>((resolve) => {
    arrive = resolve;
    window.setTimeout(resolve, WAIT_MS);
  });
  const transition = document.startViewTransition(() => {
    navigate(href);
    return ready;
  });
  void transition.finished.finally(() => {
    delete html.dataset.gtpVt;
    arrive = null;
  });
}

/** Called by the arriving page once it has mounted: the transition can capture it now. */
export function landed(): void {
  arrive?.();
  arrive = null;
}

/** A plain left click: the kind a transition may take over; a modified click opens a tab as usual. */
export function plainClick(e: { button: number; metaKey: boolean; ctrlKey: boolean; shiftKey: boolean; altKey: boolean }): boolean {
  return e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
}
