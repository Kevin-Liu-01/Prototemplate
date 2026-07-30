'use client';

import { LayoutDashboard } from 'lucide-react';
import { useRef } from 'react';

import { useQuietReveal } from './reveal';

/**
 * The context cell's artifact: the gt.config.json from the gt next-ssg
 * example, verbatim — the same file the hero's caption and the ledger's five
 * locale rows are read from. The locales line is the hot one: it is the
 * ledger to its left, stated as config.
 */
const CONFIG: readonly { text: string; hot?: boolean }[] = [
  { text: '{' },
  { text: '  "defaultLocale": "en",' },
  { text: '  "locales": ["es", "fr", "ja", "de", "zh"],', hot: true },
  { text: '  "files": {' },
  { text: '    "gt": { "output": "public/_gt/[locale].json" }' },
  { text: '  }' },
  { text: '}' },
];

/**
 * The dashboard as a ledger: one project, every locale, its live version and
 * review debt. The numbers here are the same facts the dark band's `gt status`
 * transcript states — 128 strings, v214 at the edge, PR #218 — told once as a
 * machine account and once as the surface you'd actually work in.
 */
const LOCALES: readonly {
  tag: string;
  name: string;
  done: string;
  pct: number;
  state: string;
  review?: boolean;
}[] = [
  { tag: 'en', name: 'English', done: '128 keys', pct: 100, state: 'source' },
  { tag: 'es', name: 'Español', done: '128 / 128', pct: 100, state: 'live · v214' },
  { tag: 'fr', name: 'Français', done: '128 / 128', pct: 100, state: 'live · v214' },
  { tag: 'ja', name: '日本語', done: '126 / 128', pct: 98.4, state: '2 in review', review: true },
  { tag: 'de', name: 'Deutsch', done: '128 / 128', pct: 100, state: 'live · v214' },
  { tag: 'zh', name: '中文', done: '128 / 128', pct: 100, state: 'live · v214' },
];

export default function Platform() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-sec' id='platform' ref={root}>
      <div className='tc-head'>
        <LayoutDashboard className='tc-head-icon' strokeWidth={1} aria-hidden />
        <h2 data-reveal>One dashboard holds the context.</h2>
        <p data-reveal>
          Curate glossaries, style rules, and project context — with editing, versioning, and
          integrations under one project, one config, and one bill.
        </p>
      </div>

      <div className='tc-row is-wide-left'>
        {/* The dashboard is a ledger: ink marks on the card surface, a filled
            gauge per locale — the one open row (ja) is the only gap in the
            ink. (The ledger beige retired with the founder batch: NO CREAM.) */}
        <div className='tc-cell is-tall is-framed' data-reveal>
          <div className='tc-card'>
            <div className='ap-led'>
              <div className='ap-led-bar'>
                <span className='ap-led-proj'>acme/web</span>
                <span className='ap-led-meta'>6 locales · 128 strings</span>
              </div>

              <div className='ap-led-head'>
                <span>Locale</span>
                <span>Translated</span>
                <span>State</span>
              </div>

              {LOCALES.map((row) => (
                <div className='ap-led-row' data-review={row.review || undefined} key={row.tag}>
                  <span className='ap-led-loc'>
                    <b>{row.tag}</b>
                    {row.name}
                  </span>
                  <span className='ap-led-done'>
                    <i className='ap-led-gauge' aria-hidden>
                      <b style={{ width: `${row.pct}%` }} />
                    </i>
                    {row.done}
                  </span>
                  <span className='ap-led-state'>{row.state}</span>
                </div>
              ))}

              <div className='ap-led-int'>
                <span>
                  <b>GitHub</b>PR #218 merged · +38 −6
                </span>
                <span>
                  <b>CDN</b>v214 · fra · 12 ms
                </span>
                <span>
                  <b>Locadex</b>last run 41 min ago
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className='tc-cell is-tall' data-reveal>
          <h3>The context platform</h3>
          <p>
            Everything the agents read before they write: your glossary, your locale rules, your project
            files — versioned, assignable, and shared across projects.
          </p>
          <ul className='tc-list'>
            <li>Glossaries and per-locale style rules</li>
            <li>Every source version restorable, tagged from the CLI</li>
            <li>GitHub, Google Drive, Mintlify, Sanity and Storyblok</li>
            <li>Over-the-air updates without a redeploy</li>
          </ul>

          {/* The cell's proof object: the config is the ledger, stated as a
              file — the five locales in the hot line are the five rows on
              the left, and the output path is the hero caption's file. */}
          <div className='ap-cfg' data-reveal>
            <div className='ap-cfg-bar'>
              <span>gt.config.json</span>
              <span>checked into acme/web</span>
            </div>
            <pre>
              {CONFIG.map((line, i) => (
                <div className='ap-cfg-line' data-hot={line.hot || undefined} key={i}>
                  {line.text}
                </div>
              ))}
            </pre>
          </div>

          <div className='tc-cell-act'>
            <a className='tc-btn tc-btn-line tc-btn-sm' href='#context'>
              See how context works
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
