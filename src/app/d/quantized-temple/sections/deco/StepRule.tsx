/**
 * Deco layer. C1 home: section heads, the rule under the h2 (C1.1); also
 * seated under the dark band's h2 (C1.5) and the review head.
 *
 * The temple in profile at rule scale: three courses of 3px, each shorter
 * than the one below, left-aligned so the staircase climbs into the heading's
 * measure. Solid ornament ink; at this height a dither tier has no room to
 * read, so the rule stays flat and the crest beside it carries the texture.
 */
export default function StepRule({ className }: { className?: string }) {
  return (
    <svg
      className={className ? `qt-head-rule ${className}` : 'qt-head-rule'}
      viewBox='0 0 64 9'
      width={64}
      height={9}
      aria-hidden='true'
      focusable='false'
      shapeRendering='crispEdges'
    >
      <rect x={0} y={6} width={64} height={3} fill='currentColor' />
      <rect x={0} y={3} width={42} height={3} fill='currentColor' />
      <rect x={0} y={0} width={22} height={3} fill='currentColor' />
    </svg>
  );
}
