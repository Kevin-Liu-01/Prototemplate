/**
 * calendar-rings: the customers.
 * Six wordmarks in six cells of one arc band, each the real SVG mark in
 * the page's ink, cap-height aligned by its own height. The band's arcs
 * carry one notch tick at each cell's midpoint.
 */
import type { CSSProperties } from 'react';

import { CUSTOMERS } from '../data';
import { ArcBand } from '../diagrams/ArcBand';
import { SectionHead } from './SectionHead';

export function Trust() {
  return (
    <section className='cr-sec cr-trust' aria-labelledby='cr-trust-h'>
      <div className='cr-col'>
        <SectionHead
          count={CUSTOMERS.length}
          id='cr-trust-h'
          title='The customers'
          lead='Cursor, Ramp and Profound ship in over thirty languages.'
        />
        <ArcBand
          sag={44}
          as='ul'
          subdivide={2}
          label='Customers'
          className='cr-trust-arc'
          cells={CUSTOMERS.map((customer) => (
            <a key={customer.id} className='cr-wm-link' href={customer.href} rel='noreferrer' target='_blank'>
              <span
                className={`cr-wm is-${customer.id}`}
                style={{ height: customer.height, aspectRatio: String(customer.aspect) } as CSSProperties}
              >
                {customer.name}
              </span>
            </a>
          ))}
        />
      </div>
    </section>
  );
}
