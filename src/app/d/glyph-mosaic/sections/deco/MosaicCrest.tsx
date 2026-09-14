import { BAYER_8 } from '@/lib/dither';

import { bayerThreshold, pickGlyph } from './scripts';

/**
 * GLYPH MOSAIC: the crests.
 *
 * C1 homes: the section heads (C1.1, variants `fan` and `chevron`, seated in
 * the head's icon slot) and the hero crown (C1.4, variant `rise`).
 *
 * A crest is a small mosaic laid in inline SVG: tesserae are `<text>` nodes
 * on a polar or diagonal grid, each glyph drawn from the seven script pools.
 * Rays alternate between the ornament color and ink, and each ray's density
 * is decided against the Bayer screen exactly as the canvas decides it, so
 * the crests and the plate are one material at two scales. Everything is
 * deterministic in integer coordinates, so the server and the client lay the
 * same crest. Coordinates round to a tenth of a pixel.
 */

export type CrestVariant = 'fan' | 'rise' | 'chevron';

export type MosaicCrestProps = {
  variant?: CrestVariant;
  seed?: number;
  className?: string;
};

type Tone = 'ink' | 'ornament';
type Piece = { x: number; y: number; g: string; tone: Tone };

const CELL = 12;
const GLYPH = 10;

const round = (n: number) => Math.round(n * 10) / 10;

/** Rays over an arc from `a0` to `a1` around (cx, cy), radii from `r0` to `r1`. */
function arc(
  seed: number,
  cx: number,
  cy: number,
  r0: number,
  r1: number,
  a0: number,
  a1: number,
  rays: number
): Piece[] {
  const out: Piece[] = [];
  const span = a1 - a0;
  let ring = 0;
  for (let r = r0; r <= r1; r += CELL, ring++) {
    const n = Math.max(4, Math.round((span * r) / CELL));
    const far = (r - r0) / Math.max(1, r1 - r0);
    for (let i = 0; i < n; i++) {
      const a = a0 + (span * (i + 0.5)) / n;
      const wedge = Math.floor(((a - a0) / span) * rays) % rays;
      const on = wedge % 2 === 0;
      const f = on ? 0.96 - 0.5 * far : 0.34 - 0.26 * far;
      if (f <= bayerThreshold(BAYER_8, i, ring)) continue;
      out.push({
        x: round(cx + Math.cos(a) * r),
        y: round(cy + Math.sin(a) * r),
        g: pickGlyph(i, ring, seed).glyph,
        tone: on ? 'ornament' : 'ink',
      });
    }
  }
  return out;
}

/** Three nested chevrons pointing right; the middle course in the ornament color. */
function chevrons(seed: number, w: number, h: number): Piece[] {
  const out: Piece[] = [];
  const cy = h / 2;
  for (let k = 0; k < 3; k++) {
    const apex = w - 10 - k * CELL * 2.4;
    const tone: Tone = k === 1 ? 'ornament' : 'ink';
    const reach = Math.min(cy - 6, apex - 6);
    let j = 0;
    for (let t = 0; t <= reach; t += CELL, j++) {
      const x = round(apex - t);
      out.push({ x, y: round(cy - t), g: pickGlyph(j, k, seed).glyph, tone });
      if (t > 0) out.push({ x, y: round(cy + t), g: pickGlyph(j, k + 10, seed).glyph, tone });
    }
  }
  return out;
}

export default function MosaicCrest({ variant = 'fan', seed = 1, className }: MosaicCrestProps) {
  const w = variant === 'rise' ? 260 : 240;
  const h = variant === 'rise' ? 84 : 220;

  let pieces: Piece[];
  if (variant === 'fan') {
    /* half sunburst centered on the right edge, rays fanning left */
    pieces = arc(seed, w, h / 2, 20, h / 2 - 8, Math.PI / 2, (3 * Math.PI) / 2, 12);
  } else if (variant === 'rise') {
    /* a rising sun over the crown's baseline */
    pieces = arc(seed, w / 2, h, 14, h - 8, Math.PI, 2 * Math.PI, 14);
  } else {
    pieces = chevrons(seed, w, h);
  }

  return (
    <svg
      className={className}
      viewBox={`0 0 ${w} ${h}`}
      width={w}
      height={h}
      aria-hidden='true'
      focusable='false'
    >
      {variant === 'rise' ? <line className='gm-crest-base' x1='0' y1={h - 0.5} x2={w} y2={h - 0.5} /> : null}
      {pieces.map((p, i) => (
        <text
          key={i}
          className={p.tone === 'ornament' ? 'gm-tess is-ornament' : 'gm-tess'}
          x={p.x}
          y={p.y}
          fontSize={GLYPH}
          textAnchor='middle'
          dominantBaseline='central'
        >
          {p.g}
        </text>
      ))}
    </svg>
  );
}
