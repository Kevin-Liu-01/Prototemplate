import { ArrowUpRight } from 'lucide-react';

import BondWall from '../components/Bond';
import CourseHead from '../components/CourseHead';
import { Parapet } from '../components/Rosette';
import Sheen from '../components/Sheen';
import { PLANS, RATES, RATE_NOTES, URLS } from '../data';

/**
 * The pricing file as a gate in miniature. Two towers, each a stepped
 * parapet over a battered bond face, carry the two plans as gold plaques
 * set into the brick: Starter in the left tower, Enterprise in the right.
 * Between them the rate ledger is the opening, a lapis tablet with the
 * published rates in gold. The two footnotes sit under the ledger and the
 * compare link closes the course. No number here is outside the file.
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

        <div className='gb-price-gate'>
          {starter ? <PlanTower plan={starter} side='left' /> : null}

          <article className='gb-ledger-tablet' aria-label='Usage rates'>
            <Sheen ink='turq' />
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

          {enterprise ? <PlanTower plan={enterprise} side='right' /> : null}
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

type PlanTowerProps = { plan: (typeof PLANS)[number]; side: 'left' | 'right' };

/** One tower of the pricing gate: parapet, battered bond face, the gold plaque set into it. */
function PlanTower({ plan, side }: PlanTowerProps) {
  return (
    <div className={`gb-ptower is-${side}`}>
      <Parapet />
      <div className='gb-ptower-wall'>
        <div className='gb-ptower-bond' aria-hidden='true'>
          <BondWall />
        </div>
        <article className='gb-plaque' aria-label={`${plan.name} plan`}>
          <Sheen ink='cream' />
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
          <a className={plan.solid ? 'gb-btn is-solid is-gold' : 'gb-btn is-line is-gold'} href={plan.href}>
            {plan.cta}
          </a>
        </article>
      </div>
    </div>
  );
}
