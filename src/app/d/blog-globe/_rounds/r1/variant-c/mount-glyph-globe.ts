/**
 * Variant C's engine (GlobeC.tsx mounts it). The radios own the choice and
 * CSS shows the checked stop, so the figure works without it; this adds the
 * canvas globe, the turn, the text step, the keys and the tour.
 *
 * One clock: a pick starts one rAF run. The camera turns to the new city
 * over the whole run on power2.inOut, the short way round, and across its
 * midpoint the passage and the letters on the land, then 55 ms later the
 * label, step into the new language through the same 8 by 8 screen. A
 * pick mid-run turns on from the camera on screen. Under reduced motion
 * the camera jumps and the text swaps.
 */
import { DITHER_LEVELS, ditherMaskUrl } from '@/app/d/blog-globe/_shared/ditherMask';
import { project, turnToward } from '@/app/d/blog-globe/_rounds/r1/ortho';
import { STOPS } from '@/app/d/blog-globe/_rounds/r1/stops';
import { stepIndex } from '@/app/d/blog-globe/_shared/versions-field';

import {
  CELLS_PER_RADIUS,
  CITY,
  CLEAR,
  MAX_TIER,
  SEA_SIDE,
  SIZE_STEPS,
  SVG_MARGIN,
  SVG_RADIUS,
  cameraOf,
  easeInOut,
  globeMarks,
  glyphScale,
  handedOver,
  letterAt,
  lettersOf,
  rowsAt,
  turnMs,
  type GlobeMark,
} from './glyph-globe';

import type { GlobeCamera } from '@/app/d/blog-globe/_rounds/r1/ortho';

const LETTERS = STOPS.map(lettersOf);
const SCALES = STOPS.map((stop) => glyphScale(stop.lang));
const CELL_PX = 2; // the text step's screen, as the Versions figure's

type Inks = {
  land: string;
  sea: string;
  city: string;
  accent: string;
  limb: string;
};

type Run = {
  start: number;
  from: GlobeCamera;
  to: GlobeCamera;
  ms: number;
  /** The language the land showed, and the one it steps to. */
  prev: number;
  next: number;
  /** The text step is done and its masks are cleared. */
  stepped: boolean;
  /** The last mask level of each row, so a frame writes only a change. */
  levels: [number, number];
  raf: number;
};

/* ---------- the text step's masks, after versions-field.ts ---------- */

type Masks = { out: string[]; in: string[] };
let masks: Promise<Masks> | null = null;

