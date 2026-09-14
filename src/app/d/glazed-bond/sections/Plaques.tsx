import { ArrowUpRight } from 'lucide-react';

import CourseHead from '../components/CourseHead';
import { PLANS, RATES, RATE_NOTES, URLS } from '../data';

/**
 * The pricing file as three glazed plaques set in the towers: the Starter
 * plaque in the left tower, the rate ledger in the center, the Enterprise
 * plaque in the right tower. Lapis glaze, rates in gold, labels in cream.
 * The two footnotes sit under the ledger and the compare link closes the
 * course. No number here is outside the published file.
 */
export default function Plaques() {
  const starter = PLANS[0];
  const enterprise = PLANS[1];

  return (
    <section className='gb-course' id='pricing'>
      <div className='gb-course-in'>
        <CourseHead
          n={5}
          title='Start at $0. Pay per token.'
          sub='The price of a translation is knowable before you run it.'
        />

        <div className='gb-plaques'>
          {starter ? <PlanPlaque plan={starter} /> : null}

          <article className='gb-plaque is-ledger' aria-label='Usage rates'>
            <header className='gb-plaque-head'>
              <h3>Usage rates</h3>
            </header>
            <div className='gb-ledger' role='table' aria-label='Rates'>
              <div className='gb-ledger-row is-head' role='row'>
                <span role='columnheader'>Workflow</span>
                <span role='columnheader'>Rate</span>
                <span role='columnheader'>GT libraries</span>
              </div>
              {RATES.map((row) => (
                <div className='gb-ledger-row' role='row' key={row.workflow}>
                  <span className='gb-ledger-name' role='cell'>
                    {row.workflow}
                  </span>
                  <span className='gb-ledger-rate' role='cell'>
                    {row.rate}
                  </span>
                  <span className='gb-ledger-gt' role='cell'>
                    {row.gtLibs ?? ''}
                  </span>
                </div>
              ))}
            </div>
            <footer className='gb-ledger-notes'>
              <p>{RATE_NOTES.cap}</p>
              <p>
                <code>{RATE_NOTES.dryRunCommand}</code> {RATE_NOTES.dryRun}
              </p>
            </footer>
          </article>

          {enterprise ? <PlanPlaque plan={enterprise} /> : null}
        </div>

        <div className='gb-compare'>
          <a href={URLS.pricing}>
            Compare Plans and Usage Pricing
            <ArrowUpRight size={14} strokeWidth={1.5} aria-hidden='true' />
          </a>
        </div>
      </div>
    </section>
  );
}

function PlanPlaque({ plan }: { plan: (typeof PLANS)[number] }) {
  return (
    <article className='gb-plaque is-plan' aria-label={`${plan.name} plan`}>
      <header className='gb-plaque-head'>
        <h3>{plan.name}</h3>
      </header>
      <div className='gb-plan-price'>
        <strong>{plan.price}</strong>
        <small>{plan.period}</small>
      </div>
      <p className='gb-plan-body'>{plan.body}</p>
      <ul className='gb-plan-list'>
        {plan.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <a className={plan.solid ? 'gb-btn is-solid is-glazed' : 'gb-btn is-line is-glazed'} href={plan.href}>
        {plan.cta}
      </a>
    </article>
  );
}
