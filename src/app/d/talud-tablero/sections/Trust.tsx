import { CUSTOMERS, TRUST_LEAD } from '../data';
import { Tablero, Talud, Terrace } from './deco/Terrace';

/**
 * The second tier: the trust course. One lead sentence over six customer
 * wordmarks, each in its own cell, cap-height aligned and held to the
 * page's ink. The marks are the real SVGs from /public/logos, drawn as
 * backgrounds so the name stays as text for readers and find-in-page.
 */
export default function Trust() {
  return (
    <Terrace tier={5} className='tt-trust' id='trust'>
      <Tablero depth={1}>
        <p className='tt-trust-lead'>{TRUST_LEAD}</p>
        <ul className='tt-trust-row'>
          {CUSTOMERS.map((customer) => (
            <li key={customer.slug} className='tt-trust-cell'>
              <b className={`tt-wm is-${customer.slug}`}>{customer.name}</b>
            </li>
          ))}
        </ul>
      </Tablero>
      <Talud relief='stone' />
    </Terrace>
  );
}
