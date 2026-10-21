/**
 * Variant A's engine (GlobeA.tsx mounts it). The radios own the choice and
 * CSS shows the checked passage, so the figure reads without it; this adds
 * the globe, the turn, the text step, the keys and the optional tour.
 *
 * One clock: a pick starts one timeline. The camera turns the short way
 * round on power2.inOut (field.ts) and the pill's thumb slides on the same
 * curve; at the middle of the turn the label and then the passage step
 * from the old stop to the new one through the 8 by 8 screen, 150 ms a row
 * and 55 ms apart, as the Versions figure's rows do (rowK, ditherMask.ts).
 * The field around the label mixes on the label's curve. The pin leaves
 * its place while the ground moves under it and prints again on arrival.
 * A pick mid-turn retargets from the camera on screen.
 */
import { DITHER_LEVELS, ditherMaskUrl } from '@/app/d/blog-globe/_shared/ditherMask';
import { turnToward } from '@/app/d/blog-globe/_rounds/r1/ortho';
import { STOPS } from '@/app/d/blog-globe/_rounds/r1/stops';
import { rowK, stepIndex } from '@/app/d/blog-globe/_shared/versions-field';

import {
  aim,
  arcDegrees,
  CELL,
  clearMap,
  drawCities,
  drawGlobe,
  easeInOut,
  makeDisc,
  spinMs,
  textDelay,
  type ClearBox,
  type DiscGrid,
} from './field';

import type { GlobeCamera } from '@/app/d/blog-globe/_rounds/r1/ortho';

const LABEL_PAD = 3; // the field gives way this far past the label's lines
const LABEL_FALL = 6; // then returns over this distance
const ROWS = 2; // the label steps first, the passage 55 ms after it

type Masks = { out: string[]; in: string[] };
let masks: Promise<Masks> | null = null;

/** Every level decoded before the first step: a mask still decoding paints as transparent. */
function loadMasks() {
  masks ??= (async () => {
    const levels = Array.from({ length: DITHER_LEVELS + 1 }, (_, l) => l);
    const out = levels.map((l) => ditherMaskUrl(l, CELL, 'out'));
    const into = levels.map((l) => ditherMaskUrl(l, CELL, 'in'));
    await Promise.all(
      [...out, ...into].map((url) => {
        const image = new Image();
        image.src = url.slice('url("'.length, -'")'.length);
        return image.decode().catch(() => null);
      })
    );
    return { out, in: into };
  })();
  return masks;
}

function setMask(el: HTMLElement | undefined, url: string | null) {
  el?.style.setProperty('mask-image', url);
  el?.style.setProperty('-webkit-mask-image', url);
}

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
  /** the pill's thumb, in stops from the first: where it starts */
  thumbFrom: number;
  spin: number;
  textAt: number;
  /** the stops whose label and passage step, out and in */
  leave: number;
  enter: number;
  clearFrom: Uint8Array;
  levels: number[];
  raf: number;
};

