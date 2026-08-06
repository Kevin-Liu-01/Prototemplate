import {
  frontEdge,
  leftFace,
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

/**
 * The iso kit demo plate — drawn with the real geometry module, in the kit's
 * own extrusion recipe: opaque hull first (the occluder), then the three lit
 * faces, then the hairlines the silhouette and top contour don't already
 * draw. One slab, two box chips, and one hexagonal prism — the kit's
 * arbitrary-plan-polygon extrusion — seated on its top face.
 */
const SLAB: IsoBox = { x: -52, y: -52, z: 0, w: 104, d: 104, h: 4.2 };
const CHIP_A: IsoBox = { x: -34, y: -30, z: 4.2, w: 26, d: 26, h: 4 };
const CHIP_B: IsoBox = { x: 6, y: -2, z: 4.2, w: 34, d: 24, h: 7 };

function hexPoints(cx: number, cy: number, r: number): Pt2[] {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
  });
}

const HEX: IsoPrism = { points: hexPoints(24, -28, 11), z: 4.2, h: 5 };

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

function Prism({ p }: { p: IsoPrism }) {
  return (
    <g>
      <path className='ptc-iso-hull' d={roundedPolygon(prismSilhouette(p))} />
      {prismFaces(p).map((face) => (
        <path
          className={face.shade === 'right' ? 'ptc-iso-right' : 'ptc-iso-left'}
          d={roundedPolygon(face.pts)}
          key={String(face.pts[0])}
        />
      ))}
      <path className='ptc-iso-top' d={roundedPolygon(prismTop(p))} />
      <path className='ptc-iso-line' d={roundedPolygon(prismSilhouette(p))} />
      <path className='ptc-iso-hair' d={roundedPolygon(prismTop(p))} />
      {prismFrontEdges(p).map(([a, b]) => (
        <path className='ptc-iso-line' d={segment(a, b)} key={String(a)} />
      ))}
    </g>
  );
}

export default function IsoDemo() {
  return (
    <svg className='ptc-iso' viewBox='-120 -84 240 168' aria-hidden='true'>
      <Solid box={SLAB} />
      <Solid box={CHIP_A} />
      <Prism p={HEX} />
      <Solid box={CHIP_B} />
    </svg>
  );
}
