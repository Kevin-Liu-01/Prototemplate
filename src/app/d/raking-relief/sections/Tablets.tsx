import { PLAN_CTAS } from '@/app/d/production/sections/pricing-links';

import { BarDot } from './Ornament';
import { DRY_RUN_COMMAND, DRY_RUN_NOTE, LINKS, RATES, RATE_NOTES } from './content';

/**
 * The pricing file as three inscribed tablets set into the wall: the rate
 * ledger, the Starter plan, the Enterprise plan. The rates are the
 * published seven rows and nothing else. Nothing here moves.
 */
export default function Tablets() {
  return (
    <section className='rr-course rr-pricing' id='pricing'>
      <div className='rr-head'>
        <BarDot n={6} />
        <div className='rr-head-copy'>
          <h2>Start at $0. Pay per token.</h2>
          <p>The price of a translation is knowable before you run it.</p>
        </div>
      </div>

      <div className='rr-tablets'>
        <article className='rr-raised rr-tablet rr-rates'>
          <div className='rr-face'>
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
        </article>

        <article className='rr-raised rr-tablet rr-plan'>
          <div className='rr-face'>
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
        </article>

        <article className='rr-raised rr-tablet rr-plan'>
          <div className='rr-face'>
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
        </article>
      </div>

      <div className='rr-compare'>
        <a className='rr-btn is-line is-sm' href={LINKS.pricing}>
          Compare Plans and Usage Pricing
        </a>
      </div>
    </section>
  );
}
