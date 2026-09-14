/**
 * papyrus-registers · deco · the column numeral.
 * Ornament home: section heads. The columns of the scroll are counted in
 * bar-and-dot numerals, pure geometry: a dot is one, a bar is five, dots
 * sit above bars. Drawn once per column head in the rubric red, seated in
 * the margin beside the rubric. Decorative: the rubric carries the meaning.
 */
export type NumeralProps = { n: number };

const DOT_R = 2.6;
const DOT_GAP = 9;
const BAR_W = 30;
const BAR_H = 3.5;
const BAR_GAP = 3;

export default function Numeral({ n }: NumeralProps) {
  const value = Math.max(1, Math.min(19, Math.floor(n)));
  const bars = Math.floor(value / 5);
  const dots = value % 5;
  const dotsH = dots > 0 ? DOT_R * 2 : 0;
  const barsH = bars * BAR_H + Math.max(0, bars - 1) * BAR_GAP;
  const gap = dots > 0 && bars > 0 ? 4 : 0;
  const height = Math.max(DOT_R * 2, dotsH + gap + barsH);
  const dotsWidth = dots > 0 ? (dots - 1) * DOT_GAP + DOT_R * 2 : 0;
  const dotsStart = (BAR_W - dotsWidth) / 2 + DOT_R;

  return (
    <svg className='pr-numeral' viewBox={`0 0 ${BAR_W} ${height}`} width={BAR_W} height={height} aria-hidden='true'>
      {Array.from({ length: dots }, (_, i) => (
        <circle key={`d${i}`} cx={dotsStart + i * DOT_GAP} cy={DOT_R} r={DOT_R} fill='currentColor' />
      ))}
      {Array.from({ length: bars }, (_, i) => (
        <rect
          key={`b${i}`}
          x={0}
          y={dotsH + gap + i * (BAR_H + BAR_GAP)}
          width={BAR_W}
          height={BAR_H}
          fill='currentColor'
        />
      ))}
    </svg>
  );
}
