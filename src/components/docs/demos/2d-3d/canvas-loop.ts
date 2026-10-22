import { costMeter, watchPresence, type Presence } from './presence';

/**
 * The lifecycle of a canvas 2D piece on the 2D and 3D pages, the 2D
 * counterpart of dither-stage.ts. The engine supplies three functions:
 * resize() when the host's box or pixel ratio changes, step() to advance
 * its own state by a delta in seconds, and paint() to draw the state it
 * holds. The loop calls step and paint once per animation frame while the
 * host is on screen, the tab is visible and the plate is playing; it
 * stops otherwise, and under reduced motion it paints the engine's still
 * once and repaints only when asked (a control, a pointer). The first
 * paint happens synchronously at creation, so a piece never shows an
 * empty frame before its first animation frame.
 */

export type CanvasEngine = {
  resize: (state: Presence) => void;
  step: (delta: number) => void;
  paint: () => void;
  /** pose the engine as its designed still, for reduced motion and the Still toggle */
  still: () => void;
  /** releases what the engine holds beyond garbage collection (bitmaps) */
  dispose?: () => void;
};

export type CanvasLoopOptions = {
  host: HTMLElement;
  engine: CanvasEngine;
  playing?: boolean;
  onCost?: (ms: number) => void;
};

export type CanvasLoopHandle = {
  setPlaying: (playing: boolean) => void;
  setSpeed: (speed: number) => void;
  /** paint once soon, without stepping */
  invalidate: () => void;
  /** the loop is stepping the engine every frame */
  running: () => boolean;
  presence: () => Presence;
  destroy: () => void;
};

export function createCanvasLoop({ host, engine, playing: start = true, onCost }: CanvasLoopOptions): CanvasLoopHandle {
  let playing = start;
  let speed = 1;
  let loop = 0;
  let once = 0;
  let last = 0;
  let posedStill = false;
  const meter = costMeter(onCost);

  const presence = watchPresence({
    el: host,
    onChange: () => sync(),
    onResize: (state) => {
      engine.resize(state);
      if (posedStill) engine.still();
      invalidate();
    },
  });

  const running = () => presence.state.visible && !presence.state.hidden && playing && !presence.state.reduced;

  function frame(delta: number) {
    const begin = performance.now();
    if (delta > 0) engine.step(delta);
    engine.paint();
    meter(performance.now() - begin);
  }

  function tick(now: number) {
    loop = 0;
    if (!running()) return;
    const delta = last ? Math.min(0.05, (now - last) / 1000) * speed : 0;
    last = now;
    frame(delta);
    loop = requestAnimationFrame(tick);
  }

  function invalidate() {
    if (loop || once) return;
    once = requestAnimationFrame(() => {
      once = 0;
      frame(0);
    });
  }

  function sync() {
    const still = !playing || presence.state.reduced;
    if (still && !posedStill) {
      engine.still();
      posedStill = true;
      invalidate();
    } else if (!still) posedStill = false;
    if (running()) {
      if (!loop) {
        last = 0;
        loop = requestAnimationFrame(tick);
      }
    } else if (loop) {
      cancelAnimationFrame(loop);
      loop = 0;
    }
  }

  engine.resize(presence.state);
  if (presence.state.reduced || !playing) {
    engine.still();
    posedStill = true;
  }
  frame(0);

  return {
    setPlaying(next) {
      playing = next;
      sync();
    },
    setSpeed(next) {
      speed = next;
    },
    invalidate,
    running: () => loop !== 0,
    presence: () => presence.state,
    destroy() {
      presence.dispose();
      if (loop) cancelAnimationFrame(loop);
      if (once) cancelAnimationFrame(once);
      loop = 0;
      once = 0;
      engine.dispose?.();
    },
  };
}
