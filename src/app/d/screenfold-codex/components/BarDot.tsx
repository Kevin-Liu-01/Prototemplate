import { cn } from '@/lib/cn';

/**
 * Maya bar-and-dot numerals as SVG geometry. A dot is one, a bar is five,
 * an empty oval stands for zero; a figure over nineteen stacks its base
 * twenty digits with the highest place on top (or, in `row` layout, on the
 * left). Every figure on the codex prints beside one of these, so the
 * numeral is decorative by default and the Arabic figure carries the
 * reading; pass `label` to make it the only carrier.
 *
 * Ornament home: the margins and the row heads of every panel; the folio
 * cartouche in each panel's corner.
 */
export type BarDotProps = {
  n: number;
  /** CSS pixels per unit; 1 prints a 6px dot and a 33px bar. */
  scale?: number;
  layout?: 'column' | 'row';
  className?: string;
  /** an accessible name; without one the numeral is aria-hidden */
  label?: string;
};

const DOT = 6;
const GAP = 3;
const BAR_H = 4;
const W = DOT * 4 + GAP * 3;
const DIGIT_GAP = 7;

function digitsOf(n: number): number[] {
  if (n === 0) return [0];
  const digits: number[] = [];
  let rest = n;
  while (rest > 0) {
    digits.unshift(rest % 20);
    rest = Math.floor(rest / 20);
  }
  return digits;
}

function digitHeight(d: number): number {
  if (d === 0) return DOT;
  const dots = d % 5;
  const bars = Math.floor(d / 5);
  let h = 0;
  if (dots > 0) h += DOT;
  if (bars > 0) {
    if (dots > 0) h += GAP;
    h += bars * BAR_H + (bars - 1) * GAP;
  }
  return h;
}

function digitShapes(d: number, h: number) {
  if (d === 0) {
    return (
      <ellipse
        cx={W / 2}
        cy={h / 2}
        rx={W * 0.32}
        ry={DOT / 2 - 0.6}
        fill='none'
        stroke='currentColor'
        strokeWidth={1.4}
      />
    );
  }
  const dots = d % 5;
  const bars = Math.floor(d / 5);
  const shapes = [];
  if (dots > 0) {
    const rowW = dots * DOT + (dots - 1) * GAP;
    const x0 = (W - rowW) / 2;
    for (let k = 0; k < dots; k++) {
      shapes.push(
        <circle
          key={`d${k}`}
          cx={x0 + k * (DOT + GAP) + DOT / 2}
          cy={DOT / 2}
          r={DOT / 2}
          fill='currentColor'
        />
      );
    }
  }
  let y = dots > 0 ? DOT + GAP : 0;
  for (let b = 0; b < bars; b++) {
    shapes.push(<rect key={`b${b}`} x={0} y={y} width={W} height={BAR_H} fill='currentColor' />);
    y += BAR_H + GAP;
  }
  return shapes;
}

export default function BarDot({ n, scale = 1, layout = 'column', className, label }: BarDotProps) {
  const digits = digitsOf(Math.max(0, Math.floor(n)));
  const heights = digits.map(digitHeight);
  const count = digits.length;
  const totalH =
    layout === 'column'
      ? heights.reduce((a, b) => a + b, 0) + (count - 1) * DIGIT_GAP
      : Math.max(...heights);
  const totalW = layout === 'column' ? W : count * W + (count - 1) * DIGIT_GAP;

  let cursor = 0;
  const groups = digits.map((d, i) => {
    const h = heights[i] ?? DOT;
    const x = layout === 'column' ? 0 : cursor;
    const y = layout === 'column' ? cursor : totalH - h;
    cursor += (layout === 'column' ? h : W) + DIGIT_GAP;
    return (
      <g key={i} transform={`translate(${x} ${y})`}>
        {digitShapes(d, h)}
      </g>
    );
  });

  return (
    <svg
      className={cn('sfc-num', className)}
      viewBox={`0 0 ${totalW} ${totalH}`}
      width={totalW * scale}
      height={totalH * scale}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable='false'
    >
      {groups}
    </svg>
  );
}
