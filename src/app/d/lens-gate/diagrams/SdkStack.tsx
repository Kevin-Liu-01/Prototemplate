import IsoFrame, { type IsoProps } from './IsoFrame';
import { IsoPlane, IsoSlab } from './IsoSolid';
import { ISO_COS30 } from './iso';

/**
 * SDKs — four translucent planes on one axis, each one named. The stack used to
 * be four anonymous plates, which is a metaphor rather than information; with a
 * leader out to the package on each level it is the list of first-party SDKs,
 * drawn.
 *
 * Accent: the chip resting on the top plane — the SDK you are currently in.
 */

const SIZE = 72;
const HALF = SIZE / 2;
const THICK = 3.4;
const GAP = 18;
const LEVELS = [0, GAP, GAP * 2, GAP * 3];
const TOP_Z = GAP * 3 + THICK;

/** The right-hand vertex of a plane's top face, which is where its leader starts. */
const VERTEX_X = HALF * 2 * ISO_COS30;

/** Bottom plane first, so the index lines up with `LEVELS`. */
const PACKAGES = ['gt-node', 'gt-react-native', 'gt-react', 'gt-next'];

/** Rule lines on the top plane, as [start x, length, y]. */
const LINES: readonly (readonly [number, number, number])[] = [
  [-26, 46, -24],
  [-26, 32, -12],
  [-26, 38, 0],
];

export default function SdkStack({ className, strokeWidth, accent, title }: IsoProps) {
  return (
    <IsoFrame className={className} strokeWidth={strokeWidth} accent={accent} title={title} viewW={250} viewH={152}>
      <g transform='translate(78 101)'>
        {LEVELS.map((z, i) => (
          <g key={z}>
            <IsoSlab x={-HALF} y={-HALF} z={z} w={SIZE} d={SIZE} h={THICK} />
            {i < LEVELS.length - 1 ? (
              <IsoPlane x={-30} y={26} z={z + THICK} w={24} d={3} fill='mark' />
            ) : null}
          </g>
        ))}

        {LINES.map(([x, len, y]) => (
          <IsoPlane key={`${x}-${y}`} x={x} y={y} z={TOP_Z} w={len} d={4.5} fill='mark' />
        ))}

        <IsoSlab x={2} y={14} z={TOP_Z} w={26} d={16} h={4.5} tone='accent' />

        {/* One leader per level, all landing on the same column, so four labels
            read as a list rather than as four separate annotations. */}
        {LEVELS.map((z, i) => {
          const y = -(z + THICK);
          const top = i === LEVELS.length - 1;
          return (
            <g key={`label-${z}`}>
              <path className='iso-hair' d={`M${VERTEX_X + 2} ${y}L${VERTEX_X + 20} ${y}`} />
              <text
                className={top ? 'iso-label iso-label-strong' : 'iso-label'}
                x={VERTEX_X + 25}
                y={y + 2.9}
              >
                {PACKAGES[i]}
              </text>
            </g>
          );
        })}
      </g>
    </IsoFrame>
  );
}
