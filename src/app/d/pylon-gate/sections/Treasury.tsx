'use client';

import { useRef } from 'react';

import CourtHead from './CourtHead';
import Plinth from './deco/Plinth';
import { HREF, RATES } from './data';
import { useCourtReveal } from './reveal';

/**
 * The treasury: pricing as three tapered plinths on the axis. The Starter
 * plan on the left face, the published rate ledger on the taller center
 * face, the Enterprise plan on the right. The two footnotes and the compare
 * link sit under the floor.
 */
export default function Treasury() {
  const root = useRef<HTMLElement>(null);
  useCourtReveal(root);

  return (
    <section className='pg-court pg-treas' id='pricing' ref={root}>
      <div className='pg-passage'>
        <CourtHead
          n={5}
          title='Pricing'
          sub='Start at $0. Pay per token. The price of a translation is knowable before you run it.'
        />

        <div className='pg-plinths'>
          <Plinth className='pg-plan' reveal>
            <h3>Starter</h3>
            <div className='pg-price'>
              $0<small>per month</small>
            </div>
            <p>
              Unlimited users, projects and languages. Editor, GitHub integration and Locadex included.
              Minimum top-up $10.
            </p>
            <ul>
              <li>Every SDK and the translation CLI</li>
              <li>Dashboard, glossaries, and the editor</li>
              <li>Locadex agent runs on your repo</li>
            </ul>
            <a className='pg-btn pg-btn-solid' href={HREF.starterPlan}>
              Get Started
            </a>
          </Plinth>

          <Plinth className='pg-ledger-plinth' reveal>
            <h3>Usage rates</h3>
            <dl className='pg-ledger'>
              {RATES.map((row) => (
                <div key={row.workflow}>
                  <dt>{row.workflow}</dt>
                  <dd>{row.rate}</dd>
                  {row.gtLibs ? <dd className='pg-ledger-gt'>GT libraries · {row.gtLibs}</dd> : null}
                </div>
              ))}
            </dl>
          </Plinth>

          <Plinth className='pg-plan' reveal>
            <h3>Enterprise</h3>
            <div className='pg-price'>
              Custom<small>annual</small>
            </div>
            <p>
              Forward-deployed engineers, custom workflows for any format or framework, shared context
              across projects.
            </p>
            <ul>
              <li>SSO, RBAC, webhooks, custom SLA</li>
              <li>SOC 2 Type II, GDPR, ISO 27001</li>
              <li>Support from the engineers who build it</li>
            </ul>
            <a className='pg-btn pg-btn-line' href={HREF.demo}>
              Contact Us
            </a>
          </Plinth>
        </div>

        <div className='pg-notes'>
          <p>A Usage Limit is a hard cap. It blocks billing even with auto-reload on.</p>
          <p>
            <code>npx gt translate --dry-run</code> prints what would be translated and bills 0 tokens.
          </p>
        </div>

        <p className='pg-compare'>
          <a href={HREF.pricing}>Compare Plans and Usage Pricing</a>
        </p>
      </div>
    </section>
  );
}