/** Mounts the figure on its server markup and returns the cleanup. `tour` is the seconds each stop holds after it arrives on the guided tour, 0 for none. */
export function mountGlobeA(fig: HTMLElement, tour: number): () => void {
  const disc = fig.querySelector<HTMLElement>('.ga-disc');
  const canvas = fig.querySelector<HTMLCanvasElement>('.ga-field');
  const pill = fig.querySelector<HTMLElement>('.ga-pill');
  if (!disc || !canvas || !pill) return () => undefined;
  const labels = [...fig.querySelectorAll<HTMLElement>('.ga-label')];
  const passages = [...fig.querySelectorAll<HTMLElement>('.ga-passage')];
  const inputs = [...pill.querySelectorAll<HTMLInputElement>('input')];
  const marks = [
    ...fig.querySelectorAll<HTMLElement>('.ga-pin, .ga-lead, .ga-run'),
  ];
  const off = new AbortController();
  const listen = { signal: off.signal };
  const cleanups: (() => void)[] = [];

  let live = false;
  let cur = Math.max(
    0,
    inputs.findIndex((input) => input.checked)
  );
  let shown = cur; // the stop whose words are on screen
  let camera = aim(STOPS[cur] ?? STOPS[0]);
  let thumb = cur; // the thumb's place, in stops; CSS keeps it at rest
  let run: Run | null = null;
  let steps: Masks | null = null;
  let ctx: CanvasRenderingContext2D | null = null;
  let grid: DiscGrid = makeDisc(0);
  let image: ImageData | null = null;
  let px = new Uint32Array(0);
  let prints: Uint8Array = new Uint8Array(0);
  let clear: Uint8Array = new Uint8Array(0); // this frame's cut-out
  let fixed: Uint8Array = new Uint8Array(0); // the pin and its leader
  let labelClears: (Uint8Array | undefined)[] = [];
  let shownClear: Uint8Array = new Uint8Array(0);
  let inks = [0, 0, 0];
  let pending = 0;

  /* ---------- the field ---------- */

  const boxesOf = (els: Element[], pad: number, fall: number) => {
    const origin = disc.getBoundingClientRect();
    return els.flatMap((el) =>
      [...el.getClientRects()].map(
        (r): ClearBox => ({
          left: r.left - origin.left,
          top: r.top - origin.top,
          right: r.right - origin.left,
          bottom: r.bottom - origin.top,
          pad,
          fall,
        })
      )
    );
  };

  // A stop's label cut-out, made on first use after each measure.
  const labelClear = (i: number) => {
    const label = labels[i];
    labelClears[i] ??= label
      ? clearMap(
          boxesOf(
            [...label.querySelectorAll('.ga-coords, .ga-where')],
            LABEL_PAD,
            LABEL_FALL
          ),
          grid.size
        )
      : new Uint8Array(grid.size * grid.size);
    return labelClears[i];
  };

  // The cut-out on screen: the pin and leader, and the label mixed on its row.
  const mixClear = (from: Uint8Array, to: Uint8Array, k: number) => {
    for (let i = 0; i < clear.length; i++) {
      const label = from[i]! + (to[i]! - from[i]!) * k;
      clear[i] = Math.max(fixed[i]!, label);
    }
  };

  const draw = () => {
    if (!ctx || !image) return;
    drawGlobe(grid, camera, clear, prints);
    drawCities(grid, camera, STOPS, clear, prints);
    for (let i = 0; i < prints.length; i++) {
      const p = prints[i]!;
      px[i] = p === 0 ? 0 : inks[p - 1]!;
    }
    ctx.putImageData(image, 0, 0);
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
    grid = makeDisc(size);
    prints = new Uint8Array(size * size);
    clear = new Uint8Array(size * size);
    fixed = clearMap(boxesOf(marks, 1, 0), size);
    labelClears = [];
    shownClear = labelClear(shown);
    mixClear(shownClear, shownClear, 0);
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

  /* ---------- the words ---------- */

  const showOnly = (i: number) => {
    [labels, passages].forEach((set) =>
      set.forEach((el, j) => el.toggleAttribute('data-on', j === i))
    );
  };

  const rowsOf = (i: number) => [labels[i], passages[i]];

  /* ---------- the timeline ---------- */

  // The camera at `now` on the running turn, and the thumb on its curve.
  const cameraAt = (now: number, r: Run) =>
    turnToward(r.from, r.to, easeInOut((now - r.start) / r.spin));
  const thumbAt = (now: number, r: Run) =>
    r.thumbFrom + (r.enter - r.thumbFrom) * easeInOut((now - r.start) / r.spin);

  // Ends the running timeline at its last frame.
  function finish() {
    if (!run) return;
    cancelAnimationFrame(run.raf);
    for (const el of [...rowsOf(run.leave), ...rowsOf(run.enter)]) {
      setMask(el, null);
    }
    fig.removeAttribute('data-mixing');
    fig.removeAttribute('data-turning');
    fig.style.removeProperty('--ga-k');
    camera = run.to;
    shown = run.enter;
    thumb = run.enter;
    shownClear = labelClear(shown);
    run = null;
    showOnly(shown);
    mixClear(shownClear, shownClear, 0);
  }

  const tick = () => {
    const r = run;
    if (!r) return;
    const now = performance.now();
    camera = cameraAt(now, r);
    fig.style.setProperty('--ga-k', thumbAt(now, r).toFixed(4));
    const t = now - r.start - r.textAt;
    const changing = r.leave !== r.enter;
    for (let row = 0; row < ROWS && changing; row++) {
      const k = rowK(t, row);
      const level = Math.round(DITHER_LEVELS * k);
      if (level === r.levels[row]) continue;
      r.levels[row] = level;
      if (steps) {
        setMask(rowsOf(r.leave)[row], steps.out[level] ?? null);
        setMask(rowsOf(r.enter)[row], steps.in[level] ?? null);
      } else if (k > 0) {
        // the masks are still decoding: cut on the row's turn
        rowsOf(r.leave)[row]?.removeAttribute('data-on');
        rowsOf(r.enter)[row]?.setAttribute('data-on', '');
      }
    }
    if (changing) mixClear(r.clearFrom, labelClear(r.enter), rowK(t, 0));
    draw();
    const done = now - r.start >= r.spin && (!changing || rowK(t, 1) >= 1);
    if (done) {
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
    let from = camera;
    let thumbFrom = thumb;
    let leave = shown;
    let clearFrom = shownClear;
    if (run) {
      // retarget from the frame on screen; a text step under way completes
      from = cameraAt(now, run);
      thumbFrom = thumbAt(now, run);
      const stepped = now - run.start >= run.textAt;
      leave = stepped ? run.enter : run.leave;
      clearFrom = clear.slice();
      for (const el of [...rowsOf(run.leave), ...rowsOf(run.enter)]) {
        setMask(el, null);
      }
      cancelAnimationFrame(run.raf);
      run = null;
    }
    clearTimeout(tourTimer);
    if (reduced()) {
      camera = target;
      shown = next;
      thumb = next;
      shownClear = labelClear(next);
      showOnly(next);
      mixClear(shownClear, shownClear, 0);
      draw();
      return;
    }
    const spin = spinMs(arcDegrees(from, target));
    run = {
      start: now,
      from,
      to: target,
      thumbFrom,
      spin,
      textAt: textDelay(spin),
      leave,
      enter: next,
      clearFrom,
      levels: [],
      raf: 0,
    };
    shown = leave;
    showOnly(leave);
    fig.setAttribute('data-turning', '');
    if (leave !== next && steps) {
      // the arriving words wait behind the empty mask for their row's turn
      const empty = steps.in[0] ?? null;
      fig.setAttribute('data-mixing', '');
      rowsOf(next).forEach((el) => {
        setMask(el, empty);
        el?.setAttribute('data-on', '');
      });
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
  pill.addEventListener(
    'keydown',
    (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const rtl = getComputedStyle(pill).direction === 'rtl';
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
  pill.addEventListener('pointerdown', takeOver, listen);

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
    thumb = cur;
    camera = aim(STOPS[cur] ?? STOPS[0]);
    showOnly(cur);
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
    clearTimeout(tourTimer);
    cancelAnimationFrame(pending);
    if (run) cancelAnimationFrame(run.raf);
  };
}
