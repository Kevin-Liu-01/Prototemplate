import type { ReactNode } from 'react';

/**
 * A tapered plinth, the obelisk base: a battered face whose two sides and
 * top are one SVG path at hairline weight, standing on two stepped courses.
 * Home: frames (the pricing court). The face path draws no bottom edge;
 * the first step's top border is that seam, the second step's top border
 * is the next, and the court's floor rule closes the base. Every line has
 * one owner.
 */
type PlinthProps = { children: ReactNode; className?: string; reveal?: boolean };

export default function Plinth({ children, className, reveal = false }: PlinthProps) {
  return (
    <div className={className ? `pg-plinth ${className}` : 'pg-plinth'} data-reveal={reveal ? '' : undefined}>
      <div className='pg-plinth-face'>
        <svg className='pg-plinth-frame' viewBox='0 0 100 100' preserveAspectRatio='none' aria-hidden='true'>
          <path d='M0 100L5 0H95L100 100' fill='none' stroke='currentColor' vectorEffect='non-scaling-stroke' />
        </svg>
        <div className='pg-plinth-body'>{children}</div>
      </div>
      <div className='pg-plinth-step is-1' />
      <div className='pg-plinth-step is-2' />
    </div>
  );
}
