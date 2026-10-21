/**
 * Globe variant D's drawing and its one clock (GlobeD.tsx mounts it). The
 * radios own the choice and CSS shows the checked stop, so the figure works
 * without this; it adds the turn and the text step.
 *
 * The globe is zoomed ZOOM times and seen through a round window, so the
 * window shows a cap about 47 degrees across and the 7 to 14 degree hops
 * between Alexandria, Antioch and Baghdad move the ground by a sixth to a
 * third of the window. The window is a screen of square dots fixed to the
 * figure, PITCH units apart: every frame reads the land under each cell
 * (unproject, landAt), so the earth turns under a screen that never moves.
 * A pick turns the camera the short way on power2.inOut. Across the turn's
 * midpoint the passage steps row by row (mount-passage.ts) and the label
 * steps once, both through the 8 by 8 screen on the Versions figure's
 * timing. Nothing fades.
 */
import { DITHER_LEVELS, smoothstep } from '@/app/d/blog-globe/_shared/ditherMask';
import { landAt } from '@/app/d/blog-globe/_rounds/r3/land';
import { mountPassage } from '@/app/d/blog-globe/_rounds/r3/mount-passage';
import {
  project,
  turnToward,
  unproject,
  type GlobeCamera,
  type GlobeView,
  type LatLon,
} from '@/app/d/blog-globe/_rounds/r3/ortho';
import { STOPS } from '@/app/d/blog-globe/_rounds/r3/stops';
import {
  mountCityTargets,
  type GlobeDisc,
} from '@/app/d/blog-globe/_rounds/r3/targets';
import {
  loadMasks,
  setMask,
  STEP_MS,
  stepIndex,
  type Masks,
} from '@/app/d/blog-globe/_shared/versions-field';

/** The globe's viewBox side; it is drawn at 240 CSS px, so a cell is a whole number of pixels. */
export const SIZE = 240;
/** The round window's radius in viewBox units, inside the hairline rim. */
export const WINDOW = 116;
/** The globe's radius is ZOOM times the window's. */
export const ZOOM = 2.5;
export const DISC = { radius: WINDOW * ZOOM, cx: SIZE / 2, cy: SIZE / 2 };
const PITCH = 4; // one dot per 4 by 4 cell
const HALO = 8; // a city mark's halo radius: a city shows where its halo fits the window
/** The depth (cosine of the angle from the point faced) at which a city leaves the window: a point on the near side sits radius * sin(angle) from the centre. */
export const MIN_DEPTH = Math.sqrt(1 - ((WINDOW - HALO) / DISC.radius) ** 2);
/** Where a sea cell looks for land, in pitches: an island narrower than a cell still prints. */
const PROBES = [
  [-0.3, -0.3],
  [0.3, -0.3],
  [-0.3, 0.3],
  [0.3, 0.3],
] as const;
const RAD = Math.PI / 180;

export const cameraOf = ({ lat, lon }: LatLon): GlobeCamera => ({
  lat0: lat,
  lon0: lon,
});

/** The land dots facing `camera` inside the window: one 2 by 2 square per land cell, as one path. */
export function landPath(camera: GlobeCamera): string {
  const view: GlobeView = { ...camera, ...DISC };
  const landUnder = (x: number, y: number) => {
    const p = unproject(view, x, y);
    return p !== null && landAt(p.lat, p.lon) >= 0.5;
  };
  // a dot's far corner stays a pixel inside the rim
  const inside = (WINDOW - 2) ** 2;
  let d = '';
  for (let y = PITCH / 2; y < SIZE; y += PITCH) {
    for (let x = PITCH / 2; x < SIZE; x += PITCH) {
      if ((x - DISC.cx) ** 2 + (y - DISC.cy) ** 2 > inside) continue;
      const land =
        landUnder(x, y) ||
        PROBES.some(([ox, oy]) => landUnder(x + ox * PITCH, y + oy * PITCH));
      if (land) d += `M${x - 1} ${y - 1}h2v2h-2z`;
    }
  }
  return d;
}

/** Where a stop's mark sits facing `camera`, as an SVG transform, and whether it shows inside the window. */
export function markAt(camera: GlobeCamera, place: LatLon) {
  const p = project({ ...camera, ...DISC }, place);
  return {
    transform: `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`,
    shown: p.depth > MIN_DEPTH,
  };
}

/** The globe in CSS px for the drawing's box: the SVG scales its square viewBox to the box, so a city target placed on this disc sits on the city's mark. */
export function drawnDisc({ width }: { width: number }): GlobeDisc {
  const scale = width / SIZE;
  return {
    cx: DISC.cx * scale,
    cy: DISC.cy * scale,
    radius: DISC.radius * scale,
  };
}

/** Degrees of arc between the points two cameras face. */
export function arcBetween(a: GlobeCamera, b: GlobeCamera): number {
  const cos =
    Math.sin(a.lat0 * RAD) * Math.sin(b.lat0 * RAD) +
    Math.cos(a.lat0 * RAD) *
      Math.cos(b.lat0 * RAD) *
      Math.cos((b.lon0 - a.lon0) * RAD);
  return Math.acos(Math.max(-1, Math.min(1, cos))) / RAD;
}

/** A turn's length: 0.5 s and 8 ms a degree, at most 1.2 s. */
export const turnMs = (a: GlobeCamera, b: GlobeCamera) =>
  Math.min(1200, 500 + 8 * arcBetween(a, b));

const inOut = (k: number) => (k < 0.5 ? 2 * k * k : 1 - (2 - 2 * k) ** 2 / 2);

export type Turn = { from: GlobeCamera; to: GlobeCamera; ms: number };