/** Every level decoded before the first step: a mask still decoding paints as transparent. */
function loadMasks() {
  masks ??= (async () => {
    const levels = Array.from({ length: DITHER_LEVELS + 1 }, (_, l) => l);
    const out = levels.map((l) => ditherMaskUrl(l, CELL_PX, 'out'));
    const into = levels.map((l) => ditherMaskUrl(l, CELL_PX, 'in'));
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

function setMask(el: Element | undefined, url: string | null) {
  if (!(el instanceof HTMLElement)) return;
  el.style.setProperty('mask-image', url);
  el.style.setProperty('-webkit-mask-image', url);
}

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Mounts the figure on its server markup and returns the cleanup. `tour` is seconds per stop on the guided tour, 0 for none. */
export function mountGlyphGlobe(fig: HTMLElement, tour: number): () => void {
  const box = fig.querySelector<HTMLElement>('.gvc-globe');
  const canvas = fig.querySelector<HTMLCanvasElement>('.gvc-canvas');
  const stage = fig.querySelector<HTMLElement>('.gvc-stage');
  const pill = fig.querySelector<HTMLElement>('.gvc-pill');
  if (!box || !canvas || !stage || !pill) return () => undefined;
  const inputs = [
    ...fig.querySelectorAll<HTMLInputElement>('.gvc-opt > input'),
  ];
  const stops = [...stage.children];
  const off = new AbortController();
  const listen = { signal: off.signal };
  const cleanups: (() => void)[] = [];

  let cur = Math.max(
    0,
    inputs.findIndex((input) => input.checked)
  );
  let shown = cur; // the language the land prints at rest
  let camera: GlobeCamera = cameraOf(STOPS[cur] ?? STOPS[0]);
  let run: Run | null = null;
  let steps: Masks | null = null;
  let ctx: CanvasRenderingContext2D | null = null;
  let size = 0; // the globe box's side in CSS px
  let dpr = 1;
  let inks: Inks | null = null;
  let families: string[] = [];
  let pending = 0;

  /* ---------- drawing ---------- */

  const draw = (now: number) => {
    const g = ctx;
    if (!g || !inks || size <= 0) return;
    const t = run ? now - run.start : 0;
    const cam = run
      ? turnToward(run.from, run.to, easeInOut(t / run.ms))
      : camera;
    const k = run && !run.stepped ? rowsAt(run.ms, t)[0] : 1;
    const prev = run ? run.prev : shown;
    const next = run ? run.next : shown;
    const r = size / 2 / (1 + SVG_MARGIN / SVG_RADIUS);
    const c = size / 2;
    const cell = r / CELLS_PER_RADIUS;
    const view = { ...cam, radius: 1, cx: 0, cy: 0 };
    const cities = STOPS.map((stop, i) => ({
      i,
      ...project(view, { lat: stop.lat, lon: stop.lon }),
    })).filter((p) => p.near);
    const clear = (mark: GlobeMark) =>
      cities.some(
        (p) =>
          Math.hypot(mark.nx - p.x, mark.ny - p.y) <
          (p.i === cur ? CLEAR.current : CLEAR.other)
      );

    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, size, size);

    g.strokeStyle = inks.limb;
    g.lineWidth = 1;
    g.beginPath();
    g.arc(c, c, r - 0.5, 0, Math.PI * 2);
    g.stroke();

    // the sea, then the land a size step at a time: one font per step and language
    const land: GlobeMark[][] = Array.from({ length: MAX_TIER }, () => []);
    g.fillStyle = inks.sea;
    for (const mark of globeMarks(cam)) {
      if (clear(mark)) continue;
      if (mark.land) {
        land[mark.tier - 1]?.push(mark);
        continue;
      }
      const side = (mark.tier / SIZE_STEPS) * cell * SEA_SIDE;
      g.fillRect(
        c + mark.nx * r - side / 2,
        c + mark.ny * r - side / 2,
        side,
        side
      );
    }
    g.fillStyle = inks.land;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    land.forEach((marks, i) => {
      for (const lang of prev === next ? [next] : [prev, next]) {
        const px = ((i + 1) / SIZE_STEPS) * cell * (SCALES[lang] ?? 1);
        g.font = `400 ${px.toFixed(2)}px ${families[lang] ?? 'sans-serif'}`;
        const letters = LETTERS[lang] ?? [];
        for (const mark of marks) {
          const into = handedOver(mark.col, mark.row, k);
          if ((into ? next : prev) !== lang) continue;
          g.fillText(letterAt(letters, mark), c + mark.nx * r, c + mark.ny * r);
        }
      }
    });

    // the cities: ink dots, and the current one in the accent with its ring
    for (const p of cities) {
      const x = c + p.x * r;
      const y = c + p.y * r;
      const current = p.i === cur;
      g.fillStyle = current ? inks.accent : inks.city;
      g.beginPath();
      g.arc(x, y, (current ? CITY.dot : CITY.other) * r, 0, Math.PI * 2);
      g.fill();
      if (!current) continue;
      g.strokeStyle = inks.accent;
      g.beginPath();
      g.arc(x, y, CITY.ring * r, 0, Math.PI * 2);
      g.stroke();
    }
  };

  /* ---------- the run: the turn, with the text step across its midpoint ---------- */

  // Clears the text step's masks and the leaving stop. The words on screen
  // stay: the new stop's once its step has begun, else the old one's.
  const endStep = (current: Run, now: number) => {
    if (current.stepped) return;
    current.stepped = true;
    for (const i of [current.prev, current.next]) {
      for (const el of stops[i]?.children ?? []) setMask(el, null);
    }
    stops[current.prev]?.removeAttribute('data-leaving');
    stage.removeAttribute('data-mixing');
    const begun = rowsAt(current.ms, now - current.start)[0] > 0;
    shown = begun ? current.next : current.prev;
  };

  const cameraNow = (now: number): GlobeCamera =>
    run
      ? turnToward(run.from, run.to, easeInOut((now - run.start) / run.ms))
      : camera;

  const select = (next: number) => {
    const stop = STOPS[next];
    if (!stop || next === cur) return;
    const now = performance.now();
    const from = cameraNow(now);
    if (run) {
      cancelAnimationFrame(run.raf);
      endStep(run, now); // an interrupted step ends on the words on screen
      run = null;
    }
    const prev = shown;
    cur = next;
    camera = cameraOf(stop);
    if (!ctx || reduced()) {
      shown = next;
      draw(now);
      armTour();
      return;
    }
    const current: Run = {
      start: now,
      from,
      to: camera,
      ms: turnMs(from, camera),
      prev,
      next,
      stepped: prev === next || !steps,
      levels: [-1, -1],
      raf: 0,
    };
    if (!current.stepped) {
      stops[prev]?.setAttribute('data-leaving', '');
      stage.setAttribute('data-mixing', '');
    } else shown = next;
    run = current;
    const tick = () => {
      const now = performance.now();
      const t = now - current.start;
      if (!current.stepped && steps) {
        const rows = rowsAt(current.ms, t);
        rows.forEach((k, r) => {
          const level = Math.round(DITHER_LEVELS * k);
          if (level === current.levels[r]) return;
          current.levels[r] = level;
          setMask(stops[prev]?.children[r], steps?.out[level] ?? null);
          setMask(stops[next]?.children[r], steps?.in[level] ?? null);
        });
        if (rows[1] >= 1) endStep(current, now);
      }
      draw(performance.now());
      if (t < current.ms) {
        current.raf = requestAnimationFrame(tick);
        return;
      }
      run = null;
      draw(performance.now());
      armTour();
    };
    tick();
  };

  /* ---------- the tour: the next stop after a hold, until the reader takes over ---------- */

  let tourTimer = 0;
  let touched = false;
  let seen = false;

  const armTour = () => {
    window.clearTimeout(tourTimer);
    if (tour <= 0 || touched || !seen || document.hidden || reduced()) return;
    fig.setAttribute('data-touring', '');
    tourTimer = window.setTimeout(() => {
      if (!seen || document.hidden || run) return;
      const next = (cur + 1) % inputs.length;
      const input = inputs[next];
      if (!input) return;
      input.checked = true;
      select(next);
    }, tour * 1000);
  };

  // A reader's pick, key or press ends the tour for good.
  const takeOver = () => {
    touched = true;
    window.clearTimeout(tourTimer);
    fig.removeAttribute('data-touring');
  };

  if (tour > 0 && typeof IntersectionObserver !== 'undefined') {
    const view = new IntersectionObserver(
      (entries) => {
        seen = entries.some((entry) => entry.isIntersecting);
        if (!seen) window.clearTimeout(tourTimer);
        else if (!run) armTour();
      },
      { threshold: 0.35 }
    );
    view.observe(fig);
    cleanups.push(() => view.disconnect());
    document.addEventListener(
      'visibilitychange',
      () => {
        if (document.hidden) window.clearTimeout(tourTimer);
        else if (!run) armTour();
      },
      listen
    );
  }

  /* ---------- input ---------- */

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

  // The keys, here rather than native: WebKit's radios neither wrap nor mirror.
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

  const readInks = () => {
    const css = getComputedStyle(fig);
    const read = (name: string) => css.getPropertyValue(name).trim();
    inks = {
      land: read('--gvc-land'),
      sea: read('--gvc-sea'),
      city: read('--gvc-city'),
      accent: read('--gvc-accent'),
      limb: read('--gvc-limb'),
    };
    // each language's own stack, as its passage is set
    families = stops.map((el) => {
      const passage = el.querySelector('.gvc-passage');
      return passage ? getComputedStyle(passage).fontFamily : 'sans-serif';
    });
  };

  const measure = () => {
    if (!ctx) return;
    size = box.getBoundingClientRect().width;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    draw(performance.now());
  };

  const start = () => {
    if (off.signal.aborted) return;
    void loadMasks().then((loaded) => {
      steps = loaded;
    });
    ctx = canvas.getContext('2d');
    if (!ctx) return;
    readInks();
    measure();
    fig.setAttribute('data-live', '');
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
    resize.observe(box);
    const repaint = () => {
      readInks();
      draw(performance.now());
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
    cleanups.push(
      () => resize.disconnect(),
      () => theme.disconnect()
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
    window.clearTimeout(tourTimer);
    cancelAnimationFrame(pending);
    if (run) {
      cancelAnimationFrame(run.raf);
      endStep(run, performance.now());
      run = null;
    }
  };
}
