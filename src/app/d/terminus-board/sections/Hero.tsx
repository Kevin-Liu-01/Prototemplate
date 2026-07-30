'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import { useRef, useState } from 'react';

import { blankLine, CYCLE, flipUp, retarget } from '../lib/flap';
import BoardField from './BoardField';
import { FlapChars } from './FlapText';
import NowBoarding from './NowBoarding';

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrambleTextPlugin);

/**
 * Six names in one weight read as a word list, so each is set as its own
 * typographic mark — weight, case, size and tracking are the only variables,
 * and they stay inside the page's two faces. The row is ruled into six cells so
 * the two hairlines bracketing the band bound a table rather than a sentence.
 */
const CUSTOMERS: readonly { name: string; mark: string }[] = [
  { name: 'Cursor', mark: 'is-cursor' },
  { name: 'Ramp', mark: 'is-ramp' },
  { name: 'Mintlify', mark: 'is-mintlify' },
  { name: 'Profound', mark: 'is-profound' },
  { name: 'Partiful', mark: 'is-partiful' },
  { name: 'ClickHouse', mark: 'is-clickhouse' },
];

type Departure = { code: string; name: string; status: 'SHIPPED' | 'ON TIME' };

/* Real locales with their native names — the board never shows glyph soup.
   Statuses stay quiet: a departure board announces, it does not sell. */
const RUN_OPEN: readonly Departure[] = [
  { code: 'ES', name: 'ESPAÑOL', status: 'SHIPPED' },
  { code: 'FR', name: 'FRANÇAIS', status: 'SHIPPED' },
  { code: 'JA', name: '日本語', status: 'ON TIME' },
  { code: 'DE', name: 'DEUTSCH', status: 'SHIPPED' },
  { code: 'ZH', name: '中文', status: 'ON TIME' },
  { code: 'KO', name: '한국어', status: 'SHIPPED' },
];

