'use client';

import { useState } from 'react';

import {
  frontEdge,
  leftFace,
  plane,
  prismFaces,
  prismFrontEdges,
  prismSilhouette,
  prismTop,
  rightFace,
  roundedPolygon,
  segment,
  silhouette,
  topFace,
  type IsoBox,
  type IsoPrism,
  type Pt2,
} from '@/app/d/toolchain/diagrams/iso';
import { REFERENCE_MARK } from '@/lib/marks';

import { Choice, Range, Toggle } from './controls';
import Plate from './Plate';

type Solid = 'box' | '6' | '8';

/* the slab every object stands on, as the craft plate draws it */
const SLAB: IsoBox = { x: -60, y: -60, z: 0, w: 120, d: 120, h: 4.2 };

function polygon(sides: number, r: number): Pt2[] {
  return Array.from({ length: sides }, (_, i) => {
    const a = (Math.PI * 2 * i) / sides + (sides === 8 ? Math.PI / 8 : 0);
    return [r * Math.cos(a), r * Math.sin(a)] as const;
  });
}

/** The extrusion recipe: the opaque hull first, then the three lit faces, then the hairlines. */
function Box({ box }: { box: IsoBox }) {
  const [a, b] = frontEdge(box);
  return (
    <g>
      <path className='dmo-iso-hull' d={roundedPolygon(silhouette(box))} />
      <path className='dmo-iso-right' d={roundedPolygon(rightFace(box))} />
      <path className='dmo-iso-left' d={roundedPolygon(leftFace(box))} />
      <path className='dmo-iso-top' d={roundedPolygon(topFace(box))} />
      <path className='dmo-iso-line' d={roundedPolygon(silhouette(box))} />
      <path className='dmo-iso-hair' d={roundedPolygon(topFace(box))} />
      <path className='dmo-iso-line' d={segment(a, b)} />
    </g>
  );
}

function Prism({ prism }: { prism: IsoPrism }) {
  return (
    <g>
      <path className='dmo-iso-hull' d={roundedPolygon(prismSilhouette(prism))} />
      {prismFaces(prism).map((face) => (
        <path
          className={face.shade === 'right' ? 'dmo-iso-right' : 'dmo-iso-left'}
          d={roundedPolygon(face.pts)}
          key={String(face.pts[0])}
        />
      ))}
      <path className='dmo-iso-top' d={roundedPolygon(prismTop(prism))} />
      <path className='dmo-iso-line' d={roundedPolygon(prismSilhouette(prism))} />
      <path className='dmo-iso-hair' d={roundedPolygon(prismTop(prism))} />
      {prismFrontEdges(prism).map(([a, b]) => (
        <path className='dmo-iso-line' d={segment(a, b)} key={String(a)} />
      ))}
    </g>
  );
}

/* the GT mark's outline, fit to a plan square and seated on a top face */
const [MX, MY, MW, MH] = REFERENCE_MARK.viewBox.split(' ').map(Number) as [number, number, number, number];

function SeatedMark({ z, size }: { z: number; size: number }) {
  const s = size / MW;
  return (
    <g transform={plane(z)}>
      <path
        className='dmo-iso-mark'
        d={REFERENCE_MARK.d}
        fillRule='evenodd'
        transform={`translate(${-size / 2} ${(-MH * s) / 2}) scale(${s}) translate(${-MX} ${-MY})`}
      />
    </g>
  );
}

/**
 * The isometric kit, live: one 30 degree projection, one corner radius and
 * one light from the upper left, so every drawing in the family reads as
 * one set. The plate builds a solid on a slab with the kit's own geometry
 * functions. Width, depth and height size a box; the solid can also be a
 * hexagonal or octagonal prism, extruded from any convex plan polygon the
 * same way. Mark seats the GT mark on the top face with plane(z).
 */
export default function IsoKitDemo() {
  const [solid, setSolid] = useState<Solid>('box');
  const [w, setW] = useState(56);
  const [d, setD] = useState(48);
  const [h, setH] = useState(18);
  const [mark, setMark] = useState(true);
  const top = SLAB.h + h;
  const box: IsoBox = { x: -w / 2, y: -d / 2, z: SLAB.h, w, d, h };
  const prism: IsoPrism = { points: polygon(Number(solid), Math.min(w, d) / 2), z: SLAB.h, h };

  return (
    <Plate
      controls={
        <>
          <Choice
            label='Solid'
            options={[
              { value: 'box', label: 'Box' },
              { value: '6', label: 'Hexagonal prism' },
              { value: '8', label: 'Octagonal prism' },
            ]}
            value={solid}
            onChange={setSolid}
          />
          <Range label='Width' max={100} min={16} step={2} value={w} onChange={setW} />
          <Range label='Depth' max={100} min={16} step={2} value={d} onChange={setD} />
          <Range label='Height' max={48} min={2} step={1} value={h} onChange={setH} />
          <Toggle label='Mark' pressed={mark} onChange={setMark} />
        </>
      }
      height={320}
      label={`An isometric ${solid === 'box' ? 'box' : `${solid}-sided prism`} on a slab`}
      phoneHeight={240}
      stageClassName='dmo-iso'
      tag={solid === 'box' ? `IsoBox { w: ${w}, d: ${d}, h: ${h} }` : `IsoPrism { sides: ${solid}, h: ${h} }`}
    >
      <svg aria-hidden='true' className='dmo-iso-svg' viewBox='-130 -110 260 200'>
        <Box box={SLAB} />
        {solid === 'box' ? <Box box={box} /> : <Prism prism={prism} />}
        {mark ? <SeatedMark size={Math.min(w, d) * 0.62} z={top} /> : null}
      </svg>
    </Plate>
  );
}
