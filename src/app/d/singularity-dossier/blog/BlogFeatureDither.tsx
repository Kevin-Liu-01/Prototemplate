const BAYER4: readonly (readonly number[])[] = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

/**
 * Server-rendered SVG cover: the motif text is an SVG mask over a
 * tiered Bayer-dither ramp, so the glyphs render as dither cells that
 * thin from solid coverage on one flank to sparse on the other.
 * (The article page's own copy of the landing component — the
 * blog-landing copy predates the word-vocabulary motifs.)
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

function hashSlug(slug: string): number {
  let h = 2166136261;
  for (let i = 0; i < slug.length; i += 1) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/* The vocabulary the covers can speak, most specific first. The word
   is looked up in the TITLE first, then the tags, so a post about
   Next.js i18n reads "Next.js" while the plain i18n essay keeps
   "i18n" — related words, never interchangeable ones. */
const MOTIF_TERMS: readonly [RegExp, string][] = [
  [/\bseo\b/i, 'SEO'],
  [/next\.?js|gt-next/i, 'Next.js'],
  [/\bi18n\b/i, 'i18n'],
  [/jsx|ternary|conditional/i, 'JSX'],
  [/chatbot|\bai\b/i, 'AI'],
  [/plural/i, 'plurals'],
  [/\breact\b/i, 'React'],
  [/locali[sz]|translat|internationali[sz]|locale/i, '語'],
];

function wordFor(title: string, tags: string[]): string {
  for (const hay of [title, tags.join(' ')]) {
    for (const [pattern, word] of MOTIF_TERMS) {
      if (pattern.test(hay)) return word;
    }
  }
  return '語';
}

/** SVG font-size that fills the 400×225 plate for this word. */
function sizeFor(word: string): number {
  if (/[　-鿿가-힯]/.test(word)) return 185;
  if (word.length <= 2) return 170;
  if (word.length === 3) return 150;
  if (word.length === 4) return 145;
  if (word.length <= 6) return 110;
  return 86;
}

export type MotifSource = { slug: string; title: string; tags: string[] };

/** A post's motif is its own: a word related to the article, derived
    from its title and tags, poured in the blue dither — the index card
    and the article header always show the same image. The slug leans
    the ramp so posts sharing a word stay distinct. */
export function motifFor(post: MotifSource): FeatureMotif {
  const seed = hashSlug(post.slug);
  const text = wordFor(post.title, post.tags);
  const sign = seed % 2 === 0 ? 1 : -1;
  const angle = sign * (12 + ((seed >> 5) % 12));
  return {
    text,
    size: sizeFor(text),
    angle,
    letterSpacing: text.length > 2 ? '-0.04em' : undefined,
  };
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
  scale = 1,
}: {
  motif: FeatureMotif;
  /** Unique per page — namespaces the SVG pattern/mask ids. */
  id: string;
  className?: string;
  /** Shrinks the word for short plates so slice never beheads it. */
  scale?: number;
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
              fontSize={Math.round(motif.size * scale)}
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
