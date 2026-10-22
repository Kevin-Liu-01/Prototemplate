import { useId, type CSSProperties } from 'react';

import { GT_MARK_PATH } from './GtMark';

/* The GT Atlas imprint: a book stood upright, its board, its spine and its
   page block, with the GT monogram cut through the board's top left
   corner like a katagami stencil, so whatever lies behind the mark shows
   through the letters. Six paper leaves lie under the board: when a link
   around the mark is hovered or pressed, the board bends open like a
   magazine cover and the leaves flick over one after another, then fall
   back and the cover closes (press.css, .gtp-mark-leaf). */
export default function PressMark({ size = 24, className }: { size?: number; className?: string }) {
  const id = useId().replace(/:/g, '');
  // the monogram in the board's top left corner, as the GT logo files set it
  const scale = 52 / 1213;
  return (
    <svg className={['gtp-mark', className].filter(Boolean).join(' ')} viewBox='0 0 112 140' width={Math.round(size * (112 / 140))} height={size} aria-hidden='true' fill='currentColor'>
      <defs>
        <mask id={`press-${id}`} maskUnits='userSpaceOnUse' x='0' y='0' width='112' height='140'>
          <rect x='0' y='0' width='112' height='140' fill='#fff' />
          <g transform={`translate(20 10) scale(${scale.toFixed(5)})`}>
            <path transform='translate(8 -214)' d={GT_MARK_PATH} fillRule='evenodd' fill='#000' />
          </g>
        </mask>
      </defs>
      <rect x='0' y='5' width='8' height='131' />
      {[0.5, 0.42, 0.36, 0.3, 0.25, 0.2].map((tone, i) => (
        <rect key={tone} className='gtp-mark-leaf' x='11' y={1 + i * 0.5} width={99 - i} height={125 - i} opacity={tone} style={{ '--leaf': i } as CSSProperties} />
      ))}
      <rect className='gtp-mark-board' x='11' y='0' width='101' height='127' mask={`url(#press-${id})`} />
      <rect x='11' y='130' width='98' height='10' />
    </svg>
  );
}
