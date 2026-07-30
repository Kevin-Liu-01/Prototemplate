'use client';

import './delivery.css';

/**
 * The edge at volume — the escalation past the hero. The hero shows ONE
 * request landing on fra; this ledger shows the fleet a few seconds later:
 * seven requests across five POPs and six locales, every one a cache hit,
 * with `es` already serving the v215 string that was saved in the editor two
 * shells up. No repeated hero datums: the hero states the topology (POPs,
 * anycast, versions); this states the traffic.
 *
 * Founder-ban compliant state: the two v215 rows are weight + white, never a
 * pill or a color.
 */

const ROWS: readonly {
  t: string;
  pop: string;
  path: string;
  ver: string;
  ms: string;
  hot?: boolean;
}[] = [
  { t: '14:02:11', pop: 'fra', path: '/fr/a-propos', ver: 'v214', ms: '12 ms' },
  { t: '14:02:11', pop: 'sin', path: '/ja/docs', ver: 'v214', ms: '9 ms' },
  { t: '14:02:12', pop: 'iad', path: '/es/checkout', ver: 'v215', ms: '11 ms', hot: true },
  { t: '14:02:12', pop: 'gru', path: '/pt-br/precos', ver: 'v214', ms: '14 ms' },
  { t: '14:02:13', pop: 'sfo', path: '/zh/产品', ver: 'v214', ms: '8 ms' },
  { t: '14:02:13', pop: 'fra', path: '/de/preise', ver: 'v214', ms: '10 ms' },
  { t: '14:02:14', pop: 'iad', path: '/es/checkout', ver: 'v215', ms: '2 ms', hot: true },
];

export type EdgeLedgerProps = {
  className?: string;
  title?: string;
};

export default function EdgeLedger({ className, title }: EdgeLedgerProps) {
  return (
    <div
      className={['dlv-ledger', className].filter(Boolean).join(' ')}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <div className='dlv-ledger-bar'>
        <span>edge — request log</span>
        <span>last 4 s</span>
      </div>

      <div className='dlv-ledger-head' aria-hidden>
        <span>time</span>
        <span>pop</span>
        <span>path</span>
        <span>version</span>
        <span>cache</span>
        <span className='is-num'>ms</span>
      </div>

      {ROWS.map((row, i) => (
        <div className='dlv-ledger-row' data-hot={row.hot || undefined} key={i}>
          <span>{row.t}</span>
          <span>{row.pop}</span>
          <span>{row.path}</span>
          <span>{row.ver}</span>
          <span>hit</span>
          <span className='is-num'>{row.ms}</span>
        </div>
      ))}

      <div className='dlv-ledger-foot'>
        <span>7 requests · 7 hits · 0 origin fetches</span>
        <span>6 locales · 5 pops</span>
      </div>
    </div>
  );
}
