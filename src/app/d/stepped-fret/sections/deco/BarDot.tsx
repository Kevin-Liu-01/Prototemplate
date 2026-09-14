import type { ReactNode } from 'react';

import { barDotPlaces } from '../../fret';

/**
 * Ornament home: the hero crown. A count written in bar-and-dot geometry,
 * base twenty, the highest place on top: dots are ones, bars are fives. The
 * figure the page draws is 118, the locales ready today, so the numeral is
 * the count itself and not a decoration. Drawn in the crown's `color`.
 */
export type BarDotProps = {
  value: number;
  /** pixel size of one dot; bars are four dots long */
  unit?: number;
  className?: string;
};

export default function BarDot({ value, unit = 9, className }: BarDotProps) {
  const places = barDotPlaces(value);
  const gap = Math.round(unit * 0.55);
  const barH = Math.round(unit * 0.55);
  const barW = unit * 4 + gap * 3;
  const placeGap = unit * 1.4;
  const heights = places.map((p) => (p.dots > 0 ? unit : 0) + (p.dots > 0 && p.bars > 0 ? gap : 0) + p.bars * (barH + gap) - (p.bars > 0 ? gap : 0));
  const total = heights.reduce((sum, h) => sum + h, 0) + placeGap * Math.max(0, places.length - 1);

  let y = 0;
  return (
    <svg
      className={className}
      width={barW}
      height={total}
      viewBox={`0 0 ${barW} ${total}`}
      aria-hidden='true'
      focusable='false'
    >
      {places.map((place, i) => {
        const startY = y;
        const shapes: ReactNode[] = [];
        let cursor = startY;
        if (place.dots > 0) {
          const rowW = place.dots * unit + (place.dots - 1) * gap;
          const x0 = (barW - rowW) / 2;
          for (let d = 0; d < place.dots; d++) {
            shapes.push(
              <rect
                key={`d${i}-${d}`}
                x={x0 + d * (unit + gap)}
                y={cursor}
                width={unit}
                height={unit}
                fill='currentColor'
              />
            );
          }
          cursor += unit + (place.bars > 0 ? gap : 0);
        }
        for (let b = 0; b < place.bars; b++) {
          shapes.push(<rect key={`b${i}-${b}`} x={0} y={cursor} width={barW} height={barH} fill='currentColor' />);
          cursor += barH + (b < place.bars - 1 ? gap : 0);
        }
        y = cursor + placeGap;
        return <g key={`p${i}`}>{shapes}</g>;
      })}
    </svg>
  );
}
