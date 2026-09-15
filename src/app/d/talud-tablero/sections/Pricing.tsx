import { ArrowUpRight } from 'lucide-react';

import {
  COMPARE_LABEL,
  FOOTNOTE_DRY_RUN,
  FOOTNOTE_DRY_RUN_CMD,
  FOOTNOTE_LIMIT,
  LINKS,
  PLANS,
  PRICING_HEAD,
  PRICING_SUB,
  RATES,
} from '../data';
import { Tablero, Talud, Terrace } from './deco/Terrace';

/**
 * The pricing file on the lower platform: three tableros of increasing
 * frame depth set as one course, sharing the terrace's top and foot lines.
 * The shallowest frame holds the published rate ledger, the middle one the
 * Starter plan, the deepest the Enterprise plan. Then the two footnotes
 * and the compare link. Nothing here moves.
 */
export default function Pricing() {
  return (
    <Terrace tier={1} className='tt-pricing' id='pricing'>
      <header className='tt-head is-open'>
        <h2 className='tt-h2'>{PRICING_HEAD}</h2>
        <p>{PRICING_SUB}</p>
      </header>

      <div className='tt-plinths'>
        <Tablero depth={1} className='tt-plinth is-rates'>
          <h3 className='tt-plinth-title'>Usage rates</h3>
          <table className='tt-rates'>
            <thead>
              <tr>
                <th scope='col'>Workflow</th>
                <th scope='col'>Rate</th>
                <th scope='col'>GT libraries</th>
              </tr>
            </thead>
            <tbody>
              {RATES.map((row) => (
                <tr key={row.workflow}>
                  <td>{row.workflow}</td>
                  <td>
                    <code>{row.rate}</code>
                  </td>
                  <td>{row.gtLibs ? <code>{row.gtLibs}</code> : <span className='tt-vh'>none</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Tablero>

        {PLANS.map((plan, i) => (
          <Tablero key={plan.name} depth={i === 0 ? 2 : 3} className={`tt-plinth is-plan is-${plan.name.toLowerCase()}`}>
            <h3 className='tt-plinth-title'>{plan.name}</h3>
            <p className='tt-plan-price'>
              <b>{plan.price}</b>
              <small>{plan.cadence}</small>
            </p>
            <p className='tt-plan-copy'>{plan.copy}</p>
            <ul className='tt-plan-items'>
              {plan.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <a className={plan.solid ? 'tt-btn tt-btn-solid' : 'tt-btn tt-btn-line'} href={plan.href}>
              {plan.cta}
            </a>
          </Tablero>
        ))}
      </div>

      <div className='tt-footnotes'>
        <p>{FOOTNOTE_LIMIT}</p>
        <p>
          <code>{FOOTNOTE_DRY_RUN_CMD}</code> {FOOTNOTE_DRY_RUN}
        </p>
        <a className='tt-compare' href={LINKS.pricing}>
          {COMPARE_LABEL}
          <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden='true' />
        </a>
      </div>

      <Talud relief='stone' />
    </Terrace>
  );
}
