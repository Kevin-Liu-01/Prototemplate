'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

import { ArrowRight } from 'lucide-react';
import { useRef, useState } from 'react';

import LocaleTag from '@/app/d/toolchain/components/LocaleTag';
import HeroFieldSwitcher from '@/components/shared/HeroFieldSwitcher';
import { startEveryMorph } from '@/app/d/toolchain/sections/every-morph';
import { pauseWhileHidden } from '@/app/d/toolchain/sections/visibility';

import '@/app/d/toolchain/sections/chip-consistency.css';
import '@/app/d/toolchain/sections/hero-every.css';
import '@/app/d/toolchain/sections/hero-terminal.css';

gsap.registerPlugin(useGSAP);

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

/* ------------------------------------------------------------------
   The gt CLI session, split into cause and effect: ONE window, TWO
   panes. The session pane holds what you type — the wizard command,
   its answers, `gt translate` — and the output pane holds what the
   machine does: the scan, per-string translations landing with their
   locale chips, the public/_gt write, the timing. Every string below
   is real — sources are the site's own UI copy; translations are
   verbatim from the landing demo's shipped table (es / fr / ja / de /
   zh). 128 strings × 5 locales = 640.
   ------------------------------------------------------------------ */

/** The wizard's summary block: detection, source, locale set, files written.
    `src` renders the page's one locale chip like `locs` does — the source is
    a locale token too, so it speaks the same flag+code grammar as the
    targets, in the plate's quieter neutral voice. */
const WIZARD: readonly { key: string; text?: string; src?: string; locs?: readonly string[] }[] = [
  { key: 'Detected', text: 'Next.js · App Router' },
  { key: 'Source', src: 'en' },
  { key: 'Locales', locs: ['es', 'fr', 'ja', 'de', 'zh'] },
  { key: 'Wrote', text: 'gt.config.json · .env.local' },
];

type Variant = { loc: string; text: string };

/** One translated cell; more than one variant means the cell cycles the long tail. */
type Cell = readonly Variant[];

type Row = { src: string; cells: readonly Cell[] };

const ROWS: readonly Row[] = [
  {
    src: '"Hello, world!"',
    cells: [
      [{ loc: 'es', text: '¡Hola, mundo!' }],
      [{ loc: 'ja', text: 'こんにちは、世界！' }],
      [
        { loc: 'de', text: 'Hallo, Welt!' },
        { loc: 'fr', text: 'Bonjour le monde !' },
        { loc: 'zh', text: '你好，世界！' },
      ],
    ],
  },
  {
    src: '"Get started"',
    cells: [
      [{ loc: 'es', text: 'Comenzar ahora' }],
      [{ loc: 'ja', text: '始める' }],
      [
        { loc: 'de', text: 'Jetzt starten' },
        { loc: 'fr', text: 'Commencer' },
        { loc: 'zh', text: '立即开始' },
      ],
    ],
  },
];

/** Command lines type in character by character; static DOM stays complete. */
function Cmd({ text, mark }: { text: string; mark: string }) {
  return (
    <div className='tct-line'>
      <span className='tct-dollar'>$ </span>
      <span className={`tct-type ${mark}`}>
        {[...text].map((ch, i) => (
          <span key={`c${i}`}>{ch}</span>
        ))}
      </span>
    </div>
  );
}

