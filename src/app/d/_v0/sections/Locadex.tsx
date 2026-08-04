'use client';

import { useRef } from 'react';
import type { ComponentType } from 'react';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import {
  SiContentful,
  SiGoogledrive,
  SiMarkdown,
  SiNotion,
  SiSanity,
} from '@icons-pack/react-simple-icons';

import IsoFrame from '../../toolchain/diagrams/IsoFrame';
import { IsoPlane, IsoSlab } from '../../toolchain/diagrams/IsoSolid';
import { ISO_COS30, ISO_SIN30, polyline, project, segment } from '../../toolchain/diagrams/iso';

import './locadex.css';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * V0 LOCADEX — the agent, drawn in the house isometric family (founder
 * directive: an iso diagram, never a gif). One composition tells the story
 * left to right: the repository plate with its file grid, the Locadex agent
 * slab hovering over it with a scan beam sweeping the files, and the output
 * plate carrying the merged-PR chip — the drawing's one accent, exactly like
 * the delivered-string chip in the stack iso. Below, a slim ruled row for
 * integrations.
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

function LocadexIso() {
  return (
    <IsoFrame
      className='v0-ldx-iso'
      title='The Locadex agent scans a repository and opens a pull request: merged, +38 −6, checks passed'
      viewW={396}
      viewH={164}
    >
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

        {/* the agent slab, hovering, carrying its diff — the house Locadex
            glyph: gutter mark + removed line, gutter mark + added line */}
        <IsoSlab x={-A_HALF} y={-A_HALF} z={A_Z} w={A_HALF * 2} d={A_HALF * 2} h={A_H} />
        <IsoPlane x={-14} y={-9} z={A_Z + A_H} w={4} d={4} fill='mark' />
        <IsoPlane x={-7} y={-9} z={A_Z + A_H} w={13} d={4} fill='mark' />
        <IsoPlane x={-14} y={3} z={A_Z + A_H} w={4} d={4} fill='mark' />
        <IsoPlane x={-7} y={3} z={A_Z + A_H} w={18} d={4} fill='mark' />

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

/* ---- the integrate row's marks ------------------------------------------ */

type MarkProps = { className?: string; color?: string; 'aria-hidden'?: boolean };

type IntegrationMark = {
  name: string;
  Icon: ComponentType<MarkProps>;
};

const INTEGRATIONS: readonly IntegrationMark[] = [
  { name: 'Google Drive', Icon: SiGoogledrive },
  { name: 'Notion', Icon: SiNotion },
  { name: 'Contentful', Icon: SiContentful },
  { name: 'Sanity', Icon: SiSanity },
  { name: 'Markdown', Icon: SiMarkdown },
];

export default function V0Locadex() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const el = root.current;
      const scan = el?.querySelector<SVGGElement>('[data-ldx-scan]');
      if (!el || !scan) return;

      /* One quiet pass, back and forth, across the file grid. The tween runs
         only while the section is on screen; with reduced motion the beam
         rests at the plate's center (its drawn position). */
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
    },
    { scope: root }
  );

  return (
    <section className='v0-ldx' id='locadex' ref={root}>
      <h2 className='v0-ldx-h2'>
        The easiest way to localize your full system in native speed and quality.
      </h2>

      <div className='v0-ldx-grid'>
        <div className='v0-ldx-copy'>
          <h3>Run the Locadex agent.</h3>
          <p>Connect your repository to our custom-built AI agent. Just merge a PR.</p>
        </div>

        <div className='v0-ldx-plate'>
          <LocadexIso />
        </div>
      </div>

      <div className='v0-ldx-integrate'>
        <p className='v0-ldx-int-copy'>
          <strong>Integrate with any tool.</strong> Just a few clicks to integrate with your
          Google Drive, CMS platform, or docs framework
        </p>
        <ul className='v0-ldx-int-marks' aria-label='Integrations'>
          {INTEGRATIONS.map(({ name, Icon }) => (
            <li key={name}>
              <Icon className='v0-ldx-int-ico' color='currentColor' aria-hidden />
              <span>{name}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
