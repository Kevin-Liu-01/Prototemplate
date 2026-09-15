import type { CSSProperties } from 'react';

import { CUSTOMERS, TRUST_LEAD } from '../data';
import { FRETS, verticalFretMask } from '../fret';
import Register from './deco/Register';

/** The hooked step turned upright, at the fine scale: the pilaster between two marks. */
const PILASTER = verticalFretMask(FRETS.hook);

/**
 * The first register: one lead sentence and six customer wordmarks, each a
 * real SVG mark used as an alpha mask filled with the page ink, so the six
 * read as one monochrome line of type in both themes. The marks are set in
 * fret cells: the row is a course bounded by two hairlines, and the cells
 * are divided not by rules but by pilasters of the hooked step at the fine
 * scale, run upright in the ornament color, so each mark stands between two
 * columns of cut stone. Each cell is a link to the customer's site; the
 * name stays as the accessible label. The register's riser is the rail at
 * k = 0.
 */
export default function Trust() {
  return (
    <Register k={0} id='customers' className='sf-trust'>
      <p className='sf-trust-lead'>{TRUST_LEAD}</p>
      <div className='sf-trust-row' style={{ '--pilaster': PILASTER } as CSSProperties}>
        {CUSTOMERS.map((customer) => (
          <a
            key={customer.id}
            className='sf-trust-cell'
            href={customer.href}
            rel='noreferrer'
            target='_blank'
            aria-label={customer.name}
          >
            <span
              className='sf-wm'
              style={
                {
                  '--wm': `url('/logos/${customer.id}.light.svg')`,
                  '--wm-ratio': customer.ratio,
                  '--wm-h': `${customer.height}px`,
                } as CSSProperties
              }
              aria-hidden='true'
            />
          </a>
        ))}
      </div>
    </Register>
  );
}
