'use client';

import { BookMarked } from 'lucide-react';
import { useRef } from 'react';

import LocaleTag from '../components/LocaleTag';
import { useQuietReveal } from '../sections/reveal';

import GovernedColumn from './GovernedColumn';

/**
 * Governance: one Context Group at the organization, and the difference it
 * makes. The glossary and directive strings are the docs' own examples —
 * "Locadex is the GT agent. This product name should never be translated." /
 * "Use active voice, avoid jargon, and use formal 'Sie.'" — and the
 * before/after cell draws the struck-through wrong answer the way the
 * feature inventory asks: wrong side struck, right side held by weight.
 */
export default function Governance() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-sec' id='governance' ref={root}>
      <div className='tc-head'>
        <BookMarked className='tc-head-icon' strokeWidth={1} aria-hidden />
        <h2 data-reveal>Terminology, decided once.</h2>
        <p data-reveal>
          Context Groups hold your glossary and style directives at the organization; every
          assigned project inherits them, and on overlap the top group wins.
        </p>
      </div>

      <div className='tc-row is-wide-left'>
        <div className='tc-cell is-framed' data-reveal>
          <div className='tc-card'>
            <h3>One group, every project</h3>
            <p>
              Glossary and directives live at org level and are assigned across projects — Apply
              pushes a change through existing translations.
            </p>
            <div className='tce-group'>
              <div className='tce-group-bar'>
                <b>brand-core</b>
                <span>organization group</span>
                <span className='tce-group-pri'>priority 1 · top group wins</span>
              </div>
              <div className='tce-group-sec'>glossary</div>
              <div className='tce-grow'>
                <b>Locadex</b>
                <span>do not translate</span>
              </div>
              <div className='tce-grow'>
                <b>Workflow</b>
                <span>
                  <i lang='es'>Flujo de trabajo</i> <LocaleTag code='es' /> ·{' '}
                  <i lang='ja'>ワークフロー</i> <LocaleTag code='ja' />
                </span>
              </div>
              <div className='tce-group-sec'>directives</div>
              <div className='tce-grow is-dir'>
                <span>Use formal &ldquo;Sie.&rdquo;</span>
                <LocaleTag code='de' />
              </div>
              <div className='tce-grow is-dir'>
                <span>Active voice, avoid jargon.</span>
              </div>
              <div className='tce-grow is-dir'>
                <span>Never translate product names.</span>
              </div>
              <div className='tce-group-sec'>assigned</div>
              <div className='tce-grow'>
                <b>acme/web · acme/docs · acme/api</b>
                <span>3 projects</span>
              </div>
            </div>
          </div>
        </div>

        <div className='tc-cell is-framed' data-reveal>
          <div className='tc-card'>
            <h3>The difference a directive makes</h3>
            <p>The same sentence with and without the group — context, not model roulette.</p>
            <div className='tce-ba'>
              <div className='tce-ba-src'>
                <LocaleTag code='en' />
                <span>Locadex opens the PR for your review.</span>
              </div>
              <div className='tce-ba-row is-off'>
                <span className='tce-ba-tag'>
                  without <LocaleTag code='de' />
                </span>
                <s lang='de'>Standort-Index öffnet die PR, damit du sie prüfst.</s>
              </div>
              <div className='tce-ba-row is-on'>
                <span className='tce-ba-tag'>
                  with brand-core <LocaleTag code='de' />
                </span>
                <b lang='de'>Locadex öffnet den PR zu Ihrer Prüfung.</b>
              </div>
              <p className='tce-ba-note'>
                &ldquo;Locadex is the GT agent. This product name should never be
                translated.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className='tc-hatch' aria-hidden='true' />

      {/* The governed column: the section's closer and the bridge into the
          review and delivery sections — the whole chain the page walks next,
          as one isometric instrument (founder ask). */}
      <GovernedColumn />
    </section>
  );
}
