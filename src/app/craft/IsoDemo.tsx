import {
  frontEdge,
  leftFace,
  rightFace,
  roundedPolygon,
  segment,
  silhouette,
  topFace,
  type IsoBox,
} from '@/app/d/toolchain/diagrams/iso';

/**
 * The iso kit demo plate — drawn with the real geometry module, in the kit's
 * own extrusion recipe: opaque hull first (the occluder), then the three lit
 * faces, then the hairlines the silhouette and top contour don't already
 * draw. One slab, two chips seated on its top face — the raised-surface
 * grammar at its smallest.
 */
const SLAB: IsoBox = { x: -52, y: -52, z: 0, w: 104, d: 104, h: 4.2 };
const CHIP_A: IsoBox = { x: -34, y: -30, z: 4.2, w: 26, d: 26, h: 4 };
const CHIP_B: IsoBox = { x: 6, y: -2, z: 4.2, w: 34, d: 24, h: 7 };

function Solid({ box }: { box: IsoBox }) {
  const [a, b] = frontEdge(box);
  return (
    <g>
      <path className='ptc-iso-hull' d={roundedPolygon(silhouette(box))} />
      <path className='ptc-iso-right' d={roundedPolygon(rightFace(box))} />
      <path className='ptc-iso-left' d={roundedPolygon(leftFace(box))} />
      <path className='ptc-iso-top' d={roundedPolygon(topFace(box))} />
      <path className='ptc-iso-line' d={roundedPolygon(silhouette(box))} />
      <path className='ptc-iso-hair' d={roundedPolygon(topFace(box))} />
      <path className='ptc-iso-line' d={segment(a, b)} />
    </g>
  );
}

export default function IsoDemo() {
  return (
    <svg className='ptc-iso' viewBox='-120 -84 240 168' aria-hidden='true'>
      <Solid box={SLAB} />
      <Solid box={CHIP_A} />
      <Solid box={CHIP_B} />
    </svg>
  );
}
