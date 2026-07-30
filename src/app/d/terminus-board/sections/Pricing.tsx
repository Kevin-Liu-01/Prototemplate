'use client';

import { useRef } from 'react';

import FlapPhrase from './FlapPhrase';
import { useQuietReveal } from './reveal';

/** Two plans, one line each, and a link to the real comparison. */
export default function Pricing() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-sec' id='pricing' ref={root}>
      <div className='tc-head'>
        <h2 data-reveal>
          Pricing <FlapPhrase text='for everyone.' />
        </h2>
        <p data-reveal>Full-stack localization across buildtime, runtime, and review.</p>
      </div>

      <div className='tc-plans'>
        <div className='tc-plan' data-reveal>
          <h3>Starter</h3>
          <div className='tc-plan-price'>
            $0<small>to start</small>
          </div>
          <p>Start free and upgrade when you ship. Everything you need to localize a real product.</p>
          <ul className='tc-list'>
            <li>Every SDK and the translation CLI</li>
            <li>Dashboard, glossaries, and the editor</li>
            <li>Locadex agent runs on your repo</li>
          </ul>
          <a className='tc-btn tc-btn-solid' href='#top'>
            Get started
          </a>
        </div>

        <div className='tc-plan' data-reveal>
          <h3>Enterprise</h3>
          <div className='tc-plan-price'>
            Custom<small>annual</small>
          </div>
          <p>Talk to an engineer about implementation, volume, and your security review.</p>
          <ul className='tc-list'>
            <li>Volume pricing across projects</li>
            <li>SOC 2 Type II, GDPR, ISO 27001</li>
            <li>Support from the engineers who build it</li>
          </ul>
          <a className='tc-btn tc-btn-line' href='#top'>
            Contact us
          </a>
        </div>
      </div>

      <div className='tc-compare' data-reveal>
        <a href='#top'>Compare plans and usage pricing</a>
      </div>
    </section>
  );
}
