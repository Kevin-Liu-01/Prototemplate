import { useId } from 'react';

import { dmsPair, HOME } from '../coords';
import GtMark from './GtMark';

/* The press seal from Direction 01: the monogram inside a ring of minute
   ticks, with the press's name and coordinates set around it. Drawn in
   currentColor at one stroke weight. */
export default function Seal({
  size = 132,
  className,
}: {
  size?: number;
  className?: string;
}) {
  const id = useId().replace(/:/g, '');
  const ticks = Array.from({ length: 72 }, (_, i) => i);
  const text = `GT ATLAS · GENERAL TRANSLATION · SAN FRANCISCO · ${dmsPair(HOME)} · `;
  return (
    <svg
      className={className}
      viewBox='0 0 200 200'
      width={size}
      height={size}
      aria-hidden='true'
    >
      <defs>
        <path
          id={`seal-${id}`}
          d='M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0'
        />
      </defs>
      <circle
        cx='100'
        cy='100'
        r='96'
        fill='none'
        stroke='currentColor'
        strokeWidth='0.75'
      />
      <circle
        cx='100'
        cy='100'
        r='64'
        fill='none'
        stroke='currentColor'
        strokeWidth='0.75'
      />
      {ticks.map((i) => {
        const a = (i / ticks.length) * Math.PI * 2;
        const long = i % 6 === 0;
        const r0 = long ? 56 : 60;
        // rounded so the server's and the browser's float formatting agree
        const at = (r: number, f: (x: number) => number) =>
          Math.round((100 + f(a) * r) * 1000) / 1000;
        return (
          <line
            key={i}
            x1={at(r0, Math.cos)}
            y1={at(r0, Math.sin)}
            x2={at(64, Math.cos)}
            y2={at(64, Math.sin)}
            stroke='currentColor'
            strokeWidth='0.75'
          />
        );
      })}
      <text className='gtp-seal-text' fill='currentColor'>
        <textPath href={`#seal-${id}`} textLength='488' lengthAdjust='spacing'>
          {text}
        </textPath>
      </text>
      <line
        x1='100'
        y1='30'
        x2='100'
        y2='44'
        stroke='currentColor'
        strokeWidth='0.75'
      />
      <line
        x1='100'
        y1='156'
        x2='100'
        y2='170'
        stroke='currentColor'
        strokeWidth='0.75'
      />
      <line
        x1='30'
        y1='100'
        x2='44'
        y2='100'
        stroke='currentColor'
        strokeWidth='0.75'
      />
      <line
        x1='156'
        y1='100'
        x2='170'
        y2='100'
        stroke='currentColor'
        strokeWidth='0.75'
      />
      <g transform='translate(72 82)'>
        <GtMark size={56} />
      </g>
    </svg>
  );
}
