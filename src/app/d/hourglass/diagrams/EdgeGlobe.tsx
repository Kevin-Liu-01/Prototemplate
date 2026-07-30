import IsoFrame, { type IsoProps } from './IsoFrame';
import { depth, ISO_COS30, polyline, project, xy, type Pt } from './iso';

/**
 * Edge delivery — the translation CDN as a meridian cage in the family's own
 * projection.
 *
 * Three rules keep it from reading as a tangle, and the third one is why this
 * drawing was rebuilt: it used to have a body. A filled silhouette plus a filled
 * equator plane under fourteen low-contrast wires added up to a soft grey ball
 * rather than a crisp cage — the muddiest object in a family whose whole claim is
 * thin strokes on the page surface. So the fill is gone. What is left is wire,
 * and the wire is set at the family's full line weight on the near face against
 * the hairline on the far one, which is enough to say which side of the sphere a
 * line is on without any shading at all.
 *
 * The mesh is quads only: two latitude rings and the equator plus two polar
 * caps, crossed by six meridians that stop at the caps instead of fanning into a
 * starburst at the poles. Six rather than eight, because at this size the two
 * extra meridians crossed the near face without adding a reading of it.
 *
 * Accent: the point of presence serving this reader. It sits on a mesh
 * intersection with a plumb line down to the equator plane and a leader out to
 * its latency, so it reads as a place on the sphere rather than a dot floating
 * in front of one.
 */

const R = 62;
/** The projection scales an orthographic isometric by √2·cos30, so does the silhouette. */
const SILHOUETTE = R * ISO_COS30 * Math.SQRT2;

/** Rings, poles last: ±72 are the caps the meridians terminate on. */
const LATITUDES = [0, 38, -38, 72, -72];
const LONGITUDES = [0, 60, 120, 180, 240, 300];
const POLE = 72;

/** Samples per full ring, and per meridian arc between the two caps. */
const RING_STEPS = 48;
const ARC_STEPS = 24;

type World = readonly [number, number, number];
type Wire = { d: string; near: boolean };

const rad = (deg: number): number => (deg * Math.PI) / 180;

function sphere(latDeg: number, lonDeg: number): World {
  const lat = rad(latDeg);
  const lon = rad(lonDeg);
  return [R * Math.cos(lat) * Math.cos(lon), R * Math.cos(lat) * Math.sin(lon), R * Math.sin(lat)];
}

const screen = (p: World): Pt => project(p[0], p[1], p[2]);

/**
 * One path, cut into contiguous near and far runs. Splitting by run rather than
 * by segment is what keeps a 5-ring cage at 34 paths instead of 600, and the
 * crossing sample is emitted into both runs so the two arcs meet exactly.
 */
function runs(points: readonly World[], closed: boolean): Wire[] {
  const n = points.length;
  if (n < 2) return [];
  const near = points.map((p) => depth(p[0], p[1], p[2]) > 0);
  const out: Wire[] = [];

  /* A closed ring has to start where a run starts, or the first and last runs
     would be reported as two arcs when they are one. */
  let start = 0;
  if (closed) {
    let k = 0;
    while (k < n && near[k] === near[(k - 1 + n) % n]) k += 1;
    start = k % n;
  }

  let run: Pt[] = [];
  let flag = near[start] ?? true;

  for (let i = 0; i < (closed ? n + 1 : n); i += 1) {
    const point = points[(start + i) % n];
    if (!point) continue;
    const isNear = near[(start + i) % n] ?? flag;
    if (isNear !== flag && run.length > 0) {
      run.push(screen(point));
      out.push({ d: polyline(run), near: flag });
      run = [screen(point)];
      flag = isNear;
      continue;
    }
    run.push(screen(point));
  }

  if (run.length > 1) out.push({ d: polyline(run), near: flag });
  return out;
}

const RINGS: Wire[] = LATITUDES.flatMap((lat) =>
  runs(
    Array.from({ length: RING_STEPS }, (_, i) => sphere(lat, (i * 360) / RING_STEPS)),
    true,
  ),
);

