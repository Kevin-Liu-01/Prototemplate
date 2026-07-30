'use client';

import { useRef } from 'react';

import { useQuietReveal } from '../../sections/reveal';

/**
 * The three group mechanics that keep an accumulator trustworthy, each as a
 * small real artifact: Apply as an explicit action (context steers new
 * translations automatically; existing ones change only on Apply), explicit
 * priority when groups overlap (the top group wins), and the published
 * context surcharge as its own line item.
 */
export default function Controls() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-sec' id='apply' ref={root}>
      <div className='tc-head'>
        <h2 data-reveal>Applied on your terms.</h2>
        <p data-reveal>
          Groups live at the organization and are assigned to projects. New translations draw from them
          automatically; what already shipped changes only when you say so.
        </p>
      </div>

      <div className='tc-row is-three'>
        <div className='tc-cell is-short is-framed' data-reveal>
          <div className='tc-card'>
            <h3>Apply is a decision</h3>
            <p>
              Editing the glossary never rewrites your app behind your back. Existing translations
              change only when you press Apply.
            </p>
            <div className='ctx-apply'>
              <div className='ctx-apply-acts' aria-hidden='true'>
                <span className='tc-btn tc-btn-solid tc-btn-sm'>Translate</span>
                <span className='tc-btn tc-btn-line tc-btn-sm'>Apply</span>
              </div>
              <div className='ctx-ledger'>
                <div className='ctx-ledger-row'>
                  <span>new strings</span>
                  <span>translated with the group</span>
                </div>
                <div className='ctx-ledger-row'>
                  <span>existing 42</span>
                  <span>unchanged until Apply</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='tc-cell is-short is-framed' data-reveal>
          <div className='tc-card'>
            <h3>The top group wins</h3>
            <p>
              Groups stack per project. When two pin the same term, priority is explicit &mdash; the
              higher group decides.
            </p>
            <div className='ctx-prio'>
              <div className='ctx-prio-row'>
                <span className='ctx-prio-n'>01</span>
                <b>glossary — 12 terms</b>
                <span>directives — 3</span>
              </div>
              <div className='ctx-prio-row'>
                <span className='ctx-prio-n'>02</span>
                <b>glossary — 5 terms</b>
              </div>
              <div className='ctx-ledger'>
                <div className='ctx-ledger-row'>
                  <span>Workflow</span>
                  <span lang='ja'>ワークフロー · group 01</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='tc-cell is-short is-framed' data-reveal>
          <div className='tc-card'>
            <h3>Priced in the open</h3>
            <p>
              Project context is its own published line item, per token &mdash; you can see exactly what
              you&rsquo;re buying.
            </p>
            <div className='ctx-ledger is-rate'>
              <div className='ctx-ledger-row'>
                <span>build time</span>
                <span>$10 / 10k input tokens</span>
              </div>
              <div className='ctx-ledger-row'>
                <span>project context</span>
                <span>+$0.10 / 10k per 500 tokens</span>
              </div>
            </div>
            <p className='ctx-verdict'>Published rates, hard usage caps — never a surprise invoice.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
