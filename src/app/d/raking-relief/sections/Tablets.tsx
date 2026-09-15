import { PRICING_FEATURES } from '@/app/d/production/sections/pricing-features';
import type { Cell } from '@/app/d/production/sections/pricing-features';
import { PLAN_CTAS } from '@/app/d/production/sections/pricing-links';

import { Carved } from './deco/Carved';
import { BarDot, Frame, StepCrown } from './deco/Ornament';
import { DRY_RUN_COMMAND, DRY_RUN_NOTE, LINKS, RATES, RATE_NOTES } from './content';

/**
 * The pricing file as three inscribed tablets set into the wall, each under
 * a ziggurat cap and framed by its own band: the rate ledger, the Starter
 * plan, the Enterprise plan. Under them the compare ledger, sunk: the
 * shipped feature grid's four groups, a filled square where a plan includes
 * a feature and an open ring where it does not. The rates are the published
 * seven rows and nothing else. Nothing here moves.
 */

function CompareCell({ cell }: { cell: Cell }) {
  switch (cell.kind) {
    case 'yes':
      return (
        <span className='rr-cmp-mark is-yes'>
          <span className='rr-vh'>Included</span>
        </span>
      );
    case 'no':
      return (
        <span className='rr-cmp-mark is-no'>
          <span className='rr-vh'>Not included</span>
        </span>
      );
    case 'rates':
      return (
        <a className='rr-cmp-link' href={LINKS.pricing}>
          View Rates
        </a>
      );
    case 'text':
    default:
      return <span className='rr-cmp-text'>{cell.value}</span>;
  }
}

export default function Tablets() {
  return (
    <section className='rr-course rr-pricing' id='pricing'>
      <div className='rr-head'>
        <BarDot n={6} />
        <div className='rr-head-copy'>
          <h2>
            <Carved text='Start at $0. Pay per token.' />
          </h2>
          <p>The price of a translation is knowable before you run it.</p>
        </div>
      </div>

      <div className='rr-tablets'>
        <div className='rr-tablet-stack rr-rates'>
          <StepCrown />
          <article className='rr-raised is-deep rr-tablet'>
            <div className='rr-face is-framed'>
              <Frame id='rr-frame-rates' kind='rosette' />
              <div className='rr-tablet-in'>
                <header className='rr-tablet-head'>
                  <h3>Usage rates</h3>
                  <p>The published rates, by workflow.</p>
                </header>
                <table className='rr-rate-table'>
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
                        <td>{row.gtLibs ? row.gtLibs : <span className='rr-vh'>none</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <ul className='rr-rate-notes'>
                  {RATE_NOTES.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                  <li>
                    <code>{DRY_RUN_COMMAND}</code> {DRY_RUN_NOTE}
                  </li>
                </ul>
              </div>
            </div>
          </article>
        </div>

        <div className='rr-tablet-stack rr-plan'>
          <StepCrown />
          <article className='rr-raised is-deep rr-tablet'>
            <div className='rr-face is-framed'>
              <Frame id='rr-frame-starter' kind='palmette' />
              <div className='rr-tablet-in'>
                <header className='rr-tablet-head'>
                  <h3>Starter</h3>
                  <p className='rr-plan-price'>
                    $0<small>per month</small>
                  </p>
                </header>
                <div className='rr-plan-body'>
                  <p>
                    Unlimited users, projects and languages. Editor, GitHub integration and Locadex
                    included. Minimum top-up $10.
                  </p>
                  <ul className='rr-plan-list'>
                    <li>Every SDK and the translation CLI</li>
                    <li>Dashboard, glossaries, and the editor</li>
                    <li>Locadex agent runs on your repo</li>
                  </ul>
                  <a className='rr-btn is-solid' href={PLAN_CTAS.starter}>
                    Get Started
                  </a>
                </div>
              </div>
            </div>
          </article>
        </div>

        <div className='rr-tablet-stack rr-plan'>
          <StepCrown />
          <article className='rr-raised is-deep rr-tablet'>
            <div className='rr-face is-framed'>
              <Frame id='rr-frame-enterprise' kind='palmette' />
              <div className='rr-tablet-in'>
                <header className='rr-tablet-head'>
                  <h3>Enterprise</h3>
                  <p className='rr-plan-price'>
                    Custom<small>annual</small>
                  </p>
                </header>
                <div className='rr-plan-body'>
                  <p>
                    Forward-deployed engineers, custom workflows for any format or framework, shared
                    context across projects.
                  </p>
                  <ul className='rr-plan-list'>
                    <li>SSO, RBAC, webhooks, custom SLA</li>
                    <li>SOC 2 Type II, GDPR, ISO 27001</li>
                    <li>Support from the engineers who build it</li>
                  </ul>
                  <a className='rr-btn is-line' href={PLAN_CTAS.enterpriseContact}>
                    Contact Us
                  </a>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>

      <div className='rr-compare-wrap'>
        <div className='rr-compare rr-sunk'>
          <div className='rr-compare-head'>
            <p className='rr-compare-lead'>The two plans, feature by feature</p>
            <a className='rr-btn is-line is-sm' href={LINKS.pricing}>
              Compare Plans and Usage Pricing
            </a>
          </div>
          <div className='rr-cmp-scroll'>
            <table className='rr-cmp-table'>
              <thead>
                <tr>
                  <th scope='col'>Feature</th>
                  <th scope='col'>Starter</th>
                  <th scope='col'>Enterprise</th>
                </tr>
              </thead>
              {PRICING_FEATURES.map((group) => (
                <tbody key={group.id}>
                  <tr className='rr-cmp-group'>
                    <th scope='colgroup' colSpan={3}>
                      {group.name}
                    </th>
                  </tr>
                  {group.features.map((feature) => (
                    <tr key={feature.id}>
                      <th scope='row' title={feature.tooltip}>
                        {feature.name}
                      </th>
                      <td>
                        <CompareCell cell={feature.starter} />
                      </td>
                      <td>
                        <CompareCell cell={feature.enterprise} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
