/**
 * One requestAnimationFrame clock for every line globe on a page. A loop is
 * created paused on its still, plays while its element is in view and the
 * tab is visible, and pauses on its current frame when either stops. Loops
 * that start in the same frame advance by the same steps, so the two marks
 * of one animation side by side stay in step. Under prefers-reduced-motion
 * a loop keeps its still and arms nothing, and a change to that setting is
 * followed live: turning it on draws the still again and stops the loop.
 *
 * The frames are computed off the main thread by the frame worker
 * (frame-worker.ts), on a grid of GRID_FPS frames a second. The worker
 * starts when a loop comes within one screen of the viewport, so its frames
 * are ready before it shows, and ends with the last loop on the page. The
 * clock keeps every frame it receives while a drawing of its loop is
 * mounted and draws only frames it holds: while a playing loop's next frame
 * has not arrived, every loop keeps its frame and its time, so no loop
 * skips a frame of the design and loops that started together stay in
 * step. A frame writes the d of the stroke path and the fill path only when
 * it changed, and the frames of a hold share one string, so a hold costs
 * one reference comparison. If the worker cannot start or fails, every
 * drawing returns to its still and the clock stops, as under reduced
 * motion.
 *
 * The clock follows measured frame cost with glyph-field's governor
 * (src/lib/glyph-field.ts): after a 2.5 s warmup, when 35% of a window of
 * 120 frames take longer than 22 ms, every loop steps down to 30 frames a
 * second. It never steps back up.
 */
import { REDUCED_MOTION_QUERY } from '@/lib/reduced-motion';
import { scrollRoot } from '@/lib/scroll-root';

import type { FromWorker, ToWorker } from './frame-worker';
import type { LinePaths, MarkId } from './geometry';
import type { LineAnimationId } from './line-loop';
import { GRID_FPS } from './line-loop';

/** One loop on a page: its animation and mark, which key its frames, and its length in seconds. */
export type Loop = { readonly animation: LineAnimationId; readonly mark: MarkId; readonly duration: number };
/** The two paths a loop writes: the stroke at the lines' weight and the fill. */
export type LoopPaths = { readonly stroke: SVGPathElement; readonly fill: SVGPathElement };

/** One playing drawing: whether its frame dt seconds on has arrived, and the step there. */
type Runner = { ready: (dt: number) => boolean; advance: (dt: number) => void };

/** Seconds: the largest step one frame takes, so a stalled tab resumes where it paused instead of jumping. */
const MAX_STEP = 0.1;
/** A loop this close to the viewport has its frames computed: one screen above it and one below. */
const NEAR = '100% 0px';

/* The frame-time governor, glyph-field's pattern: it judges raw rAF cadence,
   so a tick that draws nothing new still counts, and skips a gap longer than
   GOV_GAP_MS as a hidden tab. */
const GOV_BUDGET_MS = 22;
const GOV_WINDOW = 120;
const GOV_TRIP = 0.35;
const GOV_WARMUP_MS = 2500;
const GOV_GAP_MS = 900;

/** One loop's grid frames, kept while a drawing of the loop is mounted. Frame 0 is the still, read from the markup. */
type Frames = { readonly id: number; readonly loop: Loop; readonly count: number; mounted: number; wanted: number; readonly list: (LinePaths | undefined)[] };
const kept = new Map<string, Frames>();
const byId = new Map<number, Frames>();
let nextId = 1;

let worker: Worker | null = null;
/** Set when the worker could not start or failed: every drawing then shows its still and no loop plays again. */
let workerFailed = false;

const playing = new Set<Runner>();
/** Each mounted drawing's return to its still. */
const stills = new Set<() => void>();
let raf = 0;
let last = 0;
/** Grid frames one drawn frame spans: 1 at 60 frames a second, 2 once the governor steps down to 30. */
let step = 1;
let govBornAt = 0;
let govCount = 0;
let govOver = 0;

function post(message: ToWorker) {
  worker?.postMessage(message);
}

function receive({ data }: MessageEvent<FromWorker>) {
  const frames = byId.get(data.id);
  if (!frames) return;
  for (const sent of data.frames) frames.list[sent[0]] = sent.length === 2 ? frames.list[sent[1]] : { stroke: sent[1], fill: sent[2] };
}

/** The worker could not start or failed: the clock stops and every drawing shows its still, not the frame it was on. */
function fail() {
  workerFailed = true;
  worker?.terminate();
  worker = null;
  playing.clear();
  cancelAnimationFrame(raf);
  raf = 0;
  last = 0;
  govBornAt = 0;
  for (const toStill of stills) toStill();
}

function startWorker(): Worker | null {
  if (worker || workerFailed) return worker;
  try {
    worker = new Worker(new URL('./frame-worker.ts', import.meta.url), { type: 'module' });
  } catch {
    fail();
    return null;
  }
  worker.addEventListener('message', receive);
  worker.addEventListener('error', fail);
  if (step > 1) post({ type: 'step', step });
  return worker;
}

