/**
 * The treasury: the pricing file (A10). The rate ledger is a ruled table
 * under the head, the published seven rows and nothing else. Below it, a
 * 4 by 2 column plan with three bays framed by columns: the Starter plan,
 * the two footnotes with the compare link, and the Enterprise plan, so the
 * two plans mirror across the central bay.
 */
import { ArrowUpRight } from 'lucide-react';

import {
  COMPARE_LABEL,
  FOOTNOTE_DRY_RUN,
  FOOTNOTE_DRY_RUN_CMD,
  FOOTNOTE_LIMIT,
  PLANS,
  PRICING_URL,
  RATES,
} from '../data';
import { Rosette } from './deco/Rosette';
import { Bay, Hall, Row } from './deco/Hall';

export function Treasury() {
  const [starter, enterprise] = PLANS;
  return (
    <section className='apg-hall is-treasury' id='pricing' aria-labelledby='apg-pricing-h'>
      <div className='apg-thresh'>
        <Rosette />
        <h2 id='apg-pricing-h'>Start at $0. Pay per token.</h2>
        <p>The price of a translation is knowable before you run it.</p>
      </div>

      <div className='apg-ledger-wrap'>
        <table className='apg-ledger'>
          <caption className='apg-visually-hidden'>Usage rates</caption>
          <thead>
            <tr>
              <th scope='col'>Workflow</th>
              <th scope='col' className='is-rate'>
                Rate
              </th>
              <th scope='col' className='is-libs'>
                GT libraries
              </th>
            </tr>
          </thead>
          <tbody>
            {RATES.map((row, i) => (
              <tr key={row.workflow} className={i === 0 ? 'is-lead' : undefined}>
                <th scope='row'>{row.workflow}</th>
                <td className='is-rate'>{row.rate}</td>
                <td className='is-libs'>{row.gtLibs ? row.gtLibs : <span aria-hidden='true' />}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Hall cols={3} base={76} className='is-treasury'>
        <Row>
          {starter ? (
            <Bay className='is-plan'>
              <div className='apg-plan-card'>
                <h3>{starter.name}</h3>
                <p className='apg-price'>
                  {starter.price}
                  <small>{starter.cadence}</small>
                </p>
                <p className='apg-plan-body'>{starter.body}</p>
                <a className='apg-btn is-solid' href={starter.href}>
                  {starter.cta}
                </a>
              </div>
            </Bay>
          ) : null}
          <Bay className='is-notes'>
            <div className='apg-notes'>
              <p>{FOOTNOTE_LIMIT}</p>
              <p>
                <code>{FOOTNOTE_DRY_RUN_CMD}</code> {FOOTNOTE_DRY_RUN}
              </p>
              <a className='apg-compare' href={PRICING_URL}>
                {COMPARE_LABEL}
                <ArrowUpRight size={14} strokeWidth={1.5} aria-hidden />
              </a>
            </div>
          </Bay>
          {enterprise ? (
            <Bay className='is-plan'>
              <div className='apg-plan-card'>
                <h3>{enterprise.name}</h3>
                <p className='apg-price'>
                  {enterprise.price}
                  <small>{enterprise.cadence}</small>
                </p>
                <p className='apg-plan-body'>{enterprise.body}</p>
                <a className='apg-btn is-line' href={enterprise.href}>
                  {enterprise.cta}
                </a>
              </div>
            </Bay>
          ) : null}
        </Row>
      </Hall>
    </section>
  );
}
