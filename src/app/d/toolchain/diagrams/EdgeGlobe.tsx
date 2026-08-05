'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { FileJson2, Server, User } from 'lucide-react';
import { useRef, type CSSProperties } from 'react';

import type { IsoProps } from './IsoFrame';
import { prefersReducedMotion } from './lang/lang';

import './edge-globe-v2.css';

gsap.registerPlugin(useGSAP);

/**
 * Edge delivery — the translation CDN as an orthographic globe.
 *
 * The old meridian cage read as a tangle: overlapping ellipses, crossing
 * leaders, a stray plumb line. This drawing is built the other way round,
 * from the story outward. The story is one sentence — a request goes to the
 * closest edge, and the translation is already there — so the drawing is:
 * five points of presence standing on a sparse graticule, one user, and one
 * highlighted great-circle route between the user and the PoP that answers
 * in 12 ms. Everything else is quieter than those three things.
 *
 * Depth is said once, with ink: near graticule arcs draw at the family's
 * regular weight, far arcs are dashed hairlines, and the limb is the
 * strongest neutral line. No fills, no shading.
 *
 * The meridian set is symmetric about the camera (±18°, ±54°) so no
 * meridian ever projects as a dead-vertical line — the old drawing's
 * "plumb line" was the lon-0 meridian doing exactly that. The five PoPs
 * sit on graticule intersections — infrastructure snaps to the grid; the
 * user does not. Latencies are ordered the way geography would order them
 * from a user in fra's neighbourhood: fra 12 < iad 21 < nrt 34 < sin 41 <
 * syd 48. Callout leaders are corner-routed (node → elbow → horizontal
 * run) and fan outward on both sides, so no two ever cross. Glyphs
 * identify, never decorate: a server on each PoP label, a user on the
 * origin, and a file on the payload that travels the route.
 *
 * Motion is one quiet loop: a request dot rides the route out, a ring
 * lands at fra, and the payload chip rides back. Under reduced motion the
 * chip rests mid-route and the dot and ring are removed — the still frame
 * carries the whole argument.
 */

/* ---------------- projection ---------------- */

const R = 92;
const CX = 170;
const CY = 126;
const VIEW_W = 360;
const VIEW_H = 240;

/** Camera latitude: the globe leans toward the reader by 18°. */
const TILT = 18;

const rad = (deg: number): number => (deg * Math.PI) / 180;
const SIN_T = Math.sin(rad(TILT));
const COS_T = Math.cos(rad(TILT));

/** A projected point: screen x/y plus signed depth (z > 0 faces the reader). */
type P3 = { x: number; y: number; z: number };

function point(latDeg: number, lonDeg: number, lift = 0): P3 {
  const lat = rad(latDeg);
  const lon = rad(lonDeg);
  const r = R * (1 + lift);
  const x = r * Math.cos(lat) * Math.sin(lon);
  const y = r * (COS_T * Math.sin(lat) - SIN_T * Math.cos(lat) * Math.cos(lon));
  const z = SIN_T * Math.sin(lat) + COS_T * Math.cos(lat) * Math.cos(lon);
  return { x: CX + x, y: CY - y, z };
}

const fmt = (n: number): string => `${Math.round(n * 100) / 100}`;

function toPath(run: readonly P3[]): string {
  return run.map((p, i) => `${i === 0 ? 'M' : 'L'}${fmt(p.x)} ${fmt(p.y)}`).join('');
}

type Arc = { d: string; front: boolean };

/**
 * One sampled line, cut into contiguous front and back runs. The crossing
 * sample is emitted into both runs so adjacent arcs meet exactly; a closed
 * ring is rotated to start on a boundary so its first and last runs are
 * never reported as two arcs when they are one.
 */
function splitArcs(pts: readonly P3[], closed: boolean): Arc[] {
  const n = pts.length;
  if (n < 2) return [];
  const front = pts.map((p) => p.z >= 0);

  let start = 0;
  if (closed) {
    let k = 0;
    while (k < n && front[k] === front[(k - 1 + n) % n]) k += 1;
    start = k % n;
  }

  const out: Arc[] = [];
  let run: P3[] = [];
  let flag = front[start] ?? true;
  const total = closed ? n + 1 : n;

  for (let i = 0; i < total; i += 1) {
    const idx = (start + i) % n;
    const p = pts[idx];
    if (!p) continue;
    const f = front[idx] ?? flag;
    if (f !== flag && run.length > 0) {
      run.push(p);
      out.push({ d: toPath(run), front: flag });
      run = [p];
      flag = f;
      continue;
    }
    run.push(p);
  }

  if (run.length > 1) out.push({ d: toPath(run), front: flag });
  return out;
}