/** Asks the worker for a loop's frames from grid frame `from` on. */
function want(frames: Frames, from: number) {
  if (!startWorker()) return;
  const { animation, mark } = frames.loop;
  post({ type: 'want', id: frames.id, animation, mark, count: frames.count, from: from % frames.count });
}

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
  if (govOver / govCount >= GOV_TRIP) {
    step = 2;
    post({ type: 'step', step });
  }
  govCount = 0;
  govOver = 0;
}

function tick(now: number) {
  const dtMs = last ? now - last : 0;
  if (last) govern(now, dtMs);
  last = now;
  const dt = Math.min(MAX_STEP, dtMs / 1000);
  const runners = [...playing];
  if (runners.every((runner) => runner.ready(dt))) for (const runner of runners) runner.advance(dt);
  raf = playing.size ? requestAnimationFrame(tick) : 0;
  if (!raf) {
    last = 0;
    govBornAt = 0;
  }
}

function wake() {
  if (!raf && playing.size) raf = requestAnimationFrame(tick);
}

function keep(key: string, loop: Loop, rest: LinePaths): Frames {
  const frames: Frames = { id: nextId++, loop, count: Math.round(loop.duration * GRID_FPS), mounted: 0, wanted: 0, list: [rest] };
  kept.set(key, frames);
  byId.set(frames.id, frames);
  return frames;
}

/** Plays a loop into its paths while `watch` is in view. Returns the stop, which leaves the frame on screen. */
export function playLoop(watch: Element, loop: Loop, paths: LoopPaths): () => void {
  /* the markup draws the still, so the path data at mount is the still and frame 0 */
  const rest: LinePaths = { stroke: paths.stroke.getAttribute('d') ?? '', fill: paths.fill.getAttribute('d') ?? '' };
  const written = { ...rest };
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
  const key = `${loop.animation}-${loop.mark}`;
  const frames = kept.get(key) ?? keep(key, loop, rest);
  frames.mounted += 1;
  const { count, list } = frames;
  let t = 0;
  let shown = 0;
  let inView = false;
  let near = false;
  let wanting = false;
  /* the grid frame dt seconds on */
  const at = (dt: number) => (Math.floor((((t + dt) % loop.duration) * GRID_FPS) / step) * step) % count;
  const toStill = () => {
    t = 0;
    shown = 0;
    draw(rest);
  };
  stills.add(toStill);
  const runner: Runner = {
    ready: (dt) => Boolean(list[at(dt)]),
    advance(dt) {
      const i = at(dt);
      t = (t + dt) % loop.duration;
      const frame = list[i];
      if (i === shown || !frame) return;
      shown = i;
      draw(frame);
    },
  };
  const reduce = window.matchMedia(REDUCED_MOTION_QUERY);
  const sync = () => {
    const live = !reduce.matches && document.visibilityState === 'visible';
    const wants = live && (near || inView);
    if (wants !== wanting) {
      wanting = wants;
      frames.wanted += wants ? 1 : -1;
      if (wants && frames.wanted === 1) want(frames, shown + step);
      else if (!wants && !frames.wanted) post({ type: 'pause', id: frames.id });
    }
    if (live && inView && !workerFailed) {
      playing.add(runner);
      wake();
    } else playing.delete(runner);
  };
  let watchers: IntersectionObserver[] = [];
  const arm = () => {
    if (watchers.length) return;
    watchers = [
      new IntersectionObserver((entries) => {
        for (const e of entries) inView = e.isIntersecting;
        sync();
      }),
      new IntersectionObserver(
        (entries) => {
          for (const e of entries) near = e.isIntersecting;
          sync();
        },
        { root: scrollRoot(watch), rootMargin: NEAR }
      ),
    ];
    for (const w of watchers) w.observe(watch);
    document.addEventListener('visibilitychange', sync);
  };
  const disarm = () => {
    if (!watchers.length) return;
    for (const w of watchers) w.disconnect();
    watchers = [];
    inView = false;
    near = false;
    document.removeEventListener('visibilitychange', sync);
    sync();
  };
  const onReduce = () => {
    if (!reduce.matches) {
      arm();
      return;
    }
    disarm();
    toStill();
  };
  if (!reduce.matches) arm();
  reduce.addEventListener('change', onReduce);
  return () => {
    disarm();
    reduce.removeEventListener('change', onReduce);
    stills.delete(toStill);
    frames.mounted -= 1;
    if (frames.mounted) return;
    kept.delete(key);
    byId.delete(frames.id);
    post({ type: 'end', id: frames.id });
    if (kept.size) return;
    worker?.terminate();
    worker = null;
  };
}
