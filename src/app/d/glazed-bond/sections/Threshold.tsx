import { CUSTOMERS, TRUST_LEAD } from '../data';

/**
 * The threshold: the course at the foot of the gate. One lead sentence,
 * then six customer marks as six stretchers between two seams. Each mark is
 * its SVG artwork used as a mask over currentColor, so the marks are the
 * page's ink in both themes, never colored, never dithered.
 */
export default function Threshold() {
  return (
    <section className='gb-course gb-threshold' aria-label='Customers'>
      <div className='gb-course-in'>
        <p className='gb-threshold-lead'>{TRUST_LEAD}</p>
        <ul className='gb-marks'>
          {CUSTOMERS.map((customer) => (
            <li className='gb-mark-cell' key={customer.name}>
              <span
                className={`gb-mark is-${customer.mark}`}
                role='img'
                aria-label={customer.name}
                style={{ aspectRatio: customer.aspect }}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
