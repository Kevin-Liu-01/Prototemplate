/**
 * Globe variant D's drawing and its one clock (GlobeD.tsx mounts it). The
 * radios own the choice and CSS shows the checked stop, so the figure works
 * without this; it adds the turn and the text step.
 *
 * The disc is a screen of square dots fixed to the figure, PITCH units
 * apart: every frame reads the land under each cell (unproject, landAt), so
 * the earth turns under a screen that never moves. A pick turns the camera
 * the short way on power2.inOut, the pill's thumb slides on the same curve,
 * and across the turn's midpoint the passage and then its label step to the
 * new stop through the 8 by 8 screen (ditherMask.ts), on the Versions
 * figure's row timing. Nothing fades.
 */
import {
  DITHER_LEVELS,
  ditherMaskUrl,
  smoothstep,
} from '@/app/d/blog-globe/_shared/ditherMask';
import { landAt } from '@/app/d/blog-globe/_rounds/r2/land';
import {
  project,
  turnToward,
  unproject,
  type GlobeCamera,
  type GlobeView,
  type LatLon,
} from '@/app/d/blog-globe/_rounds/r2/ortho';
import { STOPS } from '@/app/d/blog-globe/_rounds/r2/stops';
import {
  mountCityTargets,
  type GlobeDisc,
} from '@/app/d/blog-globe/_rounds/r2/targets';
import { stepIndex } from '@/app/d/blog-globe/_shared/versions-field';

/** The globe's viewBox side; it is drawn at 240 CSS px, or 120 on a narrow figure, so a cell is a whole number of pixels. */
export const SIZE = 240;
export const DISC = { radius: 116, cx: SIZE / 2, cy: SIZE / 2 };
const PITCH = 4; // one dot per 4 by 4 cell
/** Where a sea cell looks for land, in pitches: an island narrower than a cell (Britain, Cyprus) still prints. */
const PROBES = [
  [-0.3, -0.3],
  [0.3, -0.3],
  [-0.3, 0.3],
  [0.3, 0.3],
] as const;
const CELL = 2; // CSS px per cell of the text step, as on the Versions figure
const STEP_MS = 150; // one text row's step
const STAGGER_MS = 55; // the label starts this long after the passage
const RAD = Math.PI / 180;

export const cameraOf = ({ lat, lon }: LatLon): GlobeCamera => ({
  lat0: lat,
  lon0: lon,
});

/** The land dots facing `camera`: one 2 by 2 square per land cell, as one path. */
export function landPath(camera: GlobeCamera): string {
  const view: GlobeView = { ...camera, ...DISC };
  const landUnder = (x: number, y: number) => {
    const p = unproject(view, x, y);
    return p !== null && landAt(p.lat, p.lon) >= 0.5;
  };
  let d = '';
  for (let y = PITCH / 2; y < SIZE; y += PITCH) {
    for (let x = PITCH / 2; x < SIZE; x += PITCH) {
      if (!unproject(view, x, y)) continue;
      const land =
        landUnder(x, y) ||
        PROBES.some(([ox, oy]) => landUnder(x + ox * PITCH, y + oy * PITCH));
      if (land) d += `M${x - 1} ${y - 1}h2v2h-2z`;
    }
  }
  return d;
}

/** Where a stop's mark sits facing `camera`, as an SVG transform, and whether it is on the near side. */
export function markAt(camera: GlobeCamera, place: LatLon) {
  const p = project({ ...camera, ...DISC }, place);
  return {
    transform: `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`,
    near: p.near,
  };
}

/** The drawn disc in CSS px for the globe's box: the SVG scales its square viewBox to the box, so a city target placed on this disc sits on the city's mark. */
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

/** `thumb` is the pill's thumb, in stops from the first: where it starts and where it lands. */
export type Turn = {
  from: GlobeCamera;
  to: GlobeCamera;
  ms: number;
  thumb: [number, number];
};

/** The one clock, t ms into a turn: the camera, the thumb, and the step of the passage (row 0) and the label (row 1), centred on the turn's midpoint. */
export function frameAt(turn: Turn, t: number) {
  const e = inOut(Math.min(1, Math.max(0, t / turn.ms)));
  const start = turn.ms / 2 - (STEP_MS + STAGGER_MS) / 2;
  const [thumbFrom, thumbTo] = turn.thumb;
  return {
    camera: turnToward(turn.from, turn.to, e),
    thumb: thumbFrom + (thumbTo - thumbFrom) * e,
    rows: [0, 1].map((row) =>
      smoothstep((t - start - row * STAGGER_MS) / STEP_MS)
    ),
  };
}