const MERIDIANS: Wire[] = LONGITUDES.flatMap((lon) =>
  runs(
    Array.from({ length: ARC_STEPS + 1 }, (_, i) => sphere(-POLE + (i * 2 * POLE) / ARC_STEPS, lon)),
    false,
  ),
);

/**
 * Points of presence, all on mesh intersections on the near face, every one of
 * them named and carrying its measured latency — a topology labels its nodes
 * or it is a texture. `end` anchors the two labels that sit left of the cage.
 */
type Pop = {
  lat: number;
  lon: number;
  code: string;
  ms: number;
  /** Leader elbow and label anchor, in screen units around the cage centre. */
  elbow: readonly [number, number];
  end?: boolean;
};

const POPS: readonly Pop[] = [
  { lat: 38, lon: 300, code: 'iad', ms: 21, elbow: [76, -58] },
  { lat: 0, lon: 0, code: 'sin', ms: 41, elbow: [74, 42] },
  { lat: 38, lon: 120, code: 'nrt', ms: 34, elbow: [-70, -38], end: true },
  { lat: -38, lon: 60, code: 'syd', ms: 48, elbow: [10, 86] },
];
const HOME = { lat: 38, lon: 0, code: 'fra', ms: 12 } as const;

export default function EdgeGlobe({ className, strokeWidth, accent, title }: IsoProps) {
  const home = sphere(HOME.lat, HOME.lon);
  const pin = screen(home);
  const base = screen([home[0], home[1], 0]);

  return (
    /* 292 wide, cage centred at 146: the west label (`nrt · 34 ms`) is
       end-anchored ~80 units left of centre and runs ~56 more — the old
       268/122 frame cut its leading glyphs at the panel edge, and a cropped
       label is a defect the way a cropped stroke is not. */
    <IsoFrame className={className} strokeWidth={strokeWidth} accent={accent} title={title} viewW={292} viewH={190}>
      <g transform='translate(146 92)'>
        {/* No fill. The equator is drawn as a line like every other ring, and the
            silhouette is a line too — the cage's front and back are told apart by
            stroke weight, which is the one device the whole family already uses. */}
        {RINGS.map((wire, i) => (
          <path key={`r${i}`} className={wire.near ? 'iso-line' : 'iso-hair'} d={wire.d} />
        ))}
        {MERIDIANS.map((wire, i) => (
          <path key={`m${i}`} className={wire.near ? 'iso-line' : 'iso-hair'} d={wire.d} />
        ))}

        <circle className='iso-line' cx={0} cy={0} r={SILHOUETTE} />

        {POPS.map((pop) => {
          const p = screen(sphere(pop.lat, pop.lon));
          const [ex, ey] = pop.elbow;
          const tick = pop.end ? -8 : 8;
          return (
            <g key={pop.code}>
              <circle className='iso-fill-soft' cx={p[0]} cy={p[1]} r={2.4} />
              <path className='iso-soft' d={`M${xy(p)}L${ex} ${ey}l${tick} 0`} />
              <text
                className='iso-label'
                x={ex + tick + (pop.end ? -2.5 : 2.5)}
                y={ey + 2.2}
                textAnchor={pop.end ? 'end' : undefined}
              >
                {pop.code} · {pop.ms} ms
              </text>
            </g>
          );
        })}

        {/* The plumb line to the equator plane — the family's own way of saying
            a point is standing on something rather than hovering over it. The
            home node is the one being served, so it keeps the accent and the
            strong label. */}
        <path className='iso-soft' d={`M${xy(pin)}L${xy(base)}`} />
        <circle className='iso-face-mark' cx={base[0]} cy={base[1]} r={1.8} />
        <circle className='iso-fill-accent' cx={pin[0]} cy={pin[1]} r={3.4} />

        <path className='iso-soft' d={`M${xy(pin)}L72 -32L80 -32`} />
        <text className='iso-label iso-label-strong' x={84} y={-28.6}>
          {HOME.code} · {HOME.ms} ms
        </text>
      </g>
    </IsoFrame>
  );
}
