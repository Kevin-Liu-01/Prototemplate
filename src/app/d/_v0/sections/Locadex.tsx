'use client';

import { useRef } from 'react';
import type { ComponentType, CSSProperties, SVGProps } from 'react';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Bot } from 'lucide-react';

import {
  SiContentful,
  SiGithub,
  SiGoogledrive,
  SiMarkdown,
  SiNotion,
  SiSanity,
} from '@icons-pack/react-simple-icons';

import {
  ISO_COS30,
  ISO_SIN30,
  frontEdge,
  leftFace,
  polyline,
  project,
  rightFace,
  roundedPolygon,
  segment,
  silhouette,
  topFace,
  type IsoBox,
  type Pt,
} from '@/app/d/toolchain/diagrams/iso';
import { useQuietReveal } from '@/app/d/toolchain/sections/reveal';
import { BentoCell } from '@/components/shell/Bento';

/* tcm-ruled (the split row's ruled copy cell) is defined by the toolchain
   bento sheet; the v0 routes don't mount that section, so the sheet rides
   in here the way the pages import styles.css directly. */
import '@/app/d/toolchain/sections/bento-motion.css';
import './locadex.css';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * V0 LOCADEX — the agent, drawn in the house isometric family (founder
 * directive: an iso diagram, never a gif). One composition tells the story
 * left to right: the repository plate with its module grid, the Locadex agent
 * slab hovering over it with a scan beam sweeping the modules, and the output
 * plate carrying the merged-PR chip — the drawing's one accent, exactly like
 * the delivered-string chip in the stack tower. Below, the integrate block's
 * connector diagram: four source nodes feeding one Locadex plate.
 *
 * The composition is founder-approved verbatim; its MATERIAL is the stack
 * tower's (StackTower / fullstack.css .v0s-*): opaque extruded plates in the
 * dark band's ink family — hull under three face fills lit from the upper
 * left, 1px rims and top edges whose alphas step brighter toward the story's
 * focus — with the plates' artwork as miniature extrusions of the same stock
 * (the module grid at the tower's chip gauge, the merged chip with the
 * payload chip's accent contour and fill). The section around the drawings
 * is the sheet's own grammar — a tc-head band, then two split rows (a ruled
 * copy cell and a framed artifact cell — row 1 words-first, row 2
 * diagram-first), whose seams the rows own.
 */

/* ---- geometry, all through the family's 30° projection ------------------ */

/** Repository plate: half-size and thickness at the tower's plate gauge
    (thickness ~4% of footprint). */
const R_HALF = 38;
const R_H = 3;
const REPO_BOX: IsoBox = { x: -R_HALF, y: -R_HALF, z: 0, w: R_HALF * 2, d: R_HALF * 2, h: R_H };

/** Agent slab: half-size, hover height, thickness. */
const A_HALF = 22;
const A_Z = 54;
const A_H = 7;
const AGENT_BOX: IsoBox = { x: -A_HALF, y: -A_HALF, z: A_Z, w: A_HALF * 2, d: A_HALF * 2, h: A_H };

/** Output plate (the pull request), same stock as the repository. */
const PR_BOX: IsoBox = { x: 57, y: -121, z: 0, w: 64, d: 64, h: 3 };

/** Module grid on the repository plate: 3×3 raised chips of 14, stepped 22 —
    the tower's chip drawing (a rounded extrusion, hull + lighter top face),
    each topped by a content bar so the modules read as files, not tiles. */
const CHIP_POS: readonly number[] = [-29, -7, 15];
const CHIP_SIZE = 14;
const CHIP_H = 3;
const CHIP_TOP = R_H + CHIP_H;
/** The content bars' widths, row-major — ragged like a real file list. */
const CHIP_BARS: readonly number[] = [8, 6, 7, 5, 8, 6, 6, 7, 5];

/**
 * The scan beam is a vertical sheet under the agent — from its underside at
 * z=A_Z down to the module chips' top faces (the grid is extruded now, so
 * landing any lower would slice the light through the chip bodies) — drawn
 * at y=0 and swept along world +y by GSAP. A world-y translation projects
 * to a constant screen vector (−cos30, +sin30) per unit, so the sweep is
 * one x/y tween.
 */