/* ---------------- graticule ----------------
   A few well-chosen lines: three parallels, four meridians, two polar
   caps the meridians terminate on (stopping short of the poles is what
   avoids the old starburst; leaving lon 0 out is what avoids the old
   plumb line). The spacing is chosen so every PoP below stands exactly
   on an intersection. */

const PARALLELS = [-40, 0, 40];
const MERIDIANS = [-54, -18, 18, 54];
const CAP = 72;
const RING_STEPS = 96;
const ARC_STEPS = 48;

const ring = (lat: number): P3[] =>
  Array.from({ length: RING_STEPS }, (_, i) => point(lat, (i * 360) / RING_STEPS));

const meridian = (lon: number): P3[] =>
  Array.from({ length: ARC_STEPS + 1 }, (_, i) => point(-CAP + (i * 2 * CAP) / ARC_STEPS, lon));

const GRID: Arc[] = [
  ...PARALLELS.flatMap((lat) => splitArcs(ring(lat), true)),
  ...MERIDIANS.flatMap((lon) => splitArcs(meridian(lon), false)),
];

const CAPS: Arc[] = [CAP, -CAP].flatMap((lat) => splitArcs(ring(lat), true));

/* ---------------- the network ----------------
   Five PoPs, every one on a graticule intersection, every one named and
   carrying its measured latency. `fra` is the one serving this reader. */

type Pop = {
  code: string;
  ms: number;
  lat: number;
  lon: number;
  /** Corner-routed leader: node → elbow → horizontal run to the label. */
  elbow: readonly [number, number];
  /** Where the horizontal run ends (left side: smaller than elbow x). */
  tickTo: number;
  iconX: number;
  textX: number;
  home?: boolean;
};

/* The left rail reads iad then fra — the home PoP labels on its own side
   of the sphere (founder note), one row step below iad, its elbow just
   clear of the limb (left edge at y=82 is x≈89.2). The right rail keeps
   nrt/sin/syd top-to-bottom, still in latency order. */
const POPS: readonly Pop[] = [
  { code: 'fra', ms: 12, lat: 40, lon: -18, elbow: [88, 82], tickTo: 76, iconX: 3, textX: 15, home: true },
  { code: 'iad', ms: 21, lat: 40, lon: -54, elbow: [88, 52], tickTo: 76, iconX: 3, textX: 15 },
  { code: 'nrt', ms: 34, lat: 40, lon: 54, elbow: [272, 78], tickTo: 284, iconX: 288, textX: 300 },
  { code: 'sin', ms: 41, lat: 0, lon: 54, elbow: [272, 140], tickTo: 284, iconX: 288, textX: 300 },
  { code: 'syd', ms: 48, lat: -40, lon: 18, elbow: [272, 206], tickTo: 284, iconX: 288, textX: 300 },
];

/** The reader: not infrastructure, so not snapped to the grid. Sitting
 *  east of fra keeps the great circle off the sphere's centre, so the
 *  route projects as a visible arc instead of a straight chord. */
/* The reader's row lives in the right ledger, between sin and syd, so the
   hollow dot is unmistakably "user" — same leader grammar as the PoPs. */
const ORIGIN = { lat: -8, lon: 30, elbow: [272, 172], tickTo: 284, iconX: 288, textX: 300 } as const;

const HOME = POPS.find((p) => p.home) ?? POPS[0];

/* ---------------- the route ----------------
   The great circle from the user to the nearest PoP. Between two
   reader-facing points an orthographic great circle projects almost
   straight, so the drawn route is bowed off its chord — perpendicular,
   away from the sphere's centre — the way a flight path is lifted off a
   map. That keeps it legible as a route rather than another graticule
   line. Slerp in view space; both endpoints face the reader. */

const ROUTE_STEPS = 32;
const ROUTE_BOW = 9;

type V3 = readonly [number, number, number];

function unit(latDeg: number, lonDeg: number): V3 {
  const lat = rad(latDeg);
  const lon = rad(lonDeg);
  return [
    Math.cos(lat) * Math.sin(lon),
    COS_T * Math.sin(lat) - SIN_T * Math.cos(lat) * Math.cos(lon),
    SIN_T * Math.sin(lat) + COS_T * Math.cos(lat) * Math.cos(lon),
  ];
}

