'use client';

import { useRef } from 'react';
import type { ComponentType, SVGProps } from 'react';

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

import IsoFrame from '@/app/d/toolchain/diagrams/IsoFrame';
import { IsoPlane, IsoSlab } from '@/app/d/toolchain/diagrams/IsoSolid';
import { ISO_COS30, ISO_SIN30, polyline, project, segment } from '@/app/d/toolchain/diagrams/iso';
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
 * left to right: the repository plate with its file grid, the Locadex agent
 * slab hovering over it with a scan beam sweeping the files, and the output
 * plate carrying the merged-PR chip — the drawing's one accent, exactly like
 * the delivered-string chip in the stack iso. Below, the integrate block's
 * connector diagram: four source nodes feeding one Locadex plate.
 *
 * Both drawings are founder-approved verbatim; the section around them is
 * the sheet's own grammar — a tc-head band, then two split rows (a ruled
 * copy cell and a framed artifact cell — row 1 words-first, row 2
 * diagram-first), whose seams the rows own.
 */

/* ---- geometry, all through the family's 30° projection ------------------ */

/** Repository plate: half-size, thickness. */
const R_HALF = 38;
const R_H = 3;

/** Agent slab: half-size, hover height, thickness. */
const A_HALF = 22;
const A_Z = 54;
const A_H = 7;

/** Output plate (the pull request): world box, and the chip resting on it. */
const PR = { x: 57, y: -121, w: 64, d: 64, h: 3 } as const;

/** File grid on the repository plate: 3×3 cells of 12, stepped 20. */
const FILE_POS: readonly number[] = [-26, -6, 14];
const FILE_SIZE = 12;

/**
 * The scan beam is a vertical sheet under the agent — from its underside at
 * z=A_Z down to the repository's top face — drawn at y=0 and swept along
 * world +y by GSAP. A world-y translation projects to a constant screen
 * vector (−cos30, +sin30) per unit, so the sweep is one x/y tween.
 */
const beamTL = project(-A_HALF, 0, A_Z);
const beamTR = project(A_HALF, 0, A_Z);
const beamBR = project(A_HALF, 0, R_H);
const beamBL = project(-A_HALF, 0, R_H);
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
const PR_CX = (PR.x * 2 + PR.w) * ISO_COS30;

/**
 * The Locadex mark lies flat in the slab's top face. A z=const plane projects
 * as the 2D affine map (x,y) → (cos30·x − cos30·y, sin30·x + sin30·y − z), so
 * one matrix() puts the masked mark in the plane and it inherits the
 * projection like every other face detail.
 */
const MARK_HALF = 16;
const MARK_PLANE = `matrix(${ISO_COS30} ${ISO_SIN30} ${-ISO_COS30} ${ISO_SIN30} 0 ${-(A_Z + A_H)})`;