const beamTL = project(-A_HALF, 0, A_Z);
const beamTR = project(A_HALF, 0, A_Z);
const beamBR = project(A_HALF, 0, CHIP_TOP);
const beamBL = project(-A_HALF, 0, CHIP_TOP);
const BEAM_QUAD = polyline([beamTL, beamTR, beamBR, beamBL], true);
const BEAM_EDGE_L = segment(beamTL, beamBL);
const BEAM_EDGE_R = segment(beamTR, beamBR);
const BEAM_LAND = segment(beamBL, beamBR);

/** Sweep amplitude in world y — stays inside the agent's underside (±22). */
const SWEEP_Y = 20;
const SWEEP_DX = SWEEP_Y * ISO_COS30;
const SWEEP_DY = SWEEP_Y * ISO_SIN30;

/** Ground flow from the repository's right vertex toward the output plate. */
const FLOW_WIRE = segment(project(40, -40, 0), project(54, -54, 0));
const FLOW_CHEV = 'M88.7 -4.1L94.3 0L88.7 4.1';

/** Screen anchors for the annotation leaders, house-style (SdkStack). */
const REPO_VERT_X = -(R_HALF * 2 * ISO_COS30);
const AGENT_VERT_X = A_HALF * 2 * ISO_COS30;
const AGENT_TOP_Y = -(A_Z + A_H);
const REPO_LEADER = `M${(REPO_VERT_X - 2.2).toFixed(2)} ${-R_H}H-92`;
const AGENT_LEADER = `M${(AGENT_VERT_X + 2.2).toFixed(2)} ${AGENT_TOP_Y}H70`;

/** The output plate's screen center x — the chip's reading hangs beneath it. */
const PR_CX = (PR_BOX.x * 2 + PR_BOX.w) * ISO_COS30;

/**
 * The Locadex mark lies flat in the slab's top face. A z=const plane projects
 * as the 2D affine map (x,y) → (cos30·x − cos30·y, sin30·x + sin30·y − z), so
 * one matrix() puts the masked mark in the plane and it inherits the
 * projection like every other face detail.
 */
const MARK_HALF = 16;
const MARK_PLANE = `matrix(${ISO_COS30} ${ISO_SIN30} ${-ISO_COS30} ${ISO_SIN30} 0 ${-(A_Z + A_H)})`;

/** The iso's frame — the approved composition's bounds. */
const VIEW_W = 396;
const VIEW_H = 164;

/** Custom properties are legal inline styles but absent from CSSProperties. */
type StyleVars = CSSProperties & Record<`--${string}`, string | number>;

/** A flat rounded bar lying in the z = const plane — string lines, file
    contents — the tower's markPath, verbatim. */
function markPath(x: number, y: number, w: number, d: number, z: number): string {
  const quad: Pt[] = [
    project(x, y, z),
    project(x + w, y, z),
    project(x + w, y + d, z),
    project(x, y + d, z),
  ];
  return roundedPolygon(quad);
}

type SolidProps = {
  box: IsoBox;
  /** The tower's depth-stepped stroke voice: the silhouette rim's and the
      top-face contour's alphas, brightening toward the story's focus. */
  rim: number;
  edge: number;
  /** The hovering actor sits a fill step brighter — the tower's hot ink. */
  lift?: boolean;
};

/** One plate of the tower's stock: opaque hull, three face fills lit from
    the family's upper-left, then the hairlines, each drawn once. */
function Solid({ box, rim, edge, lift }: SolidProps) {
  const hull = roundedPolygon(silhouette(box));
  const top = roundedPolygon(topFace(box));
  const [frontA, frontB] = frontEdge(box);
  const voice: StyleVars = {
    '--ldx-rim-a': rim.toFixed(3),
    '--ldx-edge-a': edge.toFixed(3),
  };
  return (
    <g className={lift ? 'v0-ldx-solid is-lift' : 'v0-ldx-solid'} style={voice}>
      <path className='v0-ldx-hull' d={hull} />
      <path className='v0-ldx-left' d={roundedPolygon(leftFace(box))} />
      <path className='v0-ldx-right' d={roundedPolygon(rightFace(box))} />
      <path className='v0-ldx-top' d={top} />
      <path className='v0-ldx-rim' d={hull} vectorEffect='non-scaling-stroke' />
      <path className='v0-ldx-front' d={segment(frontA, frontB)} vectorEffect='non-scaling-stroke' />
      <path className='v0-ldx-edge' d={top} vectorEffect='non-scaling-stroke' />
    </g>
  );
}

