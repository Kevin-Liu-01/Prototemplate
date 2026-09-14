import { ArrowUpRight } from 'lucide-react';

import { LINKS, PLANS, RATES, RATE_NOTES } from '../data';
import ColumnHead from './ColumnHead';

/**
 * The pricing file as three ruled ledger columns: workflow, rate, GT
 * libraries, seven rows from the published ledger and nothing else. Two
 * footnotes close the ledger, the two plans follow in one register, and
 * the compare link closes the column.
 */
export default function Ledger() {
  return (
    <section className='pr-col' id='pricing' aria-labelledby='pr-pricing-title'>
      <ColumnHead
        n={6}
        id='pr-pricing-title'
        title='Start at $0. Pay per token.'
        sub='The price of a translation is knowable before you run it.'
      />

      <div className='pr-ledger-scroll'>
        <div className='pr-ledger' role='table' aria-label='Published rates'>
          <div className='pr-ledger-row is-head' role='row'>
            <span role='columnheader'>Workflow</span>
            <span role='columnheader'>Rate</span>
            <span role='columnheader'>GT libraries</span>
          </div>
          {RATES.map((row, i) => (
            <div className={i === 0 ? 'pr-ledger-row is-lead' : 'pr-ledger-row'} role='row' key={row.workflow}>
              <span className='pr-ledger-name' role='cell'>
                {row.workflow}
              </span>
              <span className='pr-ledger-rate' role='cell'>
                {row.rate}
              </span>
              <span className='pr-ledger-gt' role='cell'>
                {row.gtLibs ?? ''}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className='pr-ledger-foot'>
        <p>{RATE_NOTES.limit}</p>
        <p>
          <code>npx gt translate --dry-run</code> {RATE_NOTES.dryRun}
        </p>
      </div>

      <div className='pr-reg pr-plans'>
        {PLANS.map((plan) => (
          <article className='pr-cell pr-plan' key={plan.name}>
            <h3 className='pr-h3'>{plan.name}</h3>
            <p className='pr-price'>
              {plan.price}
              <small>{plan.period}</small>
            </p>
            <p className='pr-plan-body'>{plan.body}</p>
            <ul className='pr-plan-list'>
              {plan.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <a className={plan.solid ? 'pr-btn is-solid' : 'pr-btn is-line'} href={plan.href}>
              {plan.cta}
            </a>
          </article>
        ))}
      </div>

      <p className='pr-compare'>
        <a href={LINKS.usage}>
          Compare Plans and Usage Pricing
          <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden='true' />
        </a>
      </p>
    </section>
  );
}
