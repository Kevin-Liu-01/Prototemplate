import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import MoneyField from './MoneyField';

/**
 * The hero: one line of display, the accent landing on 'everyone', and
 * the money weather owning the right — the ink field's currency rain
 * dissolving leftward on the dither threshold before it reaches the
 * copy.
 */
export default function PricingHero() {
  return (
    <section className='tc-sec pricing-hero'>
      <MoneyField
        className='pricing-hero-ink'
        canvasClassName='pricing-hero-ink-canvas'
      />
      <div className='pricing-hero-grid'>
        <div className='pricing-hero-copy'>
          <h1>
            Pricing for <span className='pricing-hero-everyone'>everyone</span>
          </h1>
          <p>
            Start free. Upgrade anytime. Full-stack localization across
            buildtime, runtime, and review.
          </p>
          <Link
            className='pricing-hero-link'
            href='/d/singularity-dossier/usage'
          >
            View usage rates
            <ArrowRight aria-hidden='true' />
          </Link>
        </div>
      </div>
    </section>
  );
}
