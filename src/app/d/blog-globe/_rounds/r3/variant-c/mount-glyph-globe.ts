/**
 * Variant C's engine (GlobeC.tsx mounts it). The radios own the choice and
 * CSS shows the checked stop, so the figure works without it; this adds the
 * canvas globe, the turn, the text step, the keys and the tour.
 *
 * One clock: a pick starts one rAF run. The camera turns to the new city
 * over the whole run on power2.inOut, the short way round. Across the
 * turn's midpoint the letters on the land and the label step into the new
 * language through the 8 by 8 screen, and the passage's rows (the shared
 * Passage, driven by this run) step top to bottom around them. A pick
 * mid-run turns on from the camera on screen, and the passage goes on from
 * the rows on screen. Under reduced motion the camera jumps and the text
 * cuts.
 *
 * A click on a city in the window picks its stop: the targets laid over the
 * disc (CityTargets) check its radio, so the change listener below runs the
 * same turn as a pick in the language links. Each drawn frame places the
 * targets on the globe behind the window (globeBehind), only cities inside
 * the window take a click, and the city under the pointer is drawn larger in
 * a clearing, so the target's ring sits on open ground.
 */
import { DITHER_LEVELS } from '@/app/d/blog-globe/_shared/ditherMask';
import { mountPassage } from '@/app/d/blog-globe/_rounds/r3/mount-passage';
import { turnToward } from '@/app/d/blog-globe/_rounds/r3/ortho';
import { STOPS } from '@/app/d/blog-globe/_rounds/r3/stops';
import { mountCityTargets } from '@/app/d/blog-globe/_rounds/r3/targets';
import {
  loadMasks,
  setMask,
  stepIndex,
  type Masks,
} from '@/app/d/blog-globe/_shared/versions-field';

import {
  CELLS_PER_RADIUS,
  CITY,
  CITY_DEPTH,
  MAX_TIER,
  SEA_SIDE,
  SIZE_STEPS,
  cameraOf,
  easeInOut,
  globeBehind,
  globeDisc,
  globeMarks,
  glyphScale,
  handedOver,
  handoverAt,
  letterAt,
  lettersOf,
  passageStart,
  turnMs,
  windowCities,
  type GlobeMark,
} from './glyph-globe';

import type { GlobeCamera } from '@/app/d/blog-globe/_rounds/r3/ortho';

