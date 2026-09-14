import type { CSSProperties, ReactNode } from 'react';

/**
 * Ornament home: the grid itself. A register is one horizontal stratum of
 * the page. Its content block steps right by one fret step per register
 * (`k`, 0 to 3) while its right edge stays on the rail, so the block narrows
 * by one step per register and the blocks stagger down the page like the
 * treads of the stair (k rises 0 to 3 and falls back to 0). The block's left
 * edge is the riser: a single hairline the register owns. At k = 0 the
 * block sits flush with the rail, whose own hairline is then the riser.
 * Under 720px the step collapses to zero and the risers go with it.
 */
export type RegisterProps = {
  k: 0 | 1 | 2 | 3;
  id?: string;
  className?: string;
  children: ReactNode;
};

export default function Register({ k, id, className, children }: RegisterProps) {
  const style = { '--k': k } as CSSProperties;
  return (
    <section id={id} className={['sf-reg', className].filter(Boolean).join(' ')} data-k={k} style={style}>
      <div className='sf-reg-in'>{children}</div>
    </section>
  );
}