type ChipProps = {
  x: number;
  y: number;
  z: number;
  w: number;
  d: number;
  h: number;
  /** The one accent artifact: the merged pull request. */
  accent?: boolean;
};

/** A miniature extrusion resting on a plate — the tower's glyph chip. */
function Chip({ x, y, z, w, d, h, accent }: ChipProps) {
  const box: IsoBox = { x, y, z, w, d, h };
  return (
    <g className={accent ? 'v0-ldx-chip is-accent' : 'v0-ldx-chip'}>
      <path className='v0-ldx-chip-hull' d={roundedPolygon(silhouette(box))} />
      <path className='v0-ldx-chip-top' d={roundedPolygon(topFace(box))} />
    </g>
  );
}

function LocadexIso() {
  return (
    <svg className='v0-ldx-iso' viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} role='img'>
      <title>
        The Locadex agent scans a repository and opens a pull request: merged, +38 −6, checks
        passed
      </title>
      <defs>
        {/* the brand mark as an alpha mask, so the shape takes the surface's
            ink instead of the asset's baked-in fill */}
        <mask
          id='v0-ldx-slab-mark'
          maskUnits='userSpaceOnUse'
          x={-MARK_HALF}
          y={-MARK_HALF}
          width={MARK_HALF * 2}
          height={MARK_HALF * 2}
          style={{ maskType: 'alpha' }}
        >
          <image
            href='/brand/locadex-mark.svg'
            x={-MARK_HALF}
            y={-MARK_HALF}
            width={MARK_HALF * 2}
            height={MARK_HALF * 2}
          />
        </mask>
      </defs>

      <g transform='translate(155 97)'>
        {/* the repository: one plate, a grid of module chips — painter's
            order back row first, so the small extrusions occlude cleanly */}
        <Solid box={REPO_BOX} rim={0.13} edge={0.28} />
        {CHIP_POS.map((fy, ri) =>
          CHIP_POS.map((fx, ci) => (
            <g key={`chip-${fx}-${fy}`}>
              <Chip x={fx} y={fy} z={R_H} w={CHIP_SIZE} d={CHIP_SIZE} h={CHIP_H} />
              <path
                className='v0-ldx-fmark'
                d={markPath(fx + 3, fy + 4, CHIP_BARS[ri * 3 + ci] ?? 6, 3, CHIP_TOP)}
              />
            </g>
          ))
        )}

        {/* ground flow: the repository feeds the output plate */}
        <path className='v0-ldx-flow' d={FLOW_WIRE} vectorEffect='non-scaling-stroke' />
        <path className='v0-ldx-flow-chev' d={FLOW_CHEV} vectorEffect='non-scaling-stroke' />

        {/* the scan beam, swept across the module grid */}
        <g data-ldx-scan>
          <path className='v0-ldx-beam' d={BEAM_QUAD} />
          <path className='v0-ldx-beam-edge' d={BEAM_EDGE_L} vectorEffect='non-scaling-stroke' />
          <path className='v0-ldx-beam-edge' d={BEAM_EDGE_R} vectorEffect='non-scaling-stroke' />
          <path className='v0-ldx-beam-land' d={BEAM_LAND} vectorEffect='non-scaling-stroke' />
        </g>

        {/* the agent slab, hovering, carrying the Locadex mark on its top
            face — the brightest voice in the frame, and the mark warms to
            the accent as the beam passes beneath it */}
        <Solid box={AGENT_BOX} rim={0.2} edge={0.48} lift />
        <g transform={MARK_PLANE}>
          <rect
            className='v0-ldx-mark'
            data-ldx-mark
            x={-MARK_HALF}
            y={-MARK_HALF}
            width={MARK_HALF * 2}
            height={MARK_HALF * 2}
            mask='url(#v0-ldx-slab-mark)'
          />
        </g>

        {/* the output plate: two string bars and the merged chip — the
            tower's payload chip treatment, the drawing's one accent */}
        <Solid box={PR_BOX} rim={0.16} edge={0.36} />
        <path className='v0-ldx-gmark' d={markPath(65, -113, 30, 4.5, PR_BOX.h)} />
        <path className='v0-ldx-gmark' d={markPath(65, -104, 22, 4.5, PR_BOX.h)} />
        <Chip x={74} y={-97} z={PR_BOX.h} w={30} d={16} h={4} accent />

        {/* annotations — sans labels, hair leaders */}
        <path className='v0-ldx-leader' d={REPO_LEADER} vectorEffect='non-scaling-stroke' />
        <text className='v0-ldx-iso-name' x={-96} y={-0.4} textAnchor='end'>
          Repository
        </text>
        <path className='v0-ldx-leader' d={AGENT_LEADER} vectorEffect='non-scaling-stroke' />
        <text className='v0-ldx-iso-name' x={74} y={AGENT_TOP_Y + 2.8}>
          Locadex agent
        </text>

        {/* the chip's reading — mono spent on the numbers only */}
        <text className='v0-ldx-chip-read' x={PR_CX} y={54} textAnchor='middle'>
          {'merged · '}
          <tspan className='v0-ldx-chip-num'>+38 −6</tspan>
          {' · checks passed'}
        </text>
      </g>
    </svg>
  );
}

