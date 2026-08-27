import { BAYER_8 } from '@/lib/dither';

/**
 * The article's motif cover, ported from the landing app's
 * BlogFeatureDither: the post's own word, cut as an SVG mask over a tiered
 * Bayer ramp, so the glyphs render as dither cells that thin from solid
 * coverage on one flank to sparse on the other. Server-rendered SVG — no
 * canvas, no image, nothing to load.
 *
 * The ink is set in blog-article.css (`pattern path`), not here: the
 * repo bans raw hex in tsx, and the ramp has to re-skin in the dark.
 */

export type FeatureMotif = {
  /** The text the dither forms. */
  text: string;
  /** SVG font-size for the motif inside the 400x225 plate. */
  size: number;
  /** Ramp rotation, degrees. */
  angle: number;
  letterSpacing?: string;
};

const CJK = /[　-鿿가-힯]/;

function hashSlug(slug: string): number {
  let h = 2166136261;
  for (let i = 0; i < slug.length; i += 1) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/* The vocabulary the covers can speak, most specific first. The word is
   looked up in the TITLE first, then the tags, so a post about Next.js i18n
   reads "Next.js" while the plain i18n essay keeps "i18n" — related words,
   never interchangeable ones. */
const MOTIF_TERMS: readonly (readonly [RegExp, string])[] = [
  [/\bseo\b/i, 'SEO'],
  [/next\.?js|gt-next/i, 'Next.js'],
  [/\bi18n\b/i, 'i18n'],
  [/jsx|ternary|conditional/i, 'JSX'],
  [/chatbot|\bai\b/i, 'AI'],
  [/plural/i, 'plurals'],
  [/\breact\b/i, 'React'],
  [/locali[sz]|translat|internationali[sz]|locale/i, '語'],
];

/* A devlog title is a release identifier ("gt-react@11.1.2",
   "compiler@1.0.0 / gt-next@6.7.0") — its cover speaks the bare package
   name of the FIRST segment, scope stripped. */
const RELEASE_SEGMENT = /^(?:@[a-z0-9._-]+\/)?([a-z0-9._-]+)@\d/i;

function wordFor(title: string, tags: readonly string[]): string {
  const release = title.split(/\s+\/\s+/)[0]?.match(RELEASE_SEGMENT);
  if (release?.[1]) return release[1];
  for (const hay of [title, tags.join(' ')]) {
    for (const [pattern, word] of MOTIF_TERMS) {
      if (pattern.test(hay)) return word;
    }
  }
  return '語';
}

/** SVG font-size that fills the 400x225 plate for this word: bucketed by
    length, sized so the longest package names still fit the plate. */
function sizeFor(word: string): number {
  if (CJK.test(word)) return 170;
  const length = word.length;
  if (length <= 2) return 155;
  if (length === 3) return 138;
  if (length === 4) return 132;
  if (length <= 6) return 100;
  if (length <= 8) return 80;
  if (length <= 10) return 66;
  if (length <= 13) return 56;
  if (length <= 15) return 48;
  return 42;
}

export type MotifSource = {
  slug: string;
  title: string;
  tags: readonly string[];
};

/** A post's cover motif, from its title, tags, and slug. */
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

/* Coverage tiers of 64, solid-side first. The dither opens early and steps
   in small, even increments so the solid-to-dither handoff reads as one
   gradient, and the tail floors at 12/64 — a long word's last letters
   decay, but never disappear. */
const RAMP: readonly { cover: number; width: number }[] = [
  { cover: 64, width: 260 },
  { cover: 58, width: 38 },
  { cover: 52, width: 38 },
  { cover: 46, width: 38 },
  { cover: 40, width: 38 },
  { cover: 34, width: 38 },
  { cover: 28, width: 38 },
  { cover: 22, width: 38 },
  { cover: 16, width: 38 },
  { cover: 12, width: 38 },
];

const CELL = 1;
const TILE = CELL * 8;

function tilePath(cover: number): string {
  const cells: string[] = [];
  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      const bayerRow = BAYER_8[row];
      if (bayerRow && (bayerRow[col] ?? 64) < cover) {
        cells.push(`M${col * CELL} ${row * CELL}h${CELL}v${CELL}h${-CELL}z`);
      }
    }
  }
  return cells.join('');
}

function centerYFor(word: string, fontSize: number): number {
  if (CJK.test(word)) return 112.5 - fontSize * 0.04;
  if (/^gt[-x]/.test(word) && fontSize >= 75) return 112.5 - fontSize * 0.14;
  if (/[gjpqy]/.test(word)) return 112.5 - fontSize * 0.11;
  return 112.5 - fontSize * 0.03;
}

export default function BlogPostCover({
  post,
  id,
  className,
  scale = 1,
}: {
  post: MotifSource;
  /** Unique per page — namespaces the SVG pattern/mask ids. */
  id: string;
  className?: string;
  /** Shrinks the word for short plates so slice never beheads it. */
  scale?: number;
}) {
  const motif = motifFor(post);
  const idBase = `cpa-motif-${id}`;
  const fontSize = Math.round(motif.size * scale);
  const centerY = centerYFor(motif.text, fontSize);

  let edge = -200;
  const bands = RAMP.map((tier) => {
    const band = { cover: tier.cover, x: edge, width: tier.width };
    edge += tier.width;
    return band;
  });

  return (
    <span className={`cpa-dither${className ? ` ${className}` : ''}`} aria-hidden='true'>
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
              y={centerY}
              fill='white'
              textAnchor='middle'
              dominantBaseline='central'
              fontSize={fontSize}
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
