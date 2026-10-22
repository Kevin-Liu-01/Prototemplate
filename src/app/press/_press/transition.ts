/* The move between the shelf and a story, as a view transition: the
   book's cover grows into the story's cover (the stage's or Fuma's
   card's), the rest of the page fades, and the story's text comes in
   the way its look does (press.css, ::view-transition). Going home runs it
   backwards: the story's cover shrinks into its book on the shelf. Euclid
   opens and closes without it (Landing.tsx).

   The page being left names its cover gtp-cover just before the old view
   is captured; the page arriving names its own and calls landed() once it
   has mounted, which lets the transition run. Without view transitions, or
   under reduced motion, it is a plain navigation. */

type Navigate = (href: string) => void;

/** The look the move is going into, read by press.css from <html data-gtp-vt>. */
export type Move = 'docs' | 'fuma' | 'home';

let arrive: (() => void) | null = null;
/** The story a move home came from, so the shelf can name that book's cover. */
let leaving: string | null = null;

/** How long the leaving page waits for the arriving one before the transition runs without it. */
const WAIT_MS = 2500;

function canTransition(): boolean {
  return typeof document !== 'undefined' && 'startViewTransition' in document && !matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Moves to `href` through a view transition. `name` is the element on this
 * page that becomes the arriving page's cover; `from` is the story being
 * left, on a move home.
 */
export function move(navigate: Navigate, href: string, kind: Move, name?: Element | null, from?: string): void {
  if (!canTransition()) {
    navigate(href);
    return;
  }
  const html = document.documentElement;
  html.dataset.gtpVt = kind;
  if (name instanceof HTMLElement) name.style.viewTransitionName = 'gtp-cover';
  leaving = from ?? null;
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
    document.querySelectorAll<HTMLElement>('[style*="view-transition-name"]').forEach((el) => {
      if (!el.matches('.gtp-vt-cover')) el.style.viewTransitionName = '';
    });
    arrive = null;
  });
}

/** Called by the arriving page once it has mounted: the transition can capture it now. */
export function landed(): void {
  arrive?.();
  arrive = null;
}

/** The story a move home is coming from, read once by the shelf. */
export function takeLeaving(): string | null {
  const slug = leaving;
  leaving = null;
  return slug;
}

/** A plain left click: the kind a transition may take over; a modified click opens a tab as usual. */
export function plainClick(e: { button: number; metaKey: boolean; ctrlKey: boolean; shiftKey: boolean; altKey: boolean }): boolean {
  return e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
}
