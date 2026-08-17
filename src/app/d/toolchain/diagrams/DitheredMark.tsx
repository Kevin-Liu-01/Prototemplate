import type { ReactNode } from 'react';

import { polyline, type Pt } from './iso';

/**
 * A brand mark rendered as masked ink with the house Bayer shimmer — the
 * StackTower capstone's device, extracted. The mark keeps its alpha mask
 * (an <image> or any React content, seated into a surface by a plane
 * matrix INSIDE the mask so the dither cells stay square screen pixels);
 * what sweeps through it is a specular band QUANTIZED by the 4×4 ordered
 * Bayer matrix — five NESTED clip windows riding together, a solid core
 * out to a 1/16 fringe, each windowing a static rect filled with that
 * coverage tier's pattern. Ordered dithering nests by construction (every
 * tier's lit cells are a subset of the next tier's), so the overlap
 * composes exactly the ramp, and because the glint ink is opaque the
 * doubled cells never brighten.
 *
 * TWO bands ride the loop: the primary and a slimmer counter-sheen parked
 * at the sweep's start — each tier's clipPath is the union of both — so
 * the driver can run them half a lap apart and the metal reads alive.
 * The windows are PRE-ROTATED 60° geometry (a rotate()-based window
 * proved GSAP-origin-fragile), swept by pure horizontal translate: the
 * consumer tweens every `[stripeData[0]]` / `[stripeData[1]]` path from
 * shineTravel().from to .to, ease none, repeat -1, counter-sheen at
 * .time(lap / 2). Without JS or under reduced motion the markup poses:
 * primary band mid-glyph, counter-sheen parked clear.
 */

/** Ordered 4×4 Bayer matrix — glyph-field's, verbatim. */
export const BAYER4: readonly (readonly number[])[] = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

export type ShineTier = { cover: number; width: number };

/** The band's tiers, center-out: clip-window width (drawing units) and
    Bayer coverage. Each window CONTAINS the previous, so the union is
    the ordered-dither falloff — solid core, sparse fringe. */
export const SHINE_TIERS: readonly ShineTier[] = [
  { cover: 16, width: 7 },
  { cover: 10, width: 12 },
  { cover: 6, width: 18 },
  { cover: 3, width: 26 },
  { cover: 1, width: 36 },
];

export type ShineCover = { x: number; y: number; w: number; h: number };

const SHINE_NX = Math.cos(Math.PI / 3);
const SHINE_NY = Math.sin(Math.PI / 3);

/** The sweep geometry, derived from the masked cover: endpoints where the
    widest fringe has fully entered/exited the cover along the band normal,
    and the window half-length that still spans the cover diagonal at both
    travel ends. */
function shineGeometry(cover: ShineCover, tiers: readonly ShineTier[], pad: number) {
  const wMax = Math.max(...tiers.map((tier) => tier.width));
  const nMin = SHINE_NX * cover.x + SHINE_NY * cover.y;
  const nMax = SHINE_NX * (cover.x + cover.w) + SHINE_NY * (cover.y + cover.h);
  const from = (nMin - wMax / 2 - pad) / SHINE_NX;
  const to = (nMax + wMax / 2 + pad) / SHINE_NX;
  const halfLen = Math.ceil(
    SHINE_NY * Math.max(Math.abs(from), Math.abs(to)) +
      SHINE_NY * (cover.w / 2) +
      SHINE_NX * Math.max(Math.abs(cover.y), Math.abs(cover.y + cover.h)) +
      pad
  );
  return { from, to, halfLen };
}

/** The driver's tween endpoints — computed from the same geometry the
    markup uses, so a pass always fully enters, crosses, and exits. */
export function shineTravel(
  cover: ShineCover,
  tiers: readonly ShineTier[] = SHINE_TIERS,
  pad = 4
): { from: number; to: number } {
  const { from, to } = shineGeometry(cover, tiers, pad);
  return { from, to };
}

/** One pattern tile at coverage k/16: every cell whose Bayer threshold
    sits under k, as one path of squares. Shared with DitherText — the
    matrix and its tiling live here once. */
export function bayerTile(k: number, cell: number): string {
  const cells: string[] = [];
  BAYER4.forEach((row, y) => {
    row.forEach((threshold, x) => {
      if (threshold < k) {
        cells.push(`M${x * cell} ${y * cell}h${cell}v${cell}h${-cell}Z`);
      }
    });
  });
  return cells.join('');
}

