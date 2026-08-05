/* PLACEHOLDER QUOTES — every statement below is invented scaffolding for
   the layout. Swap for real customer words (and confirm names and titles)
   before this copy ships anywhere. */

import GtLogoText from '../../_v0/GtLogoText';

const STATEMENTS = [
  {
    mark: 'is-cursor',
    brand: 'Cursor',
    quote:
      'We took Cursor multilingual in one sprint. It was the first launch where the pipeline did the reviewing instead of my engineers.',
    name: 'Michael Truell',
    role: 'CEO, Cursor',
    exhibit: 'A',
  },
  {
    mark: 'is-ramp',
    brand: 'Ramp',
    quote: (
      <>
        Finance software cannot ship a wrong word. <GtLogoText /> is the only localization
        system our compliance review passed without a single exception.
      </>
    ),
    name: 'Head of Platform',
    role: 'Ramp',
    exhibit: 'B',
  },
  {
    mark: 'is-clickhouse',
    brand: 'ClickHouse',
    quote:
      'Docs, console, errors — every surface, every release, no string freeze. It behaves like infrastructure, so we treat it like infrastructure.',
    name: 'Engineering Lead',
    role: 'ClickHouse',
    exhibit: 'C',
  },
] as const;

/**
 * The sworn statements: three testimony plates, each ruled like a filed
 * exhibit — hairline top rule carrying the exhibit letter, the quote set
 * large in the display face, and the attribution row closing the plate
 * with the witness's real wordmark.
 */
export default function Testimony() {
  return (
    <section className='sgd-testimony' aria-label='Customer statements'>
      <header className='sgd-head'>
        <span className='sgd-kicker'>The record</span>
        <h2>Entered into evidence.</h2>
      </header>
      {STATEMENTS.map((s) => (
        <figure className='sgd-plate' key={s.exhibit}>
          <div className='sgd-plate-rule'>
            <span>Exhibit {s.exhibit}</span>
            <span className='sgd-plate-brand'>{s.brand}</span>
          </div>
          <blockquote>
            <p>{s.quote}</p>
          </blockquote>
          <figcaption>
            <i className={`sgd-wm ${s.mark}`} aria-hidden />
            <span>
              <b>{s.name}</b>
              {s.role}
            </span>
          </figcaption>
        </figure>
      ))}
    </section>
  );
}