/* ---- the integrate diagram: four sources feed one Locadex plate --------- */

type MarkProps = SVGProps<SVGSVGElement>;

type IntSource = {
  label: string;
  cy: number;
  icons: readonly { name: string; Icon: ComponentType<MarkProps> }[];
};

/** Flat ruled coordinates: the four source nodes at LEFT feed the Locadex
    plate at right — the tools flow into the agent. */
const INT_W = 560;
const INT_H = 234;
const NODE_X = 1;
const NODE_W = 186;
const NODE_H = 44;
const INT_PLATE = { x: 408, y: 73, w: 150, h: 88 } as const;

const INT_SOURCES: readonly IntSource[] = [
  { label: 'GitHub', cy: 24, icons: [{ name: 'GitHub', Icon: SiGithub }] },
  { label: 'Google Drive', cy: 86, icons: [{ name: 'Google Drive', Icon: SiGoogledrive }] },
  {
    label: 'CMS platform',
    cy: 148,
    icons: [
      { name: 'Notion', Icon: SiNotion },
      { name: 'Contentful', Icon: SiContentful },
      { name: 'Sanity', Icon: SiSanity },
    ],
  },
  { label: 'Docs framework', cy: 210, icons: [{ name: 'Markdown', Icon: SiMarkdown }] },
];

/**
 * One connector per source, each drawn once, flowing left → right INTO the
 * plate, all in ONE turn grammar: every arc is radius 12, the inner pair's
 * vertical gauge sits at x 320 and the outer pair's at x 344, and every
 * matching feature repeats at that same 24 interval (turn-in at 308/332,
 * exit at 332/356). The inner pair's ±24 offset is exactly two radii, so
 * those turns resolve as clean tangent ogees rather than a cramped jog.
 * All four ports land on the plate's left edge, at y 96/110/124/138 —
 * mirror-symmetric about the plate's center line.
 */
const INT_LINKS: readonly string[] = [
  'M187 24H332Q344 24 344 36V84Q344 96 356 96H408',
  'M187 86H308Q320 86 320 98Q320 110 332 110H408',
  'M187 148H308Q320 148 320 136Q320 124 332 124H408',
  'M187 210H332Q344 210 344 198V150Q344 138 356 138H408',
];

/** Plate contents: the mark is the node's anchor — 40px against the 17px
    wordmark — and the lockup is centered in the plate as one group. */
const INT_MARK = 40;
const INT_MARK_X = INT_PLATE.x + 16;
const INT_NAME_X = INT_MARK_X + INT_MARK + 12;

