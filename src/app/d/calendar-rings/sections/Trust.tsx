/**
 * calendar-rings: the second ring, the customers.
 * Six wordmarks in six cells of one arc band, each the real SVG mark in
 * the page's ink, cap-height aligned by its own height.
 */
import type { CSSProperties } from 'react';

import { CUSTOMERS } from '../data';
import { ArcBand } from '../diagrams/ArcBand';
import { SectionHead } from './SectionHead';

export function Trust() {
  return (
    <section className='cr-sec cr-trust' aria-labelledby='cr-trust-h'>
      <div className='cr-col'>
        <SectionHead n={2} id='cr-trust-h' title="Trusted by the world's best companies" />
        <ArcBand
          sag={44}
          list
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
