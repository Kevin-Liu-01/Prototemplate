'use client';

import { ArrowUpRight } from 'lucide-react';
import { useRef } from 'react';

import { PLANS, RATES, RATE_NOTES, USAGE_RATES_HREF } from '../data';
import { useRise } from '../reveal';
import Register from './deco/Register';
import StepCap from './deco/StepCap';

/**
 * The pricing file as three stepped plinths of increasing height on one
 * baseline: the published rate ledger as the low, wide base, Starter, then
 * Enterprise, the tallest. Each plinth owns its one hairline frame and is
 * capped by one, two or three setbacks of fine stepped diamonds, so the
 * three read as three ziggurats rising left to right; the ground between
 * the plinths is the seam. Nothing here moves on its own.
 */
export default function Pricing() {
  const root = useRef<HTMLDivElement>(null);
  useRise(root);

  return (
    <Register k={1} id='pricing' className='sf-pricing'>
      <div ref={root} className='sf-pricing-in'>
        <header className='sf-head'>
          <h2 className='sf-h2' data-rise>
            Start at $0. Pay per token.
          </h2>
          <p className='sf-lead' data-rise>
            The price of a translation is knowable before you run it.
          </p>
        </header>

        <div className='sf-plinths-3'>
          <div className='sf-pl is-rates' data-rise>
            <StepCap tiers={1} />
            <section className='sf-plinth' aria-labelledby='sf-rates-title'>
              <div className='sf-plinth-body'>
                <h3 className='sf-h3' id='sf-rates-title'>
                  Usage
                </h3>
                <div className='sf-rates' role='table' aria-label='Published rates'>
                  <div className='sf-rates-head' role='row'>
                    <span role='columnheader'>Workflow</span>
                    <span role='columnheader'>Rate</span>
                    <span role='columnheader'>GT libraries</span>
                  </div>
                  {RATES.map((row) => (
                    <div className='sf-rate' role='row' key={row.workflow}>
                      <span role='cell' className='sf-rate-name'>
                        {row.workflow}
                      </span>
                      <span role='cell' className='sf-rate-value'>
                        {row.rate}
                      </span>
                      <span role='cell' className='sf-rate-gt'>
                        {row.gtLibs ?? ''}
                      </span>
                    </div>
                  ))}
                </div>
                <ul className='sf-rate-notes'>
                  {RATE_NOTES.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                  <li>
                    <code>npx gt translate --dry-run</code> prints what would be translated and bills 0 tokens.
                  </li>
                </ul>
              </div>
            </section>
          </div>

          {PLANS.map((plan, i) => (
            <div className={`sf-pl is-plan is-${plan.id}`} key={plan.id} data-rise>
              <StepCap tiers={i === 0 ? 2 : 3} />
              <section className='sf-plinth' aria-labelledby={`sf-plan-${plan.id}`}>
                <div className='sf-plinth-body'>
                  <h3 className='sf-h3' id={`sf-plan-${plan.id}`}>
                    {plan.name}
                  </h3>
                  <p className='sf-price'>
                    {plan.price}
                    <small>{plan.period}</small>
                  </p>
                  <p className='sf-plinth-p'>{plan.blurb}</p>
                  <ul className='sf-plan-list'>
                    {plan.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <a className={plan.id === 'starter' ? 'sf-btn sf-btn-solid' : 'sf-btn sf-btn-line'} href={plan.href}>
                    {plan.cta}
                  </a>
                </div>
              </section>
            </div>
          ))}
        </div>

        <p className='sf-compare' data-rise>
          <a href={USAGE_RATES_HREF}>
            Compare Plans and Usage Pricing
            <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden />
          </a>
        </p>
      </div>
    </Register>
  );
}
