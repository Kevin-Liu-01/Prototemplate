import IsoFrame, { type IsoProps } from './IsoFrame';
import { ISO_COS30, ISO_RADIUS, ISO_SIN30, roundedPolygon, segment, type Pt } from './iso';

/**
 * Data as illustration — horizontal bars that are extruded on the family's own
 * 30° vector rather than drawn flat, so a chart sits beside the drawings
 * without looking borrowed from somewhere else.
 *
 * Accent: one row, by default the first.
 */

export type BenchmarkItem = {
  label: string;
  /** Anything on a shared scale — smaller is not assumed to be better. */
  value: number;
  /** The figure printed at the right, already formatted (e.g. `142ms`). */
  time: string;
};

export type BenchmarkBarsProps = IsoProps & {
  items: readonly BenchmarkItem[];
  /** Which row spends the accent. Pass -1 for none. Default 0. */
  accentIndex?: number;
  /** Full-scale value. Defaults to the largest item. */
  max?: number;
};

const VIEW_W = 360;
const ROW_H = 30;
const PAD = 4;
const BAR_H = 13;
const TRACK_X = 104;
const TRACK_W = 178;
/** The extrusion: five world units straight back, on the family's axes. */
const DEPTH = 5;
const DX = DEPTH * ISO_COS30;
const DY = -DEPTH * ISO_SIN30;

export default function BenchmarkBars({
  items,
  accentIndex = 0,
  max,
  className,
  strokeWidth,
  accent,
  title,
}: BenchmarkBarsProps) {
  const scale = max ?? items.reduce((acc, item) => Math.max(acc, item.value), 0);
  const viewH = PAD * 2 + items.length * ROW_H;

  return (
    <IsoFrame
      className={className}
      strokeWidth={strokeWidth}
      accent={accent}
      title={title}
      viewW={VIEW_W}
      viewH={viewH}
    >
      {items.map((item, i) => {
        const y0 = PAD + i * ROW_H + 9;
        const y1 = y0 + BAR_H;
        const x0 = TRACK_X;
        const x1 = x0 + Math.max(10, scale > 0 ? (item.value / scale) * TRACK_W : 0);
        const isAccent = i === accentIndex;
        const stroke = isAccent ? 'iso-accent' : 'iso-line';

        const front: Pt[] = [
          [x0, y0],
          [x1, y0],
          [x1, y1],
          [x0, y1],
        ];
        const top: Pt[] = [
          [x0, y0],
          [x1, y0],
          [x1 + DX, y0 + DY],
          [x0 + DX, y0 + DY],
        ];
        const cap: Pt[] = [
          [x1, y0],
          [x1 + DX, y0 + DY],
          [x1 + DX, y1 + DY],
          [x1, y1],
        ];
        const outline: Pt[] = [
          [x0, y0],
          [x0 + DX, y0 + DY],
          [x1 + DX, y0 + DY],
          [x1 + DX, y1 + DY],
          [x1, y1],
          [x0, y1],
        ];

        return (
          <g key={item.label}>
            <text className='iso-bench-name' x={0} y={y0 + BAR_H / 2} dominantBaseline='middle'>
              {item.label}
            </text>

            <path
              className='iso-hair'
              d={roundedPolygon(
                [
                  [x0, y0],
                  [TRACK_X + TRACK_W, y0],
                  [TRACK_X + TRACK_W, y1],
                  [x0, y1],
                ],
                ISO_RADIUS,
              )}
            />

            <path className={isAccent ? 'iso-face-accent-low' : 'iso-face-right'} d={roundedPolygon(cap, ISO_RADIUS)} />
            <path className={isAccent ? 'iso-face-accent-mid' : 'iso-face-left'} d={roundedPolygon(front, ISO_RADIUS)} />
            <path className={isAccent ? 'iso-face-accent' : 'iso-face-top'} d={roundedPolygon(top, ISO_RADIUS)} />

            <path className={stroke} d={roundedPolygon(outline, ISO_RADIUS)} />
            <path className={stroke} d={segment([x0, y0], [x1, y0])} />
            <path className={stroke} d={segment([x1, y0], [x1 + DX, y0 + DY])} />
            <path className={stroke} d={segment([x1, y0], [x1, y1])} />

            <text
              className='iso-bench-time'
              x={VIEW_W}
              y={y0 + BAR_H / 2}
              textAnchor='end'
              dominantBaseline='middle'
            >
              {item.time}
            </text>
          </g>
        );
      })}
    </IsoFrame>
  );
}
