import { useId, type ReactNode } from 'react';

/**
 * The brand's doubled line, componentized — one center path stroked twice:
 * a full-gauge ink stroke under a narrower surface-colored core, carving
 * the ink into two parallel hairline threads at a constant gap along any
 * curve. Because both strokes share one geometry the gap can never drift
 * on a bend, and non-scaling-stroke holds the gauge in screen pixels even
 * under a stretched viewBox.
 *
 * The pair is ONE ink by default, and that is the house law: a doubled
 * line is a single line drawn twice, so its two threads never disagree on
 * color — hosts publish the value as a token and pass it once.
 *
 * Two-tone is the exception, for a drawing that must ink one thread apart
 * from the other: when `inkB` is set, the sandwich renders one thread in `ink`
 * and the other in `inkB` via a half-plane clip — the full-gauge inkB
 * stroke paints unclipped, the ink copy clips to `splitD` (the SAME center
 * path closed off one side of the viewBox), and the core carves both. The
 * clip boundary is the center line itself, which lies inside the carved
 * zone, so the split seam is invisible and exact on any curve. Offset
 * clones and concentric restrokes both fail this (gap collapse on curves;
 * symmetric annuli) — the clip is the only construction that two-tones a
 * single path.
 *
 * The `children` slot renders between the threads and the core — the pulse
 * layer: an accent stroke at full sandwich gauge is carved by the same core
 * into two accent hairlines, never a filled band.
 *
 * Junctions stay free: render a later DoubledLine over an earlier one and
 * its core re-carves the joint into one clean pair — zero parallel-curve
 * math, the same trick the toolchain flow diagrams use.
 */
type DoubledLineProps = {
  /** the single center path — the only geometry */
  d: string;
  /** px per thread (screen gauge) */
  gauge?: number;
  /** px between the threads */
  gap?: number;
  /** thread ink — the whole sandwich when inkB is unset */
  ink?: string;
  /** second ink; when set the line is two-tone (requires splitD) */
  inkB?: string;
  /** REQUIRED: the surface color that carves — must match the ground */
  core: string;
  /** closed region selecting `ink`'s side of the line; required with inkB */
  splitD?: string;
  /** the pulse slot, rendered between the threads and the core */
  children?: ReactNode;
};

export default function DoubledLine({
  d,
  gauge = 1.5,
  gap = 3,
  ink = 'rgba(255, 255, 255, 0.88)',
  inkB,
  core,
  splitD,
  children,
}: DoubledLineProps) {
  const rawId = useId();
  const clipId = `dl-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const full = gauge * 2 + gap;
  const twoTone = Boolean(inkB && splitD);
  return (
    <g>
      <path
        d={d}
        fill='none'
        stroke={twoTone ? inkB : ink}
        strokeWidth={full}
        vectorEffect='non-scaling-stroke'
      />
      {twoTone ? (
        <>
          <clipPath id={clipId}>
            <path d={splitD} />
          </clipPath>
          <g clipPath={`url(#${clipId})`}>
            <path
              d={d}
              fill='none'
              stroke={ink}
              strokeWidth={full}
              vectorEffect='non-scaling-stroke'
            />
          </g>
        </>
      ) : null}
      {children}
      <path d={d} fill='none' stroke={core} strokeWidth={gap} vectorEffect='non-scaling-stroke' />
    </g>
  );
}
