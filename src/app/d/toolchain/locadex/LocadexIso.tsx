'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import { useRef, useState } from 'react';

import IsoFrame from '../diagrams/IsoFrame';
import { IsoPlane, IsoSlab } from '../diagrams/IsoSolid';
import {
  ISO_COS30,
  ISO_SIN30,
  frontEdge,
  leftFace,
  project,
  rightFace,
  roundedPolygon,
  segment,
  silhouette,
  topFace,
  type IsoBox,
} from '../diagrams/iso';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * The Locadex isometric (founder directive: "a custom isometric graphic"):
 * run #1184 as an exploded stack — the repo plane at the base, rising
 * through scan, map, edit and translate, topped by the PR plane where the
 * agent stops and waits. A sibling of the dark band's stack, by
 * construction: the same 30° projection kit, the same glassmorphic plates
 * (near-opaque dark hull occluding the planes beneath, one shared frost
 * sheen, soft white edges whose brightness carries depth — lower planes
 * dimmer), the same corner-routed leaders tapping off a full-height
 * doubled rail at the house 1px-pair gauge, and the doubled top edge —
 * two contours at constant gauge, the brand's line — on the active plane.
 *
 * Every on-plate glyph means its stage: file grid with the skipped
 * sibling on scan, the two context slabs on map, a diff sliver on edit,
 * five locale chips on translate, and on the PR plane the +38 bar (the
 * drawing's one accent spend) beside the struck −6 — with the real
 * doubled-line lambda printed flat into the glass, the agent's maker's
 * mark on the plane where it signs its work.
 *
 * Hover/focus (GSAP) raises a plane and inks its leader and caption;
 * with reduced motion nothing lifts and the still carries the argument:
 * the PR plane is active by default, doubled edge shown, its caption —
 * PR #218 · +38 −6 · awaiting review — at full ink.
 */

const SIZE = 84;
const HALF = SIZE / 2;
const THICK = 3.2;
const GAP = 38;

type RunPlane = {
  /** Stable id, shared by plane, leader and caption row. */
  id: string;
  name: string;
  /** The caption's value line — real output of the page's canonical run. */
  value: string;
};

/** Bottom plane first — the run starts at the repo. */
const PLANES: readonly RunPlane[] = [
  { id: 'repo', name: 'repo', value: 'push e4f21c9 · acme/web' },
  { id: 'scan', name: 'scan', value: '11 files changed · 5 need i18n' },
  { id: 'map', name: 'map', value: 'tone: playful · glossary 12 terms' },
  { id: 'edit', name: 'edit', value: 'app/page.tsx · <T> + <Var>' },
  { id: 'translate', name: 'translate', value: 'es fr ja de zh · in context' },
  { id: 'pr', name: 'open pr', value: 'PR #218 · +38 −6 · awaiting review' },
];

/** Top plane first: caption rows sit beside the heights they annotate. */
const CAPTIONS: readonly RunPlane[] = [...PLANES].reverse();

/** Depth cue, spent on paint: 0 at the repo plane, 1 at the PR plane. */
function stackDepth(i: number): number {
  return i / (PLANES.length - 1);
}

/* ---- the left connector, in screen space ------------------------------ */

/** Every plane's top-left vertex projects to this x. */
const VERTEX_X = -(SIZE * ISO_COS30);
/** The x every leader starts from — the CSS rail pins its inner line here. */
const RAIL_IN = -104;
/** The corner radius each leader turns with as it peels off the rail. */
const CORNER = 6;

const layerTopY = (i: number): number => -(i * GAP + THICK);

/** Up the rail, a small-radius corner, then flat to the plane's vertex. */
function leaderPath(i: number): string {
  const y = layerTopY(i);
  return `M${RAIL_IN} ${y + CORNER}Q${RAIL_IN} ${y} ${RAIL_IN + CORNER} ${y}L${VERTEX_X - 1} ${y}`;
}

/* ---- the glass slab: the plate every stage sits on --------------------- */

/**
 * One frosted plate, painted in the dark band's order: near-opaque hull
 * (what occludes the planes beneath), the three face tints keeping the
 * family's upper-left light, the shared diagonal frost, then the white
 * edge strokes whose alpha carries the depth cue.
 */
function GlassPlate({ z, depth }: { z: number; depth: number }) {
  const box: IsoBox = { x: -HALF, y: -HALF, z, w: SIZE, d: SIZE, h: THICK };
  const hull = roundedPolygon(silhouette(box));
  const top = roundedPolygon(topFace(box));
  const [edgeA, edgeB] = frontEdge(box);
  return (
    <g>
      <path className='ldxi-glass-base' d={hull} />
      <path className='ldxi-glass-left' d={roundedPolygon(leftFace(box))} />
      <path className='ldxi-glass-right' d={roundedPolygon(rightFace(box))} />
      <path className='ldxi-glass-topfill' d={top} />
      <path className='ldxi-glass-sheen' d={top} />
      <path
        className='ldxi-glass-rim'
        d={hull}
        style={{ stroke: `rgba(255, 255, 255, ${(0.14 + 0.1 * depth).toFixed(3)})` }}
      />
      <path className='ldxi-glass-front' d={segment(edgeA, edgeB)} />
      <path
        className='ldxi-glass-edge'
        d={top}
        style={{ stroke: `rgba(255, 255, 255, ${(0.32 + 0.3 * depth).toFixed(3)})` }}
      />
    </g>
  );
}

/**
 * The active plane's doubled top edge: the contour inset by a constant
 * world margin, which projects to a constant screen gap — two parallel
 * lines at the thread gauge, never merging.
 */
const EDGE_INSET = 3.4;

function doubledEdge(z: number): string {
  return roundedPolygon(
    topFace({
      x: -HALF + EDGE_INSET,
      y: -HALF + EDGE_INSET,
      z,
      w: SIZE - EDGE_INSET * 2,
      d: SIZE - EDGE_INSET * 2,
      h: THICK,
    })
  );
}

/**
 * Lays a flat image into the ground plane at height `z`: image-space u
 * maps to world +x, v to world +y, so the mark reads as printed on the
 * glass rather than billboarded over it.
 */
function flatStamp(u0: number, v0: number, z: number): string {
  const [ex, ey] = project(u0, v0, z);
  return `matrix(${ISO_COS30} ${ISO_SIN30} ${-ISO_COS30} ${ISO_SIN30} ${ex} ${ey})`;
}

/* ---- the on-plate glyphs: each one means its stage --------------------- */

function PlaneGlyphs({ id, zf }: { id: string; zf: number }) {
  switch (id) {
    case 'repo':
      /* the source: three code lines, the second indented */
      return (
        <>
          <IsoPlane x={-32} y={-24} z={zf} w={40} d={4.5} fill='mark' />
          <IsoPlane x={-24} y={-12} z={zf} w={30} d={4.5} fill='mark' />
          <IsoPlane x={-32} y={0} z={zf} w={34} d={4.5} fill='mark' />
        </>
      );
    case 'scan':
      /* the file grid: five files that need i18n, the sibling outside the
         target directory left as an empty outline — skipped, not touched */
      return (
        <>
          <IsoPlane x={-34} y={-22} z={zf} w={18} d={14} fill='mark' />
          <IsoPlane x={-10} y={-22} z={zf} w={18} d={14} fill='mark' />
          <IsoPlane x={14} y={-22} z={zf} w={18} d={14} fill='mark' />
          <IsoPlane x={-34} y={-2} z={zf} w={18} d={14} fill='mark' />
          <IsoPlane x={-10} y={-2} z={zf} w={18} d={14} fill='mark' />
          <IsoPlane x={14} y={-2} z={zf} w={18} d={14} tone='hair' fill='none' />
          <IsoPlane x={-34} y={18} z={zf} w={66} d={2.5} fill='mark' />
        </>
      );
    case 'map':
      /* the two halves of a Context Group — glossary and directives —
         plus the tone note written down for the translator */
      return (
        <>
          <IsoSlab x={-30} y={-16} z={zf} w={22} d={15} h={2.6} />
          <IsoSlab x={2} y={-16} z={zf} w={22} d={15} h={2.6} />
          <IsoPlane x={-30} y={8} z={zf} w={26} d={4.5} fill='mark' />
        </>
      );
    case 'edit':
      /* a diff sliver: one removed line, the wrap that replaces it */
      return (
        <>
          <IsoPlane x={-36} y={-17} z={zf} w={4.5} d={4.5} tone='hair' fill='none' />
          <IsoPlane x={-28} y={-17} z={zf} w={24} d={4.5} tone='hair' fill='none' />
          <IsoPlane x={-36} y={-5} z={zf} w={4.5} d={4.5} fill='mark' />
          <IsoPlane x={-28} y={-5} z={zf} w={34} d={4.5} fill='mark' />
          <IsoPlane x={-36} y={7} z={zf} w={4.5} d={4.5} fill='mark' />
          <IsoPlane x={-28} y={7} z={zf} w={28} d={4.5} fill='mark' />
        </>
      );
    case 'translate':
      /* five locale chips — es fr ja de zh, filled in context */
      return (
        <>
          <IsoSlab x={-38} y={-5} z={zf} w={12} d={10} h={2} tone='soft' />
          <IsoSlab x={-22} y={-5} z={zf} w={12} d={10} h={2} tone='soft' />
          <IsoSlab x={-6} y={-5} z={zf} w={12} d={10} h={2} tone='soft' />
          <IsoSlab x={10} y={-5} z={zf} w={12} d={10} h={2} tone='soft' />
          <IsoSlab x={26} y={-5} z={zf} w={12} d={10} h={2} tone='soft' />
        </>
      );
    case 'pr':
      /* the review gate: the PR title line, the +38 bar (the drawing's
         one accent), the struck −6 beside it — and the agent's mark,
         printed flat into the glass where it signs its work */
      return (
        <>
          <IsoPlane x={-36} y={-36} z={zf} w={30} d={4.5} fill='mark' />
          <IsoSlab x={-36} y={-22} z={zf} w={24} d={7} h={2} tone='accent' />
          <IsoPlane x={-4} y={-20.75} z={zf} w={8} d={4.5} tone='hair' fill='none' />
          <image
            className='ldxi-stamp'
            href='/brand/no-bg-locadex-logo-light.png'
            width={30}
            height={30}
            transform={flatStamp(2, 0, zf)}
          />
        </>
      );
    default:
      return null;
  }
}

export default function LocadexIso() {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<string>('pr');
  const activeRef = useRef(active);
  const entered = useRef(false);
  activeRef.current = active;

  /* entrance: the stack assembles bottom-up, once, as it scrolls in */
  useGSAP(
    () => {
      const scope = root.current;
      if (!scope) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        entered.current = true;
        return;
      }
      const planes = gsap.utils.toArray<SVGGElement>('[data-ldxi-plane]', scope);
      gsap.set(planes, { autoAlpha: 0, y: 14 });
      ScrollTrigger.create({
        trigger: scope,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          gsap.to(planes, {
            autoAlpha: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.09,
            ease: 'power2.out',
            onComplete: () => {
              entered.current = true;
              gsap.to(`[data-ldxi-plane='${activeRef.current}']`, {
                y: -7,
                duration: 0.35,
                ease: 'power2.out',
              });
            },
          });
        },
      });
    },
    { scope: root }
  );

  /* the lift: the active plane rises off the stack; the rest settle */
  useGSAP(
    () => {
      const scope = root.current;
      if (!scope) return;
      if (!entered.current) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      gsap.utils.toArray<SVGGElement>('[data-ldxi-plane]', scope).forEach((plane) => {
        gsap.to(plane, {
          y: plane.dataset.ldxiPlane === active ? -7 : 0,
          duration: 0.35,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      });
    },
    { scope: root, dependencies: [active] }
  );

  return (
    <div className='tc-row is-one'>
      <div className='tc-cell is-framed ldxi-cell' ref={root}>
        <div className='tc-card ldxi-card'>
          <div className='ldxi-bar'>
            <span className='ldxi-bar-brand'>
              <Image src='/brand/no-bg-locadex-logo-light.png' alt='' width={14} height={14} />
              locadex · run #1184 — exploded
            </span>
            <span>push e4f21c9 → PR #218</span>
          </div>
          <div className='ldxi-body'>
            <div className='ldxi-fig'>
              <div className='ldxi-rail' aria-hidden='true' />
              <IsoFrame
                className='ldxi-iso'
                viewW={204}
                viewH={300}
                title='One Locadex run as an exploded stack: repo, scan, map, edit, translate, open PR'
              >
                <defs>
                  {/* one diagonal frost from the family's upper-left light,
                      shared by every plate so the glass is one material */}
                  <linearGradient id='ldxiFrost' x1='0' y1='0' x2='1' y2='1'>
                    <stop offset='0' stopColor='#ffffff' stopOpacity='0.15' />
                    <stop offset='0.55' stopColor='#ffffff' stopOpacity='0.04' />
                    <stop offset='1' stopColor='#ffffff' stopOpacity='0' />
                  </linearGradient>
                </defs>
                <g transform='translate(124 250)'>
                  {/* one corner-routed leader per plane, off the doubled rail */}
                  {PLANES.map((plane, i) => (
                    <path
                      key={`leader-${plane.id}`}
                      className='ldxi-leader'
                      data-active={plane.id === active}
                      vectorEffect='non-scaling-stroke'
                      d={leaderPath(i)}
                    />
                  ))}

                  {/* the planes, bottom first so upper stages occlude lower */}
                  {PLANES.map((plane, i) => {
                    const z = i * GAP;
                    return (
                      <g
                        key={plane.id}
                        className='ldxi-layer'
                        data-ldxi-plane={plane.id}
                        data-active={plane.id === active}
                        onMouseEnter={() => setActive(plane.id)}
                        aria-hidden='true'
                      >
                        <GlassPlate z={z} depth={stackDepth(i)} />
                        <PlaneGlyphs id={plane.id} zf={z + THICK} />
                        {/* the doubled edge, revealed on the active plane */}
                        <path className='ldxi-dbl' d={doubledEdge(z)} />
                      </g>
                    );
                  })}
                </g>
              </IsoFrame>
            </div>

            {/* the legend: one row per plane, top plane first, so each
                caption sits beside the height it annotates */}
            <div className='ldxi-caps'>
              {CAPTIONS.map((plane) => (
                <button
                  key={plane.id}
                  type='button'
                  className='ldxi-cap'
                  data-active={plane.id === active}
                  aria-pressed={plane.id === active}
                  onMouseEnter={() => setActive(plane.id)}
                  onFocus={() => setActive(plane.id)}
                  onClick={() => setActive(plane.id)}
                >
                  <b>{plane.name}</b>
                  <span>{plane.value}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
