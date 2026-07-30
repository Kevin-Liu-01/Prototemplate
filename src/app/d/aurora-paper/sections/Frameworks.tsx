'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef, useState } from 'react';

import CodeBlock from './code';
import { useQuietReveal } from './reveal';
import { CAP_DEMOS, FRAMEWORKS } from './stacks';

gsap.registerPlugin(useGSAP);

/**
 * The oxc pattern: one row of stacks, an underline that slides to the active
 * one, and a sample plus capability list that swap beneath it. The underline is
 * the only thing that travels — the panel below resolves in place.
 */
export default function Frameworks() {
  const root = useRef<HTMLElement>(null);
  const tabs = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const settled = useRef(false);
  const [active, setActive] = useState(0);

  useQuietReveal(root);

  useGSAP(
    () => {
      const list = tabs.current;
      const bar = list?.querySelector<HTMLElement>('[data-underline]');
      if (!list || !bar) return;

      const place = (animate: boolean) => {
        const button = list.querySelectorAll<HTMLButtonElement>('[data-tab]')[active];
        if (!button) return;
        const to = { x: button.offsetLeft - list.scrollLeft, width: button.offsetWidth };
        if (animate) gsap.to(bar, { ...to, duration: 0.42, ease: 'power3.out' });
        else gsap.set(bar, to);
      };

      place(settled.current);

      if (settled.current && panel.current) {
        gsap.fromTo(
          panel.current,
          { autoAlpha: 0, y: 6 },
          { autoAlpha: 1, y: 0, duration: 0.34, ease: 'power2.out' }
        );
      }
      settled.current = true;

      /* Switzer loads after first paint; the underline is measured type, so it
         has to be measured again once the real face is in. */
      const settle = () => place(false);
      void document.fonts?.ready.then(settle);
      window.addEventListener('resize', settle);
      return () => window.removeEventListener('resize', settle);
    },
    { dependencies: [active] }
  );

  const framework = FRAMEWORKS[active] ?? FRAMEWORKS[0];
  if (!framework) return null;

  return (
    <section className='tc-sec' id='frameworks' ref={root}>
      <div className='tc-head'>
        <h2 data-reveal>One toolchain, every stack.</h2>
        <p data-reveal>
          Developer-first SDKs to translate everything from simple sites to complex user experiences.
        </p>
      </div>

      <div className='tc-tabs' ref={tabs} role='tablist' aria-label='Frameworks'>
        {FRAMEWORKS.map((item, i) => (
          <button
            className='tc-tab'
            data-tab
            data-on={i === active}
            key={item.id}
            id={`tc-tab-${item.id}`}
            type='button'
            role='tab'
            aria-selected={i === active}
            aria-controls='tc-fw-panel'
            onClick={() => setActive(i)}
          >
            {item.name}
          </button>
        ))}
        <span className='tc-tab-bar' data-underline aria-hidden />
      </div>

      <div
        className='tc-fw'
        id='tc-fw-panel'
        ref={panel}
        role='tabpanel'
        aria-labelledby={`tc-tab-${framework.id}`}
      >
        {/* Mounted, like every other code surface on the page: the mat with its
            2px reveal, then the card, then the sample on the page's own paper. */}
        <div className='tc-fw-code'>
          <div className='tc-mount'>
            <div className='tc-card'>
              <CodeBlock file={framework.file} code={framework.code} />
            </div>
          </div>
        </div>

        {/* The split is a rule of its own rather than a cell border, so the two
            panes can each end where their content ends instead of the shorter
            one being stretched to the taller one's bottom. */}
        <span className='tc-fw-rule' aria-hidden />

        <div className='tc-fw-side'>
          <div className='tc-fw-pkg'>{framework.pkg}</div>
          <p>{framework.blurb}</p>

          {/* The two commands that precede the sample. They also give the pane
              enough to say that it reaches the bottom of the code beside it
              instead of stopping a third of the way up. */}
          <div className='tc-fw-run'>
            {framework.install.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </div>

          {/* Each capability cell carries a real output under its name — the
              formatted number, the shipped pathname, the plural pair — so the
              table reads at the density of the sample beside it. */}
          <div className='tc-caps'>
            {framework.caps.map((cap) => (
              <span key={cap}>
                <b>{cap}</b>
                <code>{CAP_DEMOS[cap]}</code>
              </span>
            ))}
          </div>

          <a className='tc-fw-link' href='#platform'>
            {framework.pkg} reference
          </a>
        </div>
      </div>
    </section>
  );
}
