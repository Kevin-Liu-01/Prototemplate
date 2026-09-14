import type { ReactElement } from 'react';

/**
 * Bar-and-dot numerals for the court heads: a dot is one, a bar is five.
 * Home: section heads. Gold fills, no stroke, sized to the count.
 */
type BarDotProps = { n: number; className?: string };

const DOT_R = 3;
const DOT_STEP = 12;
const BAR_W = 30;
const BAR_H = 4;
const GAP = 8;

export default function BarDot({ n, className }: BarDotProps) {
  const bars = Math.floor(n / 5);
  const dots = n % 5;
  const width = bars * BAR_W + (bars > 0 && dots > 0 ? GAP : 0) + (dots > 0 ? (dots - 1) * DOT_STEP + DOT_R * 2 : 0);
  const height = Math.max(BAR_H, DOT_R * 2);
  let x = 0;
  const shapes: ReactElement[] = [];
  for (let i = 0; i < bars; i++) {
    shapes.push(<rect key={`b${i}`} x={x} y={(height - BAR_H) / 2} width={BAR_W} height={BAR_H} fill='currentColor' />);
    x += BAR_W;
  }
  if (bars > 0 && dots > 0) x += GAP;
  for (let i = 0; i < dots; i++) {
    shapes.push(<circle key={`d${i}`} cx={x + DOT_R} cy={height / 2} r={DOT_R} fill='currentColor' />);
    x += DOT_STEP;
  }
  return (
    <svg className={className} width={Math.max(width, 1)} height={height} viewBox={`0 0 ${Math.max(width, 1)} ${height}`} aria-hidden='true'>
      {shapes}
    </svg>
  );
}
