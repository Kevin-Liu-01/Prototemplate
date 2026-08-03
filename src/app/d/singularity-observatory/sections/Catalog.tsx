/* PLACEHOLDER QUOTES AND FIGURES — the observation notes and magnitudes
   below are invented scaffolding. Swap for real customer words and real
   rollout numbers before this ships. */

const BODIES = [
  {
    id: 'SGR·001',
    mark: 'is-cursor',
    brand: 'Cursor',
    note: 'Docs and product surface multilingual in one sprint; the pipeline reviews itself.',
    magnitude: '14 locales',
  },
  {
    id: 'SGR·002',
    mark: 'is-ramp',
    brand: 'Ramp',
    note: 'Passed a finance-grade compliance review with zero exceptions filed.',
    magnitude: '9 locales',
  },
  {
    id: 'SGR·003',
    mark: 'is-profound',
    brand: 'Profound',
    note: 'Dashboard and onboarding localized before the seed announcement.',
    magnitude: '12 locales',
  },
  {
    id: 'SGR·004',
    mark: 'is-partiful',
    brand: 'Partiful',
    note: 'A consumer product in sixteen markets, run by two engineers.',
    magnitude: '16 locales',
  },
  {
    id: 'SGR·005',
    mark: 'is-clickhouse',
    brand: 'ClickHouse',
    note: 'Docs and cloud console on every release train, no string freeze.',
    magnitude: '11 locales',
  },
] as const;

/**
 * The star catalog: customers filed as observed bodies on a faint dotted
 * sky — designation, mark, the observation note, and the measured
 * magnitude. Social proof as astronomy: recorded, not shouted.
 */
export default function Catalog() {
  return (
    <section className='tc-band sgb-catalog' aria-label='The customer catalog'>
      <div className='sgb-catalog-in'>
        <header className='sgb-catalog-head'>
          <h2>Bodies under observation.</h2>
          <p>Every entry verified in production. The catalog grows monthly.</p>
        </header>
        <div className='sgb-rows'>
          {BODIES.map((b) => (
            <article className='sgb-row' key={b.id}>
              <span className='sgb-row-id'>{b.id}</span>
              <span className='sgb-row-mark'>
                <i className={`sgb-wm ${b.mark}`} aria-hidden />
                <span className='sr-only'>{b.brand}</span>
              </span>
              <p className='sgb-row-note'>{b.note}</p>
              <span className='sgb-row-mag'>{b.magnitude}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
