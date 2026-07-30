'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Waypoints } from 'lucide-react';
import { useRef, useState } from 'react';

import LocaleTag from '@/app/d/toolchain/components/LocaleTag';

import { useQuietReveal } from './reveal';

/**
 * M05 — the six-station rail. The whole pipeline stated once, in order, so
 * every section below reads as a stage of one journey rather than a feature.
 * The rail itself is the doubled thread; between Ship and Update it turns
 * dashed, because Update is the only station that happens after your build
 * has shipped. Beneath the six sentences the whole strip lands on one dark
 * surface — the ledger — where each station shows its real artifact in
 * white mono: the code, the scan, the strings, the review rows, the shipped
 * paths, the live URL. A single dot walks the rail at the product's own
 * cadence (~1.2s per station) and lights the ledger cell it stands over.
 */

type Station = {
  name: string;
  line: string;
  /** Where in the toolchain this stage physically lives. */
  at: string;
};

const STATIONS: readonly Station[] = [
  {
    name: 'Write',
    line: 'JSX goes in <T>, strings go through gt(). Nothing is extracted.',
    at: 'app/page.tsx',
  },
  {
    name: 'Scan',
    line: 'npx gt translate reads your source and finds only what changed.',
    at: '$ npx gt translate',
  },
  {
    name: 'Translate',
    line: 'New content is sent. Local edits are preserved. --force is opt-in.',
    at: 'gt.config.json',
  },
  {
    name: 'Review',
    line: 'Approve per entry and per locale in the editor, or let it ship.',
    at: 'dashboard/editor',
  },
  {
    name: 'Ship',
    line: 'Translations land in public/_gt/[locale].json and you commit them.',
    at: 'git',
  },
  {
    name: 'Update',
    line: 'Fix a string in the dashboard and the CDN serves it without a deploy.',
    at: 'edge',
  },
];

const LOCALE_CHIPS = ['es', 'fr', 'ja', 'de', 'zh'] as const;

/* Real per-locale review rows: the next-ssg example's own h1, from
   public/_gt/{es,ja,de}.json — the same entry the Develop card types.
   The CSS ellipsizes them the way the dashboard's own table would. */
const REVIEW_ROWS: readonly { locale: string; text: string; state: 'ok' | 'wait' }[] = [
  { locale: 'es', text: 'Para comenzar, edita el archivo page.tsx.', state: 'ok' },
  { locale: 'ja', text: '開始するには、page.tsxファイルを編集してください。', state: 'ok' },
  { locale: 'de', text: 'Um zu beginnen, bearbeiten Sie die Datei page.tsx.', state: 'wait' },
];

/** The station's artifact, drawn in ink-on-dark — never a silhouette. */
function StationArt({ index }: { index: number }) {
  switch (index) {
    case 0:
      return (
        <div className='cf-lg-code'>
          <span className='is-hot'>{'<T>'}</span>
          <span>{'  <h1>'}</span>
          <span>{'    Hello, world!'}</span>
          <span>{'  </h1>'}</span>
          <span className='is-hot'>{'</T>'}</span>
        </div>
      );
    case 1:
      return (
        <div className='cf-lg-code is-scan'>
          <span>{'const gt = useGT();'}</span>
          <span>{"gt('Payment received')"}</span>
          <span>{"gt('Get started')"}</span>
          <span className='is-dim'>{'— 2 changed'}</span>
          <i className='cf-lg-scanline' aria-hidden />
        </div>
      );
    case 2:
      return (
        <div className='cf-lg-code'>
          <div className='cf-lg-chips'>
            {LOCALE_CHIPS.map((locale, i) => (
              <span data-fill={i < 3} key={locale}>
                <LocaleTag code={locale} />
              </span>
            ))}
          </div>
          <span className='is-dim'>{'"Payment received"'}</span>
          <span>{'→ "Pago recibido"'}</span>
        </div>
      );
    case 3:
      return (
        <div className='cf-lg-review'>
          {REVIEW_ROWS.map((row) => (
            <div key={row.locale}>
              <i>{row.locale}</i>
              <span>{row.text}</span>
              <b data-state={row.state}>{row.state === 'ok' ? '✓' : '·'}</b>
            </div>
          ))}
        </div>
      );
    case 4:
      return (
        <div className='cf-lg-code'>
          <span>{'public/_gt/ja.json'}</span>
          <span className='is-dim'>{'public/_gt/es.json'}</span>
          <span className='is-dim'>{'public/_gt/de.json'}</span>
          <span>{'+ 3 files committed'}</span>
        </div>
      );
    default:
      return (
        <div className='cf-lg-code'>
          <span className='cf-lg-url'>example.com/ja</span>
          <span>{'GET 200 · 38 ms'}</span>
          <span className='cf-lg-live'>no deploy</span>
        </div>
      );
  }
}

export default function PipelineRail() {
  const root = useRef<HTMLElement>(null);
  /* Reduced motion parks the dot at Translate — the canonical still. */
  const [active, setActive] = useState(2);

  useQuietReveal(root);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const dot = root.current?.querySelector<HTMLElement>('[data-rail-dot]');
      if (!dot) return;

      /* 1.2s per station: travel 0.45s, dwell 0.75s — LocadexFlowchart's own
         cadence, so the rail already feels like the product. */
      gsap.set(dot, { left: `${100 / 12}%` });
      setActive(0);
      const timeline = gsap.timeline({ repeat: -1, delay: 0.9 });
      STATIONS.forEach((_, i) => {
        if (i > 0) {
          timeline.to(dot, {
            left: `${((i * 2 + 1) * 100) / 12}%`,
            duration: 0.45,
            ease: 'power2.inOut',
          });
        }
        timeline.call(() => setActive(i)).to({}, { duration: 0.75 });
      });
      /* Close the loop: walk back to station one before repeating. */
      timeline.to(dot, { left: `${100 / 12}%`, duration: 0.45, ease: 'power2.inOut' });
    },
    { scope: root }
  );

  return (
    <section className='tc-sec' id='pipeline' ref={root}>
      <div className='tc-head'>
        <Waypoints className='tc-head-icon' strokeWidth={1} aria-hidden />
        <h2 data-reveal>Ship it the way you wrote it.</h2>
        <p data-reveal>
          Source in your repo, translations in your repo, review in the dashboard, delivery at the
          edge.
        </p>
      </div>

      <div className='cf-rail' data-reveal>
        <i className='cf-rail-dot' data-rail-dot aria-hidden />
        {STATIONS.map((station, i) => (
          <div
            className='cf-station'
            data-on={i === active}
            data-last={i === STATIONS.length - 1}
            key={station.name}
          >
            <i className='cf-station-tick' aria-hidden />
            <h3>{station.name}</h3>
            <p>{station.line}</p>
          </div>
        ))}
      </div>

      {/* The ledger: one dark surface under all six stations, flush to the
          side rules and to the section's bottom rule. */}
      <div className='cf-ledger' data-reveal>
        {STATIONS.map((station, i) => (
          <div className='cf-ledger-cell' data-on={i === active} key={station.name}>
            <span className='cf-lg-at'>{station.at}</span>
            <StationArt index={i} />
          </div>
        ))}
      </div>
    </section>
  );
}
