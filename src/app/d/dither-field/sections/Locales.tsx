'use client';

import { useRef } from 'react';

import DitherGlobe from '../diagrams/DitherGlobe';
import { useQuietReveal } from './reveal';

/**
 * M13 — Locales. "100+ languages" converted from a marketing number into a
 * technical claim by expanding one language into its real regional variants.
 * Four rows, verbatim from `packages/supported-locales`; the two-second tell
 * is `zh-Hans` and `zh-Hant` sitting adjacent as different things.
 *
 * Beside the table, the one visual on the site genuinely improved by being
 * 1-bit: the halftone globe — a printed atlas plate, turning slowly.
 */

type LocaleRow = {
  tag: string;
  name: string;
  variants: readonly string[];
};

const ROWS: readonly LocaleRow[] = [
  { tag: 'ar', name: 'Arabic', variants: ['ar-AE', 'ar-EG', 'ar-LB', 'ar-MA', 'ar-OM', 'ar-SA'] },
  { tag: 'zh', name: 'Chinese', variants: ['zh-CN', 'zh-Hans', 'zh-Hant', 'zh-HK', 'zh-SG', 'zh-TW'] },
  { tag: 'de', name: 'German', variants: ['de-DE', 'de-AT', 'de-CH'] },
  { tag: 'pt', name: 'Portuguese', variants: ['pt-BR', 'pt-PT'] },
];

export default function Locales() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-sec' id='locales' ref={root}>
      <div className='tc-head'>
        <h2 data-reveal>100+ languages, and the variants that matter</h2>
        <p data-reveal>zh-Hant is not zh-Hans. Both ship.</p>
      </div>

      <div className='tc-row is-lead'>
        <div className='tc-cell is-tall' data-reveal>
          <div className='df-loc-table'>
            {ROWS.map((row) => (
              <div className='df-loc-row' key={row.tag}>
                <span className='df-loc-tag'>{row.tag}</span>
                <span className='df-loc-name'>{row.name}</span>
                <span className='df-loc-variants'>
                  {row.variants.map((variant) => (
                    <code
                      className={
                        variant === 'zh-Hans' || variant === 'zh-Hant'
                          ? 'df-loc-chip is-tell'
                          : 'df-loc-chip'
                      }
                      key={variant}
                    >
                      {variant}
                    </code>
                  ))}
                </span>
              </div>
            ))}

            <div className='df-loc-row is-tail'>
              <span className='df-loc-tag' aria-hidden />
              <span className='df-loc-name is-muted'>…and the long tail</span>
              <span className='df-loc-variants is-muted'>
                <span className='df-loc-tail'>
                  <code className='df-loc-chip'>cnr</code> Montenegrin
                </span>
                <span className='df-loc-tail'>
                  <code className='df-loc-chip'>cy</code> Welsh
                </span>
              </span>
            </div>
          </div>

          <p className='df-loc-count'>78 base languages, 129 distinct locale tags.</p>

          <div className='tc-cell-act'>
            <a className='tc-btn tc-btn-line tc-btn-sm' href='#platform'>
              Browse all supported locales
            </a>
          </div>
        </div>

        <div className='tc-cell is-tall is-framed' data-reveal>
          <div className='tc-card'>
            <div className='df-globe-well'>
              <DitherGlobe title='A halftone globe with twelve meridians and seven parallels, turning slowly' />
            </div>
            <p className='df-globe-note'>Every variant negotiated per request · served from the edge</p>
          </div>
        </div>
      </div>
    </section>
  );
}