/* The rest of the timetable, rotated in one cell at a time. */
const RUN_POOL: readonly Departure[] = [
  { code: 'PT', name: 'PORTUGUÊS', status: 'SHIPPED' },
  { code: 'AR', name: 'العربية', status: 'ON TIME' },
  { code: 'HI', name: 'हिन्दी', status: 'SHIPPED' },
  { code: 'IT', name: 'ITALIANO', status: 'SHIPPED' },
  { code: 'NL', name: 'NEDERLANDS', status: 'ON TIME' },
  { code: 'PL', name: 'POLSKI', status: 'SHIPPED' },
  { code: 'TR', name: 'TÜRKÇE', status: 'ON TIME' },
  { code: 'SV', name: 'SVENSKA', status: 'SHIPPED' },
];

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const core = useRef<HTMLDivElement>(null);
  const run = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const copy = () => {
    void navigator.clipboard?.writeText('npx gt@latest');
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1600);
  };

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const scope = root.current;
      if (!scope) return;

      /* The identity move: the headline clacks up from blanks, riffling
         through world scripts before settling into English — each glyph
         flashing phosphor-amber as it lands. Blanked inside this layout
         effect, so the settled SSR text never paints first. */
      const lines = gsap.utils.toArray<HTMLElement>('h1 [data-tb-line]', scope);
      lines.forEach((line, i) => {
        blankLine(line);
        gsap.delayedCall(0.35 + i * 0.24, () => {
          flipUp(line, { per: 0.016, cycles: 2 });
        });
      });

      gsap.from('[data-hero-in]', {
        y: 14,
        autoAlpha: 0,
        duration: 0.7,
        stagger: 0.07,
        ease: 'power2.out',
        delay: 0.2,
      });

      gsap.from('[data-run-cell]', {
        y: 10,
        autoAlpha: 0,
        duration: 0.55,
        stagger: 0.06,
        ease: 'power2.out',
        delay: 1.0,
      });

      /* The departures rail stays alive: one cell re-flips every few seconds
         — code clacks, name scrambles through the same cycle scripts, status
         crossfades — and the cell holds the phosphor before cooling. Gated on
         the hero being on screen and the tab being visible, and the first
         turn is held long enough that a fresh page never reads mid-flip. */
      const heroOn = ScrollTrigger.create({ trigger: scope, start: 'top bottom', end: 'bottom top' });
      const cells = gsap.utils.toArray<HTMLElement>('[data-run-cell]', scope);
      const live: Departure[] = RUN_OPEN.map((item) => ({ ...item }));
      const queue: Departure[] = RUN_POOL.map((item) => ({ ...item }));
      let cursor = 2; // start mid-row so the first flip is not the corner cell
      /* The re-scheduling delayedCalls are created after this context has
         finished recording, so they outlive its revert — the alive latch is
         what actually stops the loop on unmount. */
      let alive = true;

      const rotate = () => {
        if (!alive) return;
        gsap.delayedCall(7.2, rotate);
        if (document.hidden || !heroOn.isActive) return;
        const idx = cursor % cells.length;
        cursor += 1;
        const cell = cells[idx];
        const next = queue.shift();
        const prev = live[idx];
        if (!cell || !next || !prev) return;
        queue.push(prev);
        live[idx] = next;

        const line = cell.querySelector<HTMLElement>('[data-tb-line]');
        const name = cell.querySelector<HTMLElement>('[data-run-name]');
        const status = cell.querySelector<HTMLElement>('[data-run-status]');
        const sr = cell.querySelector<HTMLElement>('[data-run-sr]');
        if (!line || !name || !status) return;

        retarget(line, next.code);
        flipUp(line, { per: 0.055, cycles: 2 });
        gsap.to(name, {
          duration: 0.6,
          ease: 'none',
          /* the same multi-script inventory the flap engine riffles through,
             so both mechanics read as one machine */
          scrambleText: { text: next.name, chars: CYCLE, speed: 0.7 },
        });
        gsap
          .timeline()
          .to(status, {
            autoAlpha: 0,
            duration: 0.16,
            ease: 'power1.in',
            onComplete: () => {
              status.textContent = next.status;
            },
          })
          .to(status, { autoAlpha: 1, duration: 0.28, ease: 'power1.out' });
        if (sr) sr.textContent = `${next.code} ${next.name} — ${next.status}`;

        cell.classList.add('is-live');
        gsap.delayedCall(2.6, () => cell.classList.remove('is-live'));
      };
      gsap.delayedCall(6.4, rotate);

      return () => {
        alive = false;
      };
    },
    { scope: root }
  );

  return (
    <section className='tc-sec' id='top' ref={root}>
      <div className='tb-hero'>
        <BoardField className='tb-hero-field' gapRef={core} maskRefs={[run]} />

        <div className='tb-hero-in'>
          <div className='tb-hero-core' ref={core}>
            <Image
              className='tb-hero-mark'
              data-hero-in
              src='/brand/no-bg-gt-logo-light.png'
              alt='General Translation'
              width={34}
              height={34}
            />

            {/* The break is authored: the accented word opens line two, on the
                hinge of the sentence, and the riffle cascades through both
                lines while the ghosts hold the measure. */}
            <h1>
              <span className='tb-sr'>Launch in every language.</span>
              <span className='tb-line' data-tb-line aria-hidden>
                <FlapChars text='Launch in' />
              </span>
              <span className='tb-line' data-tb-line aria-hidden>
                <em>
                  <FlapChars text='every' />
                </em>{' '}
                <FlapChars text='language.' />
              </span>
            </h1>

            <p className='tb-hero-sub' data-hero-in>
              General Translation builds full-stack infrastructure for localizing apps, docs, and websites.
            </p>

            {/* the identity, held statically: one flap line is always ready
                to clack over to the next language, locale-stamped */}
            <NowBoarding />

            <div className='tb-hero-acts' data-hero-in>
              <a className='tc-btn tc-btn-solid' href='#pricing'>
                Get started
              </a>
              <a className='tc-btn tc-btn-line' href='#frameworks'>
                Docs
              </a>
              <button className='tc-copy' type='button' onClick={copy}>
                <span>$ npx gt@latest</span>
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* The departures rail: a paper strip standing on the hero's bottom
            rule — the waterline the board field runs beneath. */}
        <div className='tb-hero-run' ref={run}>
          <div className='tb-run-cap'>
            <span>Departures — 118 locales supported</span>
            <span>all on time</span>
          </div>
          <div className='tb-run-row'>
            {RUN_OPEN.map((item, i) => (
              <div className='tb-run-cell' data-run-cell key={`cell-${i}`}>
                <span className='tb-run-top' aria-hidden>
                  <span className='tb-tile' data-tb-line>
                    <FlapChars text={item.code} />
                  </span>
                  <span className='tb-run-name' data-run-name>
                    {item.name}
                  </span>
                </span>
                <span className='tb-run-status' data-run-status aria-hidden>
                  {item.status}
                </span>
                <span className='tb-sr' data-run-sr>
                  {`${item.code} ${item.name} — ${item.status}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className='tc-trust'>
        <p className='tc-trust-lead'>Trusted by the world&rsquo;s best companies</p>
        <div className='tc-trust-row'>
          {CUSTOMERS.map((customer) => (
            <span className='tc-trust-cell' key={customer.name}>
              <b className={`tc-wm ${customer.mark}`}>{customer.name}</b>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
