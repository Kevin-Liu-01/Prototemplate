'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Fragment, useRef, type ReactNode } from 'react';

import LocaleTag from '../components/LocaleTag';
import IsoFrame from '../diagrams/IsoFrame';
import { IsoArrow, IsoPlane, IsoSlab, IsoWire } from '../diagrams/IsoSolid';
import {
  ISO_COS30,
  frontEdge,
  leftFace,
  rightFace,
  roundedPolygon,
  segment,
  silhouette,
  topFace,
  type IsoBox,
} from '../diagrams/iso';

import './enterprise-iso.css';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * The governed column — this page's bespoke isometric, a sibling of the dark
 * band's stack (same 30° projection kit, same glass-plate material, same
 * gauges) drawn for the enterprise story instead of the toolchain's:
 * organization planes at the TOP (glossary, style directives, scoped access)
 * press down through the review tier (the gate, the guarded Locadex PR) onto
 * the delivery plane at the base — a wider foundation plate carrying the edge
 * topology and the versioned rollout. Occlusion is the argument: what ships
 * sits under everything the organization decided.
 *
 * The captions ledger hangs to the right, one row per plane grouped by tier,
 * and each plane is wired to its row by a corner-routed leader at the page's
 * doubled gauge — two parallel 1px lines, 3px apart, never merging
 * (THREAD_MOTIF). Leaders are drawn in an HTML-pixel overlay measured off
 * invisible anchors in the drawing, so the pair lands exactly on its row at
 * any width; the geometry redraws on resize and hides when the layout folds.
 *
 * Rest state IS the still: the review-gate plane holds the doubled top edge,
 * the full-ink leader and the lit caption ("nothing ships until someone says
 * so" is the enterprise hinge). Hover/focus/tap moves the highlight and dims
 * the rest, transiently; reduced motion gets the finished still with instant
 * state changes. Accent is spent once, on the live version chip (v214) the
 * delivery plate carries.
 */

const SIZE = 86;
const BASE_SIZE = 110;
const THICK = 3.2;
const GAP = 34;

/** Rest-state highlight: the review gate, the page's argument. */
const DEFAULT_ACTIVE = 2;

type TierName = 'organization' | 'review' | 'delivery';

type ColumnLayer = {
  /** Stable id, shared between plane, leader and caption row. */
  id: string;
  tier: TierName;
  name: string;
  /** The ledger value — real product state, verbatim from this page. */
  cap: ReactNode;
  aria: string;
};

/** Bottom plane first — delivery is the foundation the column stands on. */
const LAYERS: readonly ColumnLayer[] = [
  {
    id: 'edge',
    tier: 'delivery',
    name: 'edge delivery',
    cap: <>fra 12 ms · v214 live · rollback ↩</>,
    aria: 'edge delivery — fra 12 ms, version 214 live, rollback is one step',
  },
  {
    id: 'locadex-pr',
    tier: 'review',
    name: 'guarded locadex pr',
    cap: <>PR #218 · auto-merge off</>,
    aria: 'guarded Locadex PR — PR #218, auto-merge off, review required',
  },
  {
    id: 'review-gate',
    tier: 'review',
    name: 'review gate',
    cap: (
      <>
        <LocaleTag code='es' /> <LocaleTag code='ja' /> approved · <LocaleTag code='fr' /> held
      </>
    ),
    aria: 'review gate — Spanish and Japanese approved, French held',
  },
  {
    id: 'access',
    tier: 'organization',
    name: 'scoped access',
    cap: (
      <>
        @jun — <LocaleTag code='ja' /> only
      </>
    ),
    aria: 'scoped access — @jun, Japanese files only',
  },
  {
    id: 'directives',
    tier: 'organization',
    name: 'style directives',
    cap: (
      <>
        Use formal &ldquo;Sie.&rdquo; · <LocaleTag code='de' />
      </>
    ),
    aria: 'style directives — use formal Sie, German',
  },
  {
    id: 'glossary',
    tier: 'organization',
    name: 'glossary',
    cap: <>Locadex → do not translate</>,
    aria: 'glossary — Locadex, do not translate',
  },
];

/** The ledger, top plane first, grouped under its tier label. */
const TIERS: readonly { label: TierName; rows: readonly (ColumnLayer & { i: number })[] }[] = (
  ['organization', 'review', 'delivery'] as const
).map((label) => ({
  label,
  rows: LAYERS.map((layer, i) => ({ ...layer, i }))
    .filter((layer) => layer.tier === label)
    .reverse(),
}));

const layerSize = (i: number): number => (i === 0 ? BASE_SIZE : SIZE);
const layerZ = (i: number): number => i * GAP;

/** Depth cue, spent on paint like the sibling: 0 at the base, 1 at the top. */
const stackDepth = (i: number): number => i / (LAYERS.length - 1);

/* ---- the glass plate: the sibling material, verbatim ------------------- */

function GlassPlate({ size, z, depth }: { size: number; z: number; depth: number }) {
  const half = size / 2;
  const box: IsoBox = { x: -half, y: -half, z, w: size, d: size, h: THICK };
  const hull = roundedPolygon(silhouette(box));
  const top = roundedPolygon(topFace(box));
  const [edgeA, edgeB] = frontEdge(box);
  return (
    <g>
      <path className='tcei-glass-base' d={hull} />
      <path className='tcei-glass-left' d={roundedPolygon(leftFace(box))} />
      <path className='tcei-glass-right' d={roundedPolygon(rightFace(box))} />
      <path className='tcei-glass-topfill' d={top} />
      <path className='tcei-glass-sheen' d={top} />
      <path
        className='tcei-glass-rim'
        d={hull}
        style={{ stroke: `rgba(255, 255, 255, ${(0.14 + 0.1 * depth).toFixed(3)})` }}
      />
      <path className='tcei-glass-front' d={segment(edgeA, edgeB)} />
      <path
        className='tcei-glass-edge'
        d={top}
        style={{ stroke: `rgba(255, 255, 255, ${(0.32 + 0.3 * depth).toFixed(3)})` }}
      />
    </g>
  );
}

/** The active plane's doubled top edge — the brand pair at constant gauge. */
const EDGE_INSET = 2.4;

function doubledEdge(size: number, z: number): string {
  const half = size / 2;
  return roundedPolygon(
    topFace({
      x: -half + EDGE_INSET,
      y: -half + EDGE_INSET,
      z,
      w: size - EDGE_INSET * 2,
      d: size - EDGE_INSET * 2,
      h: THICK,
    })
  );
}

/* ---- the on-plane glyphs: each one means its tier ----------------------- */

function LayerGlyphs({ id, zf }: { id: string; zf: number }) {
  switch (id) {
    case 'glossary': {
      /* term → translation rows: the org's pinned vocabulary */
      const rows: readonly (readonly [number, number])[] = [
        [-18, 28],
        [-4, 20],
        [10, 24],
      ];
      return (
        <>
          {rows.map(([y, w]) => (
            <Fragment key={y}>
              <IsoPlane x={-35} y={y} z={zf} w={16} d={4.5} fill='mark' />
              <IsoArrow x={-10} y={y + 2.25} z={zf} size={5.5} />
              <IsoPlane x={-6} y={y} z={zf} w={w} d={4.5} fill='mark' />
            </Fragment>
          ))}
        </>
      );
    }
    case 'directives': {
      /* three style rules, each with its leading tick */
      const rows: readonly (readonly [number, number])[] = [
        [-16, 46],
        [-3, 38],
        [10, 42],
      ];
      return (
        <>
          {rows.map(([y, w]) => (
            <Fragment key={y}>
              <IsoPlane x={-33} y={y} z={zf} w={4.5} d={4.5} fill='mark' />
              <IsoPlane x={-25} y={y} z={zf} w={w} d={4.5} fill='mark' />
            </Fragment>
          ))}
        </>
      );
    }
    case 'access': {
      /* the permission matrix in miniature: admin row full, one scoped grant */
      const cols = [-32, -19, -6, 7, 20] as const;
      return (
        <>
          {cols.map((x) => (
            <IsoPlane key={`a${x}`} x={x} y={-15} z={zf} w={7} d={7} fill='mark' />
          ))}
          {cols.map((x, c) =>
            c === 3 ? (
              <IsoPlane key={`t${x}`} x={x} y={-1} z={zf} w={7} d={7} fill='mark' />
            ) : (
              <IsoPlane key={`t${x}`} x={x} y={-1} z={zf} w={7} d={7} tone='hair' />
            )
          )}
        </>
      );
    }
    case 'review-gate':
      /* the approval: a check, and the per-locale states — two let through, one held */
      return (
        <>
          <IsoWire
            points={[
              [-32, 10, zf],
              [-22, 20, zf],
              [-4, -4, zf],
            ]}
            tone='soft'
          />
          <IsoPlane x={10} y={4} z={zf} w={7} d={7} fill='mark' />
          <IsoPlane x={22} y={4} z={zf} w={7} d={7} fill='mark' />
          <IsoPlane x={34} y={4} z={zf} w={7} d={7} tone='hair' />
        </>
      );
    case 'locadex-pr':
      /* the guarded diff: gutter mark + removed line, gutter marks + added lines */
      return (
        <>
          <IsoPlane x={-34} y={-16} z={zf} w={4.5} d={4.5} fill='mark' />
          <IsoPlane x={-26} y={-16} z={zf} w={20} d={4.5} fill='mark' />
          <IsoPlane x={-34} y={-4} z={zf} w={4.5} d={4.5} fill='mark' />
          <IsoPlane x={-26} y={-4} z={zf} w={32} d={4.5} fill='mark' />
          <IsoPlane x={-34} y={8} z={zf} w={4.5} d={4.5} fill='mark' />
          <IsoPlane x={-26} y={8} z={zf} w={26} d={4.5} fill='mark' />
        </>
      );
    case 'edge':
      /* the foundation: three points of presence wired, and the versioned
         rollout — the live chip (the drawing's one accent) one step ahead
         of the restorable one, the arrow pointing the step back */
      return (
        <>
          <IsoWire
            points={[
              [-33.2, -19.2, zf],
              [6.7, -1.2, zf],
              [-15.2, 22.7, zf],
            ]}
            tone='hair'
            close
          />
          <IsoPlane x={-36} y={-22} z={zf} w={5.5} d={5.5} fill='mark' />
          <IsoPlane x={4} y={-4} z={zf} w={5.5} d={5.5} fill='mark' />
          <IsoPlane x={-18} y={20} z={zf} w={5.5} d={5.5} fill='mark' />
          <IsoSlab x={16} y={-2} z={zf} w={24} d={14} h={3} tone='hair' />
          <IsoArrow x={12} y={21} z={zf} size={-6} />
          <IsoSlab x={26} y={14} z={zf} w={24} d={14} h={3.4} tone='accent' />
        </>
      );
    default:
      return null;
  }
}

/* ---- tier joints: short doubled ticks in the gaps on the left flank ----- */

const TIER_JOINTS: readonly { y1: number; y2: number }[] = [
  /* organization | review — between plane 3 (z=102) and plane 2 (z=68) */
  { y1: -98, y2: -84 },
  /* review | delivery — between plane 1 (z=34) and the base plate */
  { y1: -34, y2: -20 },
];

/* ---- the drawing -------------------------------------------------------- */

function ColumnIso() {
  return (
    <IsoFrame
      className='tcei-iso'
      viewW={210}
      viewH={286}
      title='The governed column: organization glossary, style directives and scoped access press down through the review gate and a guarded Locadex PR onto the delivery plane — edge regions, versioned locales, one-step rollback'
    >
      <defs>
        {/* the frost: the family's one diagonal sheen, upper-left light */}
        <linearGradient id='tceiFrost' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0' stopColor='#ffffff' stopOpacity='0.15' />
          <stop offset='0.55' stopColor='#ffffff' stopOpacity='0.04' />
          <stop offset='1' stopColor='#ffffff' stopOpacity='0' />
        </linearGradient>
      </defs>
      <g transform='translate(103 224)'>
        {/* tier joints: the doubled pair marking where a tier hands down */}
        {TIER_JOINTS.map((joint) => (
          <g key={joint.y1} className='tcei-tick' aria-hidden='true'>
            <path d={`M-80.4 ${joint.y1}L-80.4 ${joint.y2}`} />
            <path d={`M-78.2 ${joint.y1}L-78.2 ${joint.y2}`} />
          </g>
        ))}

        {/* the planes, base first so the tiers above occlude what they govern */}
        {LAYERS.map((layer, i) => (
          <g key={layer.id} className='tcei-rise'>
            <g className='tcei-layer' data-tcei-layer={i} tabIndex={0} aria-label={layer.aria}>
              <GlassPlate size={layerSize(i)} z={layerZ(i)} depth={stackDepth(i)} />
              <LayerGlyphs id={layer.id} zf={layerZ(i) + THICK} />
              {/* the doubled edge, held by the active plane */}
              <path className='tcei-dbl' d={doubledEdge(layerSize(i), layerZ(i))} />
            </g>
          </g>
        ))}

        {/* leader anchors — outside the animated groups, so a hover raise
            never moves a measured point */}
        <g aria-hidden='true'>
          {LAYERS.map((layer, i) => (
            <circle
              key={layer.id}
              className='tcei-a'
              data-tcei-a={i}
              cx={(layerSize(i) * ISO_COS30).toFixed(2)}
              cy={-(layerZ(i) + THICK)}
              r='0.6'
            />
          ))}
        </g>
      </g>
    </IsoFrame>
  );
}

/* ---- leader geometry, in overlay (CSS-pixel) space ---------------------- */

type Vec = readonly [number, number];

const px = (v: number): number => Math.round(v * 100) / 100;

/**
 * Open orthogonal polyline → rounded route. Corners are quadratic, radius
 * clamped to half of each adjoining segment, one radius per interior corner.
 */
function roundedRoute(pts: readonly Vec[], radii: readonly number[]): string {
  if (pts.length < 2) return '';
  const first = pts[0] as Vec;
  let d = `M${px(first[0])} ${px(first[1])}`;
  for (let k = 1; k < pts.length - 1; k += 1) {
    const p = pts[k - 1] as Vec;
    const c = pts[k] as Vec;
    const n = pts[k + 1] as Vec;
    const inLen = Math.hypot(c[0] - p[0], c[1] - p[1]);
    const outLen = Math.hypot(n[0] - c[0], n[1] - c[1]);
    if (inLen === 0 || outLen === 0) continue;
    const r = Math.max(0.4, Math.min(radii[k - 1] ?? 6, inLen / 2, outLen / 2));
    const enter: Vec = [c[0] - ((c[0] - p[0]) / inLen) * r, c[1] - ((c[1] - p[1]) / inLen) * r];
    const exit: Vec = [c[0] + ((n[0] - c[0]) / outLen) * r, c[1] + ((n[1] - c[1]) / outLen) * r];
    d += `L${px(enter[0])} ${px(enter[1])}Q${px(c[0])} ${px(c[1])} ${px(exit[0])} ${px(exit[1])}`;
  }
  const last = pts[pts.length - 1] as Vec;
  d += `L${px(last[0])} ${px(last[1])}`;
  return d;
}

/** The pair's clear gap — the page's thread gap, in CSS px. */
const PAIR_GAP = 3;

/**
 * One corner-routed leader at the doubled gauge: the reference line runs
 * start → bus → row, and its parallel travels 3px to the right of the
 * direction of travel, with concentric corners (inside turn r−3, outside
 * r+3) so the pair never pinches and never merges.
 */
function leaderPair(s: Vec, e: Vec, busX: number): [string, string] {
  const dy = e[1] - s[1];
  if (Math.abs(dy) < 5) {
    /* the row lines up with its plane: the pair runs straight across */
    const a: readonly Vec[] = [s, e];
    const b: readonly Vec[] = [
      [s[0], s[1] + PAIR_GAP],
      [e[0], e[1] + PAIR_GAP],
    ];
    return [roundedRoute(a, []), roundedRoute(b, [])];
  }
  const r = Math.min(7, Math.abs(dy) / 2);
  const pts: readonly Vec[] = [s, [busX, s[1]], [busX, e[1]], e];
  const vx = dy > 0 ? busX - PAIR_GAP : busX + PAIR_GAP;
  const off: readonly Vec[] = [
    [s[0], s[1] + PAIR_GAP],
    [vx, s[1] + PAIR_GAP],
    [vx, e[1] + PAIR_GAP],
    [e[0], e[1] + PAIR_GAP],
  ];
  const radiiB: readonly number[] = dy > 0 ? [r - PAIR_GAP, r + PAIR_GAP] : [r + PAIR_GAP, r - PAIR_GAP];
  return [roundedRoute(pts, [r, r]), roundedRoute(off, radiiB)];
}

/* ---- the instrument ------------------------------------------------------ */

export default function GovernedColumn() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const scope = root.current;
      if (!scope) return;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const layers = gsap.utils.toArray<SVGGElement>('[data-tcei-layer]', scope);
      const rises = gsap.utils.toArray<SVGGElement>('.tcei-rise', scope);
      const caps = gsap.utils.toArray<HTMLButtonElement>('[data-tcei-cap]', scope);
      const leads = gsap.utils.toArray<SVGGElement>('[data-tcei-lead]', scope);
      const body = scope.querySelector<HTMLElement>('.tcei-body');
      const wire = scope.querySelector<SVGSVGElement>('.tcei-wire');
      const capsCol = scope.querySelector<HTMLElement>('.tcei-caps');

      /* reduced motion shows the finished still; otherwise the leaders hold
         their dash-hidden state until the build timeline draws them */
      let entered = reduce;

      const drawLeads = () => {
        if (!body || !wire || !capsCol) return;
        const folded = getComputedStyle(body).flexDirection === 'column';
        wire.style.display = folded ? 'none' : '';
        if (folded) return;
        const bRect = body.getBoundingClientRect();
        wire.setAttribute('viewBox', `0 0 ${Math.max(1, px(bRect.width))} ${Math.max(1, px(bRect.height))}`);
        const capsRect = capsCol.getBoundingClientRect();
        const busX = capsRect.left - bRect.left - 24;
        for (const lead of leads) {
          const i = Number(lead.dataset.tceiLead);
          if (Number.isNaN(i)) continue;
          const anchor = scope.querySelector<SVGCircleElement>(`[data-tcei-a='${i}']`);
          const row = caps.find((cap) => Number(cap.dataset.tceiCap) === i);
          const [pathA, pathB] = Array.from(lead.querySelectorAll('path'));
          if (!anchor || !row || !pathA || !pathB) continue;
          const aRect = anchor.getBoundingClientRect();
          const rRect = row.getBoundingClientRect();
          /* the pair is centred on the plane's top edge and on the row */
          const s: Vec = [
            aRect.left + aRect.width / 2 - bRect.left + 4,
            aRect.top + aRect.height / 2 - bRect.top - PAIR_GAP / 2,
          ];
          const e: Vec = [rRect.left - bRect.left - 5, rRect.top + rRect.height / 2 - bRect.top - PAIR_GAP / 2];
          const [da, db] = leaderPair(s, e, busX);
          pathA.setAttribute('d', da);
          pathB.setAttribute('d', db);
          if (!entered) {
            for (const path of [pathA, pathB]) {
              const len = path.getTotalLength() + 2;
              gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
            }
          }
        }
      };

      /* Rest state IS the still: the review gate holds the doubled edge, the
         full-ink leader and the lit caption. A pointer or focus moves the
         highlight; only then do the passed-over planes dim. */
      const setActive = (active: number, transient: boolean) => {
        const dur = reduce ? 0 : 0.22;
        layers.forEach((layer) => {
          const i = Number(layer.dataset.tceiLayer);
          const hot = i === active;
          gsap.to(layer, {
            y: hot && transient && !reduce ? -6 : 0,
            opacity: !transient || hot ? 1 : 0.38,
            duration: dur,
            ease: 'power2.out',
            overwrite: 'auto',
          });
          const dbl = layer.querySelector('.tcei-dbl');
          if (dbl) {
            gsap.to(dbl, { opacity: hot ? 1 : 0, duration: dur, ease: 'power2.out', overwrite: 'auto' });
          }
        });
        leads.forEach((lead) => {
          const i = Number(lead.dataset.tceiLead);
          gsap.to(lead, {
            opacity: i === active ? 1 : transient ? 0.16 : 0.42,
            duration: dur,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        });
        for (const cap of caps) {
          const i = Number(cap.dataset.tceiCap);
          cap.classList.toggle('is-hot', i === active);
          cap.classList.toggle('is-cold', transient && i !== active);
        }
      };

      drawLeads();
      setActive(DEFAULT_ACTIVE, false);

      const cleanups: (() => void)[] = [];
      const bind = (el: Element, i: number) => {
        if (Number.isNaN(i)) return;
        const on = () => setActive(i, true);
        const off = () => setActive(DEFAULT_ACTIVE, false);
        el.addEventListener('pointerenter', on);
        el.addEventListener('pointerleave', off);
        el.addEventListener('focus', on);
        el.addEventListener('blur', off);
        /* tap = the same highlight, on touch */
        el.addEventListener('click', on);
        cleanups.push(() => {
          el.removeEventListener('pointerenter', on);
          el.removeEventListener('pointerleave', off);
          el.removeEventListener('focus', on);
          el.removeEventListener('blur', off);
          el.removeEventListener('click', on);
        });
      };
      for (const layer of layers) bind(layer, Number(layer.dataset.tceiLayer));
      for (const cap of caps) bind(cap, Number(cap.dataset.tceiCap));

      /* the column assembles once: the delivery plate lands first, the org
         tiers settle on top of it, and the leader pairs draw out to the
         ledger — entrance lives on the wrapper groups so it can never fight
         the hover state on the planes themselves */
      if (!reduce) {
        const build = gsap.timeline({
          scrollTrigger: { trigger: scope, start: 'top 80%', once: true },
          onComplete: () => {
            entered = true;
          },
        });
        build.from(rises, { autoAlpha: 0, y: 16, duration: 0.45, stagger: 0.06, ease: 'power2.out' }, 0);
        const paths = leads.flatMap((lead) => Array.from(lead.querySelectorAll('path')));
        if (paths.length > 0) {
          build.to(
            paths,
            {
              strokeDashoffset: 0,
              duration: 0.3,
              stagger: 0.03,
              ease: 'power1.out',
              clearProps: 'strokeDasharray,strokeDashoffset',
            },
            0.24
          );
        }
      }

      const ro = new ResizeObserver(drawLeads);
      if (body) ro.observe(body);
      if (capsCol) ro.observe(capsCol);
      cleanups.push(() => ro.disconnect());

      return () => {
        for (const undo of cleanups) undo();
      };
    },
    { scope: root }
  );

  return (
    <div className='tc-row is-one' ref={root}>
      <div className='tc-cell is-night is-framed tcei-cell' data-reveal>
        <div className='tc-card tcei-card'>
          <div className='tcei-head'>
            <h3>From org rule to edge region</h3>
            <p>
              One governed column: glossary, directives and scoped access press down through the
              review gate and the guarded Locadex PR — what ships below is versioned per locale and
              one step from rolled back.
            </p>
          </div>
          <div className='tcei-body'>
            <div className='tcei-fig'>
              <ColumnIso />
            </div>
            {/* the leader overlay: corner-routed doubled pairs, plane → row */}
            <svg className='tcei-wire' viewBox='0 0 1 1' preserveAspectRatio='none' aria-hidden='true'>
              {LAYERS.map((layer, i) => (
                <g key={layer.id} className='tcei-lead' data-tcei-lead={i}>
                  <path />
                  <path />
                </g>
              ))}
            </svg>
            <div className='tcei-caps'>
              {TIERS.map((tier) => (
                <Fragment key={tier.label}>
                  <div className='tcei-tier'>{tier.label}</div>
                  {tier.rows.map((row) => (
                    <button
                      type='button'
                      className='tcei-cap'
                      data-tcei-cap={row.i}
                      key={row.id}
                      aria-label={row.aria}
                    >
                      <b>{row.name}</b>
                      <span>{row.cap}</span>
                    </button>
                  ))}
                </Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
