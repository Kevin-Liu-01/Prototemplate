'use client';

import { useRef } from 'react';

import { PLAN_CTAS } from '@/app/d/production/sections/pricing-links';
import { USAGE_RATES_URL } from '@/app/d/production/sections/site-links';

import BarDot from '../components/BarDot';
import { useQuietReveal } from '../components/motion';
import { Panel, Register } from '../components/Panel';
import { RATES } from '../data';

/**
 * Leaves six, seven, and eight: the pricing file. Six is the published
 * rate ledger, every rate in Arabic and in bar and dot, with the two
 * footnotes. Seven and eight are the two plans as an open spread, the
 * left leaf sheared one way and the right the other, with the compare
 * link closing the right leaf.
 */
export default function PricingPanels() {
  const root = useRef<HTMLDivElement>(null);
  useQuietReveal(root);

  return (
    <div ref={root}>
      <Panel index={6} fold='b' id='pricing'>
        <Register className='is-head'>
          <h2 className='sfc-h2' data-reveal>
            Start at $0. Pay per token.
          </h2>
          <p className='sfc-lead' data-reveal>
            The price of a translation is knowable before you run it.
          </p>
        </Register>

        <Register>
          <div className='sfc-rates' data-reveal>
            <div className='sfc-rates-head' aria-hidden='true'>
              <span />
              <span>Workflow</span>
              <span>Rate</span>
              <span>GT libraries</span>
            </div>
            <ul className='sfc-ledger is-rates'>
              {RATES.map((row, i) => (
                <li className={i === 0 ? 'sfc-ledger-row is-lead' : 'sfc-ledger-row'} key={row.workflow}>
                  <span className='sfc-rate-num'>
                    <BarDot n={row.count} layout='row' scale={0.9} />
                    <span className='sfc-rate-unit'>{row.unit}</span>
                  </span>
                  <span className='sfc-ledger-name'>{row.workflow}</span>
                  <span className='sfc-rate-value'>{row.rate}</span>
                  <span className='sfc-rate-gt'>{row.gtLibs ?? ''}</span>
                </li>
              ))}
            </ul>
          </div>
        </Register>

        <Register className='is-foot'>
          <div className='sfc-notes' data-reveal>
            <p className='sfc-note'>A Usage Limit is a hard cap. It blocks billing even with auto-reload on.</p>
            <p className='sfc-note'>
              <code>npx gt translate --dry-run</code> prints what would be translated and bills 0 tokens.
            </p>
          </div>
        </Register>
      </Panel>

      <div className='sfc-spread'>
        <Panel index={7} fold='a' className='is-plan'>
          <Register className='is-head'>
            <h2 className='sfc-h2' data-reveal>
              Starter
            </h2>
            <div className='sfc-price' data-reveal>
              <BarDot n={0} scale={1.4} label='Zero in bar and dot numerals' />
              <span className='sfc-price-figure'>$0</span>
              <span className='sfc-price-per'>per month</span>
            </div>
          </Register>
          <Register>
            <p className='sfc-p' data-reveal>
              Unlimited users, projects and languages. Editor, GitHub integration and Locadex included.
              Minimum top-up $10.
            </p>
            <ul className='sfc-list' data-reveal>
              <li>Every SDK and the translation CLI</li>
              <li>Dashboard, glossaries, and the editor</li>
              <li>Locadex agent runs on your repo</li>
            </ul>
            <div className='sfc-acts' data-reveal>
              <a className='sfc-btn is-solid' href={PLAN_CTAS.starter}>
                Get Started
              </a>
              <span className='sfc-figure'>
                <BarDot n={10} layout='row' scale={0.9} />
                <span>$10 minimum top-up</span>
              </span>
            </div>
          </Register>
        </Panel>

        <Panel index={8} fold='b' className='is-plan'>
          <Register className='is-head'>
            <h2 className='sfc-h2' data-reveal>
              Enterprise
            </h2>
            <div className='sfc-price' data-reveal>
              <span className='sfc-price-figure'>Custom</span>
              <span className='sfc-price-per'>annual</span>
            </div>
          </Register>
          <Register>
            <p className='sfc-p' data-reveal>
              Forward-deployed engineers, custom workflows for any format or framework, shared context
              across projects.
            </p>
            <ul className='sfc-list' data-reveal>
              <li>SSO, RBAC, webhooks, custom SLA</li>
              <li>SOC 2 Type II, GDPR, ISO 27001</li>
              <li>Support from the engineers who build it</li>
            </ul>
            <div className='sfc-acts' data-reveal>
              <a className='sfc-btn' href={PLAN_CTAS.enterpriseContact} rel='noreferrer' target='_blank'>
                Contact Us
              </a>
              <a className='sfc-compare' href={USAGE_RATES_URL} rel='noreferrer' target='_blank'>
                Compare Plans and Usage Pricing
              </a>
            </div>
          </Register>
        </Panel>
      </div>
    </div>
  );
}
