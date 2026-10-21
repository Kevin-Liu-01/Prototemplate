/* Clickable cities for the globe figures. CityTargets.tsx renders one hit
   target per stop over the drawn globe; mountCityTargets moves them with
   the variant's camera, one cheap update() per drawn frame with no React
   render, and turns a click into a click on the stop's radio. The radios
   stay the one source of the choice, and the variant's own change
   listener runs the turn, the label and the passage as it does for a pick
   in the pill. */
import {
  project,
  type GlobeCamera,
  type GlobeView,
  type LatLon,
} from '@/app/d/blog-globe/_rounds/r3/ortho';
import { STOPS } from '@/app/d/blog-globe/_rounds/r3/stops';

/** The drawn globe's centre and radius, in CSS px from the overlay's top left. */
export type GlobeDisc = Pick<GlobeView, 'cx' | 'cy' | 'radius'>;

/** A stop on the drawn globe, in CSS px from the overlay's top left; `facing` is false on the far side and within `minDepth` of the limb. */
export type StopPoint = { x: number; y: number; facing: boolean };

/** Where each stop sits for `camera` on `disc`, in `stops` order. `minDepth` (0 to 1, the cosine of a city's angle from the point faced) keeps a city near the limb out of reach where the variant stops drawing it. */
export function stopPoints(
  camera: GlobeCamera,
  stops: readonly LatLon[],
  disc: GlobeDisc,
  minDepth = 0
): StopPoint[] {
  const view: GlobeView = {
    lat0: camera.lat0,
    lon0: camera.lon0,
    cx: disc.cx,
    cy: disc.cy,
    radius: disc.radius,
  };
  return stops.map((stop) => {
    const p = project(view, stop);
    return { x: p.x, y: p.y, facing: p.depth > minDepth };
  });
}

/** The stop whose target (a square `half` px each way from its city) holds (x, y) and whose city is nearest it, or -1. Where targets overlap on a small globe, each city keeps the side nearest it. */
export function stopAt(
  points: readonly StopPoint[],
  x: number,
  y: number,
  half: number
): number {
  let best = -1;
  let bestDistance = Infinity;
  points.forEach((p, i) => {
    const dx = Math.abs(p.x - x);
    const dy = Math.abs(p.y - y);
    if (!p.facing || dx > half || dy > half) return;
    const distance = Math.hypot(dx, dy);
    if (distance < bestDistance) {
      best = i;
      bestDistance = distance;
    }
  });
  return best;
}

export type CityTargets = {
  /** Moves each target onto its city as `camera` faces the globe and hides those behind it. Call it with every drawn frame: it writes a style only where one changed and reads no layout once the overlay's size is known. */
  update(camera: GlobeCamera): void;
  /** Drops the listeners and the resize observer. */
  destroy(): void;
};

export type CityTargetsOptions = {
  /** The figure's radios in STOPS order. A click on a city checks its radio, so the variant's change listener does the rest. */
  inputs: readonly HTMLInputElement[];
  /** The drawn globe for the overlay's size in CSS px. */
  disc: (box: { width: number; height: number }) => GlobeDisc;
  /** See stopPoints; 0 makes the whole facing side clickable. */
  minDepth?: number;
};

const IDLE: CityTargets = {
  update: () => undefined,
  destroy: () => undefined,
};

/** Takes over CityTargets' server markup (`layer` is its `.gct` root, null when the figure has none) and returns the update call. */
export function mountCityTargets(
  layer: HTMLElement | null,
  { inputs, disc, minDepth = 0 }: CityTargetsOptions
): CityTargets {
  if (!layer) return IDLE;
  const targets = [...layer.querySelectorAll<HTMLElement>('.gct-target')];
  const shown = targets.map(() => false);
  const placed = targets.map(() => '');
  const off = new AbortController();
  const listen = { signal: off.signal };
  let box: { width: number; height: number } | null = null;
  let camera: GlobeCamera | null = null;
  let points: StopPoint[] = [];
  // the pointer over a target, in the overlay's CSS px, and that target's half size
  let pointer: { x: number; y: number; half: number } | null = null;
  let hovered = -1;

  const hover = (i: number) => {
    if (i === hovered) return;
    targets[hovered]?.removeAttribute('data-hover');
    targets[i]?.setAttribute('data-hover', '');
    hovered = i;
  };

  const place = () => {
    if (!camera) return;
    if (!box) {
      const rect = layer.getBoundingClientRect();
      box = { width: rect.width, height: rect.height };
    }
    points = stopPoints(camera, STOPS, disc(box), minDepth);
    targets.forEach((el, i) => {
      const p = points[i];
      const facing = p?.facing === true;
      if (p && facing) {
        const transform = `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px)`;
        if (transform !== placed[i]) {
          placed[i] = transform;
          el.style.transform = transform;
        }
      }
      if (facing !== shown[i]) {
        shown[i] = facing;
        el.style.visibility = facing ? 'visible' : '';
      }
      el.toggleAttribute('data-current', inputs[i]?.checked === true);
    });
    // during a turn the cities move under a still pointer
    if (pointer) hover(stopAt(points, pointer.x, pointer.y, pointer.half));
  };

  // The stop under a pointer event, nearest city first, and where it was.
  const read = (event: MouseEvent) => {
    const el =
      event.target instanceof Element
        ? event.target.closest<HTMLElement>('.gct-target')
        : null;
    if (!el) return null;
    const rect = layer.getBoundingClientRect();
    const at = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      half: el.offsetWidth / 2,
    };
    return { at, stop: stopAt(points, at.x, at.y, at.half) };
  };

  layer.addEventListener(
    'pointermove',
    (event) => {
      const hit = read(event);
      pointer = hit?.at ?? null;
      hover(hit?.stop ?? -1);
    },
    listen
  );

  layer.addEventListener(
    'pointerout',
    (event) => {
      const next = event.relatedTarget;
      if (next instanceof Element && layer.contains(next)) return;
      pointer = null;
      hover(-1);
    },
    listen
  );

  layer.addEventListener(
    'click',
    (event) => {
      const input = inputs[read(event)?.stop ?? -1];
      // the current city is already chosen: nothing to do
      if (!input || input.checked) return;
      input.click();
    },
    listen
  );

  // A press leaves the focus where it was: the targets are hidden from
  // assistive technology, which reaches the same choice through the radios.
  layer.addEventListener(
    'mousedown',
    (event) => {
      if (read(event)) event.preventDefault();
    },
    listen
  );

  const resize =
    typeof ResizeObserver === 'undefined'
      ? null
      : new ResizeObserver(([entry]) => {
          if (!entry) return;
          box = {
            width: entry.contentRect.width,
            height: entry.contentRect.height,
          };
          place();
        });
  resize?.observe(layer);

  return {
    update(next) {
      camera = next;
      place();
    },
    destroy() {
      off.abort();
      resize?.disconnect();
    },
  };
}
