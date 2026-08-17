import { bayerTile } from './DitheredMark';

/**
 * Type rendered as dithered ink: the word is an SVG mask over a tiered
 * Bayer coverage ramp, so its glyphs come out as dither cells that thin
 * from solid on one flank to a sparse fringe on the other — the 1-bit
 * language spoken by a letterform instead of a field.
 *
 * The ramp is TIERED, never a gradient: six bands of the 4×4 ordered
 * matrix (16/16 down to 1/16) laid side by side across the plate and
 * rotated as one group. Ordered dithering nests by construction — every
 * tier's lit cells are a subset of the next tier's — so a band boundary
 * only ever turns cells off: no cell is painted twice, and no seam shows
 * where two bands meet.
 *
 * Server-safe by design: no hooks, no canvas, no client boundary, so the
 * cover ships in the HTML and costs nothing at runtime. The price is that
 * SVG ids are document-global, so `id` is caller-owned and must be unique
 * per page — the same contract DitheredMark keeps.
 */

/** The plate the motif is laid out in; every geometry number here is in
    these units, and the host box scales them. */
const PLATE_W = 400;
const PLATE_H = 225;

/** Coverage tiers, solid flank first: matrix coverage k/16, and the band's
    width in plate units. The sparse tail starts late enough that the last
    letter still reads — decay, never disappearance. */
const RAMP: readonly { cover: number; width: number }[] = [
  { cover: 16, width: 320 },
  { cover: 12, width: 64 },
  { cover: 8, width: 58 },
  { cover: 5, width: 54 },
  { cover: 3, width: 50 },
  { cover: 1, width: 44 },
];

/** Where the ramp starts, and how tall each band is drawn: the group is
    rotated about the plate centre, so the bands must overhang far enough
    that no corner falls off the run at any angle. */
const RAMP_X = -200;
const RAMP_Y = -240;
const RAMP_H = 700;

/** Han, kana and Hangul carry a whole word in one glyph, so they take the
    display size a Latin word of the same length never could. */
const CJK = /[　-鿿가-힯]/;

/** The font size that fills the plate for a text of this shape — the
    default when the caller does not pin one. */
function fitSize(text: string): number {
  if (CJK.test(text)) return 185;
  if (text.length <= 2) return 170;
  if (text.length === 3) return 150;
  if (text.length === 4) return 145;
  if (text.length <= 6) return 110;
  return 86;
}

type DitherTextProps = {
  /** the word or phrase the dither forms */
  text: string;
  /** REQUIRED: unique per page — SVG ids are document-global */
  id: string;
  /** dither cell edge in plate units; one Bayer tile is four cells, so
      this is the grain dial — 2 reads as halftone, 5+ as pixel art */
  cell?: number;
  /** the lit cells' fill: any CSS color, tokens included */
  ink?: string;
  /** ramp rotation in degrees about the plate centre */
  angle?: number;
  /** display size; defaults to the fit derived from the text */
  size?: number;
  /** tracking; defaults to a slight negative on anything past two glyphs */
  letterSpacing?: string;
  className?: string;
};

export default function DitherText({
  text,
  id,
  cell = 3,
  ink = 'currentColor',
  angle = 12,
  size,
  letterSpacing,
  className,
}: DitherTextProps) {
  const tile = cell * 4;
  const track = letterSpacing ?? (text.length > 2 ? '-0.04em' : undefined);

  /* the bands are laid end to end from the ramp's start, so a tier's
     width is the only number a caller would ever retune */
  let edge = RAMP_X;
  const bands = RAMP.map((tier) => {
    const band = { cover: tier.cover, x: edge, width: tier.width };
    edge += tier.width;
    return band;
  });

  return (
    <svg
      aria-hidden='true'
      className={className}
      preserveAspectRatio='xMidYMid meet'
      viewBox={`0 0 ${PLATE_W} ${PLATE_H}`}
    >
      <defs>
        {RAMP.map((tier) => (
          <pattern
            height={tile}
            id={`${id}-b${tier.cover}`}
            key={tier.cover}
            patternUnits='userSpaceOnUse'
            width={tile}
          >
            <path d={bayerTile(tier.cover, cell)} fill={ink} shapeRendering='crispEdges' />
          </pattern>
        ))}
        <mask id={`${id}-mask`}>
          {/* the mask is luminance: black plate, white letterform */}
          <rect fill='black' height={PLATE_H} width={PLATE_W} />
          <text
            dominantBaseline='central'
            fill='white'
            fontSize={size ?? fitSize(text)}
            letterSpacing={track}
            textAnchor='middle'
            x={PLATE_W / 2}
            y={PLATE_H / 2 + 5}
          >
            {text}
          </text>
        </mask>
      </defs>
      <g mask={`url(#${id}-mask)`}>
        <g transform={`rotate(${angle} ${PLATE_W / 2} ${PLATE_H / 2})`}>
          {bands.map((band) => (
            <rect
              fill={`url(#${id}-b${band.cover})`}
              height={RAMP_H}
              key={band.cover}
              width={band.width}
              x={band.x}
              y={RAMP_Y}
            />
          ))}
        </g>
      </g>
    </svg>
  );
}
