'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';

import FlowField from './FlowField';
import { useQuietReveal } from './reveal';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * M08 — the page's dark pivot band, owned by Locadex. The largest single
 * object on the site is a pull request: real unified diffs of app/page.tsx
 * and app/layout.tsx, full column width, flush to the side rules, with the
 * PR's own file tree in the rail. The safety argument lives
 * inside the artefact — "Auto-merge is off for this repository" is a line in
 * the checks panel, not marketing copy. Above the frame, the same ribbons
 * that opened the page cross the band as light: the two threads become the
 * removed and added lines of the diff below them.
 */

type DiffLine = { kind: 'hunk' | 'ctx' | 'del' | 'add'; text: string };

const PAGE_DIFF: readonly DiffLine[] = [
  { kind: 'hunk', text: '@@ -1,14 +1,17 @@' },
  { kind: 'del', text: "import { Num, DateTime } from 'next/intl-shim';" },
  { kind: 'add', text: "import { T, Num, DateTime } from 'gt-next';" },
  { kind: 'ctx', text: '' },
  { kind: 'ctx', text: 'export default function Home() {' },
  { kind: 'ctx', text: '  return (' },
  { kind: 'add', text: '    <T>' },
  { kind: 'ctx', text: '      <main>' },
  { kind: 'ctx', text: '        <h1>Hello, world!</h1>' },
  { kind: 'ctx', text: '        <p><DateTime>{new Date()}</DateTime></p>' },
  { kind: 'ctx', text: '        <p>' },
  { kind: 'ctx', text: '          General Translation builds full-stack' },
  { kind: 'ctx', text: '          infrastructure for localizing apps, docs,' },
  { kind: 'ctx', text: '          and websites.' },
  { kind: 'ctx', text: '        </p>' },
  { kind: 'ctx', text: '      </main>' },
  { kind: 'add', text: '    </T>' },
  { kind: 'ctx', text: '  );' },
  { kind: 'ctx', text: '}' },
];

/* The second file every setup PR touches: the provider goes around children
   and the html lang stops being hard-coded. Real gt-next, line for line. */
const LAYOUT_DIFF: readonly DiffLine[] = [
  { kind: 'hunk', text: '@@ -1,11 +1,15 @@' },
  { kind: 'add', text: "import { GTProvider } from 'gt-next';" },
  { kind: 'add', text: "import { getLocale } from 'gt-next/server';" },
  { kind: 'add', text: '' },
  { kind: 'del', text: 'export default function RootLayout({' },
  { kind: 'add', text: 'export default async function RootLayout({' },
  { kind: 'ctx', text: '  children,' },
  { kind: 'ctx', text: '}: { children: React.ReactNode }) {' },
  { kind: 'add', text: '  const locale = await getLocale();' },
  { kind: 'ctx', text: '  return (' },
  { kind: 'del', text: '    <html lang="en">' },
  { kind: 'add', text: '    <html lang={locale}>' },
  { kind: 'ctx', text: '      <body>' },
  { kind: 'del', text: '        {children}' },
  { kind: 'add', text: '        <GTProvider>{children}</GTProvider>' },
  { kind: 'ctx', text: '      </body>' },
  { kind: 'ctx', text: '    </html>' },
  { kind: 'ctx', text: '  );' },
  { kind: 'ctx', text: '}' },
];

/** Old/new line numbers, derived from line kinds so the gutter is honest. */
function numberDiff(lines: readonly DiffLine[]): { old: string; next: string; line: DiffLine }[] {
  let oldN = 1;
  let newN = 1;
  return lines.map((line) => {
    if (line.kind === 'hunk') return { old: '', next: '', line };
    if (line.kind === 'del') return { old: String(oldN++), next: '', line };
    if (line.kind === 'add') return { old: '', next: String(newN++), line };
    return { old: String(oldN++), next: String(newN++), line };
  });
}

const FILES: readonly { file: string; rows: ReturnType<typeof numberDiff> }[] = [
  { file: 'app/page.tsx', rows: numberDiff(PAGE_DIFF) },
  { file: 'app/layout.tsx', rows: numberDiff(LAYOUT_DIFF) },
];

/* The PR's own file tree — the rail beside the diff, the way the Files
   changed view actually furnishes it. */
const FILE_TREE: readonly { path: string; add: number; del: number; here?: boolean }[] = [
  { path: 'app/page.tsx', add: 9, del: 6, here: true },
  { path: 'app/layout.tsx', add: 7, del: 3, here: true },
  { path: 'app/about/page.tsx', add: 11, del: 8 },
  { path: 'components/Nav.tsx', add: 6, del: 4 },
  { path: 'gt.config.json', add: 12, del: 0 },
];

const STEPS: readonly { name: string; body: string }[] = [
  { name: 'Push to repo', body: 'A commit or PR triggers the workflow' },
  { name: 'Scan codebase', body: 'Agent maps out what has changed' },
  { name: 'Edit code', body: 'Agent internationalizes code and strings' },
  { name: 'Translate content', body: 'Agent creates translations in context' },
  { name: 'Open PR', body: 'Pull request created for review' },
];

const TEMPLATES: readonly { name: string; trigger: string }[] = [
  { name: 'Generate code', trigger: 'A pull request changes' },
  { name: 'Generate translations and push', trigger: 'A commit is pushed' },
  { name: 'Keep locales in sync', trigger: 'Started manually' },
];

const GUARANTEES = [
  'Every change arrives as a reviewable PR on locadex/',
  'Auto-merge is off by default',
  'Setup is its own PR, and you merge it first',
  'Next.js, Mintlify, Fern, Docusaurus, Vite, React Router and TanStack Start',
];

