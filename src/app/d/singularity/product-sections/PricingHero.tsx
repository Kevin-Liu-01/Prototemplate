'use client';

import { useRef } from 'react';

import { useQuietReveal } from '../sections/reveal';

/** One itemized line of the dry-run estimate. Rates are the published ones
 *  ($10 / 10k input tokens build time; +$0.10 / 10k per 500 context tokens);
 *  the quantities are the demo run the whole family uses (128 strings,
 *  5 locales), so the arithmetic checks out to the cent. */
const ESTIMATE: readonly { item: string; basis: string; amount: string; total?: boolean }[] = [
  { item: 'base', basis: '24,000 tok × $10 / 10k', amount: '$24.00' },
  { item: 'context', basis: '+$0.10 / 10k per 500 ctx tok', amount: '$0.48' },
  { item: 'total', basis: 'knowable before you run', amount: '$24.48', total: true },
];

/**
 * The pricing philosophy, stated and then demonstrated: the headline says
 * start free and pay when you ship; the artifact beside it is a dry-run
 * receipt — base + context itemized at published rates, nothing billed.
 * Below, the only two plans that exist, on the shell's own plan sheets.
 */
export default function PricingHero() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-sec' id='top' ref={root}>
      <div className='sgx-hero'>
        <div>
          <h1 data-reveal>
            <span>Start free.</span>
            <span>
              Pay when you <em className='sgx-em'>ship</em>.
            </span>
          </h1>
          <p className='sgx-hero-sub' data-reveal>
            Full-stack localization across buildtime, runtime, and review — two plans and a
            published rate card. Unlimited users, projects, and languages from the first day: the
            gate is a payment method, not a feature list.
          </p>
          <div className='sgx-acts' data-reveal>
            <a className='tc-btn tc-btn-solid' href='#top'>
              Get started — $0
            </a>
            <a className='tc-btn tc-btn-line' href='#usage'>
              See usage rates
            </a>
          </div>
        </div>

        <div className='sgx-panel' data-reveal>
          <div className='sgx-panel-bar'>
            <span>gt — translate</span>
            <span>estimate</span>
          </div>
          <div className='sgx-rc-body'>
            <p className='sgx-rc-line' data-tone='prompt'>
              $ npx gt translate --dry-run
            </p>
            <p className='sgx-rc-line'>gt-next detected · Next.js App Router</p>
            <p className='sgx-rc-line'>128 strings · 24,000 input tokens · 5 locales</p>
            <p className='sgx-rc-line' data-tone='dim'>
              project context · glossary 24 · directives 6 · 1,000 tok
            </p>
            <div className='sgx-rc-rows'>
              {ESTIMATE.map((line) => (
                <div className={`sgx-rc-row${line.total ? ' is-total' : ''}`} key={line.item}>
                  <span>{line.item}</span>
                  <span>{line.basis}</span>
                  <b>{line.amount}</b>
                </div>
              ))}
            </div>
            <p className='sgx-rc-line' data-tone='dim'>
              dry run — nothing translated, nothing billed
            </p>
          </div>
        </div>
      </div>

      <div className='tc-plans'>
        <div className='tc-plan' data-reveal>
          <h3>Starter</h3>
          <div className='tc-plan-price'>
            $0<small>per month · pay for usage</small>
          </div>
          <p>Everything you need to localize a real product, metered at the published rates.</p>
          <ul className='tc-list'>
            <li>Unlimited users, projects, and languages</li>
            <li>Every SDK and the translation CLI</li>
            <li>Dashboard, editor, and Context Groups</li>
            <li>GitHub integration and dev previews</li>
            <li>
              Locadex agent runs, metered at <code className='tc-chip'>$5 / LCU</code>
            </li>
            <li>Pay-as-you-go credits — $10 minimum top-up</li>
          </ul>
          <a className='tc-btn tc-btn-solid' href='#top'>
            Get started
          </a>
        </div>

        <div className='tc-plan' data-reveal>
          <h3>Enterprise</h3>
          <div className='tc-plan-price'>
            Custom<small>annual</small>
          </div>
          <p>
            The same toolchain, plus governance, custom workflows, and the engineers who build it.
          </p>
          <ul className='tc-list'>
            <li>Forward-deployed engineers — Slack and phone</li>
            <li>Custom workflows for any format or framework</li>
            <li>Shared context across every project</li>
            <li>SSO (SAML &amp; OIDC), RBAC, custom roles</li>
            <li>Webhooks and a custom SLA</li>
            <li>SOC 2 Type II · GDPR · ISO 27001</li>
          </ul>
          <a className='tc-btn tc-btn-line' href='#top'>
            Contact us
          </a>
        </div>
      </div>
    </section>
  );
}