function slerp(a: V3, b: V3, t: number): V3 {
  const dot = Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  const omega = Math.acos(dot);
  if (omega < 1e-6) return a;
  const sa = Math.sin((1 - t) * omega) / Math.sin(omega);
  const sb = Math.sin(t * omega) / Math.sin(omega);
  return [sa * a[0] + sb * b[0], sa * a[1] + sb * b[1], sa * a[2] + sb * b[2]];
}

const ROUTE_PTS: readonly P3[] = (() => {
  const from = unit(ORIGIN.lat, ORIGIN.lon);
  const home = HOME ? unit(HOME.lat, HOME.lon) : from;
  const base = Array.from({ length: ROUTE_STEPS + 1 }, (_, i) => {
    const v = slerp(from, home, i / ROUTE_STEPS);
    return { x: CX + R * v[0], y: CY - R * v[1], z: v[2] };
  });

  const a = base[0];
  const b = base[base.length - 1];
  if (!a || !b) return base;

  /* Unit normal of the chord, signed to point away from the sphere's
     centre, so the bow reads as lift rather than a dip through the ball. */
  const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  let nx = -(b.y - a.y) / len;
  let ny = (b.x - a.x) / len;
  const mx = (a.x + b.x) / 2 - CX;
  const my = (a.y + b.y) / 2 - CY;
  if (nx * mx + ny * my < 0) {
    nx = -nx;
    ny = -ny;
  }

  return base.map((p, i) => {
    const s = ROUTE_BOW * Math.sin((Math.PI * i) / ROUTE_STEPS);
    return { x: p.x + nx * s, y: p.y + ny * s, z: p.z };
  });
})();

const ROUTE_D = toPath(ROUTE_PTS);

/** Where the payload chip rests when nothing animates (and under reduced motion). */
const CHIP_REST: P3 = ROUTE_PTS[Math.round(ROUTE_PTS.length * 0.55)] ?? { x: CX, y: CY, z: 1 };

const ORIGIN_PT = point(ORIGIN.lat, ORIGIN.lon);

/** Custom properties are legal inline styles but absent from CSSProperties. */
type StyleVars = CSSProperties & Record<`--${string}`, string | number>;

