import type { CSSProperties } from 'react';

import type { Customer } from '../data';

/**
 * textile-block: a customer wordmark cast into a block.
 *
 * The SVG in public/logos is used as a mask over the wall's ink, so every
 * mark prints monochrome in the page ink in both themes, never colored,
 * never dithered. The link's aria-label carries the accessible name; the
 * mark itself is a painted span.
 */
export default function Wordmark({ customer }: { customer: Customer }) {
  const style = {
    '--wm': `url('/logos/${customer.id}.light.svg')`,
    '--wm-ratio': customer.ratio,
  } as CSSProperties;
  return (
    <a aria-label={customer.name} className='tb-wm' href={customer.href} rel='noreferrer' target='_blank'>
      <span aria-hidden='true' className='tb-wm-print' style={style} />
    </a>
  );
}
