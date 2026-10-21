'use client';

import { useState } from 'react';

import { BAYER4 } from '@/app/d/toolchain/diagrams/DitheredMark';
import EdgeGlobe from '@/app/d/toolchain/diagrams/EdgeGlobe';

import { Action, Range, Toggle } from './controls';
import { useReplay } from './hooks';
import Plate from './Plate';

/* the globe's own frame (EdgeGlobe draws a 92 radius sphere at 179, 126 in a 384 by 240 box) */
const CX = 179;
const CY = 126;
const CELL = 1.25;
const TILE = CELL * 4;

/* four annuli outside the limb, each one coverage tier of the 4x4 screen, on one shared grid */
const RINGS: readonly { cover: number; rIn: number; rOut: number }[] = [
  { cover: 6, rIn: 94, rOut: 98.5 },
  { cover: 4, rIn: 98.5, rOut: 103 },
  { cover: 2, rIn: 103, rOut: 107.5 },
  { cover: 1, rIn: 107.5, rOut: 112 },
];

function tile(cover: number): string {
  const cells: string[] = [];
  BAYER4.forEach((row, y) => {
    row.forEach((threshold, x) => {
      if (threshold < cover) cells.push(`M${x * CELL} ${y * CELL}h${CELL}v${CELL}h${-CELL}Z`);
    });
  });
  return cells.join('');
}

function ring(r: number): string {
  return `M${CX - r} ${CY}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0Z`;
}

/** The dithered atmosphere: static, drawn in the stage's ink at a low coverage. */
function Halo() {
  return (
    <svg aria-hidden='true' className='dmo-globe-halo' focusable='false' viewBox='0 0 384 240'>
      <defs>
        {RINGS.map(({ cover }) => (
          <pattern height={TILE} id={`dmo-halo-${cover}`} key={cover} patternUnits='userSpaceOnUse' width={TILE}>
            <path className='dmo-globe-dots' d={tile(cover)} shapeRendering='crispEdges' />
          </pattern>
        ))}
      </defs>
      {RINGS.map(({ cover, rIn, rOut }) => (
        <path d={ring(rOut) + ring(rIn)} fill={`url(#dmo-halo-${cover})`} fillRule='evenodd' key={cover} />
      ))}
    </svg>
  );
}

/**
 * EdgeGlobe, live: the translation CDN as an orthographic globe. Five
 * points of presence stand on a sparse graticule, and one route carries a
 * request out to the closest edge and the payload back. The drawing reads
 * currentColor and the --iso- tokens, so it follows the docs theme. Accent
 * and stroke width are props; Replay remounts it, which restarts its one
 * GSAP loop.
 */
export default function EdgeGlobeDemo() {
  const [accent, setAccent] = useState(true);
  const [halo, setHalo] = useState(true);
  const [stroke, setStroke] = useState(0.85);
  const [run, replay] = useReplay();
  return (
    <Plate
      controls={
        <>
          <Toggle label='Accent' pressed={accent} onChange={setAccent} />
          <Toggle label='Halo' pressed={halo} onChange={setHalo} />
          <Range format={(v) => v.toFixed(2)} label='Stroke width' max={2.4} min={0.45} step={0.05} value={stroke} onChange={setStroke} />
          <Action onClick={replay}>Replay</Action>
        </>
      }
      height={340}
      label='The edge globe: a request served from the closest of five points of presence'
      lazy
      moves
      phoneHeight={240}
      stageClassName='dmo-globe'
      tag={`<EdgeGlobe accent={${accent}} strokeWidth={${stroke}} />`}
    >
      <div className='dmo-globe-box'>
        {halo ? <Halo /> : null}
        <EdgeGlobe
          accent={accent}
          key={run}
          strokeWidth={stroke}
          title='Five points of presence on a sparse graticule, one request served from the closest edge in 12 ms'
        />
      </div>
    </Plate>
  );
}