const CHECKS = ['build', 'typecheck', 'gt validate'] as const;

export default function LocadexBand() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const frame = root.current?.querySelector('[data-pr]');
      if (!frame) return;

      /* One-shot on entry, never again: added lines land, the counter counts,
         the checks resolve. Nothing loops — a PR is a fact, not a show. */
      ScrollTrigger.create({
        trigger: frame,
        start: 'top 78%',
        once: true,
        onEnter: () => {
          gsap.from('[data-diff-add]', {
            autoAlpha: 0,
            y: 5,
            duration: 0.18,
            stagger: 0.18,
            ease: 'power1.out',
          });

          const counter = root.current?.querySelector('[data-pr-count]');
          if (counter) {
            const state = { n: 0 };
            gsap.to(state, {
              n: 47,
              duration: 0.9,
              ease: 'power1.out',
              onUpdate: () => {
                counter.textContent = String(Math.round(state.n));
              },
            });
          }

          gsap.from('[data-check]', {
            autoAlpha: 0,
            duration: 0.22,
            stagger: 0.22,
            delay: 0.5,
            ease: 'none',
          });
        },
      });
    },
    { scope: root }
  );

  return (
    <section className='tc-band' id='locadex' ref={root}>
      {/* The ribbons cross the dark band as light — same field, inverted. */}
      <FlowField
        className='cf-lb-field'
        speed={0.7}
        params={{
          spacing: 22,
          amp: 1.9,
          drift: 0.4,
          chroma: 0.8,
          chromaLocal: 0,
          inkAlpha: 0.4,
          ink: [0.78, 0.8, 0.88],
          paper: [0.047, 0.055, 0.067],
        }}
      />

      <div className='tc-band-in'>
        <div className='cf-lb-top'>
          <div>
            <h2 data-reveal>Connect a repo. Get a pull request.</h2>
            <p className='tc-band-sub' data-reveal>
              Locadex reads your codebase, writes the internationalization, generates the
              translations, and opens a PR you review.
            </p>
            <ul className='cf-lb-marks' data-reveal>
              {GUARANTEES.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className='tc-band-acts' data-reveal>
              <a className='tc-btn tc-btn-solid' href='#pricing'>
                Connect GitHub
              </a>
              <a className='tc-btn tc-btn-line' href='#frameworks'>
                Read the docs
              </a>
            </div>
          </div>

          <div className='cf-lb-steps' data-reveal>
            <ol>
              {STEPS.map((step) => (
                <li key={step.name}>
                  <b>{step.name}</b>
                  <span>{step.body}</span>
                </li>
              ))}
            </ol>
            <div className='cf-lb-templates'>
              {TEMPLATES.map((template) => (
                <div key={template.name}>
                  <b>{template.name}</b>
                  <span>{template.trigger}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* The PR, at full width — flush to both side rules. */}
        <div className='cf-pr' data-pr data-reveal>
          <div className='cf-pr-head'>
            <div className='cf-pr-title'>
              <h3>Internationalize app/ with gt-next</h3>
              <span className='cf-pr-state'>Open</span>
            </div>
            <div className='cf-pr-meta'>
              <span className='cf-pr-branch'>locadex/generate-code</span>
              <span className='cf-pr-into'>→</span>
              <span className='cf-pr-branch'>main</span>
              <span className='cf-pr-stat'>
                <b data-pr-count>47</b> files changed · <i className='is-add'>+612</i>{' '}
                <i className='is-del'>−318</i>
              </span>
            </div>
            <div className='cf-pr-tabs'>
              <span>Conversation</span>
              <span>Commits</span>
              <span data-on>Files changed 47</span>
            </div>
          </div>

          <div className='cf-pr-body'>
            <div className='cf-pr-file'>
              {FILES.map(({ file, rows }) => (
                <div key={file}>
                  <div className='cf-pr-filebar'>{file}</div>
                  <div className='cf-diff'>
                    {rows.map(({ old, next, line }, i) => (
                      <div
                        key={i}
                        className='cf-diff-line'
                        data-kind={line.kind}
                        data-diff-add={line.kind === 'add' ? true : undefined}
                      >
                        <span className='cf-diff-n'>{old}</span>
                        <span className='cf-diff-n'>{next}</span>
                        <span className='cf-diff-sign'>
                          {line.kind === 'add' ? '+' : line.kind === 'del' ? '−' : ' '}
                        </span>
                        <code>{line.text.length === 0 ? ' ' : line.text}</code>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <aside className='cf-pr-checks'>
              <div className='cf-pr-checks-head'>Checks</div>
              {CHECKS.map((check) => (
                <div className='cf-pr-check' data-check key={check}>
                  <i aria-hidden>✓</i>
                  <span>{check}</span>
                </div>
              ))}

              {/* The Files changed rail, so the right column carries the same
                  density the diff does — real paths, real counts. */}
              <div className='cf-pr-tree'>
                <div className='cf-pr-checks-head'>Files</div>
                {FILE_TREE.map((row) => (
                  <div className='cf-pr-tree-row' data-here={row.here} key={row.path}>
                    <span>{row.path}</span>
                    <b>
                      <i className='is-add'>+{row.add}</i> <i className='is-del'>−{row.del}</i>
                    </b>
                  </div>
                ))}
                <div className='cf-pr-tree-more'>… 42 more files</div>
              </div>

              <p className='cf-pr-note'>Auto-merge is off for this repository</p>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
