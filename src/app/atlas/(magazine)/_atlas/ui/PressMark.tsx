import { useId } from 'react';

import { GT_MARK_PATH } from './GtMark';

/* The GT Atlas imprint: a book stood upright, its board, spine and page
   block drawn in lines of one weight, the spine running from the cap height
   to the baseline as the board's top and the page block's foot do. Inside
   the board is its cover, a solid panel with a small GT monogram cut
   through its top left corner, so whatever lies behind the mark shows
   through the letters. Under the cover lie its plain inside, folded flat,
   and a first page of three lines, unseen until the cover opens
   (HomeMark.tsx). */
export default function PressMark({
  size = 24,
  className,
}: {
  size?: number;
  className?: string;
}) {
  const id = useId().replace(/:/g, '');
  // the monogram a third of the board's width, as far in from the cover's corner as the cover is from the board
  const scale = 34 / 1213;
  return (
    <svg
      className={['gtp-mark', className].filter(Boolean).join(' ')}
      viewBox='0 0 112 140'
      width={Math.round(size * (112 / 140))}
      height={size}
      aria-hidden='true'
      fill='currentColor'
    >
      <defs>
        <mask
          id={`press-${id}`}
          maskUnits='userSpaceOnUse'
          x='0'
          y='0'
          width='112'
          height='140'
        >
          <rect x='0' y='0' width='112' height='140' fill='#fff' />
          <g transform={`translate(31 20) scale(${scale.toFixed(5)})`}>
            <path
              transform='translate(8 -214)'
              d={GT_MARK_PATH}
              fillRule='evenodd'
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
      <path
        className='gtp-mark-leaf'
        d='M33 34 H90 M33 50 H90 M33 66 H72'
        fill='none'
        stroke='currentColor'
        strokeWidth='6'
        opacity='0'
      />
      <rect
        className='gtp-mark-cover'
        x='25'
        y='14'
        width='73'
        height='99'
        mask={`url(#press-${id})`}
      />
      {/* the cover's plain inside, folded flat to nothing until the cover opens (HomeMark.tsx) */}
      <rect
        className='gtp-mark-inside'
        x='25'
        y='14'
        width='73'
        height='99'
        transform='scale(0 1)'
      />
    </svg>
  );
}
