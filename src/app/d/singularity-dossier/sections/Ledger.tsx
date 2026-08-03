/* PLACEHOLDER DATA — the figures below are illustrative scaffolding for
   the layout. Replace with real customer rollout numbers before shipping. */

const ROWS = [
  { mark: 'is-cursor', brand: 'Cursor', shipped: 'Product, docs, changelog', locales: 14, first: '11 days' },
  { mark: 'is-ramp', brand: 'Ramp', shipped: 'App and marketing surface', locales: 9, first: '2 weeks' },
  { mark: 'is-profound', brand: 'Profound', shipped: 'Dashboard and onboarding', locales: 12, first: '8 days' },
  { mark: 'is-partiful', brand: 'Partiful', shipped: 'Full consumer product', locales: 16, first: '9 days' },
  { mark: 'is-clickhouse', brand: 'ClickHouse', shipped: 'Docs and cloud console', locales: 11, first: '2 weeks' },
] as const;

/**
 * The audit ledger: what actually shipped, held in one ruled table.
 * Wordmarks in the first column, mono figures in the last two — the
 * social proof is an accounting, not a logo soup.
 */
export default function Ledger() {
  return (
    <section className='sgd-ledger' aria-label='Customer rollouts, audited'>
      <header className='sgd-head'>
        <span className='sgd-kicker'>The ledger</span>
        <h2>What shipped, on the record.</h2>
      </header>
      <div className='sgd-table' role='table'>
        <div className='sgd-tr is-head' role='row'>
          <span role='columnheader'>Customer</span>
          <span role='columnheader'>Surface</span>
          <span role='columnheader'>Locales</span>
          <span role='columnheader'>First release</span>
        </div>
        {ROWS.map((r) => (
          <div className='sgd-tr' role='row' key={r.brand}>
            <span role='cell' className='sgd-td-brand'>
              <i className={`sgd-wm ${r.mark}`} aria-hidden />
              <span className='sr-only'>{r.brand}</span>
            </span>
            <span role='cell'>{r.shipped}</span>
            <span role='cell' className='sgd-td-num'>
              {r.locales}
            </span>
            <span role='cell' className='sgd-td-num'>
              {r.first}
            </span>
          </div>
        ))}
      </div>
      <p className='sgd-ledger-foot'>
        Five teams, sixty-two locales, zero string freezes. The next row is yours.
      </p>
    </section>
  );
}