const LETTERS = STOPS.map(lettersOf);
const SCALES = STOPS.map((stop) => glyphScale(stop.lang));

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
  /** The language the land and the label showed, and the one they step to. */
  prev: number;
  next: number;
  /** The land's and the label's step is done and the label's masks are cleared. */
  stepped: boolean;
  /** The label's last mask level, so a frame writes only a change. */
  level: number;
  /** ms into the run the passage's step starts. */
  textAt: number;
  raf: number;
};

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Mounts the figure on its server markup and returns the cleanup. `tour` is seconds per stop on the guided tour, 0 for none. */
export function mountGlyphGlobe(fig: HTMLElement, tour: number): () => void {
  const box = fig.querySelector<HTMLElement>('.gvc-globe');
  const canvas = fig.querySelector<HTMLCanvasElement>('.gvc-canvas');
  const tagBox = fig.querySelector<HTMLElement>('.gvc-tags');
  const links = fig.querySelector<HTMLElement>('.gl');
  const lines = fig.querySelector<HTMLElement>('.gp');
  if (!box || !canvas || !tagBox || !links || !lines) return () => undefined;
  const inputs = [...links.querySelectorAll<HTMLInputElement>('.gl-input')];
  const tags = [...tagBox.children];
  const off = new AbortController();
  const listen = { signal: off.signal };
  const cleanups: (() => void)[] = [];
  // a click on a city checks its radio; the targets sit on the globe behind
  // the window, and only those inside it take a click
  const layer = box.querySelector<HTMLElement>('.gct');
  const targets = mountCityTargets(layer, {
    inputs,
    disc: ({ width }) => globeBehind(width),
    minDepth: CITY_DEPTH,
  });

  let cur = Math.max(
    0,
    inputs.findIndex((input) => input.checked)
  );
  const passage = mountPassage(lines, cur);
  let shown = cur; // the language the land and the label print at rest
  let camera: GlobeCamera = cameraOf(STOPS[cur] ?? STOPS[0]);
  let run: Run | null = null;
  let steps: Masks | null = null;
  let ctx: CanvasRenderingContext2D | null = null;
  let size = 0; // the globe box's side in CSS px
  let dpr = 1;
  let inks: Inks | null = null;
  let families: string[] = [];
  let pending = 0;
  let hovered = -1; // the stop whose target is under the pointer

  /* ---------- drawing ---------- */

  const draw = (now: number) => {
    const g = ctx;
    if (!g || !inks || size <= 0) return;
    const t = run ? now - run.start : 0;
    const cam = run
      ? turnToward(run.from, run.to, easeInOut(t / run.ms))
      : camera;
    const k = run && !run.stepped ? handoverAt(run.ms, t) : 1;
    const prev = run ? run.prev : shown;
    const next = run ? run.next : shown;
    const { cx: c, radius: r } = globeDisc(size);
    const cell = r / CELLS_PER_RADIUS;
    const cities = windowCities(STOPS, cam, cur, hovered);
    const clear = (mark: GlobeMark) =>
      cities.some((p) => Math.hypot(mark.nx - p.x, mark.ny - p.y) < p.clear);

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

    // the cities in the window: ink dots, and the current one in the accent with its ring
    for (const p of cities) {
      const x = c + p.x * r;
      const y = c + p.y * r;
      g.fillStyle = p.accent ? inks.accent : inks.city;
      g.beginPath();
      g.arc(x, y, p.dot * r, 0, Math.PI * 2);
      g.fill();
      if (!p.accent) continue;
      g.strokeStyle = inks.accent;
      g.beginPath();
      g.arc(x, y, CITY.ring * r, 0, Math.PI * 2);
      g.stroke();
    }
    targets.update(cam);
  };

  /* ---------- the run: the turn, with the text step across its midpoint ---------- */

  // Clears the label's masks and the leaving label. The land and the label
  // stay on the words on screen: the new stop's once its step has begun,
  // else the old one's.
  const endStep = (current: Run, now: number) => {
    if (current.stepped) return;
    current.stepped = true;
    setMask(tags[current.prev], null);
    setMask(tags[current.next], null);
    tags[current.prev]?.removeAttribute('data-leaving');
    tagBox.removeAttribute('data-mixing');
    const begun = handoverAt(current.ms, now - current.start) > 0;
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
      passage.select(next); // cuts under reduced motion
      draw(now);
      armTour();
      return;
    }
    const ms = turnMs(from, camera);
    passage.select(next, 'caller');
    const current: Run = {
      start: now,
      from,
      to: camera,
      ms,
      prev,
      next,
      stepped: prev === next || !steps,
      level: -1,
      textAt: passageStart(ms, passage.duration),
      raf: 0,
    };
    if (!current.stepped) {
      tags[prev]?.setAttribute('data-leaving', '');
      tagBox.setAttribute('data-mixing', '');
    } else shown = next;
    run = current;
    const tick = () => {
      const now = performance.now();
      const t = now - current.start;
      if (!current.stepped && steps) {
        const k = handoverAt(current.ms, t);
        const level = Math.round(DITHER_LEVELS * k);
        if (level !== current.level) {
          current.level = level;
          setMask(tags[prev], steps.out[level] ?? null);
          setMask(tags[next], steps.in[level] ?? null);
        }
        if (k >= 1) endStep(current, now);
      }
      passage.frame(t - current.textAt);
      draw(now);
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

  // The overlay marks the target under the pointer; the drawing follows it,
  // at once at rest and on the next frame of a turn.
  if (layer) {
    const hover = new MutationObserver(() => {
      const stop = layer.querySelector<HTMLElement>('.gct-target[data-hover]')
        ?.dataset.stop;
      const next = STOPS.findIndex((s) => s.lang === stop);
      if (next === hovered) return;
      hovered = next;
      if (!run) draw(performance.now());
    });
    hover.observe(layer, {
      subtree: true,
      attributes: true,
      attributeFilter: ['data-hover'],
    });
    cleanups.push(() => hover.disconnect());
  }

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
    families = [...lines.querySelectorAll('.gp-panel')].map(
      (panel) => getComputedStyle(panel).fontFamily
    );
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
    targets.destroy();
    passage.destroy();
    window.clearTimeout(tourTimer);
    cancelAnimationFrame(pending);
    if (run) {
      cancelAnimationFrame(run.raf);
      endStep(run, performance.now());
      run = null;
    }
  };
}
