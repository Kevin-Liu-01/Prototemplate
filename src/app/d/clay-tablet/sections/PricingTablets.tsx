import {
  ENTERPRISE_ITEMS,
  LINKS,
  PLAN_CTAS,
  PRICING_HEAD,
  PRICING_SUB,
  RATE_NOTE_DRY_RUN,
  RATE_NOTE_DRY_RUN_CMD,
  RATE_NOTE_LIMIT,
  RATES,
  STARTER_ITEMS,
} from './content';
import Shelf, { Tablet } from './Shelf';

/**
 * Tablets VII, VIII, IX: the pricing file (A10). Three small tablets on one
 * shelf: the published rate ledger with its two footnotes, then the two
 * plans, rates impressed as figures. Nothing here moves on its own.
 */
export default function PricingTablets() {
  return (
    <Shelf
      id='pricing'
      className='ct-pricing'
      label={{
        numeral: 'VII · VIII · IX',
        name: 'The pricing file',
        note: 'The published rate ledger, then the two plans. Whole dollars print without cents. Nothing here moves on its own.',
      }}
      head={
        <header className='ct-shelf-head'>
          <h2>{PRICING_HEAD}</h2>
          <p>{PRICING_SUB}</p>
        </header>
      }
    >
      <div className='ct-shelf-row is-three'>
        <Tablet size='small' className='ct-rates'>
          <div className='ct-reg'>
            <h3>Rates</h3>
            <table className='ct-rate-table'>
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
                    <th scope='row'>{row.workflow}</th>
                    <td>{row.rate}</td>
                    <td>{row.gtLibs ? row.gtLibs : <span className='ct-vh'>none</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <ul className='ct-notes'>
              <li>{RATE_NOTE_LIMIT}</li>
              <li>
                <code>{RATE_NOTE_DRY_RUN_CMD}</code> {RATE_NOTE_DRY_RUN}
              </li>
            </ul>
          </div>
        </Tablet>

        <Tablet size='small' className='ct-plan'>
          <div className='ct-reg'>
            <h3>Starter</h3>
            <p className='ct-price'>
              <b>$0</b>
              <small>per month</small>
            </p>
            <p className='ct-plan-line'>Usage billed at the published rates. Minimum top-up $10.</p>
            <ul className='ct-plan-items'>
              {STARTER_ITEMS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <a className='ct-btn ct-btn-solid' href={PLAN_CTAS.starter}>
              Get Started
            </a>
          </div>
        </Tablet>

        <Tablet size='small' className='ct-plan'>
          <div className='ct-reg'>
            <h3>Enterprise</h3>
            <p className='ct-price'>
              <b>Custom</b>
              <small>annual</small>
            </p>
            <p className='ct-plan-line'>Custom workflows, custom roles, webhooks, and SSO.</p>
            <ul className='ct-plan-items'>
              {ENTERPRISE_ITEMS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <a className='ct-btn ct-btn-line' href={PLAN_CTAS.enterpriseContact}>
              Contact Us
            </a>
          </div>
        </Tablet>
      </div>
      <p className='ct-compare'>
        <a href={LINKS.pricing}>Compare Plans and Usage Pricing</a>
      </p>
    </Shelf>
  );
}
