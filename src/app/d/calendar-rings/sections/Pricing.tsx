/**
 * calendar-rings: the pricing file, ring three unrolled.
 * The seven published rates as seven arc segments in two bands, each cell
 * numbered with the same bar-and-dot numeral the disk knocks out of its
 * third ring; then the two plans as two segments of a shallower arc; then
 * the two footnotes and the compare link. Nothing here moves.
 */
import { PRICING_FEATURES } from '@/app/d/production/sections/pricing-features';

import { HREFS, RATE_BANDS, RATE_NOTES, RATES } from '../data';
import type { Rate } from '../data';
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

function RateCell({ row }: { row: Rate }) {
  return (
    <div className='cr-rate'>
      <h3>{row.workflow}</h3>
      <p className='cr-rate-val'>{row.rate}</p>
      {row.libraries ? (
        <p className='cr-rate-lib'>
          GT libraries <code>{row.libraries}</code>
        </p>
      ) : null}
    </div>
  );
}

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

export function Pricing() {
  return (
    <section className='cr-sec cr-pricing' aria-labelledby='cr-pricing-h'>
      <div className='cr-col'>
        <SectionHead
          count={RATES.length}
          ring='Ring three, unrolled'
          id='cr-pricing-h'
          title='The pricing file'
          lead='Start at $0. Pay per token. The price of a translation is knowable before you run it.'
        />

        {RATE_BANDS.map((band, i) => (
          <ArcBand
            key={i}
            sag={i === 0 ? 30 : 24}
            numerals
            start={1 + RATE_BANDS.slice(0, i).reduce((sum, b) => sum + b.length, 0)}
            subdivide={2}
            as='ol'
            label={i === 0 ? 'Usage rates' : 'Usage rates, continued'}
            className='cr-rates-arc'
            cells={band.map((row) => <RateCell key={row.workflow} row={row} />)}
          />
        ))}

        <ArcBand
          sag={16}
          className='cr-plans-arc'
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
