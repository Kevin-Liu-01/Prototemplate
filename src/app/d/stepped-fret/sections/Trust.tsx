import type { CSSProperties } from 'react';

import { CUSTOMERS, TRUST_LEAD } from '../data';
import Register from './deco/Register';

/**
 * The first register: one lead sentence and six customer wordmarks, each a
 * real SVG mark used as an alpha mask filled with the page ink, so the six
 * read as one monochrome line of type in both themes. Each cell is a link
 * to the customer's site; the name stays as the accessible label. The row
 * owns its dividers; the register's riser is the rail at k = 0.
 */
export default function Trust() {
  return (
    <Register k={0} id='customers' className='sf-trust'>
      <p className='sf-trust-lead'>{TRUST_LEAD}</p>
      <div className='sf-trust-row'>
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
