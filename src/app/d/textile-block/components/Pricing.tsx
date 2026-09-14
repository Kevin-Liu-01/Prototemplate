import { DRY_RUN_COMMAND, DRY_RUN_NOTE, LINKS, PLANS, RATES, RATE_NOTES } from '../data';
import { Block, Course, Relief } from './Wall';

/**
 * textile-block: the pricing file as three cast plaques.
 *
 * Set flush in one course: the published rate ledger, the Starter plaque,
 * and the Enterprise plaque. Rates are the raised figures; nothing here
 * moves. The compare link closes the course in its own block.
 */
export default function Pricing() {
  return (
    <Course className='is-pricing' id='pricing' label='Pricing'>
      <Block className='tb-head' span={{ c: 8, r: 2, cMd: 8, rMd: 2, cSm: 6, rSm: 3 }}>
        <h2 className='tb-h2'>Start at $0. Pay per token.</h2>
        <p>The price of a translation is knowable before you run it.</p>
      </Block>
      <Relief className='tb-lg-only' motif='cross' span={{ c: 4, r: 2 }} />

      {/* ---- the rate ledger ---- */}
      <Block className='tb-rates' span={{ c: 6, r: 5, cMd: 8, rMd: 5, cSm: 6, rSm: 8 }}>
        <div className='tb-rates-head'>
          <span>Workflow</span>
          <span>Rate</span>
          <span>GT libraries</span>
        </div>
        <div className='tb-rates-body'>
          {RATES.map((row, i) => (
            <div className={i === 0 ? 'tb-rate is-lead' : 'tb-rate'} key={row.workflow}>
              <span className='tb-rate-name'>{row.workflow}</span>
              <span className='tb-rate-value'>{row.rate}</span>
              <span className='tb-rate-gt'>{row.gtLibs ?? ''}</span>
            </div>
          ))}
        </div>
        <div className='tb-rates-foot'>
          {RATE_NOTES.map((note) => (
            <p key={note}>{note}</p>
          ))}
          <p>
            <code>{DRY_RUN_COMMAND}</code> {DRY_RUN_NOTE}
          </p>
        </div>
      </Block>

      {/* ---- the two plan plaques ---- */}
      {PLANS.map((plan) => (
        <Block className='tb-plan' key={plan.id} span={{ c: 3, r: 5, cMd: 4, rMd: 5, cSm: 6, rSm: 6 }}>
          <h3>{plan.name}</h3>
          <div className='tb-plan-price'>
            {plan.price}
            <small>{plan.cadence}</small>
          </div>
          <p>{plan.copy}</p>
          <ul>
            {plan.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <a className={plan.solid ? 'tb-btn tb-btn-solid' : 'tb-btn tb-btn-line'} href={plan.href}>
            {plan.cta}
          </a>
        </Block>
      ))}

      <Block className='tb-compare' span={{ c: 12, r: 1, cMd: 8, cSm: 6 }}>
        <a href={LINKS.pricing} rel='noreferrer' target='_blank'>
          Compare Plans and Usage Pricing
        </a>
      </Block>
    </Course>
  );
}
