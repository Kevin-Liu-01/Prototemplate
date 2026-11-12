import { useId } from 'react';

import type { SVGProps } from 'react';

import { LOGO } from '@/lib/logo';

// Atlas's imprint, as gt-cloud's packages/ui icons/AtlasMark.tsx draws it in the header: a book stood
// upright, its spine, board and foot in lines of one weight, and a solid cover with the General
// Translation logo (LOGO in src/lib/logo.ts) cut through its top left corner, 28 units square, as the
// Atlas pages' PressMark cuts it.
export default function AtlasMark(props: SVGProps<SVGSVGElement>) {
  const mask = `atlas-mark-${useId().replace(/:/g, '')}`;
  const [bx, by, bw] = LOGO.viewBox.split(' ').map(Number);
  return (
    <svg viewBox='0 0 112 140' fill='currentColor' aria-hidden {...props}>
      <defs>
        <mask
          id={mask}
          maskUnits='userSpaceOnUse'
          x='0'
          y='0'
          width='112'
          height='140'
        >
          <rect x='0' y='0' width='112' height='140' fill='#fff' />
          <g transform={`translate(31 20) scale(${(28 / bw).toFixed(5)})`}>
            <path
              transform={`translate(${-bx} ${-by})`}
              d={LOGO.d}
              fillRule={LOGO.fillRule}
              fill='#000'
            />
          </g>
        </mask>
      </defs>
      <rect x='0' y='0' width='8' height='140' />
      <rect
        x='15'
        y='4'
        width='93'
        height='119'
        fill='none'
        stroke='currentColor'
        strokeWidth='8'
      />
      <rect x='11' y='132' width='101' height='8' />
      <rect x='25' y='14' width='73' height='99' mask={`url(#${mask})`} />
    </svg>
  );
}
