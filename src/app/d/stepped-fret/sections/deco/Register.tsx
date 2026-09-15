import { useId } from 'react';
import type { CSSProperties, ReactNode } from 'react';

import { bayerTile } from '../../fret';

/**
 * Ornament home: the grid itself. A register is one horizontal stratum of
 * the page. Its content block steps right by one fret step per register
 * (`k`, 0 to 3) while its right edge stays on the rail, so the block narrows
 * by one step per register and the blocks stagger down the page like the
 * treads of the stair (k rises 0 to 3 and falls back to 0).
 *
 * The step is visible as material, not only as an offset: the gutter the
 * block leaves open is filled with a static Bayer tier in the page ink, one
 * tier denser per step (2, 3 and 4 of 16), so the left margin reads as a
 * stair of cut stone descending the page, light enough to stand beside copy. The block's left edge is the
 * riser: a single hairline the register owns, between the stone and the
 * copy. At k = 0 the block sits flush with the rail, whose own hairline is
 * then the riser. Under 720px the step collapses to zero and the stone and
 * the risers go with it.
 */
export type RegisterProps = {
  k: 0 | 1 | 2 | 3;
  id?: string;
  className?: string;
  children: ReactNode;
};

export default function Register({ k, id, className, children }: RegisterProps) {
  const patternId = `sf-gutter-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const style = { '--k': k } as CSSProperties;
  return (
    <section id={id} className={['sf-reg', className].filter(Boolean).join(' ')} data-k={k} style={style}>
      {k > 0 ? (
        <svg className='sf-reg-gutter' aria-hidden='true' focusable='false'>
          <defs>
            <pattern id={patternId} patternUnits='userSpaceOnUse' width={12} height={12}>
              <path d={bayerTile(k + 1, 3)} fill='currentColor' />
            </pattern>
          </defs>
          <rect width='100%' height='100%' fill={`url(#${patternId})`} />
        </svg>
      ) : null}
      <div className='sf-reg-in'>{children}</div>
    </section>
  );
}