export default function HomeHero() {
  const root = useRef<HTMLElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        /* the DOM is complete without any tween: the still carries the whole
           finished run, both panes */
        return;
      }

      gsap.from('[data-hero-in]', {
        y: 14,
        autoAlpha: 0,
        duration: 0.7,
        stagger: 0.07,
        ease: 'power2.out',
      });

      /* ---- the terminal session replays ----
         The DOM is complete before any tween runs (every animation is a
         `from`), so reduced motion and the no-JS still both show the whole
         finished transcript. The replay settles inside ~2.5s: any screenshot
         taken three seconds in reads as a finished run, completion line,
         timing and all. The session pane types; the output pane answers. */
      const counter = (sel: string, to: number, duration: number, decimals: number) => {
        const el = root.current?.querySelector<HTMLElement>(sel);
        if (!el) return gsap.to({}, { duration: 0 });
        const state = { v: 0 };
        el.textContent = (0).toFixed(decimals);
        return gsap.to(state, {
          v: to,
          duration,
          ease: 'power1.out',
          onUpdate: () => {
            el.textContent = state.v.toFixed(decimals);
          },
        });
      };

      /* One run, one clock: the ✓ timing here is the same 12.4s the Content
         section's terminal reports for this exact 640-translation run. */
      const run = gsap.timeline({ delay: 0.25, defaults: { ease: 'none' } });
      run
        .from('.tct-cmd1 span', { autoAlpha: 0, duration: 0.01, stagger: 0.012 })
        .from('[data-tw]', { autoAlpha: 0, duration: 0.16, stagger: 0.07 }, '+=0.06')
        .from('.tct-cmd2 span', { autoAlpha: 0, duration: 0.01, stagger: 0.012 }, '+=0.07')
        .from('[data-ts]', { autoAlpha: 0, duration: 0.16, stagger: 0.09 }, '+=0.06')
        .add(counter('[data-count-scan]', 128, 0.4, 0), '<')
        .from('[data-tr-src]', { autoAlpha: 0, duration: 0.14, stagger: 0.06 }, '+=0.05')
        .from('.tct-cell', { autoAlpha: 0, y: 5, duration: 0.22, ease: 'power1.out', stagger: 0.05 }, '<+=0.08')
        .from('[data-td]', { autoAlpha: 0, duration: 0.16, stagger: 0.09 }, '+=0.06')
        .add(counter('[data-count-time]', 12.4, 0.4, 1), '<');

      /* ---- the long tail keeps arriving ----
         Both cycling cells advance IN STEP — one heartbeat for the whole
         column, de → fr → zh: the outgoing variants are fully gone before
         the incoming pair lands. */
      const cycCells = gsap.utils.toArray<HTMLElement>('.tct-cyc', root.current);
      const cycGroups = cycCells.map((cell) => gsap.utils.toArray<HTMLElement>('[data-cyc]', cell));
      const steps = cycGroups[0]?.length ?? 0;
      if (steps > 1) {
        const cyc = gsap.timeline({ repeat: -1, delay: run.duration() + 2.2 });
        for (let i = 0; i < steps; i += 1) {
          const going = cycGroups.map((g) => g[i]).filter((el): el is HTMLElement => Boolean(el));
          const coming = cycGroups.map((g) => g[(i + 1) % steps]).filter((el): el is HTMLElement => Boolean(el));
          cyc
            .to(going, { autoAlpha: 0, duration: 0.24, ease: 'power1.in' }, '+=2.7')
            .to(coming, { autoAlpha: 1, duration: 0.28, ease: 'power1.out' }, '>');
        }
        /* the cycle holds still while the hero is off screen */
        if (root.current) pauseWhileHidden(root.current, [cyc]);
      }

      /* The headline hinge (every-morph.ts): the word after "every" cycles
         through eight scripts while the hero is on screen. */
      const em = root.current?.querySelector<HTMLElement>('[data-every]');
      const word = root.current?.querySelector<HTMLElement>('[data-every-word]');
      if (!em || !word) return undefined;
      return startEveryMorph(em, word, {
        firstDelay: 1.8,
        compactFirstDelay: 1.8,
        baseline: 'alphabetic',
        scatter: { top: 0.04, bottom: 0.4, centre: 0.22 },
      });
    },
    { scope: root }
  );

  return (
    <section className='tc-sec tch-hero-sec' id='top' ref={root}>
      {/* The founder's stack: a genuine white card — radius 12, hairline edge,
          inset on the section's second-surface ground — above the SQUARE
          full-width band; the trust row repeats the card below it. */}
      <div className='tc-hero tch-card'>
        {/* Two authored lines rather than a wrap: "Launch in / every language."
            The accented word opens line two, on the hinge of the sentence. */}

        <h1 data-hero-in>
          <span>
            Launch in every{' '}
            <em data-every>
              <span data-every-word lang='en' dir='ltr'>
                language
              </span>
            </em>
            .
          </span>
        </h1>

        <p className='tc-hero-sub' data-hero-in>
          <img alt='General Translation' className='tch-sub-mark is-light' src='/brand/no-bg-gt-logo-light-96.png' width={96} height={96} /><img alt='' aria-hidden className='tch-sub-mark is-dark' src='/brand/no-bg-gt-logo-dark-96.png' width={96} height={96} /> builds full-stack infrastructure for localizing apps, docs, and websites.
        </p>

        <div className='tc-hero-acts' data-hero-in>
          <span className='tch-cta'>
            <a className='tc-btn tc-btn-solid' href='#deploy'>
              Get started
              <ArrowRight aria-hidden size={15} strokeWidth={2} />
            </a>
          </span>
          <a className='tc-btn tc-btn-line' href='https://generaltranslation.com/docs' rel='noreferrer' target='_blank'>
            Docs
          </a>
        </div>
      </div>

      {/* The first viewport commits to a material the way the references do:
          the terminal band is a dark plate washed with the prismatic field —
          lit at the flanks, dark in the centre column where the transcript
          sits. The band itself stays square and full-width; only the window
          inside it keeps the measured top corners and ring. exposureScale is
          raised (= dimmer) so the flanks wash rather than saturate. */}
      <div className='tc-hero-cell tch-band'>
        {/* the band's field + the founder's review ladder: the ten-slot
            Bayer family, default 01 = the picked bayer flow */}
        <HeroFieldSwitcher />
        <div className='tct-win' data-hero-in>
          <div className='tct-bar'>
            <span className='tct-title'>gt — translate</span>
            {/* one face, two panes: the labels are captions, not controls */}
            <div className='sgsh-panes' aria-hidden='true'>
              <span>session</span>
              <span>output</span>
            </div>
          </div>

          <div className='tct-stage sgsh-split'>
            {/* left — what you type */}
            <div className='tct-body sgsh-pane is-session'>
              <Cmd text='npx gt@latest' mark='tct-cmd1' />
              <div className='tct-gap' />
              {WIZARD.map((line) => (
                <div className='tct-line' data-tw key={line.key}>
                  <span className='tct-key'>{`  ${line.key.padEnd(11)}`}</span>
                  {line.locs ? (
                    <span className='tct-locset'>
                      {line.locs.map((loc) => (
                        <i className='tct-chip' key={loc}>
                          <LocaleTag code={loc} />
                        </i>
                      ))}
                    </span>
                  ) : line.src ? (
                    <span className='tct-locset'>
                      <i className='tct-chip is-src'>
                        <LocaleTag code={line.src} />
                      </i>
                    </span>
                  ) : (
                    line.text
                  )}
                </div>
              ))}
              <div className='tct-gap' />

              <Cmd text='npx gt translate' mark='tct-cmd2' />

              <div className='tct-gap' />
              {/* the idle prompt holds the session's floor */}
              <div className='tct-line sgsh-idle' data-td>
                <span className='tct-dollar'>$ </span>
                <span className='tct-caret' />
              </div>
            </div>

            {/* right — what the machine does */}
            <div className='tct-body sgsh-pane is-output'>
              <div className='tct-line tct-meta' data-ts>
                {'  Scanning src — '}
                <b className='tct-strong' data-count-scan>
                  128
                </b>
                {' strings found'}
              </div>
              <div className='tct-line tct-meta' data-ts>
                {'  Translating with project context'}
              </div>
              <div className='tct-gap' />

              <div className='tct-table'>
                {ROWS.map((row) => (
                  <div className='tct-row' key={row.src}>
                    <span className='tct-src' data-tr-src>
                      {row.src}
                    </span>
                    {row.cells.map((cell, c) => {
                      const only = cell.length === 1 ? cell[0] : undefined;
                      return only ? (
                        <span className='tct-cell' key={only.loc}>
                          <i className='tct-chip'>
                            <LocaleTag code={only.loc} />
                          </i>
                          <b className='tct-tr'>{only.text}</b>
                        </span>
                      ) : (
                        <span className='tct-cell tct-cyc' key={`cyc${c}`}>
                          {cell.map((v, i) => (
                            <span data-cyc key={v.loc} style={{ opacity: i === 0 ? 1 : 0 }}>
                              <i className='tct-chip'>
                                <LocaleTag code={v.loc} />
                              </i>
                              <b className='tct-tr'>{v.text}</b>
                            </span>
                          ))}
                        </span>
                      );
                    })}
                  </div>
                ))}
              </div>
              <div className='tct-gap' />

              <div className='tct-line tct-meta' data-td>
                {'  Wrote public/_gt/'}
                <span className='tct-glob'>{'{es,fr,ja,de,zh}'}</span>
                {'.json'}
              </div>
              <div className='tct-line tct-meta' data-td>
                {'  '}
                <span className='tct-ok'>✓</span>
                {' '}
                <b className='tct-strong'>640</b>
                {' translations · 5 locales · '}
                <span className='tct-ok'>
                  <b data-count-time>12.4</b>s
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='tc-trust tch-trustcard'>
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
