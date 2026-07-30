import IsoFrame, { type IsoProps } from './IsoFrame';
import { IsoArrow, IsoPlane, IsoSlab, IsoWire } from './IsoSolid';
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
} from './iso';

/**
 * The full stack, drawn once — seven planes on the family's 30° axis, one per
 * stage of the toolchain, evenly spaced. Each plane is a glassmorphic slab
 * (founder pick): a near-opaque frosted dark fill that OCCLUDES the planes
 * beneath it, a faint diagonal sheen falling from the family's upper-left
 * light, and a soft white edge stroke — depth now lives in the paint (lower
 * planes carry dimmer edges), never in group opacity, so the stack reads as
 * seven real surfaces instead of seven wireframes. Each plane is a real
 * hover/focus target: DarkBand wires it to its caption row and GSAP raises
 * and brightens it.
 *
 * The left connector is circuitry, not scaffolding: DarkBand renders the
 * doubled vertical rail as an HTML element with two real 1px borders that
 * runs the FULL height of the cell (top edge to bottom edge, crisp at any
 * zoom) and pins it to this drawing's tap line; each plane taps off it with
 * a small-radius corner leader that lands on the plane's left vertex. The
 * active plane's leader carries full ink; the rest sit muted. The active
 * plane also doubles its top edge — two parallel contours at constant
 * gauge, the brand's line (THREAD_MOTIF).
 *
 * Accent: the delivered string (the chip on the runtime plane), nothing else.
 */

const SIZE = 84;
const HALF = SIZE / 2;
const THICK = 3.2;
const GAP = 34;

export type StackLayer = {
  /** Stable id, shared with the caption rows in DarkBand. */
  id: string;
  name: string;
  /** The live value the caption row prints — real product output. */
  value: string;
};

/** Bottom plane first — the string starts in the codebase. */
export const STACK_LAYERS: readonly StackLayer[] = [
  { id: 'app-code', name: 'app code', value: '<T>Hello, world!</T>' },
  { id: 'gt-cli', name: 'gt cli', value: 'gt translate · 128 strings' },
  { id: 'locadex', name: 'locadex', value: 'PR #218 · +38 −6' },
  { id: 'context', name: 'context', value: 'glossary 24 · directives 6' },
  { id: 'review', name: 'review', value: '2 approved · 0 waiting' },
  { id: 'edge-cdn', name: 'edge cdn', value: 'fra · 12 ms · v214 live' },
  { id: 'runtime', name: 'runtime', value: 'Hallo, Welt! · de' },
];

/** Depth cue, spent on paint: 0 at the bottom plane, 1 at the runtime plane. */
function stackDepth(i: number): number {
  return i / (STACK_LAYERS.length - 1);
}

/* ---- the left connector, in screen space ------------------------------ */

/** Every plane's top-left vertex projects to this x. */
const VERTEX_X = -(SIZE * ISO_COS30);
/** The x every leader starts from — DarkBand pins the HTML rail's inner line here. */
const RAIL_IN = -104;
/** The corner radius each leader turns with as it peels off the rail. */
const CORNER = 6;

const layerTopY = (i: number): number => -(i * GAP + THICK);

/**
 * A leader: up the rail, a small-radius corner, then horizontal to the
 * plane's left vertex. The corner starts exactly on the inner rail line.
 */
function leaderPath(i: number): string {
  const y = layerTopY(i);
  return `M${RAIL_IN} ${y + CORNER}Q${RAIL_IN} ${y} ${RAIL_IN + CORNER} ${y}L${VERTEX_X - 1} ${y}`;
}

/* ---- the glass slab: the plate every stage sits on --------------------- */

/**
 * One frosted plate. Paint order is the material: a near-opaque dark hull
 * (this is what occludes the planes beneath), the three face tints keeping
 * the family's upper-left light, a diagonal frost sheen on the lit face,
 * then the soft white edge strokes — silhouette rim, front edge, and the
 * top contour, whose brightness carries the depth cue.
 */
function GlassPlate({ z, depth }: { z: number; depth: number }) {
  const box: IsoBox = { x: -HALF, y: -HALF, z, w: SIZE, d: SIZE, h: THICK };
  const hull = roundedPolygon(silhouette(box));
  const top = roundedPolygon(topFace(box));
  const [edgeA, edgeB] = frontEdge(box);
  return (
    <g>
      <path className='tcs-glass-base' d={hull} />
      <path className='tcs-glass-left' d={roundedPolygon(leftFace(box))} />
      <path className='tcs-glass-right' d={roundedPolygon(rightFace(box))} />
      <path className='tcs-glass-topfill' d={top} />
      <path className='tcs-glass-sheen' d={top} />
      <path
        className='tcs-glass-rim'
        d={hull}
        style={{ stroke: `rgba(255, 255, 255, ${(0.14 + 0.1 * depth).toFixed(3)})` }}
      />
      <path className='tcs-glass-front' d={segment(edgeA, edgeB)} />
      <path
        className='tcs-glass-edge'
        d={top}
        style={{ stroke: `rgba(255, 255, 255, ${(0.32 + 0.3 * depth).toFixed(3)})` }}
      />
    </g>
  );
}