/* ---------- the text step's masks (as versions-field.ts loads them, which keeps its loader private) ---------- */

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

function setMask(el: Element | undefined, url: string | null) {
  if (!(el instanceof HTMLElement)) return;
  el.style.setProperty('mask-image', url);
  el.style.setProperty('-webkit-mask-image', url);
}

/* ---------- the figure ---------- */

/** Mounts the turn and the text step on the figure's server markup and returns the cleanup. */
export function mountGlobeD(fig: HTMLElement) {
  const pill = fig.querySelector<HTMLElement>('.gd-pill');
  const inputs = [...fig.querySelectorAll<HTMLInputElement>('.gd-opt input')];
  const land = fig.querySelector('.gd-land');
  // two per stop in STOPS order: the halos' layer, then the marks' layer
  const cities = [...fig.querySelectorAll('.gd-city')];
  // row 0 holds the five passages, row 1 the five labels
  const rows = [
    [...fig.querySelectorAll('.gd-text')],
    [...fig.querySelectorAll('.gd-cap')],
  ];
  const off = new AbortController();
  let steps: Masks | null = null;
  // a click on a city checks its radio, and the change listener below turns
  // the globe as a pick in the pill does
  const targets = mountCityTargets(fig.querySelector('.gct'), {
    inputs,
    disc: drawnDisc,
  });

  // the masks decode once the figure is within a viewport of the screen
  if (typeof IntersectionObserver !== 'undefined') {
    const near = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        near.disconnect();
        void loadMasks().then((loaded) => {
          steps = loaded;
        });
      },
      { rootMargin: '100% 0px' }
    );
    near.observe(fig);
    off.signal.addEventListener('abort', () => near.disconnect());
  }

  let shown = Math.max(
    0,
    inputs.findIndex((input) => input.checked)
  );
  let camera = cameraOf(STOPS[shown] ?? STOPS[0]);
  let thumb = shown; // the thumb's place, in stops; CSS keeps it at rest
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
      city.style.visibility = mark.near ? 'visible' : 'hidden';
    });
    targets.update(camera);
  };

  // Ends a turn where it stands: masks off, the leaving text hidden again,
  // the thumb back on the checked stop's rule.
  const settle = () => {
    if (!run) return;
    cancelAnimationFrame(run.raf);
    for (const row of rows) {
      for (const i of [run.from, run.to]) {
        setMask(row[i], null);
        row[i]?.removeAttribute('data-leaving');
      }
    }
    fig.removeAttribute('data-mixing');
    fig.style.removeProperty('--gd-k');
    thumb = run.to;
    run = null;
  };

  const select = (next: number) => {
    const stop = STOPS[next];
    if (!stop) return;
    const now = performance.now();
    // a pick mid-turn turns on from the camera on screen; its text leaves
    // from whichever stop's text the reader sees
    let thumbAt = thumb;
    if (run) {
      const frame = frameAt(run.turn, now - run.start);
      shown = (frame.rows[0] ?? 0) > 0 ? run.to : run.from;
      thumbAt = frame.thumb;
    }
    settle();
    const to = cameraOf(stop);
    const from = shown;
    shown = next;
    thumb = next;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      camera = to;
      draw();
      return;
    }
    // without the masks yet, CSS has already swapped the text
    const text = from !== next ? steps : null;
    if (text) {
      fig.setAttribute('data-mixing', '');
      for (const row of rows) row[from]?.setAttribute('data-leaving', '');
    }
    const turn: Turn = {
      from: camera,
      to,
      ms: turnMs(camera, to),
      thumb: [thumbAt, next],
    };
    const current = { start: now, turn, from, to: next, raf: 0 };
    const levels = [-1, -1];
    run = current;
    const tick = () => {
      const t = performance.now() - current.start;
      const frame = frameAt(turn, t);
      camera = frame.camera;
      fig.style.setProperty('--gd-k', frame.thumb.toFixed(4));
      draw();
      frame.rows.forEach((k, r) => {
        const level = Math.round(DITHER_LEVELS * k);
        if (!text || level === levels[r]) return;
        levels[r] = level;
        setMask(rows[r]?.[from], text.out[level] ?? null);
        setMask(rows[r]?.[next], text.in[level] ?? null);
      });
      if (t >= turn.ms) settle();
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
  pill?.addEventListener(
    'keydown',
    (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const rtl = getComputedStyle(pill).direction === 'rtl';
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
  // the engine owns the thumb's motion from here
  fig.setAttribute('data-live', '');

  return () => {
    off.abort();
    targets.destroy();
    settle();
    fig.removeAttribute('data-live');
  };
}
