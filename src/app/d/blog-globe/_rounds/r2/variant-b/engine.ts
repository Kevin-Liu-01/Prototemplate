/* Variant B's engine. One clock drives the turn, the route, the timeline,
   the label and the passage: a pick starts a move from the frame on
   screen, so a pick mid-move turns from where the globe is. The label
   counts the coordinates the globe faces and names no city while it moves:
   the leaving city and year step out as the move starts, the arriving ones
   step in as the globe lands. Across the turn's midpoint the passage steps
   to the new language through the 8 by 8 screen (ditherMask.ts), as the
   Versions figure's rows do. The radios own the choice, so the server
   markup works without it. */
import {
  DITHER_LEVELS,
  ditherMaskUrl,
  smoothstep,
} from '@/app/d/blog-globe/_shared/ditherMask';
import { turnToward } from '@/app/d/blog-globe/_rounds/r2/ortho';
import {
  formatCoordinates,
  STOPS,
} from '@/app/d/blog-globe/_rounds/r2/stops';
import { mountCityTargets } from '@/app/d/blog-globe/_rounds/r2/targets';
import {
  angle,
  discAt,
  drawFrame,
  poseAt,
  stopsAlong,
  type Pose,
} from '@/app/d/blog-globe/_rounds/r2/variant-b/geometry';
import { stepIndex } from '@/app/d/blog-globe/_shared/versions-field';

const STEP_MS = 150; // one text step, as the Versions figure's rows
const CELL = 2; // CSS px per cell of the step's screen
const RAD = Math.PI / 180;

/** A move's length: 0.7 s and 8 ms a degree of turn, at most 1.5 s. */
export function moveMs(from: Pose, to: Pose): number {
  const arc =
    angle({ lat: from.lat0, lon: from.lon0 }, { lat: to.lat0, lon: to.lon0 }) /
    RAD;
  return Math.min(1500, 700 + 8 * arc);
}

/** gt-motion's move from one place to another: power2.inOut, no overshoot. */
function easeMove(k: number): number {
  const t = Math.min(1, Math.max(0, k));
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}

/** The pose `k` (0 to 1, before easing) of the way from `from` to `to`: the camera the short way round, the route by length. */
export function poseBetween(from: Pose, to: Pose, k: number): Pose {
  const e = easeMove(k);
  return {
    ...turnToward(from, to, e),
    route: from.route + (to.route - from.route) * e,
  };
}

/** The steps of a move `ms` long, t ms in, each 0 to 1: the leaving place out, the passage across the midpoint, the arriving place in as it lands. */
export function stepsAt(ms: number, t: number) {
  return {
    leave: smoothstep(t / STEP_MS),
    passage: smoothstep((t - (ms - STEP_MS) / 2) / STEP_MS),
    arrive: smoothstep((t - (ms - STEP_MS)) / STEP_MS),
  };
}

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