/**
 * The active plane's doubled top edge: the top-face contour inset by a
 * constant world margin, which projects to a constant screen gap — two
 * parallel lines at the thread gauge, never merging.
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

/* ---- the on-plane glyphs: each one means its stage --------------------- */

function LayerGlyphs({ id, zf }: { id: string; zf: number }) {
  switch (id) {
    case 'app-code':
      /* source: three code lines, the second indented */
      return (
        <>
          <IsoPlane x={-32} y={-22} z={zf} w={40} d={4.5} fill='mark' />
          <IsoPlane x={-24} y={-10} z={zf} w={30} d={4.5} fill='mark' />
          <IsoPlane x={-32} y={2} z={zf} w={34} d={4.5} fill='mark' />
        </>
      );
    case 'gt-cli':
      /* a prompt: chevron, then the command */
      return (
        <>
          <IsoArrow x={-18} y={-12} z={zf} size={6.5} />
          <IsoPlane x={-10} y={-14.25} z={zf} w={32} d={4.5} fill='mark' />
        </>
      );
    case 'locadex':
      /* a diff: gutter mark + removed line, gutter mark + added line */
      return (
        <>
          <IsoPlane x={-34} y={-15} z={zf} w={4.5} d={4.5} fill='mark' />
          <IsoPlane x={-26} y={-15} z={zf} w={22} d={4.5} fill='mark' />
          <IsoPlane x={-34} y={-3} z={zf} w={4.5} d={4.5} fill='mark' />
          <IsoPlane x={-26} y={-3} z={zf} w={34} d={4.5} fill='mark' />
        </>
      );
    case 'context':
      /* the two halves of a Context Group: glossary and directives */
      return (
        <>
          <IsoSlab x={-26} y={-14} z={zf} w={20} d={14} h={2.6} />
          <IsoSlab x={6} y={-14} z={zf} w={20} d={14} h={2.6} />
        </>
      );
    case 'review':
      /* approved: one check, drawn in the plane */
      return (
        <IsoWire
          points={[
            [-16, 6, zf],
            [-6, 16, zf],
            [12, -8, zf],
          ]}
          tone='soft'
        />
      );
    case 'edge-cdn':
      /* three points of presence, wired — the CDN is a topology */
      return (
        <>
          <IsoWire
            points={[
              [-25.5, -15.5, zf],
              [6.5, -1.5, zf],
              [-13.5, 14.5, zf],
            ]}
            tone='hair'
            close
          />
          <IsoPlane x={-28} y={-18} z={zf} w={5} d={5} fill='mark' />
          <IsoPlane x={4} y={-4} z={zf} w={5} d={5} fill='mark' />
          <IsoPlane x={-16} y={12} z={zf} w={5} d={5} fill='mark' />
        </>
      );
    case 'runtime':
      /* the delivered string — the drawing's one accent — on the page */
      return (
        <>
          <IsoPlane x={-34} y={-18} z={zf} w={26} d={4.5} fill='mark' />
          <IsoSlab x={-10} y={2} z={zf} w={30} d={18} h={4} tone='accent' />
        </>
      );
    default:
      return null;
  }
}

export default function TcStackIso({ className, strokeWidth, accent, title }: IsoProps) {
  return (
    <IsoFrame
      className={className}
      strokeWidth={strokeWidth}
      accent={accent}
      title={title}
      viewW={204}
      viewH={312}
    >
      <defs>
        {/* the frost: one diagonal sheen from the family's upper-left light,
            shared by every plate so the glass reads as one material */}
        <linearGradient id='tcsFrost' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0' stopColor='#ffffff' stopOpacity='0.15' />
          <stop offset='0.55' stopColor='#ffffff' stopOpacity='0.04' />
          <stop offset='1' stopColor='#ffffff' stopOpacity='0' />
        </linearGradient>
      </defs>
      <g transform='translate(124 262)'>
        {/* one corner-routed leader per plane, tapping off the HTML rail */}
        {STACK_LAYERS.map((layer, i) => (
          <path
            key={`leader-${layer.id}`}
            className='tcs-leader'
            data-stack-leader={i}
            vectorEffect='non-scaling-stroke'
            d={leaderPath(i)}
          />
        ))}

        {/* the planes, bottom first so upper stages occlude lower ones */}
        {STACK_LAYERS.map((layer, i) => {
          const z = i * GAP;
          return (
            <g
              key={layer.id}
              className='tcs-layer'
              data-stack-layer={i}
              tabIndex={0}
              aria-label={`${layer.name} — ${layer.value}`}
            >
              <GlassPlate z={z} depth={stackDepth(i)} />
              <LayerGlyphs id={layer.id} zf={z + THICK} />
              {/* the doubled edge, revealed on the active plane only */}
              <path className='tcs-dbl' d={doubledEdge(z)} />
            </g>
          );
        })}
      </g>
    </IsoFrame>
  );
}
