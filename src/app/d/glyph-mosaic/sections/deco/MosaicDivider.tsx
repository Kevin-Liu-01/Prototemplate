/**
 * GLYPH MOSAIC: the divider.
 *
 * C1 home: the `.tc-hatch` spacer band (C1.2). The base sheet's diagonal
 * hatch becomes a stacked chevron frieze drawn in hairline geometry: one
 * SVG pattern of a one-pixel zigzag, repeated, in the ornament color. The
 * band keeps its class, so the seam law around it is unchanged: it owns
 * its top and bottom rule once, and the row after it draws no top rule.
 */

export type MosaicDividerProps = {
  /** Unique per instance: SVG pattern ids are document-global. */
  id: string;
};

export default function MosaicDivider({ id }: MosaicDividerProps) {
  return (
    <div className='tc-hatch gm-chevron' aria-hidden='true'>
      <svg className='gm-chevron-svg' width='100%' height='100%' focusable='false'>
        <defs>
          <pattern id={id} patternUnits='userSpaceOnUse' width='20' height='12'>
            <path d='M0 9.5 L5 4.5 L10 9.5 L15 4.5 L20 9.5' fill='none' stroke='currentColor' strokeWidth='1' />
          </pattern>
        </defs>
        <rect width='100%' height='100%' fill={`url(#${id})`} />
      </svg>
    </div>
  );
}