export default function EdgeGlobe({ className, strokeWidth, accent = true, title }: IsoProps) {
  const root = useRef<SVGSVGElement>(null);
  const routeRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const chipRef = useRef<SVGGElement>(null);

  useGSAP(
    () => {
      const routeEl = routeRef.current;
      const dotEl = dotRef.current;
      const ringEl = ringRef.current;
      const chipEl = chipRef.current;
      if (!routeEl || !dotEl || !ringEl || !chipEl) return;
      if (prefersReducedMotion()) {
        /* The stylesheet already rests the chip mid-route and removes the
           dot and ring; nothing to schedule. */
        return;
      }

      const length = routeEl.getTotalLength();
      const place = (el: SVGCircleElement | SVGGElement, t: number): void => {
        const p = routeEl.getPointAtLength(length * t);
        gsap.set(el, { x: p.x, y: p.y });
      };

      const req = { t: 0 };
      const res = { t: 1 };

      /* One quiet loop: request out (dot), arrival ring at fra, payload
         chip back. Long holds between cycles keep the band calm. */
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.6 });
      tl.set(req, { t: 0 }, 0)
        .set(res, { t: 1 }, 0)
        .call(() => place(dotEl, 0), undefined, 0)
        .to(dotEl, { autoAlpha: 0.95, duration: 0.15 }, 0)
        .to(req, { t: 1, duration: 1.0, ease: 'power1.inOut', onUpdate: () => place(dotEl, req.t) }, 0.05)
        .to(dotEl, { autoAlpha: 0, duration: 0.18 }, 0.95)
        .fromTo(
          ringEl,
          { attr: { r: 4.6 }, autoAlpha: 0.85 },
          { attr: { r: 13 }, autoAlpha: 0, duration: 0.75, ease: 'power2.out' },
          1.05,
        )
        .to(chipEl, { autoAlpha: 1, duration: 0.22 }, 1.2)
        .to(res, { t: 0, duration: 1.15, ease: 'power1.inOut', onUpdate: () => place(chipEl, res.t) }, 1.2)
        .to(chipEl, { autoAlpha: 0, duration: 0.35 }, 2.5);
    },
    { scope: root },
  );

  const style: StyleVars = {};
  if (strokeWidth !== undefined) style['--eg-sw'] = strokeWidth;

  const homePt = HOME ? point(HOME.lat, HOME.lon) : ORIGIN_PT;

  return (
    <svg
      className={['eg', accent ? 'eg-accent-on' : 'eg-accent-off', className].filter(Boolean).join(' ')}
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      style={style}
      ref={root}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}

      {/* far hemisphere first, then near, then the limb over both */}
      {CAPS.map((arc, i) => (
        <path key={`c${i}`} className={arc.front ? 'eg-hair' : 'eg-back'} d={arc.d} />
      ))}
      {GRID.filter((arc) => !arc.front).map((arc, i) => (
        <path key={`b${i}`} className='eg-back' d={arc.d} />
      ))}
      {GRID.filter((arc) => arc.front).map((arc, i) => (
        <path key={`f${i}`} className='eg-front' d={arc.d} />
      ))}
      <circle className='eg-limb' cx={CX} cy={CY} r={R} />

      {/* corner-routed callouts: node → elbow → horizontal run → label.
          Each label ships a wide and a compact rendering; the stylesheet
          shows exactly one, so on phones the type can step up to the 11px
          floor without the wide form overrunning the viewBox. */}
      {POPS.map((pop) => {
        const p = point(pop.lat, pop.lon);
        const [ex, ey] = pop.elbow;
        const labelClass = pop.home ? 'eg-label eg-label-strong' : 'eg-label';
        return (
          <g key={pop.code}>
            <path className='eg-lead' d={`M${fmt(p.x)} ${fmt(p.y)}L${ex} ${ey}L${pop.tickTo} ${ey}`} />
            <Server
              className={pop.home ? 'eg-icon eg-icon-strong' : 'eg-icon'}
              x={pop.iconX}
              y={ey - 4.5}
              width={9}
              height={9}
              strokeWidth={2}
              aria-hidden
            />
            <text className={`${labelClass} eg-label-wide`} x={pop.textX} y={ey + 2.6}>
              {pop.code} · {pop.ms} ms
            </text>
            <text className={`${labelClass} eg-label-compact`} x={pop.textX} y={ey + 2.6} aria-hidden>
              {pop.code} {pop.ms}ms
            </text>
          </g>
        );
      })}

      {/* the user's callout, lower left */}
      <path
        className='eg-lead'
        d={`M${fmt(ORIGIN_PT.x)} ${fmt(ORIGIN_PT.y)}L${ORIGIN.elbow[0]} ${ORIGIN.elbow[1]}L${ORIGIN.tickTo} ${ORIGIN.elbow[1]}`}
      />
      <User className='eg-icon' x={ORIGIN.iconX} y={ORIGIN.elbow[1] - 4.5} width={9} height={9} strokeWidth={2} aria-hidden />
      <text className='eg-label' x={ORIGIN.textX} y={ORIGIN.elbow[1] + 2.6}>
        user
      </text>

      {/* the one emphasized element: the route to the nearest PoP */}
      <path className='eg-route' d={ROUTE_D} ref={routeRef} />

      {/* nodes over the route; the serving PoP wears the doubled ring */}
      {POPS.filter((pop) => !pop.home).map((pop) => {
        const p = point(pop.lat, pop.lon);
        return <circle key={`n-${pop.code}`} className='eg-node' cx={fmt(p.x)} cy={fmt(p.y)} r={2.4} />;
      })}
      <circle className='eg-thread' cx={fmt(homePt.x)} cy={fmt(homePt.y)} r={4.7} />
      <circle className='eg-thread' cx={fmt(homePt.x)} cy={fmt(homePt.y)} r={6.6} />
      <circle className='eg-node-home' cx={fmt(homePt.x)} cy={fmt(homePt.y)} r={3.1} />
      <circle className='eg-origin-dot' cx={fmt(ORIGIN_PT.x)} cy={fmt(ORIGIN_PT.y)} r={3} />

      {/* the pulse: request dot out, arrival ring, payload chip back */}
      <circle className='eg-pulse-ring' cx={fmt(homePt.x)} cy={fmt(homePt.y)} r={4.6} ref={ringRef} />
      <circle
        className='eg-dot'
        r={2.2}
        transform={`translate(${fmt(ROUTE_PTS[0]?.x ?? CX)} ${fmt(ROUTE_PTS[0]?.y ?? CY)})`}
        ref={dotRef}
      />
      <g className='eg-chip' transform={`translate(${fmt(CHIP_REST.x)} ${fmt(CHIP_REST.y)})`} ref={chipRef}>
        <rect className='eg-chip-bg' x={-7.5} y={-7.5} width={15} height={15} rx={3} />
        <FileJson2 className='eg-chip-icon' x={-5.5} y={-5.5} width={11} height={11} strokeWidth={2} aria-hidden />
      </g>
    </svg>
  );
}
