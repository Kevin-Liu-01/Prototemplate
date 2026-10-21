/* Variant B's engine. One clock drives the turn, the route, the label and
   the passage: a pick starts a move from the frame on screen, so a pick
   mid-move turns from where the globe is. The label counts the coordinates
   the globe faces and names no city while it moves: the leaving city and
   year step out as the move starts, the arriving ones step in as the globe
   lands. The passage's rows step to the new language through the 8 by 8
   screen (mount-passage.ts) on this clock, centred on the turn. The radios
   (LanguageLinks) own the choice, so the server markup works without it. */
import { DITHER_LEVELS, smoothstep } from '@/app/d/blog-globe/_shared/ditherMask';
import { mountPassage } from '@/app/d/blog-globe/_rounds/r3/mount-passage';
import { turnToward } from '@/app/d/blog-globe/_rounds/r3/ortho';
import { formatCoordinates, STOPS } from '@/app/d/blog-globe/_rounds/r3/stops';
import { mountCityTargets } from '@/app/d/blog-globe/_rounds/r3/targets';
import {
  angle,
  CITY_DEPTH,
  discAt,
  drawFrame,
  poseAt,
  stopsAlong,
  type Pose,
} from '@/app/d/blog-globe/_rounds/r3/variant-b/geometry';
import {
  loadMasks,
  setMask,
  STEP_MS,
  stepIndex,
  type Masks,
} from '@/app/d/blog-globe/_shared/versions-field';

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

/** The label's steps in a move `ms` long, t ms in, each 0 to 1: the leaving place out as the move starts, the arriving place in as it lands. */
export function stepsAt(ms: number, t: number) {
  return {
    leave: smoothstep(t / STEP_MS),
    arrive: smoothstep((t - (ms - STEP_MS)) / STEP_MS),
  };
}

/** When the passage's step, `length` ms, starts in a move `ms` long: centred on the turn, so the words change while the ground moves fastest. */
export function passageStart(ms: number, length: number): number {
  return Math.max(0, (ms - length) / 2);
}

/** Mounts the engine on the figure's server markup and returns the cleanup. */
export function mountGlobeB(fig: HTMLElement): () => void {
  const pick = <T extends Element>(selector: string) =>
    fig.querySelector<T>(selector);
  const inputs = [...fig.querySelectorAll<HTMLInputElement>('.gl-input')];
  const links = pick<HTMLElement>('.gl');
  const words = pick<HTMLElement>('.gp');
  const grid = pick<SVGPathElement>('.gbb-grid');
  const coast = pick<SVGPathElement>('.gbb-coast');
  const routes = [...fig.querySelectorAll<SVGPathElement>('.gbb-route-live')];
  const cities = [...fig.querySelectorAll<SVGGElement>('.gbb-city')];
  const wheres = [...fig.querySelectorAll<HTMLElement>('.gbb-where')];
  const coords = [...fig.querySelectorAll<HTMLElement>('.gbb-coord')];
  const places = [...fig.querySelectorAll<HTMLElement>('.gbb-place')];
  if (!grid || !coast || !links || !words || inputs.length !== STOPS.length) {
    return () => undefined;
  }

  const off = new AbortController();
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  // a click on a city in the lens checks its radio, so the change listener below runs it
  const targets = mountCityTargets(pick<HTMLElement>('.gct'), {
    inputs,
    disc: ({ width }) => discAt(width),
    minDepth: CITY_DEPTH,
  });
  const exact = (i: number) => formatCoordinates(STOPS[i] ?? STOPS[0]);
  let steps: Masks | null = null;

  // the label's masks decode once the figure is within a viewport of the screen
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
  const passage = mountPassage(words, target);
  let shown: Pose = poseAt(target);
  let move: {
    from: Pose;
    to: Pose;
    start: number;
    ms: number;
    /** ms into the move when the passage's step starts */
    text: number;
    /** the stop whose place leaves; null where none was shown */
    leavePlace: number | null;
    levels: { leave: number; arrive: number };
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

  // Clears the label's steps: masks off, the leaving place hidden again.
  const clearSteps = () => {
    for (const el of places) setMask(el, null);
    for (const el of wheres) el.removeAttribute('data-leaving');
    fig.removeAttribute('data-mixing');
    fig.removeAttribute('data-counting');
  };

  const settle = () => {
    cancelAnimationFrame(raf);
    raf = 0;
    move = null;
    passage.frame(Infinity);
    clearSteps();
    draw(poseAt(target));
    coords.forEach((coord, i) => {
      coord.textContent = exact(i);
    });
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
    passage.frame(t - move.text);

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
    const from = shown;
    cancelAnimationFrame(raf);
    move = null;
    clearSteps();
    coords.forEach((coord, j) => {
      coord.textContent = exact(j);
    });
    target = i;
    // the rows wait for this clock; under reduced motion they cut
    passage.select(i, 'caller');
    if (reduced()) {
      settle();
      return;
    }
    const to = poseAt(i);
    const ms = moveMs(from, to);
    move = {
      from,
      to,
      start: now,
      ms,
      text: passageStart(ms, passage.duration),
      leavePlace: steps ? leavePlace : null,
      levels: { leave: -1, arrive: -1 },
    };
    fig.setAttribute('data-counting', '');
    if (steps) {
      fig.setAttribute('data-mixing', '');
      if (leavePlace !== null)
        wheres[leavePlace]?.setAttribute('data-leaving', '');
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
  links.addEventListener(
    'keydown',
    (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const rtl = getComputedStyle(links).direction === 'rtl';
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
    passage.destroy();
    cancelAnimationFrame(raf);
    clearSteps();
    delete fig.dataset.live;
  };
}
