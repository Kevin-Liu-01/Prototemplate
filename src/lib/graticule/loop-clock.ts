/**
 * One requestAnimationFrame clock for every line globe on a page. A loop is
 * created paused on its still, plays while its element is in view and the
 * tab is visible, and pauses on its current frame when either stops. Loops
 * that start in the same frame advance by the same steps, so the two marks
 * of one animation side by side stay in step. Under prefers-reduced-motion
 * a loop keeps its still and arms nothing, and a change to that setting is
 * followed live: turning it on draws the still and stops the loop.
 *
 * A frame writes the d of the stroke path and the fill path, and only when
 * it changed, so a hold costs one string comparison.
 */
import { REDUCED_MOTION_QUERY } from '@/lib/reduced-motion';

import type { LinePaths } from './geometry';

/** One loop on a page: its length in seconds, its frame at t and its still. */
export type Loop = { readonly duration: number; readonly frame: (t: number) => LinePaths; readonly still: () => LinePaths };
/** The two paths a loop writes: the stroke at the lines' weight and the fill. */
export type LoopPaths = { readonly stroke: SVGPathElement; readonly fill: SVGPathElement };

type Runner = { advance: (dt: number) => void };

/** Seconds: the largest step one frame takes, so a stalled tab resumes where it paused instead of jumping. */
const MAX_STEP = 0.1;

const playing = new Set<Runner>();
let raf = 0;
let last = 0;

function tick(now: number) {
  const dt = last ? Math.min(MAX_STEP, (now - last) / 1000) : 0;
  last = now;
  for (const runner of [...playing]) runner.advance(dt);
  raf = playing.size ? requestAnimationFrame(tick) : 0;
  if (!raf) last = 0;
}

function wake() {
  if (!raf && playing.size) raf = requestAnimationFrame(tick);
}

/** Plays a loop into its paths while `watch` is in view. Returns the stop, which leaves the frame on screen. */
export function playLoop(watch: Element, loop: Loop, paths: LoopPaths): () => void {
  const written = { stroke: paths.stroke.getAttribute('d') ?? '', fill: paths.fill.getAttribute('d') ?? '' };
  const draw = (frame: LinePaths) => {
    if (frame.stroke !== written.stroke) {
      paths.stroke.setAttribute('d', frame.stroke);
      written.stroke = frame.stroke;
    }
    if (frame.fill !== written.fill) {
      paths.fill.setAttribute('d', frame.fill);
      written.fill = frame.fill;
    }
  };
  let t = 0;
  let inView = false;
  const runner: Runner = {
    advance(dt) {
      t = (t + dt) % loop.duration;
      draw(loop.frame(t));
    },
  };
  const reduce = window.matchMedia(REDUCED_MOTION_QUERY);
  const sync = () => {
    if (inView && !reduce.matches && document.visibilityState === 'visible') {
      playing.add(runner);
      wake();
    } else playing.delete(runner);
  };
  let io: IntersectionObserver | null = null;
  const arm = () => {
    if (io) return;
    io = new IntersectionObserver((entries) => {
      for (const e of entries) inView = e.isIntersecting;
      sync();
    });
    io.observe(watch);
    document.addEventListener('visibilitychange', sync);
  };
  const disarm = () => {
    playing.delete(runner);
    if (!io) return;
    io.disconnect();
    io = null;
    inView = false;
    document.removeEventListener('visibilitychange', sync);
  };
  const onReduce = () => {
    if (!reduce.matches) {
      arm();
      return;
    }
    disarm();
    t = 0;
    draw(loop.still());
  };
  if (!reduce.matches) arm();
  reduce.addEventListener('change', onReduce);
  return () => {
    disarm();
    reduce.removeEventListener('change', onReduce);
  };
}
