/**
 * What every engine on the 2D and 3D pages needs to know about its host,
 * from one place: whether the host is near the viewport (the WebGL plates
 * create their context there and release it past it), whether any of it is
 * on screen (loops run only then), whether the tab is hidden, whether the
 * reader asks for reduced motion, and the host's size and pixel ratio.
 * Browser zoom changes devicePixelRatio without resizing the box, so a
 * resolution query is armed for the current ratio and re-armed on every
 * change, as the shared glyph field does.
 */

import { onReducedMotionChange, prefersReducedMotion } from '@/lib/reduced-motion';

export type Presence = {
  near: boolean;
  visible: boolean;
  hidden: boolean;
  reduced: boolean;
  width: number;
  height: number;
  /** devicePixelRatio, capped at 2 */
  dpr: number;
};

export type PresenceOptions = {
  el: HTMLElement;
  /** how far outside the viewport counts as near; 300px above and below by default */
  nearMargin?: string;
  onChange: (state: Presence) => void;
  onResize: (state: Presence) => void;
};

export const MAX_DPR = 2;

/** The device pixel ratio the plates draw at, capped at MAX_DPR. */
export function readDpr(): number {
  return Math.min(MAX_DPR, Math.max(1, window.devicePixelRatio || 1));
}

export function watchPresence({ el, nearMargin = '300px 0px', onChange, onResize }: PresenceOptions): { state: Presence; dispose: () => void } {
  const state: Presence = {
    near: false,
    visible: false,
    hidden: document.hidden,
    reduced: prefersReducedMotion(),
    width: el.clientWidth,
    height: el.clientHeight,
    dpr: readDpr(),
  };

  const changed = () => onChange(state);

  const near = new IntersectionObserver(
    (entries) => {
      const last = entries[entries.length - 1];
      if (!last || last.isIntersecting === state.near) return;
      state.near = last.isIntersecting;
      changed();
    },
    { rootMargin: nearMargin }
  );
  const seen = new IntersectionObserver((entries) => {
    const last = entries[entries.length - 1];
    if (!last || last.isIntersecting === state.visible) return;
    state.visible = last.isIntersecting;
    changed();
  });
  near.observe(el);
  seen.observe(el);

  const onVisibility = () => {
    state.hidden = document.hidden;
    changed();
  };
  document.addEventListener('visibilitychange', onVisibility);

  const stopReduced = onReducedMotionChange(() => {
    state.reduced = prefersReducedMotion();
    changed();
  });

  let frame = 0;
  const measure = () => {
    frame = 0;
    const width = el.clientWidth;
    const height = el.clientHeight;
    const dpr = readDpr();
    if (width === state.width && height === state.height && dpr === state.dpr) return;
    state.width = width;
    state.height = height;
    state.dpr = dpr;
    onResize(state);
  };
  const queue = () => {
    if (!frame) frame = requestAnimationFrame(measure);
  };
  const sizes = new ResizeObserver(queue);
  sizes.observe(el);

  let zoom: MediaQueryList | null = null;
  const armZoom = () => {
    zoom?.removeEventListener('change', onZoom);
    zoom = window.matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`);
    zoom.addEventListener('change', onZoom);
  };
  function onZoom() {
    armZoom();
    queue();
  }
  armZoom();

  return {
    state,
    dispose: () => {
      near.disconnect();
      seen.disconnect();
      sizes.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      stopReduced();
      zoom?.removeEventListener('change', onZoom);
      if (frame) cancelAnimationFrame(frame);
    },
  };
}

/** Exponential moving average of a frame's main-thread cost, reported at most twice a second. */
export function costMeter(report?: (ms: number) => void): (ms: number) => void {
  let avg = -1;
  let last = 0;
  return (ms) => {
    avg = avg < 0 ? ms : avg * 0.9 + ms * 0.1;
    const now = performance.now();
    if (report && now - last > 500) {
      last = now;
      report(avg);
    }
  };
}