function IntegrateDiagram() {
  return (
    <svg
      className='v0-ldx-int-svg'
      viewBox={`0 0 ${INT_W} ${INT_H}`}
      role='img'
      aria-label='GitHub, Google Drive, a CMS platform, and a docs framework all feed the Locadex agent'
    >
      <defs>
        <mask
          id='v0-ldx-int-mark'
          maskUnits='userSpaceOnUse'
          x={INT_MARK_X}
          y={117 - INT_MARK / 2}
          width={INT_MARK}
          height={INT_MARK}
          style={{ maskType: 'alpha' }}
        >
          <image
            href='/brand/locadex-mark.svg'
            x={INT_MARK_X}
            y={117 - INT_MARK / 2}
            width={INT_MARK}
            height={INT_MARK}
          />
        </mask>
      </defs>

      {INT_LINKS.map((d) => (
        <path key={d} className='v0-ldx-link' d={d} vectorEffect='non-scaling-stroke' />
      ))}
      {INT_LINKS.map((d) => (
        <path
          key={`pulse-${d}`}
          className='v0-ldx-pulse'
          data-ldx-pulse
          d={d}
          pathLength={100}
          strokeDasharray='22 200'
          strokeDashoffset={22}
          vectorEffect='non-scaling-stroke'
        />
      ))}

      {/* every label opens on ONE text column (x 18); the marks right-align
          against the node's far edge, sitting by the wire they feed */}
      {INT_SOURCES.map(({ label, cy, icons }) => (
        <g key={label}>
          <rect
            className='v0-ldx-node'
            x={NODE_X}
            y={cy - NODE_H / 2}
            width={NODE_W}
            height={NODE_H}
            rx={8}
            vectorEffect='non-scaling-stroke'
          />
          <text className='v0-ldx-nlabel' x={NODE_X + 17} y={cy} dominantBaseline='central'>
            {label}
          </text>
          {icons.map(({ name, Icon }, i) => (
            <Icon
              key={name}
              className='v0-ldx-nico'
              x={NODE_X + NODE_W - 17 - 14 - (icons.length - 1 - i) * 21}
              y={cy - 7}
              width={14}
              height={14}
              color='currentColor'
              aria-hidden
            />
          ))}
        </g>
      ))}

      <rect
        className='v0-ldx-int-plate'
        x={INT_PLATE.x}
        y={INT_PLATE.y}
        width={INT_PLATE.w}
        height={INT_PLATE.h}
        rx={10}
        vectorEffect='non-scaling-stroke'
      />
      {/* the arrival ring: the plate's border redrawn in accent at the SAME
          gauge, directly on the hairline — the border still reads as one
          stroke, only its ink changes. GSAP fills the whole perimeter solid
          on each landing and eases it back; the parked tint is the resting
          border and the reduced-motion still. */}
      <rect
        className='v0-ldx-ring'
        data-ldx-ring
        x={INT_PLATE.x}
        y={INT_PLATE.y}
        width={INT_PLATE.w}
        height={INT_PLATE.h}
        rx={10}
        vectorEffect='non-scaling-stroke'
      />
      <rect
        className='v0-ldx-mark-ink'
        x={INT_MARK_X}
        y={117 - INT_MARK / 2}
        width={INT_MARK}
        height={INT_MARK}
        mask='url(#v0-ldx-int-mark)'
      />
      <text className='v0-ldx-int-name' x={INT_NAME_X} y={117} dominantBaseline='central'>
        Locadex
      </text>
    </svg>
  );
}

