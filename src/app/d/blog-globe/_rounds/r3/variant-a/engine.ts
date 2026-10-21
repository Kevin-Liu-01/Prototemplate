/**
 * Variant A's engine (GlobeA.tsx mounts it). The radios under the language
 * links own the choice and CSS shows the checked passage and label, so the
 * figure reads without it; this adds the globe, the turn, the text step,
 * the keys and the optional tour.
 *
 * One clock: a pick starts one timeline. The camera turns the short way
 * round on power2.inOut (field.ts), and a long turn pulls back and closes
 * in again on the same curve (zoomAt). Centred on the turn, the label and
 * then the passage's rows step from the old stop to the new one through the
 * 8 by 8 screen, 150 ms a row and 55 ms apart, as the Versions figure's
 * rows do (rowK; mount-passage.ts runs on this clock). The label sits
 * under the window, so the field gives way only to the pin, which leaves
 * its place while the ground moves under it and prints again on arrival. A
 * pick mid-turn retargets from the camera and the rows on screen. A click
 * on a city dot picks its stop through the shared targets (targets.ts): the
 * field clears a halo for the hovered city's ring, and a city outside the
 * window has no target.
 */
import { DITHER_LEVELS } from '@/app/d/blog-globe/_shared/ditherMask';
import {
  mountPassage,
  type PassageControl,
} from '@/app/d/blog-globe/_rounds/r3/mount-passage';
import { turnToward } from '@/app/d/blog-globe/_rounds/r3/ortho';
import { STOPS } from '@/app/d/blog-globe/_rounds/r3/stops';
import { mountCityTargets } from '@/app/d/blog-globe/_rounds/r3/targets';
import {
  loadMasks,
  rowK,
  setMask,
  STAGGER_MS,
  STEP_MS,
  stepIndex,
  type Masks,
} from '@/app/d/blog-globe/_shared/versions-field';

import {
  aim,
  arcDegrees,
  CELL,
  clearMap,
  drawCities,
  drawGlobe,
  easeInOut,
  makeDisc,
  nearDepth,
  setZoom,
  spinMs,
  textDelay,
  ZOOM,
  zoomAt,
  type ClearBox,
  type DiscGrid,
} from './field';

import type { GlobeCamera } from '@/app/d/blog-globe/_rounds/r3/ortho';

const DONE = Number.MAX_SAFE_INTEGER; // a step time past every row's end

/** A #rrggbb or #rgb token (the CSS build shortens hex) as one ImageData pixel (ABGR: every browser is little-endian). */
export function pixel(hex: string) {
  const digits = hex.trim().slice(1);
  const full =
    digits.length === 3 ? [...digits].map((d) => d + d).join('') : digits;
  const n = parseInt(full, 16) || 0;
  return (255 << 24) | ((n & 255) << 16) | (n & 0xff00) | ((n >> 16) & 255);
}

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

type Run = {
  start: number;
  from: GlobeCamera;
  to: GlobeCamera;
  /** the zoom on screen when the turn began, and the degrees it crosses */
  zoomFrom: number;
  arc: number;
  spin: number;
  textAt: number;
  /** the stops whose label steps, out and in */
  leave: number;
  enter: number;
  /** the label's mask level at the last frame, -1 before the first */
  level: number;
  raf: number;
};

