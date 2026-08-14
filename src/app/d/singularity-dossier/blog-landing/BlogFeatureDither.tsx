const BAYER4: readonly (readonly number[])[] = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

/**
 * The feature covers: a motif — a CJK glyph, "i18n", "Next.js" — poured
 * from the house Bayer dither in the accent blue. The motif is an SVG
 * mask over the same tiered ramp the per-slug covers use, so the type
 * itself is made of dither: solid ink on one flank falling away to
 * sparse dots on the other. Pure server-rendered SVG.
 */

export type FeatureMotif = {
  /** The text the dither forms. */
  text: string;
  /** SVG font-size for the motif inside the 400×225 plate. */
  size: number;
  /** Ramp rotation, degrees. */
  angle: number;
  letterSpacing?: string;
};

export const FEATURE_MOTIFS: readonly FeatureMotif[] = [
  { text: '語', size: 185, angle: 24 },
  { text: 'i18n', size: 148, angle: -18, letterSpacing: '-0.05em' },
  { text: 'Next.js', size: 86, angle: 14, letterSpacing: '-0.04em' },
];

function hashSlug(slug: string): number {
  let h = 2166136261;
  for (let i = 0; i < slug.length; i += 1) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** A post's motif is its own, derived from the slug — the index card
    and the article header always show the same image. The slug also
    leans the ramp a few degrees so shared motifs stay distinct. */
export function motifFor(slug: string): FeatureMotif {
  const seed = hashSlug(slug);
  const base =
    FEATURE_MOTIFS[seed % FEATURE_MOTIFS.length] ?? FEATURE_MOTIFS[0]!;
  const lean = ((seed >> 4) % 13) - 6;
  return { ...base, angle: base.angle + lean };
}

/** Coverage tiers, solid-side first (the per-slug covers' ramp, scaled
    to cross a full plate). The sparse tail starts late enough that the
    motif's last letter still reads — decay, never disappearance. */
const RAMP: readonly { cover: number; width: number }[] = [
  { cover: 16, width: 320 },
  { cover: 12, width: 64 },
  { cover: 8, width: 58 },
  { cover: 5, width: 54 },
  { cover: 3, width: 50 },
  { cover: 1, width: 44 },
];

const CELL = 3;
const TILE = CELL * 4;

function tilePath(cover: number): string {
  const cells: string[] = [];
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      const bayerRow = BAYER4[row];
      if (bayerRow && (bayerRow[col] ?? 16) < cover) {
        cells.push(`M${col * CELL} ${row * CELL}h${CELL}v${CELL}h${-CELL}z`);
      }
    }
  }
  return cells.join('');
}

export default function BlogFeatureDither({
  motif,
  id,
  className,
}: {
  motif: FeatureMotif;
  /** Unique per page — namespaces the SVG pattern/mask ids. */
  id: string;
  className?: string;
}) {
  const idBase = `blog-feature-${id}`;

  let edge = -200;
  const bands = RAMP.map((tier) => {
    const band = { cover: tier.cover, x: edge, width: tier.width };
    edge += tier.width;
    return band;
  });

  return (
    <span
      className={`blog-dither-cover blog-feature-dither${className ? ` ${className}` : ''}`}
      aria-hidden='true'
    >
      <svg viewBox='0 0 400 225' preserveAspectRatio='xMidYMid slice'>
        <defs>
          {RAMP.map((tier) => (
            <pattern
              id={`${idBase}-${tier.cover}`}
              key={tier.cover}
              width={TILE}
              height={TILE}
              patternUnits='userSpaceOnUse'
            >
              <path d={tilePath(tier.cover)} />
            </pattern>
          ))}
          <mask id={`${idBase}-mask`}>
            <rect width='400' height='225' fill='black' />
            <text
              x='200'
              y='118'
              fill='white'
              textAnchor='middle'
              dominantBaseline='central'
              fontSize={motif.size}
              letterSpacing={motif.letterSpacing}
            >
              {motif.text}
            </text>
          </mask>
        </defs>
        <g mask={`url(#${idBase}-mask)`}>
          <g transform={`rotate(${motif.angle} 200 112.5)`}>
            {bands.map((band) => (
              <rect
                fill={`url(#${idBase}-${band.cover})`}
                height='700'
                key={band.cover}
                width={band.width}
                x={band.x}
                y='-240'
              />
            ))}
          </g>
        </g>
      </svg>
    </span>
  );
}
