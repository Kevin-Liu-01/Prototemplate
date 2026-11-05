/**
 * One requestAnimationFrame clock for every line globe on a page. A loop is
 * created paused on its still, plays while its element is in view and the
 * tab is visible, and pauses on its current frame when either stops. Loops
 * that start in the same frame advance by the same steps, so the two marks
 * of one animation side by side stay in step. Under prefers-reduced-motion
 * a loop keeps its still and arms nothing, and a change to that setting is
 * followed live: turning it on draws the still and stops the loop.
 *
 * Every frame is a pure function of time, so a loop draws on a grid of 60
 * frames a second and computes each grid frame once. A display faster than
 * 60 Hz draws nothing new between grid steps. The frames of one animation
 * and mark are kept while a drawing of it is mounted, and in idle time the
 * clock computes the next second of each playing loop, so the frames where
 * many lines move are ready before they show. A frame writes the d of the
 * stroke path and the fill path only when it changed, and the frames of a
 * hold share one string, so a hold costs one reference comparison.
 *
 * The clock follows measured frame cost with glyph-field's governor
 * (src/lib/glyph-field.ts): after a 2.5 s warmup, when 35% of a window of
 * 120 frames take longer than 22 ms, every loop steps down to 30 frames a
 * second. It never steps back up.
 */
import { REDUCED_MOTION_QUERY } from '@/lib/reduced-motion';

import type { LinePaths } from './geometry';

/** One loop on a page: the key its frames are kept under (its animation and mark), its length in seconds, its frame at t and its still. */
export type Loop = { readonly key: string; readonly duration: number; readonly frame: (t: number) => LinePaths; readonly still: () => LinePaths };
/** The two paths a loop writes: the stroke at the lines' weight and the fill. */
export type LoopPaths = { readonly stroke: SVGPathElement; readonly fill: SVGPathElement };

type Runner = { advance: (dt: number) => void; fill: (deadline: IdleDeadline) => boolean };

/** Frames a second on the grid every loop draws on. */
const FPS = 60;
/** Seconds: the largest step one frame takes, so a stalled tab resumes where it paused instead of jumping. */
const MAX_STEP = 0.1;
/** Grid frames computed ahead of each playing loop in idle time: one second. */
const AHEAD = FPS;
/** Milliseconds of an idle period left unused, so computing ahead never delays the next frame. */
const IDLE_SPARE = 2;

/* The frame-time governor, glyph-field's pattern: it judges raw rAF cadence,
   so a tick that draws nothing new still counts, and skips a gap longer than
   GOV_GAP_MS as a hidden tab. */
const GOV_BUDGET_MS = 22;
const GOV_WINDOW = 120;
const GOV_TRIP = 0.35;
const GOV_WARMUP_MS = 2500;
const GOV_GAP_MS = 900;

/** One loop's grid frames, kept while a drawing of the loop is mounted. */
type Frames = { mounted: number; computed: number; list: (LinePaths | undefined)[] };
const kept = new Map<string, Frames>();

const playing = new Set<Runner>();
let raf = 0;
let last = 0;
let idle = 0;
/** Grid frames one drawn frame spans: 1 at 60 frames a second, 2 once the governor steps down to 30. */
let step = 1;
let govBornAt = 0;
let govCount = 0;
let govOver = 0;

function govern(now: number, dtMs: number) {
  if (step > 1 || dtMs > GOV_GAP_MS) return;
  if (!govBornAt) {
    govBornAt = now;
    return;
  }
  if (now - govBornAt < GOV_WARMUP_MS) return;
  govCount += 1;
  if (dtMs > GOV_BUDGET_MS) govOver += 1;
  if (govCount < GOV_WINDOW) return;
  if (govOver / govCount >= GOV_TRIP) step = 2;
  govCount = 0;
  govOver = 0;
}

function fillAhead(deadline: IdleDeadline) {
  idle = 0;
  for (const runner of playing) if (!runner.fill(deadline)) return;
}

function tick(now: number) {
  const dtMs = last ? now - last : 0;
  if (last) govern(now, dtMs);
  last = now;
  for (const runner of [...playing]) runner.advance(Math.min(MAX_STEP, dtMs / 1000));
  raf = playing.size ? requestAnimationFrame(tick) : 0;
  if (!raf) {
    last = 0;
    govBornAt = 0;
  } else if (!idle && typeof requestIdleCallback === 'function') idle = requestIdleCallback(fillAhead);
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
  const count = Math.round(loop.duration * FPS);
  const frames = kept.get(loop.key) ?? { mounted: 0, computed: 0, list: [] };
  frames.mounted += 1;
  kept.set(loop.key, frames);
  /* the grid frame i, computed once; a frame equal to the one before it keeps that one's strings */
  const frameAt = (i: number): LinePaths => {
    const known = frames.list[i];
    if (known) return known;
    const frame = loop.frame(i / FPS);
    const before = frames.list[i - 1];
    const held = before && before.stroke === frame.stroke && before.fill === frame.fill ? before : frame;
    frames.list[i] = held;
    frames.computed += 1;
    return held;
  };
  let t = 0;
  let shown = 0;
  let inView = false;
  const runner: Runner = {
    advance(dt) {
      t = (t + dt) % loop.duration;
      const i = (Math.floor((t * FPS) / step) * step) % count;
      if (i === shown) return;
      shown = i;
      draw(frameAt(i));
    },
    fill(deadline) {
      if (frames.computed >= count) return true;
      for (let k = step; k <= AHEAD; k += step) {
        const i = (shown + k) % count;
        if (frames.list[i]) continue;
        if (deadline.timeRemaining() < IDLE_SPARE) return false;
        frameAt(i);
      }
      return true;
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
    shown = 0;
    draw(loop.still());
  };
  if (!reduce.matches) arm();
  reduce.addEventListener('change', onReduce);
  return () => {
    disarm();
    reduce.removeEventListener('change', onReduce);
    frames.mounted -= 1;
    if (!frames.mounted) kept.delete(loop.key);
  };
}
