import BondWall from '../components/Bond';
import Sheen from '../components/Sheen';
import { CUSTOMERS, TRUST_LEAD } from '../data';

/**
 * The threshold: the trust course at the foot of the gate. One lead
 * sentence, then six customer marks as six glazed lapis tiles set into one
 * course of the cream bond, with a course of plain brick above and below
 * them so the tiles read as inlay. Each mark is its SVG artwork used as a
 * mask over the tile's cream, so the marks are monochrome in the tile's
 * own ink, never colored, never dithered; the only dither is the turquoise
 * glaze sheen at each tile's upper arris.
 */
export default function Threshold() {
  return (
    <section className='gb-course gb-threshold' aria-label='Customers'>
      <div className='gb-course-in'>
        <p className='gb-threshold-lead'>{TRUST_LEAD}</p>
        <div className='gb-tile-wall'>
          <div className='gb-tile-bond' aria-hidden='true'>
            <BondWall />
          </div>
          <ul className='gb-tiles'>
            {CUSTOMERS.map((customer) => (
              <li className='gb-tile' key={customer.name}>
                <Sheen ink='turq' />
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
      </div>
    </section>
  );
}
