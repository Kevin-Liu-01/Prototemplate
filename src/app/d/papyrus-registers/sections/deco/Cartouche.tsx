import type { ReactNode } from 'react';

/**
 * papyrus-registers · deco · the cartouche.
 * Ornament home: frames. The cartouche as geometry only: a stadium loop
 * with the tie bar under it, one hairline ring drawn once, the object
 * seated inside. The Locadex mark is the one thing the page frames this
 * way, as the name of the agent in the text.
 */
export type CartoucheProps = { children: ReactNode };

export default function Cartouche({ children }: CartoucheProps) {
  return (
    <span className='pr-cartouche'>
      <svg className='pr-cartouche-ring' viewBox='0 0 72 126' width={72} height={126} aria-hidden='true'>
        <path
          d='M36 2.5a33.5 33.5 0 0 1 33.5 33.5v44a33.5 33.5 0 0 1-67 0V36A33.5 33.5 0 0 1 36 2.5Z'
          fill='none'
          stroke='currentColor'
          strokeWidth={1}
          vectorEffect='non-scaling-stroke'
        />
        <path d='M14 123.5h44' stroke='currentColor' strokeWidth={1} vectorEffect='non-scaling-stroke' />
      </svg>
      <span className='pr-cartouche-seat'>{children}</span>
    </span>
  );
}