/** One window: a pre-rotated rectangle path centered on the origin. */
function shineWindow(width: number, halfLen: number): string {
  const nx = SHINE_NX * (width / 2);
  const ny = SHINE_NY * (width / 2);
  const ax = -SHINE_NY * halfLen;
  const ay = SHINE_NX * halfLen;
  const pts: readonly Pt[] = [
    [nx + ax, ny + ay],
    [nx - ax, ny - ay],
    [-nx - ax, -ny - ay],
    [-nx + ax, -ny + ay],
  ];
  return polyline(pts, true);
}

type DitheredMarkProps = {
  /** unique prefix for the mask/pattern/clip ids — SVG ids are
      document-global, so uniqueness is caller-owned */
  id: string;
  /** the mark asset; ignored when maskContent is given */
  href?: string;
  /** arbitrary alpha-mask content (e.g. a white-filled icon component) */
  maskContent?: ReactNode;
  /** the seat matrix (build with iso's plane()); applied INSIDE the mask
      so the masked rects live in screen space and cells stay square */
  plane: string;
  /** half the image box — callers compute it glyph-aware (asset padding) */
  markHalf: number;
  /** screen-space rect the masked ink and shimmer rects span */
  cover: ShineCover;
  /** the mask's userSpace bounds */
  maskBox?: ShineCover;
  /** dither cell edge in drawing units */
  cell?: number;
  tiers?: readonly ShineTier[];
  /** class for the resting ink rect */
  inkClassName: string;
  /** class for the pattern glint paths (carries the glint fill) */
  glintClassName: string;
  /** class for the shimmer group */
  shineClassName: string;
  /** the two stripe hook attributes the driver queries */
  stripeData?: readonly [string, string];
};

export default function DitheredMark({
  id,
  href,
  maskContent,
  plane,
  markHalf,
  cover,
  maskBox = { x: -120, y: -80, w: 240, h: 160 },
  cell = 1.05,
  tiers = SHINE_TIERS,
  inkClassName,
  glintClassName,
  shineClassName,
  stripeData = ['data-ldx-stripe', 'data-ldx-stripe2'],
}: DitheredMarkProps) {
  const { from, halfLen } = shineGeometry(cover, tiers, 4);
  const tile = cell * 4;
  const [stripe, stripe2] = stripeData;
  return (
    <g>
      <defs>
        {/* the glyph's alpha mask — the face-plane transform lives INSIDE,
            so the masked rects sit in screen space and the Bayer cells
            stay square pixels, never foreshortened rhombi */}
        <mask
          id={`${id}-mark`}
          maskUnits='userSpaceOnUse'
          x={maskBox.x}
          y={maskBox.y}
          width={maskBox.w}
          height={maskBox.h}
          style={{ maskType: 'alpha' }}
        >
          <g transform={plane}>
            {maskContent ?? (
              <image
                href={href}
                x={-markHalf}
                y={-markHalf}
                width={markHalf * 2}
                height={markHalf * 2}
              />
            )}
          </g>
        </mask>
        {tiers.map(({ cover: k }) => (
          <pattern
            key={k}
            id={`${id}-b${k}`}
            patternUnits='userSpaceOnUse'
            width={tile}
            height={tile}
          >
            <path className={glintClassName} d={bayerTile(k, cell)} shapeRendering='crispEdges' />
          </pattern>
        ))}
        {/* per tier, the UNION of the primary window and the slimmer
            counter-sheen parked at the sweep's start — the no-JS and
            reduced-motion still */}
        {tiers.map(({ cover: k, width }) => (
          <clipPath key={k} id={`${id}-w${k}`} clipPathUnits='userSpaceOnUse'>
            <path {...{ [stripe as string]: '' }} d={shineWindow(width, halfLen)} />
            <path
              {...{ [stripe2 as string]: '' }}
              d={shineWindow(width * 0.62, halfLen)}
              transform={`translate(${from} 0)`}
            />
          </clipPath>
        ))}
      </defs>
      {/* the resting ink */}
      <rect
        className={inkClassName}
        x={cover.x}
        y={cover.y}
        width={cover.w}
        height={cover.h}
        mask={`url(#${id}-mark)`}
      />
      {/* the shimmer: static Bayer-tier fills, windowed by the moving
          bands — cells never move, the light does */}
      <g className={shineClassName} mask={`url(#${id}-mark)`}>
        {tiers.map(({ cover: k }) => (
          <rect
            key={k}
            x={cover.x}
            y={cover.y}
            width={cover.w}
            height={cover.h}
            fill={`url(#${id}-b${k})`}
            clipPath={`url(#${id}-w${k})`}
          />
        ))}
      </g>
    </g>
  );
}