/** Mounts the figure on its server markup and returns the cleanup. `tour` is the seconds each stop holds after it arrives on the guided tour, 0 for none. */
export function mountGlobeA(fig: HTMLElement, tour: number): () => void {
  const disc = fig.querySelector<HTMLElement>('.ga-disc');
  const canvas = fig.querySelector<HTMLCanvasElement>('.ga-field');
  const links = fig.querySelector<HTMLElement>('.gl');
  const words = fig.querySelector<HTMLElement>('.gp');
  if (!disc || !canvas || !links || !words) return () => undefined;
  const labels = [...fig.querySelectorAll<HTMLElement>('.ga-label')];
  const inputs = [...links.querySelectorAll<HTMLInputElement>('.gl-input')];
  const pin = fig.querySelector<HTMLElement>('.ga-pin');
  const off = new AbortController();
  const listen = { signal: off.signal };
  const cleanups: (() => void)[] = [];
  let zoom = ZOOM;
  // a click on a city checks its radio; the canvas holds whole cells from the top left
  const layer = disc.querySelector<HTMLElement>('.gct');
  const spots = [
    ...(layer?.querySelectorAll<HTMLElement>('.gct-target') ?? []),
  ];
  const targets = mountCityTargets(layer, {
    inputs,
    disc: ({ width }) => {
      const r = (Math.floor(width / CELL) * CELL) / 2;
      return { cx: r, cy: r, radius: r * zoom };
    },
    minDepth: nearDepth(ZOOM),
  });

  let live = false;
  let cur = Math.max(
    0,
    inputs.findIndex((input) => input.checked)
  );
  let shown = cur; // the stop whose label is on screen
  let camera = aim(STOPS[cur] ?? STOPS[0]);
  let run: Run | null = null;
  let steps: Masks | null = null;
  let passage: PassageControl | null = null;
  let ctx: CanvasRenderingContext2D | null = null;
  let grid: DiscGrid = makeDisc(0);
  let image: ImageData | null = null;
  let px = new Uint32Array(0);
  let prints: Uint8Array = new Uint8Array(0);
  let clear: Uint8Array = new Uint8Array(0); // the pin's cut-out
  let inks = [0, 0, 0];
  let pending = 0;
  let hovered = -1; // the city whose target the pointer is over

  /* ---------- the field ---------- */

  // The pin's square and a pixel round it, in CSS px from the window's top left.
  const pinClear = (size: number) => {
    const origin = disc.getBoundingClientRect();
    const boxes = [...(pin?.getClientRects() ?? [])].map(
      (r): ClearBox => ({
        left: r.left - origin.left,
        top: r.top - origin.top,
        right: r.right - origin.left,
        bottom: r.bottom - origin.top,
        pad: 1,
        fall: 0,
      })
    );
    return clearMap(boxes, size);
  };

  const draw = () => {
    if (!ctx || !image) return;
    drawGlobe(grid, camera, clear, prints);
    // the chosen city's target takes no hover ring, so it gets no halo
    const lit = inputs[hovered]?.checked === false ? hovered : -1;
    const drawn = drawCities(grid, camera, STOPS, clear, prints, lit);
    for (let i = 0; i < prints.length; i++) {
      const p = prints[i]!;
      px[i] = p === 0 ? 0 : inks[p - 1]!;
    }
    ctx.putImageData(image, 0, 0);
    targets.update(camera);
    // a city outside the window, or under the pin, has no target
    spots.forEach((el, i) => el.toggleAttribute('data-off', !drawn[i]));
  };

  const measure = () => {
    if (!ctx) return;
    finish();
    const size = Math.max(
      1,
      Math.floor(disc.getBoundingClientRect().width / CELL)
    );
    canvas.width = size;
    canvas.height = size;
    canvas.style.width = `${size * CELL}px`;
    canvas.style.height = `${size * CELL}px`;
    image = ctx.createImageData(size, size);
    px = new Uint32Array(image.data.buffer);
    grid = makeDisc(size, zoom);
    prints = new Uint8Array(size * size);
    clear = pinClear(size);
    draw();
    scheduleTour();
  };

  const readInks = () => {
    const css = getComputedStyle(fig);
    inks = [
      pixel(css.getPropertyValue('--ga-cell-1')),
      pixel(css.getPropertyValue('--ga-cell-2')),
      pixel(css.getPropertyValue('--ga-dot')),
    ];
  };

  // The overlay marks the hovered target; the field clears a halo for its ring.
  const hover = new MutationObserver(() => {
    const next = spots.findIndex((el) => el.hasAttribute('data-hover'));
    if (next === hovered) return;
    hovered = next;
    if (!run) draw(); // a turn draws on its next frame
  });
  if (layer) {
    hover.observe(layer, { subtree: true, attributeFilter: ['data-hover'] });
  }
  cleanups.push(() => hover.disconnect());

  const showOnly = (i: number) => {
    labels.forEach((el, j) => el.toggleAttribute('data-on', j === i));
  };

  /* ---------- the timeline ---------- */

  // Ends the running timeline at its last frame.
  function finish() {
    if (!run) return;
    cancelAnimationFrame(run.raf);
    setMask(labels[run.leave], null);
    setMask(labels[run.enter], null);
    passage?.frame(DONE);
    fig.removeAttribute('data-mixing');
    fig.removeAttribute('data-turning');
    camera = run.to;
    zoom = ZOOM;
    setZoom(grid, zoom);
    shown = run.enter;
    run = null;
    showOnly(shown);
  }

  const tick = () => {
    const r = run;
    if (!r) return;
    const now = performance.now();
    const k = easeInOut((now - r.start) / r.spin);
    camera = turnToward(r.from, r.to, k);
    zoom = zoomAt(k, r.arc, r.zoomFrom);
    setZoom(grid, zoom);
    // the label steps first, then the passage's rows one stagger behind it
    const t = now - r.start - r.textAt;
    const label = rowK(t, 0);
    const level = Math.round(DITHER_LEVELS * label);
    if (r.leave !== r.enter && level !== r.level) {
      r.level = level;
      if (steps) {
        setMask(labels[r.leave], steps.out[level] ?? null);
        setMask(labels[r.enter], steps.in[level] ?? null);
      } else if (label > 0) {
        // the masks are still decoding: cut on the label's turn
        labels[r.leave]?.removeAttribute('data-on');
        labels[r.enter]?.setAttribute('data-on', '');
      }
    }
    const rows = passage?.frame(t - STAGGER_MS) ?? true;
    draw();
    if (now - r.start >= r.spin && label >= 1 && rows) {
      finish();
      draw();
      scheduleTour();
    } else r.raf = requestAnimationFrame(tick);
  };

  const select = (next: number) => {
    if (next === cur) return;
    cur = next;
    if (!live) return; // CSS shows the checked passage until the engine runs
    const now = performance.now();
    const target = aim(STOPS[next] ?? STOPS[0]);
    let leave = shown;
    if (run) {
      // retarget from the frame on screen; a label past half through has arrived
      leave =
        rowK(now - run.start - run.textAt, 0) >= 0.5 ? run.enter : run.leave;
      setMask(labels[run.leave], null);
      setMask(labels[run.enter], null);
      cancelAnimationFrame(run.raf);
      run = null;
    }
    clearTimeout(tourTimer);
    // the passage cuts on its own under reduced motion
    passage?.select(next, 'caller');
    if (reduced()) {
      fig.removeAttribute('data-mixing');
      fig.removeAttribute('data-turning');
      camera = target;
      zoom = ZOOM;
      setZoom(grid, zoom);
      shown = next;
      showOnly(next);
      draw();
      return;
    }
    const arc = arcDegrees(camera, target);
    const spin = spinMs(arc);
    const wordsMs = STAGGER_MS + (passage?.duration ?? STEP_MS);
    run = {
      start: now,
      from: camera,
      to: target,
      zoomFrom: zoom,
      arc,
      spin,
      textAt: textDelay(spin, wordsMs),
      leave,
      enter: next,
      level: -1,
      raf: 0,
    };
    shown = leave;
    showOnly(leave);
    fig.setAttribute('data-turning', '');
    if (leave !== next && steps) {
      // the arriving label waits behind the empty mask for its turn
      fig.setAttribute('data-mixing', '');
      setMask(labels[next], steps.in[0] ?? null);
      labels[next]?.setAttribute('data-on', '');
    }
    tick();
  };

  /* ---------- the tour: the next stop after each hold, until the reader takes over ---------- */

  let tourTimer = 0;
  let touched = false;
  let seen = false;

  function scheduleTour() {
    clearTimeout(tourTimer);
    if (tour <= 0 || touched || !live || run || !seen || reduced()) return;
    if (document.hidden) return;
    fig.setAttribute('data-touring', '');
    tourTimer = window.setTimeout(() => {
      const next = (cur + 1) % inputs.length;
      inputs[next]!.checked = true;
      select(next);
    }, tour * 1000);
  }

  // A pick, a key or a press ends the tour for good.
  const takeOver = () => {
    touched = true;
    clearTimeout(tourTimer);
    fig.removeAttribute('data-touring');
  };

  fig.addEventListener(
    'change',
    (e) => {
      const i = inputs.findIndex((input) => input === e.target);
      if (i < 0) return;
      takeOver();
      select(i);
    },
    listen
  );

  // The keys, here rather than native: WebKit's radios neither wrap nor
  // mirror, and drop the focus ring after the first arrow.
  links.addEventListener(
    'keydown',
    (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const rtl = getComputedStyle(links).direction === 'rtl';
      const next = stepIndex(e.key, cur, inputs.length, rtl);
      const input = inputs[next ?? -1];
      if (next === null || !input) return;
      takeOver();
      e.preventDefault();
      input.checked = true;
      input.focus();
      select(next);
    },
    listen
  );
  links.addEventListener('pointerdown', takeOver, listen);

  /* ---------- lifecycle: draw near the viewport, redraw on resize and theme ---------- */

  const start = () => {
    if (off.signal.aborted) return;
    void loadMasks().then((loaded) => {
      steps = loaded;
    });
    ctx = canvas.getContext('2d');
    if (!ctx) return;
    live = true;
    cur = Math.max(
      0,
      inputs.findIndex((input) => input.checked)
    );
    shown = cur;
    camera = aim(STOPS[cur] ?? STOPS[0]);
    showOnly(cur);
    passage = mountPassage(words, cur);
    cleanups.push(() => passage?.destroy());
    fig.setAttribute('data-live', '');
    readInks();
    measure();

    let first = true;
    const resize = new ResizeObserver(() => {
      // the first call reports the size just measured
      if (first) {
        first = false;
        return;
      }
      cancelAnimationFrame(pending);
      pending = requestAnimationFrame(measure);
    });
    resize.observe(disc);
    const repaint = () => {
      readInks();
      draw();
    };
    const theme = new MutationObserver(repaint);
    theme.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class'],
    });
    matchMedia('(prefers-color-scheme: dark)').addEventListener(
      'change',
      repaint,
      listen
    );
    // the tour steps only while the figure is on screen in a shown tab
    const view = new IntersectionObserver(
      (entries) => {
        seen = entries.some((entry) => entry.isIntersecting);
        if (seen) scheduleTour();
        else clearTimeout(tourTimer);
      },
      { threshold: 0.35 }
    );
    view.observe(fig);
    document.addEventListener(
      'visibilitychange',
      () => (document.hidden ? clearTimeout(tourTimer) : scheduleTour()),
      listen
    );
    cleanups.push(
      () => resize.disconnect(),
      () => theme.disconnect(),
      () => view.disconnect()
    );
  };

  if (typeof IntersectionObserver !== 'undefined') {
    const near = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        near.disconnect();
        void document.fonts.ready.then(start);
      },
      { rootMargin: '100% 0px' }
    );
    near.observe(fig);
    cleanups.push(() => near.disconnect());
  }

  return () => {
    off.abort();
    for (const stop of cleanups) stop();
    targets.destroy();
    clearTimeout(tourTimer);
    cancelAnimationFrame(pending);
    if (run) cancelAnimationFrame(run.raf);
  };
}
