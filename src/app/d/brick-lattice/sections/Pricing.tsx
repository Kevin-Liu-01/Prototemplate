import { PLAN_CTAS } from '@/app/d/production/sections/pricing-links';

import BrickField from '../diagrams/BrickField';
import PatternSwatch from '../diagrams/PatternSwatch';
import { LINKS, RATE_NOTES, RATES } from '../data';

/**
 * brick-lattice · the pricing file.
 *
 * Home: the section before the footer, over a register of palmette fans,
 * one fan rising behind each panel. Three glazed panels in the lattice,
 * each under its own header course the way the wall's bricks are: the
 * published rate ledger under a lapis course, then Starter at $0 and
 * Enterprise at Custom under gold courses that carry the billing term.
 * The seven rates and the two footnotes are the only figures on the page's
 * price side (charter A10); whole dollars print without cents. Nothing
 * here moves on its own; hovering a panel lights it with the accent ring.
 */
export default function Pricing() {
  return (
    <section className='bl-sec bl-price-sec' id='pricing'>
      <BrickField field='palmette' />
      <div className='bl-in'>
        <header className='bl-head bl-panel'>
          <PatternSwatch field='palmette' size={40} brick={16} ground='none' className='is-mark' />
          <h2>Start at $0. Pay per token.</h2>
          <p>The price of a translation is knowable before you run it.</p>
        </header>

        <div className='bl-price-grid'>
          <article className='bl-panel bl-pp bl-ledger'>
            <div className='bl-ch is-lapis'>
              <h3>Usage rates</h3>
              <code className='bl-ch-note'>USD</code>
            </div>
            <div className='bl-pp-body'>
              <table className='bl-rates'>
                <thead>
                  <tr>
                    <th scope='col'>Workflow</th>
                    <th scope='col'>Rate</th>
                    <th scope='col'>GT libraries</th>
                  </tr>
                </thead>
                <tbody>
                  {RATES.map((row, i) => (
                    <tr key={row.workflow} className={i === 0 ? 'is-lead' : undefined}>
                      <th scope='row'>{row.workflow}</th>
                      <td>{row.rate}</td>
                      <td>{row.gtLibs ? row.gtLibs : <span aria-hidden='true' />}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <ul className='bl-rate-notes'>
                <li>{RATE_NOTES.limit}</li>
                <li>
                  <code>npx gt translate --dry-run</code> {RATE_NOTES.dryRun}
                </li>
              </ul>
            </div>
          </article>

          <article className='bl-panel bl-pp bl-plan'>
            <div className='bl-ch'>
              <h3>Starter</h3>
              <code className='bl-ch-note'>per month</code>
            </div>
            <div className='bl-pp-body'>
              <p className='bl-plan-price'>$0</p>
              <p className='bl-plan-body'>
                Unlimited users, projects and languages. Editor, GitHub integration and Locadex included.
                Minimum top-up $10.
              </p>
              <ul className='bl-plan-list'>
                <li>Every SDK and the translation CLI</li>
                <li>Dashboard, glossaries, and the editor</li>
                <li>Locadex agent runs on your repo</li>
              </ul>
              <a className='bl-btn bl-btn-solid' href={PLAN_CTAS.starter}>
                Get Started
              </a>
            </div>
          </article>

          <article className='bl-panel bl-pp bl-plan'>
            <div className='bl-ch'>
              <h3>Enterprise</h3>
              <code className='bl-ch-note'>annual</code>
            </div>
            <div className='bl-pp-body'>
              <p className='bl-plan-price'>Custom</p>
              <p className='bl-plan-body'>
                Forward-deployed engineers, custom workflows for any format or framework, shared context across
                projects.
              </p>
              <ul className='bl-plan-list'>
                <li>SSO, RBAC, webhooks, custom SLA</li>
                <li>SOC 2 Type II, GDPR, ISO 27001</li>
                <li>Support from the engineers who build it</li>
              </ul>
              <a className='bl-btn bl-btn-line' href={PLAN_CTAS.enterpriseContact}>
                Contact Us
              </a>
            </div>
          </article>
        </div>

        <p className='bl-compare bl-panel'>
          <a href={LINKS.pricing}>Compare Plans and Usage Pricing</a>
        </p>
      </div>
    </section>
  );
}
