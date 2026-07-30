'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';

import { useQuietReveal } from './reveal';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * M09 — the company's actual thesis, one wrong answer struck through. The
 * glossary and directive rows are the docs' own examples, verbatim; the two
 * German paragraphs are built on the real de.json sentence ("Um zu beginnen,
 * bearbeiten Sie die Datei page.tsx.") so the register contrast is real.
 */
export default function ContextGroups() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      /* One-shot: the strikethroughs draw, then the corrections underline.
         Almost nothing moves in a module about correctness. */
      gsap.utils.toArray<HTMLElement>('[data-strike]', root.current).forEach((el, i) => {
        gsap.fromTo(
          el,
          { backgroundSize: '0% 1px' },
          {
            backgroundSize: '100% 1px',
            duration: 0.34,
            delay: 0.2 + i * 0.12,
            ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 85%', once: true },
          }
        );
      });
      gsap.utils.toArray<HTMLElement>('[data-under]', root.current).forEach((el, i) => {
        gsap.fromTo(
          el,
          { backgroundSize: '0% 1.5px' },
          {
            backgroundSize: '100% 1.5px',
            duration: 0.34,
            delay: 0.44 + i * 0.12,
            ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 85%', once: true },
          }
        );
      });
    },
    { scope: root }
  );

  return (
    <section className='tc-sec' id='context' ref={root}>
      <div className='tc-head'>
        <h2 data-reveal>Say it once, and every translation obeys.</h2>
        <p data-reveal>
          A glossary and a set of directives, defined once at the organization level and assigned to
          every project.
        </p>
      </div>

      <div className='ap-ws-wrap' data-reveal>
        {/* The group is the organization's house style, so it reads as a
            document: the beige ledger sheet, six terms, five directives. */}
        <div className='tc-mount is-beige'>
          <div className='tc-card'>
            <div className='ap-ctx-group'>
              <div className='ap-ctx-col'>
                <p className='ap-ctx-h'>Glossary</p>
                <div className='ap-ctx-row'>
                  <b>Locadex</b>
                  <span>do not translate</span>
                </div>
                <div className='ap-ctx-row'>
                  <b>Context Group</b>
                  <span>do not translate</span>
                </div>
                <div className='ap-ctx-row'>
                  <b>General Translation</b>
                  <span>do not translate</span>
                </div>
                <div className='ap-ctx-row'>
                  <b>Workflow</b>
                  <span>Flujo de trabajo (es) · ワークフロー (ja)</span>
                </div>
                <div className='ap-ctx-row'>
                  <b>Glossary</b>
                  <span>Glosario (es) · 用語集 (ja)</span>
                </div>
                <div className='ap-ctx-row'>
                  <b>Review</b>
                  <span>Revisión (es) · レビュー (ja)</span>
                </div>
              </div>
              <div className='ap-ctx-col'>
                <p className='ap-ctx-h'>Directives</p>
                <div className='ap-ctx-row is-dir'>
                  <span>Use formal &ldquo;Sie&rdquo; (de)</span>
                </div>
                <div className='ap-ctx-row is-dir'>
                  <span>Active voice, avoid jargon</span>
                </div>
                <div className='ap-ctx-row is-dir'>
                  <span>Never translate product names</span>
                </div>
                <div className='ap-ctx-row is-dir'>
                  <span>
                    Keep <code className='tc-chip'>{'{variables}'}</code> and code verbatim
                  </span>
                </div>
                <div className='ap-ctx-row is-dir'>
                  <span>Local date formats — 29 juil. 2026 (fr)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='tc-row is-split ap-ctx-split'>
        <div className='tc-cell' data-reveal>
          <p className='ap-ctx-para' lang='de'>
            Um zu beginnen,{' '}
            <mark className='ap-wrong' data-strike>
              bearbeite deine
            </mark>{' '}
            page.tsx-Datei mit dem{' '}
            <mark className='ap-wrong' data-strike>
              Ortsindex
            </mark>
            .
          </p>
          <p className='ap-ctx-cap'>Without the group</p>

          <p className='ap-ctx-para is-after' lang='de'>
            Um zu beginnen,{' '}
            <mark className='ap-right' data-under>
              bearbeiten Sie
            </mark>{' '}
            <span className='ap-ctx-rule'>directive</span> Ihre page.tsx-Datei mit{' '}
            <mark className='ap-right' data-under>
              Locadex
            </mark>
            <span className='ap-ctx-rule'>glossary</span>.
          </p>
          <p className='ap-ctx-cap'>With the group</p>
        </div>

        {/* The same correction as the machine sees it: the de.json entry the
            Apply rewrote, its neighbours as context — the proof at file
            depth, not just at sentence depth. */}
        <div className='tc-cell' data-reveal>
          <div className='ap-diff is-ctx'>
            <div className='ap-diff-bar'>
              <span>Apply — 1 entry rewritten</span>
              <span>de</span>
            </div>
            <pre>
              <div className='ap-diff-line'>
                <span className='ap-diff-g'> </span>
                {'@@ public/_gt/de.json @@'}
              </div>
              <div className='ap-diff-line'>
                <span className='ap-diff-g'> </span>
                {'"5c19e2b4": "Dokumentation",'}
              </div>
              <div className='ap-diff-line' data-d='-'>
                <span className='ap-diff-g'>-</span>
                {'"9d47a3f1": "Um zu beginnen, bearbeite deine page.tsx-Datei mit dem Ortsindex.",'}
              </div>
              <div className='ap-diff-line' data-d='+'>
                <span className='ap-diff-g'>+</span>
                {'"9d47a3f1": "Um zu beginnen, bearbeiten Sie Ihre page.tsx-Datei mit Locadex.",'}
              </div>
              <div className='ap-diff-line'>
                <span className='ap-diff-g'> </span>
                {'"2e8b90cd": "Jetzt bereitstellen",'}
              </div>
              <div className='ap-diff-line'>
                <span className='ap-diff-g'> </span>
                {'"b31c7a55": "Erstellt mit Create Next App"'}
              </div>
            </pre>
          </div>
        </div>
      </div>

      <div className='ap-ctx-notes' data-reveal>
        <span>Context applies to new translations. Existing ones change when you press Apply.</span>
        <span>Groups can be autogenerated from your project files.</span>
      </div>
    </section>
  );
}