/** Mounts the engine on the figure's server markup and returns the cleanup. */
export function mountGlobeB(fig: HTMLElement): () => void {
  const pick = <T extends Element>(selector: string) =>
    fig.querySelector<T>(selector);
  const inputs = [
    ...fig.querySelectorAll<HTMLInputElement>('.gbb-stop > input'),
  ];
  const timeline = pick<HTMLElement>('.gbb-tl');
  const grid = pick<SVGPathElement>('.gbb-grid');
  const coast = pick<SVGPathElement>('.gbb-coast');
  const routes = [...fig.querySelectorAll<SVGPathElement>('.gbb-route-live')];
  const cities = [...fig.querySelectorAll<SVGGElement>('.gbb-city')];
  const wheres = [...fig.querySelectorAll<HTMLElement>('.gbb-where')];
  const coords = [...fig.querySelectorAll<HTMLElement>('.gbb-coord')];
  const places = [...fig.querySelectorAll<HTMLElement>('.gbb-place')];
  const passages = [...fig.querySelectorAll<HTMLElement>('.gbb-text')];
  if (!grid || !coast || !timeline || inputs.length !== STOPS.length) {
    return () => undefined;
  }

  const off = new AbortController();
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  // a click on a city checks its radio, so the change listener below runs it
  const targets = mountCityTargets(pick<HTMLElement>('.gct'), {
    inputs,
    disc: ({ width }) => discAt(width),
  });
  const exact = (i: number) => formatCoordinates(STOPS[i] ?? STOPS[0]);
  let steps: Masks | null = null;

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

  let target = Math.max(
    0,
    inputs.findIndex((input) => input.checked)
  );
  let shown: Pose = poseAt(target);
  let passageShown = target; // the passage on screen
  let move: {
    from: Pose;
    to: Pose;
    start: number;
    ms: number;
    /** the stops whose place and passage leave; null where nothing was shown */
    leavePlace: number | null;
    leavePassage: number;
    levels: { leave: number; passage: number; arrive: number };
  } | null = null;
  let raf = 0;

  const draw = (pose: Pose) => {
    const frame = drawFrame(pose);
    grid.setAttribute('d', frame.grid);
    coast.setAttribute('d', frame.coast);
    for (const route of routes) route.setAttribute('d', frame.route);
    frame.cities.forEach(({ x, y, near }, i) => {
      cities[i]?.setAttribute('transform', `translate(${x} ${y})`);
      cities[i]?.setAttribute('visibility', near ? 'visible' : 'hidden');
    });
    fig.style.setProperty('--gbb-k', stopsAlong(pose.route).toFixed(3));
    targets.update(pose);
    shown = pose;
  };

  // Clears every step: masks off, the leaving rows hidden again.
  const clearSteps = () => {
    for (const el of [...places, ...passages]) setMask(el, null);
    for (const el of [...wheres, ...passages])
      el.removeAttribute('data-leaving');
    fig.removeAttribute('data-mixing');
    fig.removeAttribute('data-counting');
  };

  const settle = () => {
    cancelAnimationFrame(raf);
    raf = 0;
    move = null;
    clearSteps();
    draw(poseAt(target));
    coords.forEach((coord, i) => {
      coord.textContent = exact(i);
    });
    passageShown = target;
  };

  const tick = (now: number) => {
    if (!move) return;
    const t = now - move.start;
    const pose = poseBetween(move.from, move.to, t / move.ms);
    draw(pose);
    // the label reads the point the globe faces, at the precision of the stop it turns to
    const coord = coords[target];
    const text = formatCoordinates({
      lat: pose.lat0,
      lon: pose.lon0,
      places: (STOPS[target] ?? STOPS[0]).places,
    });
    if (coord && coord.textContent !== text) coord.textContent = text;

    const k = stepsAt(move.ms, t);
    const level = (v: number) => Math.round(DITHER_LEVELS * v);
    if (steps) {
      const { levels } = move;
      if (move.leavePlace !== null && level(k.leave) !== levels.leave) {
        levels.leave = level(k.leave);
        setMask(places[move.leavePlace], steps.out[levels.leave] ?? null);
        if (levels.leave >= DITHER_LEVELS) {
          wheres[move.leavePlace]?.removeAttribute('data-leaving');
          setMask(places[move.leavePlace], null);
          move.leavePlace = null;
        }
      }
      if (move.leavePassage !== target && level(k.passage) !== levels.passage) {
        levels.passage = level(k.passage);
        setMask(passages[move.leavePassage], steps.out[levels.passage] ?? null);
        setMask(passages[target], steps.in[levels.passage] ?? null);
        if (levels.passage > 0) passageShown = target;
      }
      if (k.arrive > 0 && level(k.arrive) !== levels.arrive) {
        levels.arrive = level(k.arrive);
        fig.removeAttribute('data-counting');
        setMask(places[target], steps.in[levels.arrive] ?? null);
      }
    } else if (k.arrive > 0) {
      fig.removeAttribute('data-counting');
    }
    if (t >= move.ms) settle();
    else raf = requestAnimationFrame(tick);
  };

  const select = (i: number) => {
    if (i === target) return;
    const now = performance.now();
    // what the reader sees now is where the next move starts
    let leavePlace: number | null = target;
    if (move) {
      const k = stepsAt(move.ms, now - move.start);
      leavePlace = k.arrive > 0 ? target : null;
    }
    const leavePassage = passageShown;
    const from = shown;
    cancelAnimationFrame(raf);
    move = null;
    clearSteps();
    coords.forEach((coord, j) => {
      coord.textContent = exact(j);
    });
    target = i;
    if (reduced()) {
      settle();
      return;
    }
    const to = poseAt(i);
    move = {
      from,
      to,
      start: now,
      ms: moveMs(from, to),
      leavePlace: steps ? leavePlace : null,
      leavePassage,
      levels: { leave: -1, passage: -1, arrive: -1 },
    };
    fig.setAttribute('data-counting', '');
    if (steps) {
      fig.setAttribute('data-mixing', '');
      if (leavePlace !== null)
        wheres[leavePlace]?.setAttribute('data-leaving', '');
      if (leavePassage !== i) {
        passages[leavePassage]?.setAttribute('data-leaving', '');
        // the arriving passage waits behind the empty mask for its step
        setMask(passages[i], steps.in[0] ?? null);
      }
    }
    tick(now);
  };

  fig.addEventListener(
    'change',
    (event) => {
      const input = event.target;
      if (!(input instanceof HTMLInputElement)) return;
      const i = inputs.indexOf(input);
      if (i >= 0) select(i);
    },
    { signal: off.signal }
  );

  // The keys, here rather than native: WebKit's radios neither wrap nor mirror.
  timeline.addEventListener(
    'keydown',
    (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const rtl = getComputedStyle(timeline).direction === 'rtl';
      const next = stepIndex(e.key, target, inputs.length, rtl);
      const input = inputs[next ?? -1];
      if (next === null || !input) return;
      e.preventDefault();
      input.checked = true;
      input.focus();
      select(next);
    },
    { signal: off.signal }
  );

  // the server drew the first stop's camera; a pick made before this ran is drawn at once
  draw(shown);
  fig.dataset.live = '';

  return () => {
    off.abort();
    targets.destroy();
    cancelAnimationFrame(raf);
    clearSteps();
    delete fig.dataset.live;
  };
}
