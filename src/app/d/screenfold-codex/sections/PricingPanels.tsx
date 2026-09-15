'use client';

import { useRef } from 'react';

import { PRICING_FEATURES, type Cell } from '@/app/d/production/sections/pricing-features';
import { PLAN_CTAS } from '@/app/d/production/sections/pricing-links';

import BarDot from '../components/BarDot';
import Fig from '../components/Fig';
import FoldHinge from '../components/FoldHinge';
import { useQuietReveal } from '../components/motion';
import { Panel, Register } from '../components/Panel';
import { RATES, USAGE_RATES_URL, leaf } from '../data';

/**
 * Leaves seven to ten: the pricing file. Seven is the published rate
 * ledger, every rate in Arabic and in bar and dot, both money columns,
 * with the two footnotes. Eight and nine are the two plans as an open
 * spread, the left leaf leaning one way and the right the other. Ten is
 * the plan comparison from the shipped feature grid: a dot marks a
 * feature included, the shell marks one that is not, the compare link
 * closes the leaf.
 */
const RATES_LEAF = leaf('pricing');
const STARTER_LEAF = leaf('starter');
const ENTERPRISE_LEAF = leaf('enterprise');
const COMPARE_LEAF = leaf('compare');

function CellView({ cell }: { cell: Cell }) {
  switch (cell.kind) {
    case 'yes':
      return (
        <span className='sfc-cmp-mark is-yes'>
          <BarDot n={1} scale={1} label='Included' />
        </span>
      );
    case 'no':
      return (
        <span className='sfc-cmp-mark is-no'>
          <BarDot n={0} scale={1} label='Not included' />
        </span>
      );
    case 'text':
      return <span className='sfc-cmp-text'>{cell.value}</span>;
    case 'rates':
      return (
        <a className='sfc-cmp-link' href={USAGE_RATES_URL} rel='noreferrer' target='_blank'>
          View Rates
        </a>
      );
    default:
      return null;
  }
}

export default function PricingPanels() {
  const root = useRef<HTMLDivElement>(null);
  useQuietReveal(root);

  return (
    <div ref={root}>
      <Panel index={RATES_LEAF.n} fold={RATES_LEAF.fold} sign={RATES_LEAF.sign} id={RATES_LEAF.id}>
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
                  <span className='sfc-rate-gt'>
                    {row.gtLibs !== undefined && row.gtCount !== undefined ? (
                      <Fig n={row.gtCount} scale={0.8}>
                        {row.gtLibs}
                      </Fig>
                    ) : null}
                  </span>
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

      <FoldHinge fold='valley' seat='east' />

      <div className='sfc-spread'>
        <Panel index={STARTER_LEAF.n} fold={STARTER_LEAF.fold} sign={STARTER_LEAF.sign} id={STARTER_LEAF.id} className='is-plan'>
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
              <Fig n={10}>$10 minimum top-up</Fig>
            </div>
          </Register>
        </Panel>

        <Panel
          index={ENTERPRISE_LEAF.n}
          fold={ENTERPRISE_LEAF.fold}
          sign={ENTERPRISE_LEAF.sign}
          id={ENTERPRISE_LEAF.id}
          className='is-plan'
        >
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
            </div>
          </Register>
        </Panel>
      </div>

      <FoldHinge fold='mountain' seat='east' />

      <Panel index={COMPARE_LEAF.n} fold={COMPARE_LEAF.fold} sign={COMPARE_LEAF.sign} id={COMPARE_LEAF.id}>
        <Register className='is-head'>
          <h2 className='sfc-h2' data-reveal>
            The plan comparison
          </h2>
          <p className='sfc-lead' data-reveal>
            A dot marks a feature included. The shell marks one not included.
          </p>
        </Register>

        {PRICING_FEATURES.map((group) => (
          <Register className='is-cmp' key={group.id}>
            <div className='sfc-cmp' data-reveal>
              <div className='sfc-cmp-head'>
                <h3 className='sfc-reg-title'>{group.name}</h3>
                <span className='sfc-cmp-col'>Starter</span>
                <span className='sfc-cmp-col'>Enterprise</span>
              </div>
              <ul className='sfc-cmp-rows'>
                {group.features.map((feature) => (
                  <li className='sfc-cmp-row' key={feature.id}>
                    <span className='sfc-cmp-name'>
                      <span className='sfc-cmp-title'>
                        {feature.name}
                        {feature.isNew ? <b className='sfc-cmp-new'>New</b> : null}
                      </span>
                      {feature.tooltip ? <small className='sfc-cmp-tip'>{feature.tooltip}</small> : null}
                    </span>
                    <span className='sfc-cmp-cell'>
                      <CellView cell={feature.starter} />
                    </span>
                    <span className='sfc-cmp-cell'>
                      <CellView cell={feature.enterprise} />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Register>
        ))}

        <Register className='is-foot'>
          <div className='sfc-acts is-end' data-reveal>
            <a className='sfc-btn' href={USAGE_RATES_URL} rel='noreferrer' target='_blank'>
              Compare Plans and Usage Pricing
            </a>
            <span className='sfc-note'>Whole-dollar amounts print without cents.</span>
          </div>
        </Register>
      </Panel>
    </div>
  );
}
