import { COMPARE_GROUPS, LINKS, PLANS, RATES } from '../data';
import { Band, Register } from './Register';

/**
 * Register VI. The pricing file as the lower registers: the published rate
 * ledger as three incised columns with the figures in gold, the plans as
 * three incised columns, and the two notes. No other numbers.
 */
export function Rates() {
  return (
    <Register id='rates' numeral='VI' name='The rates'>
      <Band label='rates · the published ledger' className='is-ledger'>
        <h2 className='tr-h2' data-cut>
          Start at $0. Pay per token.
        </h2>
        <p className='tr-sub' data-cut>
          The price of a translation is knowable before you run it.
        </p>
        <div className='tr-ledger' data-cut>
          <div className='tr-ledger-head' aria-hidden='true'>
            <span>Workflow</span>
            <span>Rate</span>
            <span>GT libraries</span>
          </div>
          {RATES.map((row) => (
            <div className='tr-ledger-row' key={row.workflow}>
              <span className='tr-ledger-name'>{row.workflow}</span>
              <span className='tr-ledger-rate'>{row.rate}</span>
              <span className='tr-ledger-gt'>{row.gtLibs ?? ''}</span>
            </div>
          ))}
        </div>
      </Band>

      <Band label='plans · three columns' className='is-plans'>
        <div className='tr-plans'>
          {PLANS.map((plan) => (
            <div className='tr-plan' key={plan.name} data-cut>
              <h3>{plan.name}</h3>
              <p className='tr-plan-price'>
                <b>{plan.price}</b>
                <small>{plan.period}</small>
              </p>
              <p className='tr-plan-body'>{plan.body}</p>
              <ul>
                {plan.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <a className={plan.cta.solid ? 'tr-act is-solid' : 'tr-act is-line'} href={plan.cta.href}>
                {plan.cta.label}
              </a>
            </div>
          ))}
          <div className='tr-plan is-compare' data-cut>
            <h3>Compare</h3>
            <p className='tr-plan-body'>The compare grid lists what each plan carries, group by group.</p>
            <ul>
              {COMPARE_GROUPS.map((group) => (
                <li key={group}>{group}</li>
              ))}
            </ul>
            <a className='tr-act is-line' href={LINKS.pricing}>
              Compare Plans and Usage Pricing
            </a>
          </div>
        </div>
      </Band>

      <Band label='notes' className='is-notes'>
        <ul className='tr-notes'>
          <li data-cut>A Usage Limit is a hard cap. It blocks billing even with auto-reload on.</li>
          <li data-cut>
            <code>npx gt translate --dry-run</code> prints what would be translated and bills 0 tokens.
          </li>
        </ul>
      </Band>
    </Register>
  );
}
