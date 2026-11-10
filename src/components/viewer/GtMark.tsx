import { LOGO } from '@/lib/logo';

/**
 * The General Translation logo (LOGO in src/lib/logo.ts, the drawing the
 * deck's #gt-mark symbol and the brand masters are written from), inline
 * so no <symbol> has to exist on the page. The viewBox is the drawn box,
 * so `size` is the ink's own: 18 square in the toolbar brand and the sheet
 * frame's wordmark slot. The sidebar head's link draws GtLogoMotion's hover
 * instead, since a logo inside a link takes it. The design directions under
 * /d pass the wide box they set for the doubled-line monogram as `width`
 * and `height`; the round logo is centred in it at its height, so their
 * spacing holds. Fills currentColor, so the parent sets the ink in both
 * themes.
 */
export type GtMarkProps = { size?: number; width?: number; height?: number };

export function GtMark({ size = 18, width, height }: GtMarkProps) {
  return (
    <svg
      viewBox={LOGO.viewBox}
      width={width ?? size}
      height={height ?? size}
      fill='currentColor'
      aria-hidden='true'
      style={{ display: 'block', flex: 'none' }}
    >
      <path fillRule={LOGO.fillRule} d={LOGO.d} />
    </svg>
  );
}
