import { LOGO } from '@/lib/logo';

/** The logo's drawn box as numbers: x, y, width and height (LOGO.viewBox, a square). */
export const LOGO_BOX = LOGO.viewBox.split(' ').map(Number) as [number, number, number, number];

/* The General Translation logo (LOGO in src/lib/logo.ts) in currentColor,
   square, `size` pixels on a side. */
export default function GtMark({
  size = 20,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      aria-hidden='true'
      className={className}
      viewBox={LOGO.viewBox}
      width={size}
      height={size}
      fill='currentColor'
    >
      <path fillRule={LOGO.fillRule} d={LOGO.d} />
    </svg>
  );
}