/** The one clock, t ms into a turn: the camera, and the label's step (0 to 1), centred on the turn's midpoint. */
export function frameAt(turn: Turn, t: number) {
  const e = inOut(Math.min(1, Math.max(0, t / turn.ms)));
  return {
    camera: turnToward(turn.from, turn.to, e),
    label: smoothstep((t - (turn.ms - STEP_MS) / 2) / STEP_MS),
  };
}

/** When a passage step of `stepMs` starts, ms into a turn: centred on the turn's midpoint, and never before the turn starts. */
export const passageStart = (turn: Turn, stepMs: number) =>
  Math.max(0, (turn.ms - stepMs) / 2);

/* ---------- the figure ---------- */

/** Mounts the turn and the text step on the figure's server markup and returns the cleanup. */
export function mountGlobeD(fig: HTMLElement) {
  const links = fig.querySelector<HTMLElement>('.gl');
  const inputs = [...fig.querySelectorAll<HTMLInputElement>('.gl-input')];
  const land = fig.querySelector('.gd-land');
  // two per stop in STOPS order: the halos' layer, then the marks' layer
  const cities = [...fig.querySelectorAll('.gd-city')];
  const caps = fig.querySelector<HTMLElement>('.gd-caps');
  const labels = [...fig.querySelectorAll('.gd-cap')];
  const off = new AbortController();
  let masks: Masks | null = null;
  // a click on a city checks its radio, and the change listener below turns
  // the globe as a pick in the links does
  const targets = mountCityTargets(fig.querySelector('.gct'), {
    inputs,
    disc: drawnDisc,
    minDepth: MIN_DEPTH,
  });

  let shown = Math.max(
    0,
    inputs.findIndex((input) => input.checked)
  );
  const passageRoot = fig.querySelector<HTMLElement>('.gp');
  const passage = passageRoot ? mountPassage(passageRoot, shown) : null;

  // the label's masks decode once the figure is within a viewport of the screen
  if (typeof IntersectionObserver !== 'undefined') {
    const near = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        near.disconnect();
        void loadMasks().then((loaded) => {
          masks = loaded;
        });
      },
      { rootMargin: '100% 0px' }
    );
    near.observe(fig);
    off.signal.addEventListener('abort', () => near.disconnect());
  }

  let camera = cameraOf(STOPS[shown] ?? STOPS[0]);
  let run: {
    start: number;
    turn: Turn;
    from: number;
    to: number;
    raf: number;
  } | null = null;

  const draw = () => {
    land?.setAttribute('d', landPath(camera));
    const marks = STOPS.map((stop) => markAt(camera, stop));
    cities.forEach((city, i) => {
      const mark = marks[i % marks.length];
      if (!(city instanceof SVGElement) || !mark) return;
      city.setAttribute('transform', mark.transform);
      city.style.visibility = mark.shown ? 'visible' : 'hidden';
    });
    targets.update(camera);
  };

  // Ends a turn where it stands: the label's masks off and its leaving stop
  // hidden again. The passage ends its own step.
  const settle = () => {
    if (!run) return;
    cancelAnimationFrame(run.raf);
    for (const i of [run.from, run.to]) {
      setMask(labels[i], null);
      labels[i]?.removeAttribute('data-leaving');
    }
    caps?.removeAttribute('data-mixing');
    run = null;
  };

  const select = (next: number) => {
    const stop = STOPS[next];
    if (!stop) return;
    const now = performance.now();
    // a pick mid-turn turns on from the camera on screen; the label leaves
    // from whichever stop's label the reader sees
    if (run) {
      shown =
        frameAt(run.turn, now - run.start).label >= 0.5 ? run.to : run.from;
    }
    settle();
    const to = cameraOf(stop);
    const from = shown;
    shown = next;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      camera = to;
      draw();
      passage?.select(next);
      return;
    }
    // without the masks yet, CSS has already swapped the label
    const text = from !== next ? masks : null;
    if (text) {
      caps?.setAttribute('data-mixing', '');
      labels[from]?.setAttribute('data-leaving', '');
    }
    passage?.select(next, 'caller');
    const turn: Turn = { from: camera, to, ms: turnMs(camera, to) };
    const textAt = passageStart(turn, passage?.duration ?? 0);
    const current = { start: now, turn, from, to: next, raf: 0 };
    let level = -1;
    run = current;
    const tick = () => {
      const t = performance.now() - current.start;
      const frame = frameAt(turn, t);
      camera = frame.camera;
      draw();
      const at = Math.round(DITHER_LEVELS * frame.label);
      if (text && at !== level) {
        level = at;
        setMask(labels[from], text.out[at] ?? null);
        setMask(labels[next], text.in[at] ?? null);
      }
      const read = passage ? passage.frame(t - textAt) : true;
      if (t >= turn.ms && read) settle();
      else current.raf = requestAnimationFrame(tick);
    };
    tick();
  };

  fig.addEventListener(
    'change',
    (e) => {
      const i = inputs.findIndex((input) => input === e.target);
      if (i >= 0) select(i);
    },
    { signal: off.signal }
  );

  // The keys, here rather than native: WebKit's radios neither wrap nor mirror.
  links?.addEventListener(
    'keydown',
    (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const rtl = getComputedStyle(links).direction === 'rtl';
      const next = stepIndex(e.key, shown, inputs.length, rtl);
      const input = inputs[next ?? -1];
      if (next === null || !input) return;
      e.preventDefault();
      input.checked = true;
      input.focus();
      select(next);
    },
    { signal: off.signal }
  );

  // a stop restored by the browser's form memory shows at once; the server
  // drew the first, so only the city targets need placing
  if (shown !== 0) draw();
  else targets.update(camera);
  fig.setAttribute('data-live', '');

  return () => {
    off.abort();
    targets.destroy();
    settle();
    passage?.destroy();
    fig.removeAttribute('data-live');
  };
}
