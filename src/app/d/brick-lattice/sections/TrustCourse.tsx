import { CUSTOMERS } from '../data';

/**
 * brick-lattice · the trust course.
 *
 * Home: the last course of the hero, under the claim panel. Six customer
 * wordmarks as six glazed stretchers in one course, the lead sentence as
 * the header brick before them. Each mark is the real SVG from
 * public/logos, used as an alpha mask over the page ink, so the six read
 * as one line of type in one color, never tinted, never dithered (charter
 * A5). The mortar between them is the lattice showing through.
 */
export default function TrustCourse() {
  return (
    <div className='bl-trust' role='group' aria-label='Customers'>
      <p className='bl-trust-lead bl-panel'>Trusted by the world&rsquo;s best companies</p>
      <ul className='bl-trust-row'>
        {CUSTOMERS.map((c) => (
          <li className='bl-trust-cell bl-panel' key={c.mark}>
            <a href={c.href} className='bl-wm-link'>
              <b
                className={`bl-wm is-${c.mark}`}
                style={{ aspectRatio: `${c.viewBox[0]} / ${c.viewBox[1]}` }}
              >
                {c.name}
              </b>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
