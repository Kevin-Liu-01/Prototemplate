import IsoFrame, { type IsoProps } from './IsoFrame';
import { IsoPlane, IsoSlab } from './IsoSolid';
import { ISO_COS30 } from './iso';

/**
 * The full stack, drawn once — seven planes on the family's 30° axis, one per
 * stage of the toolchain, each labeled with the same live values the band's
 * `gt status` transcript prints. The brand's doubled thread is the string
 * itself: it enters at the app-code plane, is tapped by every stage on the
 * way up, and lands on the accent chip on the runtime plane — the translated
 * string on a user's screen. Source to screen, one continuous line.
 *
 * Accent: the delivered string (the chip on the top plane), nothing else.
 */

const SIZE = 84;
const HALF = SIZE / 2;
const THICK = 3.2;
const GAP = 30;
const TOP_Z = GAP * 6 + THICK;

/** The right-hand vertex of a plane's top face, where its leader starts. */
const VERTEX_X = HALF * 2 * ISO_COS30;

type Layer = {
  name: string;
  value: string;
  /** Rule-line marks on the top face, as [start x, length, y]. */
  marks?: readonly (readonly [number, number, number])[];
};

/** Bottom plane first — the string starts in the codebase. */
const LAYERS: readonly Layer[] = [
  {
    name: 'app code',
    value: '<T>Hello, world!</T>',
    marks: [
      [-30, 40, -24],
      [-30, 26, -12],
      [-30, 34, 0],
    ],
  },
  {
    name: 'gt cli',
    value: 'gt translate · 128 strings',
    marks: [
      [-30, 6, -10],
      [-20, 34, -10],
      [-30, 22, 2],
    ],
  },
  {
    name: 'locadex',
    value: 'agent · PR #218 · +38 −6',
    marks: [
      [-30, 30, -14],
      [-30, 38, -2],
    ],
  },
  {
    // Two solids on one plane: the two halves of a Context Group.
    name: 'context',
    value: 'glossary 24 · directives 6',
  },
  {
    name: 'review',
    value: '2 approved · 0 waiting',
    marks: [
      [-30, 34, -14],
      [-30, 20, -2],
    ],
  },
  {
    // Three points of presence, not rule lines — the CDN is a topology.
    name: 'edge cdn',
    value: 'fra · 12 ms · v214 live',
  },
  {
    name: 'runtime',
    value: 'Hallo, Welt! · de',
  },
];

/**
 * The doubled thread, in screen space: in from the left edge, up the stack's
 * flank, and onto the top plane. Two paths, never one, never three — constant
 * gauge via non-scaling strokes, constant 3-unit gap via concentric corners.
 */
const FLANK = -102;
const ENTRY_Y = 34;
const TOP_Y = -TOP_Z + 5;
const LEFT = -136;
const END_X = -26;
const T_GAP = 3;

const THREAD_A = `M${LEFT} ${ENTRY_Y}L${FLANK} ${ENTRY_Y}L${FLANK} ${TOP_Y}L${END_X} ${TOP_Y}`;
const THREAD_B = `M${LEFT} ${ENTRY_Y + T_GAP}L${FLANK + T_GAP} ${ENTRY_Y + T_GAP}L${FLANK + T_GAP} ${
  TOP_Y + T_GAP
}L${END_X} ${TOP_Y + T_GAP}`;

export default function TcStackIso({ className, strokeWidth, accent, title }: IsoProps) {
  return (
    <IsoFrame
      className={className}
      strokeWidth={strokeWidth}
      accent={accent}
      title={title}
      viewW={392}
      viewH={262}
    >
      <g transform='translate(136 208)'>
        {LAYERS.map((layer, i) => {
          const z = i * GAP;
          return (
            <g key={layer.name}>
              <IsoSlab x={-HALF} y={-HALF} z={z} w={SIZE} d={SIZE} h={THICK} />

              {layer.marks?.map(([x, len, y]) => (
                <IsoPlane key={`${x}-${y}`} x={x} y={y} z={z + THICK} w={len} d={4.5} fill='mark' />
              ))}

              {/* context: the glossary and directive halves of a Context Group */}
              {i === 3 ? (
                <>
                  <IsoSlab x={-28} y={-16} z={z + THICK} w={20} d={14} h={2.6} />
                  <IsoSlab x={0} y={-16} z={z + THICK} w={20} d={14} h={2.6} />
                </>
              ) : null}

              {/* edge cdn: three points of presence on the plane */}
              {i === 5 ? (
                <>
                  <IsoPlane x={-26} y={-16} z={z + THICK} w={5} d={5} fill='mark' />
                  <IsoPlane x={2} y={-4} z={z + THICK} w={5} d={5} fill='mark' />
                  <IsoPlane x={-14} y={10} z={z + THICK} w={5} d={5} fill='mark' />
                </>
              ) : null}
            </g>
          );
        })}

        {/* the delivered string: the one accent in the drawing */}
        <IsoSlab x={-6} y={4} z={TOP_Z} w={30} d={18} h={4} tone='accent' />

        {/* the two threads — drawn over the planes, so the string visibly
            climbs the flank and lands on the runtime plane */}
        <path className='tcstack-thread' d={THREAD_A} />
        <path className='tcstack-thread' d={THREAD_B} />

        {/* one hairline tap per stage: every layer touches the same thread */}
        {LAYERS.slice(0, 6).map((layer, i) => {
          const y = -(i * GAP + THICK);
          return <path key={`tap-${layer.name}`} className='iso-hair' d={`M${FLANK + T_GAP} ${y}L-76 ${y}`} />;
        })}

        {/* one leader per plane, all landing on one column — a list, not seven
            floating annotations. Name strong, live value dim beneath it. */}
        {LAYERS.map((layer, i) => {
          const y = -(i * GAP + THICK);
          return (
            <g key={`label-${layer.name}`}>
              <path className='iso-hair' d={`M${VERTEX_X + 2} ${y}L${VERTEX_X + 20} ${y}`} />
              <text className='iso-label iso-label-strong tcstack-name' x={VERTEX_X + 25} y={y - 1.5}>
                {layer.name}
              </text>
              <text className='iso-label' x={VERTEX_X + 25} y={y + 9.5}>
                {layer.value}
              </text>
            </g>
          );
        })}
      </g>
    </IsoFrame>
  );
}
