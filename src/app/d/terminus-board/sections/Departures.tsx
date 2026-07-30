'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PlaneTakeoff } from 'lucide-react';
import { useRef } from 'react';

import { blankLine, flipUp } from '../lib/flap';
import FlapPhrase from './FlapPhrase';
import { FlapChars } from './FlapText';
import { useQuietReveal } from './reveal';

gsap.registerPlugin(useGSAP, ScrollTrigger);

type Row = {
  code: string;
  /** Native name — a real endonym, never machine-mangled text. */
  name: string;
  english: string;
  strings: string;
  cov: number;
  status: 'SHIPPED' | 'ON TIME' | 'BOARDING';
};

/*
 * One project's coverage restated as a timetable. The counts are consistent —
 * every locale measures against the same 1,284 source strings — and exactly
 * one row is BOARDING, so the section spends its amber once.
 */
const ROWS: readonly Row[] = [
  { code: 'ES', name: 'Español', english: 'Spanish', strings: '1,284 / 1,284', cov: 100, status: 'SHIPPED' },
  { code: 'FR', name: 'Français', english: 'French', strings: '1,284 / 1,284', cov: 100, status: 'SHIPPED' },
  { code: 'JA', name: '日本語', english: 'Japanese', strings: '1,284 / 1,284', cov: 100, status: 'SHIPPED' },
  { code: 'DE', name: 'Deutsch', english: 'German', strings: '1,271 / 1,284', cov: 99, status: 'ON TIME' },
  { code: 'ZH', name: '中文', english: 'Chinese', strings: '1,284 / 1,284', cov: 100, status: 'SHIPPED' },
  { code: 'KO', name: '한국어', english: 'Korean', strings: '1,262 / 1,284', cov: 98, status: 'ON TIME' },
  { code: 'PT', name: 'Português', english: 'Portuguese', strings: '1,284 / 1,284', cov: 100, status: 'SHIPPED' },
  { code: 'AR', name: 'العربية', english: 'Arabic', strings: '1,239 / 1,284', cov: 97, status: 'ON TIME' },
  { code: 'HI', name: 'हिन्दी', english: 'Hindi', strings: '1,284 / 1,284', cov: 100, status: 'SHIPPED' },
  { code: 'TR', name: 'Türkçe', english: 'Turkish', strings: '214 / 1,284', cov: 17, status: 'BOARDING' },
];

function rowTone(status: Row['status']): string {
  if (status === 'BOARDING') return ' is-boarding';
  if (status === 'ON TIME') return ' is-ontime';
  return '';
}

/**
 * The signature section: the dashboard's coverage view drawn as a departure
 * board. Ruled rows on one mounted card — locale cell pair, native name,
 * string count, coverage thread, called status. Statuses clack in when the
 * board scrolls up; reduced motion reads the settled SSR board.
 */
export default function Departures() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const scope = root.current;
      if (!scope) return;

      const lines = gsap.utils.toArray<HTMLElement>('[data-dep-status]', scope);
      const trigger = ScrollTrigger.create({
        trigger: scope.querySelector('[data-dep-board]'),
        start: 'top 82%',
        once: true,
        onEnter: () => {
          lines.forEach((line, i) => {
            blankLine(line);
            gsap.delayedCall(0.1 + i * 0.07, () => {
              flipUp(line, { per: 0.03, cycles: 2 });
            });
          });
        },
      });
      return () => trigger.kill();
    },
    { scope: root }
  );

  return (
    <section className='tc-sec' id='departures' ref={root}>
      <div className='tc-head'>
        <PlaneTakeoff className='tc-head-icon' strokeWidth={1} aria-hidden />
        <h2 data-reveal>
          Ship on schedule, <FlapPhrase text='in every locale.' />
        </h2>
        <p data-reveal>
          The dashboard tracks every locale like a departure: strings counted, coverage measured,
          status called. When Locadex lands a run, the row flips.
        </p>
      </div>

      <div className='tb-dep-wrap' data-reveal>
        <div className='tc-mount' data-dep-board>
          <div className='tc-card'>
            <div className='tb-dep-cap'>
              <span>
                Departures — <b>acme/web · production</b>
              </span>
              <span>gate GT-01</span>
            </div>

            <div className='tb-dep-row is-head' aria-hidden>
              <span>Locale</span>
              <span>Language</span>
              <span className='tb-dep-strings'>Strings</span>
              <span>Coverage</span>
              <span>Status</span>
            </div>

            {ROWS.map((row) => (
              <div className={`tb-dep-row${rowTone(row.status)}`} key={row.code}>
                <span className='tb-tile' aria-hidden>
                  <FlapChars text={row.code} />
                </span>
                <span className='tb-dep-name'>
                  {row.name}
                  <small>{row.english}</small>
                  <span className='tb-sr'>{row.code}</span>
                </span>
                <span className='tb-dep-strings'>{row.strings}</span>
                <span className='tb-dep-cov'>
                  <span className='tb-dep-track' aria-hidden>
                    <i style={{ width: `${row.cov}%` }} />
                  </span>
                  <span className='tb-dep-pct'>{row.cov}%</span>
                </span>
                <span className='tb-dep-status'>
                  <span data-dep-status data-tb-line aria-hidden>
                    <FlapChars text={row.status} />
                  </span>
                  <span className='tb-sr'>{row.status}</span>
                </span>
              </div>
            ))}

            <div className='tb-dep-foot'>
              <span>118 locales supported · 10 on the board</span>
              <span>updated 2 min ago</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
