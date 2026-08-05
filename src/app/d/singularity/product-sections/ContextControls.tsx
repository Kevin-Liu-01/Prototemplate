'use client';

import { useRef } from 'react';

import { useQuietReveal } from '../sections/reveal';

/**
 * The three group mechanics that keep an accumulator trustworthy, each on
 * its own ruled sheet: Apply as an explicit action (context steers new
 * translations automatically; existing ones change only on Apply), explicit
 * priority when groups overlap (the top group wins), and the published
 * context surcharge as its own line item. Then the quiet close.
 */
export default function ContextControls() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-sec' id='apply' ref={root}>
      <div className='sgx-head'>
        <span className='sgx-kicker' data-reveal>
          Group mechanics
        </span>
        <h2 data-reveal>Applied on your terms.</h2>
        <p data-reveal>
          Groups live at the organization and are assigned to projects. New translations draw from
          them automatically; what already shipped changes only when you say so.
        </p>
      </div>

      <div className='sgx-body'>
        <div className='sgx-tpl' data-reveal>
          <div>
            <h3>Apply is a decision</h3>
            <p>
              Editing the glossary never rewrites your app behind your back. Existing translations
              change only when you press Apply.
            </p>
            <div className='sgx-ledger'>
              <div className='sgx-lr'>
                <span>
                  new strings — <b>translated with the group</b>
                </span>
              </div>
              <div className='sgx-lr'>
                <span>
                  existing 42 — <b>unchanged until Apply</b>
                </span>
              </div>
            </div>
          </div>
          <div>
            <h3>The top group wins</h3>
            <p>
              Groups stack per project. When two pin the same term, priority is explicit &mdash;
              the higher group decides.
            </p>
            <div className='sgx-ledger'>
              <div className='sgx-lr'>
                <span>
                  01 · <b>glossary — 12 terms</b> · directives — 3
                </span>
              </div>
              <div className='sgx-lr'>
                <span>
                  02 · <b>glossary — 5 terms</b>
                </span>
              </div>
              <div className='sgx-lr'>
                <span>
                  Workflow → <b lang='ja'>ワークフロー</b> · group 01
                </span>
              </div>
            </div>
          </div>
          <div>
            <h3>Priced in the open</h3>
            <p>
              Project context is its own published line item, per token &mdash; you can see exactly
              what you&rsquo;re buying.
            </p>
            <div className='sgx-ledger'>
              <div className='sgx-lr'>
                <span>
                  build time — <b>$10 / 10k input tokens</b>
                </span>
              </div>
              <div className='sgx-lr'>
                <span>
                  project context — <b>+$0.10 / 10k per 500 tokens</b>
                </span>
              </div>
            </div>
            <p className='sgx-verdict'>Published rates, hard usage caps — never a surprise invoice.</p>
          </div>
        </div>
      </div>

      {/* ---- quiet close ---- */}
      <div className='sgx-close'>
        <h2 data-reveal>
          Define it <em className='sgx-em'>once</em>.
        </h2>
        <p data-reveal>
          Terminology and tone, set at the organization and obeyed by every translation &mdash; at
          build time, at runtime, and in every Locadex pull request.
        </p>
        <div className='sgx-acts' data-reveal>
          <a className='tc-btn tc-btn-solid' href='#top'>
            Get started
          </a>
          <a className='tc-btn tc-btn-line' href='#top'>
            Read the docs
          </a>
        </div>
      </div>
    </section>
  );
}
