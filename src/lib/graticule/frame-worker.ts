/**
 * The line globe frames, computed off the page's main thread. The loop
 * clock (loop-clock.ts) starts this worker when a line globe comes within
 * one screen of the viewport and ends it with the last line globe on the
 * page. For each loop the page wants, the worker computes the grid frames
 * in order from the frame the page asks for, a few milliseconds at a time,
 * and posts each slice's frames back. Every frame is computed once, a loop
 * the page pauses keeps its place, and a frame equal to the one computed
 * before it is sent as that frame's index, so a hold shares one string on
 * the page. Frame 0 is the still, which the page already draws.
 */
import type { MarkId } from './geometry';
import { LINE_ANIMATIONS } from './line-animations';
import type { LineAnimationId } from './line-loop';
import { GRID_FPS } from './line-loop';

/** What the page asks: compute a loop's frames from grid frame `from` on, pause or forget a loop, or keep to every `step`th grid frame. */
export type ToWorker =
  | { readonly type: 'want'; readonly id: number; readonly animation: LineAnimationId; readonly mark: MarkId; readonly count: number; readonly from: number }
  | { readonly type: 'pause' | 'end'; readonly id: number }
  | { readonly type: 'step'; readonly step: number };

/** One computed grid frame: its index with its stroke and fill, or its index with the index of an earlier frame it equals. */
export type SentFrame = readonly [i: number, stroke: string, fill: string] | readonly [i: number, same: number];
/** One slice's frames of one loop. */
export type FromWorker = { readonly id: number; readonly frames: readonly SentFrame[] };

/** Milliseconds of computing between two looks at the page's messages. */
const SLICE_MS = 8;

type Job = {
  readonly animation: LineAnimationId;
  readonly mark: MarkId;
  readonly count: number;
  /** 1 where the grid frame is computed or, for frame 0, already on the page */
  readonly done: Uint8Array;
  cursor: number;
  active: boolean;
  /** the last frame computed that differed from the one before it, which an equal frame points at */
  last: { readonly i: number; readonly stroke: string; readonly fill: string };
  out: SentFrame[];
};

const jobs = new Map<number, Job>();
let step = 1;
let queued = false;
/* a channel posting to itself runs the next slice after the page's waiting messages, without a timer's 4 ms clamp */
const pump = new MessageChannel();

function queue() {
  if (queued) return;
  queued = true;
  pump.port2.postMessage(0);
}

/** The job's next grid frame on the current step that is not yet computed, from its cursor on, or -1 when every one is. */
function nextFrame(job: Job): number {
  const start = job.cursor - (job.cursor % step);
  for (let k = 0; k < job.count; k += step) {
    const i = (start + k) % job.count;
    if (!job.done[i]) return i;
  }
  return -1;
}

/** Computes the job's next frame; false when it has none left. */
function computeNext(job: Job): boolean {
  const i = nextFrame(job);
  if (i < 0) return false;
  const { stroke, fill } = LINE_ANIMATIONS[job.animation].frame(i / GRID_FPS, job.mark);
  if (stroke === job.last.stroke && fill === job.last.fill) job.out.push([i, job.last.i]);
  else {
    job.out.push([i, stroke, fill]);
    job.last = { i, stroke, fill };
  }
  job.done[i] = 1;
  job.cursor = (i + step) % job.count;
  return true;
}

/* one frame of each wanted loop in turn, so loops that play side by side fill at one pace */
function slice() {
  queued = false;
  const end = performance.now() + SLICE_MS;
  let busy = true;
  while (busy && performance.now() < end) {
    busy = false;
    for (const job of jobs.values()) if (job.active && computeNext(job)) busy = true;
  }
  for (const [id, job] of jobs) {
    if (!job.out.length) continue;
    const reply: FromWorker = { id, frames: job.out };
    self.postMessage(reply);
    job.out = [];
  }
  if (busy) queue();
}

function want({ id, animation, mark, count, from }: Extract<ToWorker, { type: 'want' }>) {
  let job = jobs.get(id);
  if (!job) {
    const rest = LINE_ANIMATIONS[animation].still(mark);
    job = { animation, mark, count, done: new Uint8Array(count), cursor: 0, active: true, last: { i: 0, stroke: rest.stroke, fill: rest.fill }, out: [] };
    job.done[0] = 1;
    jobs.set(id, job);
  }
  job.cursor = from % count;
  job.active = true;
  queue();
}

pump.port1.onmessage = slice;

self.addEventListener('message', ({ data }: MessageEvent<ToWorker>) => {
  if (data.type === 'want') want(data);
  else if (data.type === 'step') step = data.step;
  else if (data.type === 'end') jobs.delete(data.id);
  else {
    const job = jobs.get(data.id);
    if (job) job.active = false;
  }
});