function LocadexIso() {
  return (
    <IsoFrame
      className='v0-ldx-iso'
      title='The Locadex agent scans a repository and opens a pull request: merged, +38 −6, checks passed'
      viewW={396}
      viewH={164}
    >
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
        {/* the repository: one plate, a grid of files */}
        <IsoSlab x={-R_HALF} y={-R_HALF} z={0} w={R_HALF * 2} d={R_HALF * 2} h={R_H} />
        {FILE_POS.map((fy) =>
          FILE_POS.map((fx) => (
            <IsoPlane
              key={`file-${fx}-${fy}`}
              x={fx}
              y={fy}
              z={R_H}
              w={FILE_SIZE}
              d={FILE_SIZE}
              fill='mark'
            />
          ))
        )}

        {/* ground flow: the repository feeds the output plate */}
        <path className='iso-hair' d={FLOW_WIRE} />
        <path className='iso-soft' d={FLOW_CHEV} />

        {/* the scan beam, swept across the file grid */}
        <g data-ldx-scan>
          <path className='v0-ldx-beam' d={BEAM_QUAD} />
          <path className='iso-hair' d={BEAM_EDGE_L} />
          <path className='iso-hair' d={BEAM_EDGE_R} />
          <path className='iso-soft' d={BEAM_LAND} />
        </g>

        {/* the agent slab, hovering, carrying the Locadex mark on its top face */}
        <IsoSlab x={-A_HALF} y={-A_HALF} z={A_Z} w={A_HALF * 2} d={A_HALF * 2} h={A_H} />
        <g transform={MARK_PLANE}>
          <rect
            className='v0-ldx-mark'
            x={-MARK_HALF}
            y={-MARK_HALF}
            width={MARK_HALF * 2}
            height={MARK_HALF * 2}
            mask='url(#v0-ldx-slab-mark)'
          />
        </g>

        {/* the output plate: two title lines and the PR chip — the accent */}
        <IsoSlab x={PR.x} y={PR.y} z={0} w={PR.w} d={PR.d} h={PR.h} />
        <IsoPlane x={65} y={-113} z={PR.h} w={30} d={4} fill='mark' />
        <IsoPlane x={65} y={-104} z={PR.h} w={22} d={4} fill='mark' />
        <IsoSlab x={74} y={-97} z={PR.h} w={30} d={16} h={4} tone='accent' />

        {/* annotations — sans labels, hair leaders */}
        <path className='iso-hair' d={REPO_LEADER} />
        <text className='v0-ldx-iso-name' x={-96} y={-0.4} textAnchor='end'>
          Repository
        </text>
        <path className='iso-hair' d={AGENT_LEADER} />
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
    </IsoFrame>
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
const INT_PLATE = { x: 424, y: 85, w: 134, h: 64 } as const;

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
 * plate: the outer pair's vertical runs sit at one gauge (x 340), the inner
 * pair's at another (x 308), so no two paths ever share a segment. All four
 * ports land on the plate's left edge, at y 96/110/124/138.
 */
const INT_LINKS: readonly string[] = [
  'M187 24H332Q340 24 340 32V88Q340 96 348 96H424',
  'M187 86H300Q308 86 308 94V102Q308 110 316 110H424',
  'M187 148H300Q308 148 308 140V132Q308 124 316 124H424',
  'M187 210H332Q340 210 340 202V146Q340 138 348 138H424',
];

/** Plate contents: mark then wordmark, centered as one group. */
const INT_MARK = 24;
const INT_MARK_X = INT_PLATE.x + 22;
const INT_NAME_X = INT_MARK_X + INT_MARK + 11;

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
        {/* the halo's blur — generous region so the soft edge never clips */}
        <filter id='v0-ldx-int-glow' x='-30%' y='-60%' width='160%' height='220%'>
          <feGaussianBlur in='SourceGraphic' stdDeviation='5' />
        </filter>
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
          {icons.map(({ name, Icon }, i) => (
            <Icon
              key={name}
              className='v0-ldx-nico'
              x={NODE_X + 17 + i * 21}
              y={cy - 7}
              width={14}
              height={14}
              color='currentColor'
              aria-hidden
            />
          ))}
          <text
            className='v0-ldx-nlabel'
            x={NODE_X + 17 + icons.length * 21 + 5}
            y={cy}
            dominantBaseline='central'
          >
            {label}
          </text>
        </g>
      ))}

      {/* the arrival glow: an accent-stroked copy of the plate's outline,
          blurred, sitting BEHIND the plate — its opaque face covers the
          blur's inner half, leaving a soft halo on the border that GSAP
          breathes up each time a pulse lands. No vector-effect: the stroke
          must scale with the geometry it blurs into. */}
      <rect
        className='v0-ldx-glow'
        data-ldx-glow
        x={INT_PLATE.x}
        y={INT_PLATE.y}
        width={INT_PLATE.w}
        height={INT_PLATE.h}
        rx={10}
        filter='url(#v0-ldx-int-glow)'
      />
      <rect
        className='v0-ldx-int-plate'
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

      /* One quiet pass, back and forth, across the file grid. The tween runs
         only while the section is on screen; with reduced motion the beam
         rests at the plate's center (its drawn position). */
      const scan = el.querySelector<SVGGElement>('[data-ldx-scan]');
      if (scan) {
        const sweep = gsap.fromTo(
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
        );
        ScrollTrigger.create({
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          onToggle: (self) => {
            if (self.isActive) sweep.play();
            else sweep.pause();
          },
        });
      }

      /* The connector pulses: a long normalized dash (22 of pathLength 100)
         slides source → plate on each link, staggered, looping only while
         the diagram is on screen. The 200 gap keeps the parked pattern
         entirely off the path at both endpoints; 22 → −102 carries the dash
         fully across, its tail clearing the port right at the tween's end.

         Each landing answers on the plate itself: the glow (the blurred
         accent copy behind the plate) breathes up and settles back once per
         arrival. Arrival of pulse i = its stagger slot + 0.9 of its travel —
         where the eased dash has all but merged into the plate — and each
         breath (rise + fall) lasts exactly one stagger, so the four breaths
         chain edge to edge; the last one settles slower, back to the
         stylesheet's barely-there resting alpha. Everything lives on ONE
         timeline, so pulses and breaths can never drift out of phase. */
      const pulses = el.querySelectorAll<SVGPathElement>('[data-ldx-pulse]');
      const glow = el.querySelector<SVGRectElement>('[data-ldx-glow]');
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
        if (glow) {
          /* mirrors the stylesheet's parked opacity — the resting halo */
          const GLOW_REST = 0.2;
          const RISE = 0.12;
          const FALL = PULSE_GAP - RISE;
          pulses.forEach((_, i) => {
            const at = i * PULSE_GAP + ARRIVE;
            const settle = i === pulses.length - 1 ? 0.8 : FALL;
            flow.fromTo(
              glow,
              { opacity: GLOW_REST },
              { opacity: 1, duration: RISE, ease: 'power2.out', immediateRender: false },
              at
            );
            flow.to(glow, { opacity: GLOW_REST, duration: settle, ease: 'power2.out' }, at + RISE);
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
