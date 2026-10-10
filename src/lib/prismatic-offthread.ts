import { FRAG, type PrismaticParams, UNIFORM_KEYS, VERT } from './prismatic-field';
import { fieldWorker, type OffThreadMessage, type OffThreadReply } from './prismatic-worker';

/**
 * Hands a field's canvas to the prismatic worker (prismatic-worker.ts) and
 * keeps it sized and paused like the shared engine does: drawn at the
 * canvas's CSS size times dpr, and idle while it is more than 120px off
 * screen or the tab is hidden. One worker serves every such field on the
 * page and ends with the last of them.
 *
 * A canvas can be transferred only once. React runs a layout effect twice
 * in development and again when its dependencies change, so removal waits
 * one task, and a field created again on the same canvas in that time
 * picks up the canvas the worker already holds.
 */
export type OffThreadOptions = {
  params: PrismaticParams;
  dpr: number;
  speed: number;
  /** False under reduced motion: the worker draws the static frame. */
  animate: boolean;
  /** The field's first frame is on its canvas. */
  onDrawn: () => void;
  /** The worker could not draw this canvas; the caller can draw a new one. */
  onFail: () => void;
};

type Entry = {
  id: number;
  options: OffThreadOptions;
  removal: number;
  resize: () => void;
  remove: () => void;
  handle: { destroy: () => void };
};

let worker: Worker | null = null;
let workerUrl = '';
let nextId = 1;
const entries = new Map<HTMLCanvasElement, Entry>();

function post(message: OffThreadMessage, transfer: Transferable[] = []) {
  worker?.postMessage(message, transfer);
}

/**
 * Starts the worker ahead of its first field, so it can boot while the page
 * is still busy. A worker that no field joins stays idle until the page goes.
 */
export function startFieldWorker(): Worker | null {
  if (worker) return worker;
  if (typeof OffscreenCanvas === 'undefined') return null;
  workerUrl = URL.createObjectURL(
    new Blob([`(${fieldWorker.toString()})()`], { type: 'text/javascript' })
  );
  try {
    worker = new Worker(workerUrl);
  } catch {
    URL.revokeObjectURL(workerUrl);
    return null;
  }
  worker.onmessage = ({ data }: MessageEvent<OffThreadReply>) => {
    for (const entry of entries.values()) {
      if (entry.id !== data.id) continue;
      if (data.type === 'drawn') entry.options.onDrawn();
      else entry.options.onFail();
    }
  };
  worker.onerror = () => {
    for (const entry of entries.values()) entry.options.onFail();
  };
  post({ type: 'init', vert: VERT, frag: FRAG, keys: UNIFORM_KEYS });
  return worker;
}

/** Null when this browser cannot draw a canvas in a worker. */
export function createOffThreadField(
  canvas: HTMLCanvasElement,
  options: OffThreadOptions
): { destroy: () => void } | null {
  const held = entries.get(canvas);
  if (held) {
    window.clearTimeout(held.removal);
    held.removal = 0;
    held.options = options;
    post({ type: 'config', id: held.id, params: options.params, speed: options.speed });
    held.resize();
    return held.handle;
  }

  if (!('transferControlToOffscreen' in canvas) || !startFieldWorker()) return null;
  let offscreen: OffscreenCanvas;
  try {
    offscreen = canvas.transferControlToOffscreen();
  } catch {
    return null;
  }

  const id = nextId++;
  const sizeOf = (dpr: number) => ({
    width: Math.max(1, Math.floor((canvas.clientWidth || 1) * dpr)),
    height: Math.max(1, Math.floor((canvas.clientHeight || 1) * dpr)),
  });
  let size = sizeOf(options.dpr);
  post(
    {
      type: 'add',
      id,
      canvas: offscreen,
      ...size,
      params: options.params,
      speed: options.speed,
      animate: options.animate,
    },
    [offscreen]
  );

  let near = true;
  let shown = true;
  const show = () => {
    const on = near && !document.hidden;
    if (on === shown) return;
    shown = on;
    post({ type: 'show', id, on });
  };
  const nearby = new IntersectionObserver(
    (records) => {
      const record = records[records.length - 1];
      if (!record) return;
      near = record.isIntersecting;
      show();
    },
    { rootMargin: '120px' }
  );
  nearby.observe(canvas);
  document.addEventListener('visibilitychange', show);
  show();

  const entry: Entry = {
    id,
    options,
    removal: 0,
    resize: () => {
      const next = sizeOf(entry.options.dpr);
      if (next.width === size.width && next.height === size.height) return;
      size = next;
      post({ type: 'size', id, ...size });
    },
    remove: () => {
      resizes.disconnect();
      nearby.disconnect();
      document.removeEventListener('visibilitychange', show);
      entries.delete(canvas);
      post({ type: 'remove', id });
      if (entries.size === 0) {
        worker?.terminate();
        worker = null;
        URL.revokeObjectURL(workerUrl);
      }
    },
    handle: {
      destroy: () => {
        window.clearTimeout(entry.removal);
        entry.removal = window.setTimeout(entry.remove, 0);
      },
    },
  };
  const resizes = new ResizeObserver(() => entry.resize());
  resizes.observe(canvas);
  entries.set(canvas, entry);
  return entry.handle;
}
