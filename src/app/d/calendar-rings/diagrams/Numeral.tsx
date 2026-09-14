/**
 * calendar-rings: bar-and-dot numerals.
 *
 * Ornament home: the disk's fourth ring (as knockouts in the ground color)
 * and the section heads (as the ring number in the ornament color). The
 * form is the Maya count: a dot is one, a bar is five, dots stack above
 * bars. Pure geometry, drawn in a 10-unit-wide frame. `NumeralGlyph` is the
 * group for an SVG that already exists; `Numeral` wraps one in its own
 * inline SVG for HTML.
 */
import type { ReactNode } from 'react';

const DOT_R = 1;
const DOT_STEP = 2.5;
const BAR_H = 1.4;
const GAP = 0.8;
const WIDTH = 10;

/** Two decimals is plenty for path data and keeps float noise out of the markup. */
const fix = (n: number) => Math.round(n * 100) / 100;

/** Height of the numeral's frame in units, for a caller that has to size around it. */
export function numeralHeight(n: number): number {
  const bars = Math.floor(n / 5);
  const dots = n % 5;
  const dotBlock = dots > 0 ? DOT_R * 2 : 0;
  const barBlock = bars > 0 ? bars * BAR_H + (bars - 1) * GAP : 0;
  const seam = dots > 0 && bars > 0 ? GAP : 0;
  return dotBlock + seam + barBlock;
}

export type NumeralGlyphProps = {
  n: number;
  /** Units per frame unit; the glyph is `10 * scale` wide. */
  scale?: number;
  fill?: string;
};

/**
 * The numeral as an SVG group centered on (0, 0) with its dots toward
 * negative y. Rotate the group to point the dots outward on a ring.
 */
export function NumeralGlyph({ n, scale = 1, fill = 'currentColor' }: NumeralGlyphProps) {
  const bars = Math.floor(n / 5);
  const dots = n % 5;
  const h = numeralHeight(n);
  const top = -h / 2;
  const shapes: ReactNode[] = [];

  if (dots > 0) {
    const span = (dots - 1) * DOT_STEP;
    for (let i = 0; i < dots; i++) {
      const cx = -span / 2 + i * DOT_STEP;
      shapes.push(
        <circle key={`d${i}`} cx={fix(cx * scale)} cy={fix((top + DOT_R) * scale)} r={fix(DOT_R * scale)} fill={fill} />
      );
    }
  }
  let y = top + (dots > 0 ? DOT_R * 2 + GAP : 0);
  for (let i = 0; i < bars; i++) {
    shapes.push(
      <rect
        key={`b${i}`}
        x={fix((-WIDTH / 2) * scale)}
        y={fix(y * scale)}
        width={fix(WIDTH * scale)}
        height={fix(BAR_H * scale)}
        fill={fill}
      />
    );
    y += BAR_H + GAP;
  }
  return <g>{shapes}</g>;
}

export type NumeralProps = {
  n: number;
  /** Height in CSS pixels of a five-unit frame; the glyph scales with it. */
  size?: number;
  className?: string;
};

/** An inline numeral for HTML, in currentColor, decorative. */
export function Numeral({ n, size = 14, className }: NumeralProps) {
  const h = Math.max(numeralHeight(n), 2);
  const unit = size / 5;
  return (
    <svg
      className={className}
      width={WIDTH * unit}
      height={h * unit}
      viewBox={`${-WIDTH / 2} ${-h / 2} ${WIDTH} ${h}`}
      aria-hidden='true'
      focusable='false'
    >
      <NumeralGlyph n={n} />
    </svg>
  );
}
