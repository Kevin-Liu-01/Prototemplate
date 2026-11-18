/**
 * One requestAnimationFrame loop for every turning loader on a page
 * (GtLogoArmillary and GtLogoAscii). A loader subscribes a tick that takes
 * the clock's time in seconds; the loop runs only while a tick is
 * subscribed, stops with the tab (rAF does) and never reads layout. Each
 * loader keeps its own lap time, so pausing one out of view (it simply
 * unsubscribes) leaves the others running.
 */
type Tick = (now: number) => void;

const ticks = new Set<Tick>();
let frame = 0;

function run(ms: number) {
  frame = 0;
  const now = ms / 1000;
  for (const tick of ticks) tick(now);
  if (ticks.size > 0) frame = requestAnimationFrame(run);
}

/** Calls `tick` on every animation frame until the returned function is called. */
export function subscribeLogoClock(tick: Tick): () => void {
  ticks.add(tick);
  if (!frame) frame = requestAnimationFrame(run);
  return () => {
    ticks.delete(tick);
    if (ticks.size === 0 && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  };
}

/** True when the reader asks for reduced motion. */
export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Runs `start` while `el` is on screen and motion is allowed, and the
 * function it returns when it leaves or motion is turned down. Returns the
 * cleanup for the whole watch.
 */
export function whileVisible(el: Element, start: () => () => void): () => void {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  let stop: (() => void) | null = null;
  let visible = false;
  const sync = () => {
    const run = visible && !reduce.matches;
    if (run && !stop) stop = start();
    if (!run && stop) {
      stop();
      stop = null;
    }
  };
  const io = new IntersectionObserver((entries) => {
    visible = entries.some((entry) => entry.isIntersecting);
    sync();
  });
  io.observe(el);
  reduce.addEventListener('change', sync);
  return () => {
    io.disconnect();
    reduce.removeEventListener('change', sync);
    if (stop) stop();
    stop = null;
  };
}
