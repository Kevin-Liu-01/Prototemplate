import type { ReactNode } from 'react';

/**
 * talud-tablero deco: a Maya bar-and-dot numeral. Home: the hero crown
 * (the one crown element). A dot is one, a bar is five, a lozenge stands
 * for zero, and digits stack in base twenty with the highest place on top.
 * Pure geometry drawn in currentColor, sized by the `unit`.
 */

export type BarDotProps = {
  value: number;
  /** Bar height and dot diameter in px. Default 6. */
  unit?: number;
  className?: string;
  /** Accessible reading of the figure, for example "118". */
  label: string;
};

function digitsBase20(value: number): number[] {
  const n = Math.max(0, Math.floor(value));
  if (n === 0) return [0];
  const out: number[] = [];
  let rest = n;
  while (rest > 0) {
    out.unshift(rest % 20);
    rest = Math.floor(rest / 20);
  }
  return out;
}

type Block = { bars: number; dots: number; zero: boolean; h: number };

export function BarDot({ value, unit = 6, className, label }: BarDotProps) {
  const digits = digitsBase20(value);
  const barW = unit * 7;
  const gap = unit * 0.7;
  const digitGap = unit * 2;

  /* measure each digit: the dots row, if any, sits above the bars */
  const blocks: Block[] = digits.map((d) => {
    const bars = Math.floor(d / 5);
    const dots = d % 5;
    const zero = d === 0;
    const dotsH = dots > 0 ? unit + gap : 0;
    const barsH = bars > 0 ? bars * (unit + gap) - gap : 0;
    const h = zero ? unit * 2 : dotsH + barsH;
    return { bars, dots, zero, h };
  });
  const total = blocks.reduce((sum, b) => sum + b.h, 0) + digitGap * (blocks.length - 1);

  const shapes: ReactNode[] = [];
  let y = 0;
  blocks.forEach((b, i) => {
    if (b.zero) {
      const cx = barW / 2;
      const cy = y + unit;
      shapes.push(
        <path
          key={`z${i}`}
          d={`M${cx - unit * 1.6} ${cy} L${cx} ${cy - unit} L${cx + unit * 1.6} ${cy} L${cx} ${cy + unit} Z`}
          fill='none'
          stroke='currentColor'
          strokeWidth={1.5}
        />
      );
      y += b.h;
    } else {
      if (b.dots > 0) {
        const span = b.dots * unit + (b.dots - 1) * gap;
        const x0 = (barW - span) / 2;
        for (let d = 0; d < b.dots; d++) {
          shapes.push(
            <rect
              key={`d${i}-${d}`}
              x={x0 + d * (unit + gap)}
              y={y}
              width={unit}
              height={unit}
              rx={unit / 2}
              fill='currentColor'
            />
          );
        }
        y += unit + gap;
      }
      for (let k = 0; k < b.bars; k++) {
        shapes.push(<rect key={`b${i}-${k}`} x={0} y={y} width={barW} height={unit} fill='currentColor' />);
        y += unit + gap;
      }
      if (b.bars > 0) y -= gap;
    }
    if (i < blocks.length - 1) y += digitGap;
  });

  return (
    <svg
      className={className ? `tt-bardot ${className}` : 'tt-bardot'}
      width={barW}
      height={total}
      viewBox={`0 0 ${barW} ${total}`}
      role='img'
      aria-label={label}
    >
      {shapes}
    </svg>
  );
}

export default BarDot;
