/**
 * calendar-rings: the sixth ring, the pricing file.
 * Three arc segments of the outermost ring: the Starter plan, the
 * published rate ledger, the Enterprise plan. The two footnotes and the
 * compare link sit under the band. Nothing here moves.
 */
import { PRICING_FEATURES } from '@/app/d/production/sections/pricing-features';

import { HREFS, RATE_NOTES, RATES } from '../data';
import { ArcBand } from '../diagrams/ArcBand';
import { SectionHead } from './SectionHead';

/** Starter carries the core products it includes; Enterprise the rows only it has. */
const STARTER_FEATURES = PRICING_FEATURES.filter((group) => group.id === 'core')
  .flatMap((group) => group.features)
  .filter((feature) => feature.starter.kind === 'yes')
  .map((feature) => feature.name);

const ENTERPRISE_FEATURES = PRICING_FEATURES.flatMap((group) => group.features)
  .filter((feature) => feature.starter.kind === 'no' && feature.enterprise.kind === 'yes')
  .map((feature) => feature.name);

type PlanProps = {
  name: string;
  price: string;
  period: string;
  note: string;
  features: readonly string[];
  cta: { label: string; href: string; solid: boolean };
};

function Plan({ name, price, period, note, features, cta }: PlanProps) {
  return (
    <article className='cr-plan'>
      <h3>{name}</h3>
      <p className='cr-plan-price'>
        <span className='cr-plan-amount'>{price}</span>
        <span className='cr-plan-period'>{period}</span>
      </p>
      <p className='cr-plan-note'>{note}</p>
      <ul className='cr-plan-list'>
        {features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
      <a className={cta.solid ? 'cr-btn is-solid' : 'cr-btn is-line'} href={cta.href}>
        {cta.label}
      </a>
    </article>
  );
}

function Ledger() {
  return (
    <div className='cr-ledger-wrap'>
      <table className='cr-ledger'>
        <caption>Usage rates</caption>
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
              <td>{row.libraries ? row.libraries : <span className='cr-ledger-empty' aria-hidden='true' />}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Pricing() {
  return (
    <section className='cr-sec cr-pricing' aria-labelledby='cr-pricing-h'>
      <div className='cr-col'>
        <SectionHead
          n={6}
          id='cr-pricing-h'
          title='Start at $0. Pay per token.'
          lead='The price of a translation is knowable before you run it.'
        />
        <ArcBand
          sag={18}
          weights={[1, 1.8, 1]}
          className='cr-pricing-arc'
          cells={[
            <Plan
              key='starter'
              name='Starter'
              price='$0'
              period='per month'
              note='Minimum top-up $10.'
              features={STARTER_FEATURES}
              cta={{ label: 'Get Started', href: HREFS.starterPlan, solid: true }}
            />,
            <Ledger key='rates' />,
            <Plan
              key='enterprise'
              name='Enterprise'
              price='Custom'
              period='annual'
              note='Forward-deployed engineers, custom workflows for any format or framework, shared context across projects.'
              features={ENTERPRISE_FEATURES}
              cta={{ label: 'Contact Us', href: HREFS.enterprisePlan, solid: false }}
            />,
          ]}
        />
        <div className='cr-pricing-foot'>
          <ul className='cr-notes'>
            {RATE_NOTES.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
          <a className='cr-btn is-line' href={HREFS.pricing}>
            Compare Plans and Usage Pricing
          </a>
        </div>
      </div>
    </section>
  );
}
