import type { SVGProps } from 'react';

import { LOGO } from '@/lib/logo';

type GtMarkProps = SVGProps<SVGSVGElement>;

// The General Translation logo (LOGO in src/lib/logo.ts) in one ink. The
// plate sets the wide box the doubled-line monogram had (25x16 beside text);
// the round logo is centred in it at the box's height, so the plate's
// spacing holds. Fills with currentColor so it follows the theme.
export default function GtMark({ className, ...props }: GtMarkProps) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox={LOGO.viewBox}
      fill='currentColor'
      aria-hidden={props['aria-label'] ? undefined : 'true'}
      className={className}
      {...props}
    >
      <path fillRule={LOGO.fillRule} d={LOGO.d} />
    </svg>
  );
}
