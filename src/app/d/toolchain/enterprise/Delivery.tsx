'use client';

import { Undo2 } from 'lucide-react';
import { useRef } from 'react';

import { useQuietReveal } from '../sections/reveal';

/** The version rail: platform versions on the left, the git metadata the CLI
 *  tags them with beside — newest first, one row restorable. */
const VERSIONS: readonly { v: string; note: string; when: string; state?: 'live' | 'restore' }[] = [
  { v: 'v214', note: 'tag v2.1.0 — “Added checkout page translations”', when: '2 min ago', state: 'live' },
  { v: 'v213', note: 'commit 0f3a92', when: 'yesterday', state: 'restore' },
  { v: 'v212', note: 'tag v2.0.0', when: '3 days ago' },
  { v: 'v211', note: 'commit 7c21e4', when: 'last week' },
  { v: 'v210', note: 'commit b3d9a0', when: 'last week' },
];

/** Measured from a reader in fra's neighbourhood — the same five points of
 *  presence and latencies the toolchain page's globe carries. */
const POPS: readonly { code: string; ms: number; home?: boolean }[] = [
  { code: 'fra', ms: 12, home: true },
  { code: 'iad', ms: 21 },
  { code: 'nrt', ms: 34 },
  { code: 'sin', ms: 41 },
  { code: 'syd', ms: 48 },
];

const MAX_MS = 48;

/**
 * Delivery you can take back: the version rail on the left (tags carry real
 * git metadata, restore is one step), the edge latency ledger on the night
 * card beside it — measured bars, anycast, versioned per locale, and the
 * SLA line an enterprise contract adds.
 */
export default function Delivery() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-sec' id='delivery' ref={root}>
      <div className='tc-head'>
        <Undo2 className='tc-head-icon' strokeWidth={1} aria-hidden />
        <h2 data-reveal>Rollouts you can take back.</h2>
        <p data-reveal>
          Translations publish to a global CDN as versions, per locale — fixing production is an
          edit without a redeploy, and rolling back is one step.
        </p>
      </div>

      <div className='tc-row is-even'>
        <div className='tc-cell is-framed' data-reveal>
          <div className='tc-card'>
            <h3>Versioned per locale</h3>
            <p>
              Tags come from the CLI, so translation history carries your git metadata — restore
              any prior state.
            </p>
            <div className='tce-vers'>
              {VERSIONS.map((row) => (
                <div className={`tce-vrow${row.state === 'live' ? ' is-live' : ''}`} key={row.v}>
                  <b>{row.v}</b>
                  <span className='tce-vnote'>{row.note}</span>
                  <span className='tce-vstate'>
                    {row.state === 'live' ? 'live' : row.state === 'restore' ? 'restore ↩' : row.when}
                  </span>
                </div>
              ))}
              <div className='tce-vcmd'>
                <span>$</span> npx gt translate --tag v2.1.0 -m &quot;Added checkout page
                translations&quot;
              </div>
              <p className='tce-vnote-foot'>
                A history entry is a source version — inline edits never create one.
              </p>
            </div>
          </div>
        </div>

        <div className='tc-cell is-night is-framed' data-reveal>
          <div className='tc-card'>
            <h3>Served from the edge</h3>
            <p className='tce-night-sub'>
              A global, low-latency translation CDN — push over-the-air updates without
              redeploying your app.
            </p>
            <div className='tce-lat' role='img' aria-label='Edge latency ledger: fra 12 ms serving this reader, iad 21, nrt 34, sin 41, syd 48 milliseconds'>
              <div className='tce-lat-head'>
                <span>point of presence</span>
                <span>latency</span>
              </div>
              {POPS.map((pop) => (
                <div className={`tce-lrow-lat${pop.home ? ' is-home' : ''}`} key={pop.code}>
                  <span className='tce-lat-code'>{pop.code}</span>
                  <span className='tce-lat-bar' aria-hidden='true'>
                    <i style={{ width: `${(pop.ms / MAX_MS) * 100}%` }} />
                  </span>
                  <b>{pop.ms} ms</b>
                </div>
              ))}
              <div className='tce-lat-foot'>
                <span>anycast · versioned per locale · updates &lt;1s</span>
                <span>sla · custom, in contract</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
