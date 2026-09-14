/**
 * C1.5 · the dark band. A stepped-setback frieze along the top edge of the
 * band column: one motif (a stepped pyramid with a mast) in a repeating SVG
 * pattern, stroked 1px in currentColor, which the sheet sets to the
 * ornament's dark lift. Crisp edges so the steps stay whole device pixels.
 * The pattern id carries the slug so two directions never collide in one
 * document. Decorative: hidden from the accessibility tree.
 */
export default function BandFrieze() {
  return (
    <svg className='ss-frieze' aria-hidden='true' focusable='false'>
      <defs>
        <pattern id='spire-setbacks-frieze' width='48' height='22' patternUnits='userSpaceOnUse'>
          <path
            d='M0 21.5H8.5V13.5H16.5V5.5H32.5V13.5H40.5V21.5H48'
            fill='none'
            stroke='currentColor'
            strokeWidth='1'
            shapeRendering='crispEdges'
          />
          <path d='M24.5 5.5V1' fill='none' stroke='currentColor' strokeWidth='1' shapeRendering='crispEdges' />
        </pattern>
      </defs>
      <rect width='100%' height='100%' fill='url(#spire-setbacks-frieze)' />
    </svg>
  );
}