export default function V0Locadex() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const el = root.current;
      if (!el) return;

      /* One quiet pass, back and forth, across the module grid. The tweens
         run only while the section is on screen; with reduced motion the
         beam rests at the plate's center (its drawn position) and the mark
         holds the stylesheet's ink. The mark's warm-up is the drawing's
         sanctioned second accent moment: a 1.8s yoyo against the 3.6s
         sine.inOut pass peaks exactly when the beam crosses under the
         slab's center. */
      const scan = el.querySelector<SVGGElement>('[data-ldx-scan]');
      if (scan) {
        const loops: gsap.core.Tween[] = [
          gsap.fromTo(
            scan,
            { x: SWEEP_DX, y: -SWEEP_DY },
            {
              x: -SWEEP_DX,
              y: SWEEP_DY,
              duration: 3.6,
              ease: 'sine.inOut',
              repeat: -1,
              yoyo: true,
              paused: true,
            }
          ),
        ];
        const mark = el.querySelector<SVGRectElement>('[data-ldx-mark]');
        if (mark) {
          loops.push(
            gsap.fromTo(
              mark,
              /* the stylesheet's resting ink — the reduced-motion still */
              { fill: 'rgba(255, 255, 255, 0.78)' },
              {
                /* the accent resolved off the stylesheet — hex stays in css */
                fill: getComputedStyle(mark).getPropertyValue('--ldx-accent').trim() || 'rgb(134, 168, 255)',
                duration: 1.8,
                ease: 'sine.inOut',
                repeat: -1,
                yoyo: true,
                paused: true,
              }
            )
          );
        }
        ScrollTrigger.create({
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          onToggle: (self) => {
            for (const loop of loops) {
              if (self.isActive) loop.play();
              else loop.pause();
            }
          },
        });
      }

      /* The connector pulses: a long normalized dash (22 of pathLength 100)
         slides source → plate on each link, staggered, looping only while
         the diagram is on screen. The 200 gap keeps the parked pattern
         entirely off the path at both endpoints; 22 → −102 carries the dash
         fully across, its tail clearing the port right at the tween's end.

         Each landing answers on the plate itself: the ring (the border
         redrawn in accent on the hairline's own geometry) fills to solid
         blue — the whole perimeter at once, nothing travels — then eases
         off. Arrival of pulse i = its stagger slot + 0.9 of its travel —
         where the eased dash has all but merged into the plate. Between
         landings the fill only sags to a mid tint, so the burst reads as
         one lit border re-struck four times; after the last it holds a
         beat and settles back to the stylesheet's resting tint. Everything
         lives on ONE timeline, so pulses and fills can never drift out of
         phase. */
      const pulses = el.querySelectorAll<SVGPathElement>('[data-ldx-pulse]');
      const ring = el.querySelector<SVGRectElement>('[data-ldx-ring]');
      const diagram = el.querySelector<SVGSVGElement>('.v0-ldx-int-svg');
      if (pulses.length > 0 && diagram) {
        const PULSE_DUR = 1.6;
        const PULSE_GAP = 0.45;
        const ARRIVE = PULSE_DUR * 0.9;
        const flow = gsap.timeline({ repeat: -1, repeatDelay: 0.9, paused: true });
        flow.fromTo(
          pulses,
          { strokeDashoffset: 22 },
          { strokeDashoffset: -102, duration: PULSE_DUR, ease: 'power1.inOut', stagger: PULSE_GAP }
        );
        if (ring) {
          /* mirrors the stylesheet's parked opacity — the resting tint */
          const RING_REST = 0.35;
          /* the sag between back-to-back landings — still clearly lit */
          const RING_MID = 0.55;
          const RISE = 0.1;
          const HOLD = 0.35;
          pulses.forEach((_, i) => {
            const at = i * PULSE_GAP + ARRIVE;
            const last = i === pulses.length - 1;
            flow.fromTo(
              ring,
              { opacity: i === 0 ? RING_REST : RING_MID },
              { opacity: 1, duration: RISE, ease: 'power2.out', immediateRender: false },
              at
            );
            if (last) {
              flow.to(
                ring,
                { opacity: RING_REST, duration: 0.8, ease: 'power2.inOut' },
                at + RISE + HOLD
              );
            } else {
              flow.to(
                ring,
                { opacity: RING_MID, duration: PULSE_GAP - RISE, ease: 'power1.inOut' },
                at + RISE
              );
            }
          });
        }
        ScrollTrigger.create({
          trigger: diagram,
          start: 'top bottom',
          end: 'bottom top',
          onToggle: (self) => {
            if (self.isActive) flow.play();
            else flow.pause();
          },
        });
      }
    },
    { scope: root }
  );

  return (
    <section className='tc-sec v0-ldx' id='locadex' ref={root}>
      <div className='tc-head'>
        <Bot className='tc-head-icon' strokeWidth={1} aria-hidden />
        <h2 data-reveal>
          The easiest way to localize your full system in native speed and quality.
        </h2>
      </div>

      {/* ---- row 1: the agent, run against a repository ----
          The toolchain 'Code' row's shape: a ruled copy cell of the sheet
          beside a framed artifact cell. The row owns the seam between them. */}
      <div className='tc-row is-split'>
        <BentoCell
          cell='is-tall tcm-ruled'
          framed={false}
          title='Run Locadex.'
          sub='Connect your GitHub repository to our localization agent. Locadex internationalizes your code and keeps your app localized on every update. Just merge a PR.'
        />

        {/* is-bleed: the card sheds its padding, so the iso's permanently-dark
            ground runs to the card's own frame — the cell owns the frame, the
            plate draws no border or radius of its own. */}
        <BentoCell cell='is-tall is-bleed is-framed'>
          <div className='v0-ldx-plate'>
            <LocadexIso />
          </div>
        </BentoCell>
      </div>

      {/* ---- row 2: the sources, converging — row 1 mirrored, the diagram
          leads and the words answer from the right ---- */}
      <div className='tc-row is-split'>
        <BentoCell cell='is-tall is-framed'>
          <div className='tc-art-center'>
            <IntegrateDiagram />
          </div>
        </BentoCell>

        <BentoCell
          cell='is-tall tcm-ruled'
          framed={false}
          title='Any integration.'
          sub='Just a few clicks to integrate with your Google Drive, CMS platform, or docs framework.'
        />
      </div>
    </section>
  );
}
