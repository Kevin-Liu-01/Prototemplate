'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import { useRef } from 'react';

import { useQuietReveal } from '../sections/reveal';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** The doubled-gauge joint: two threads travelling together, never merging. */
function Joint() {
  return (
    <svg className='sgx-joint' viewBox='0 0 30 24' width={26} height={21} aria-hidden='true'>
      <path d='M0 10.5h20' />
      <path d='M0 13.5h20' />
      <path className='sgx-joint-head' d='M21 6.5L29 12L21 17.5Z' />
    </svg>
  );
}

/** Exhibit A — run #1184's file tree, counts per file, the sibling app skipped. */
const TREE: readonly { name: string; note: string; child?: boolean; dim?: boolean }[] = [
  { name: 'apps/web', note: 'target directory' },
  { name: 'app/page.tsx', note: '3 strings · L4 L5 L16', child: true },
  { name: 'app/checkout.tsx', note: '4 strings · gt()', child: true },
  { name: 'components/Tagline.tsx', note: '1 string · context', child: true },
  { name: 'components/Nav.tsx', note: '2 strings · <Var>', child: true },
  { name: 'lib/errors.ts', note: '4 strings · gt()', child: true },
  { name: 'apps/api', note: 'outside target · skipped', dim: true },
];

/** Exhibit B — what the agent decided, line by line: judgement, not grep. */
const MAP: readonly { file: string; found: string; verdict: string; api: string }[] = [
  { file: 'app/page.tsx · L4', found: '<h1>Hello, world!</h1>', verdict: 'wrap in', api: '<T>' },
  { file: 'app/checkout.tsx · L18', found: "'Payment received'", verdict: 'string —', api: 'gt()' },
  { file: 'components/Nav.tsx · L7', found: '{user.name}', verdict: 'never translated —', api: '<Var>' },
  { file: 'app/page.tsx · L16', found: 'new Date()', verdict: 'formats locally —', api: '<DateTime>' },
  { file: 'components/Tagline.tsx · L2', found: 'tagline copy', verdict: 'tone noted —', api: '$context' },
  { file: 'legal/terms.mdx', found: 'Terms of Service', verdict: 'held —', api: '$requiresReview' },
];

/** Exhibit D — PR #218's file rows: five files, +38 −6 in total. */
const FILES: readonly { name: string; plus: number; minus: number }[] = [
  { name: 'app/page.tsx', plus: 9, minus: 2 },
  { name: 'app/checkout.tsx', plus: 11, minus: 3 },
  { name: 'components/Tagline.tsx', plus: 7, minus: 1 },
  { name: 'components/Nav.tsx', plus: 6, minus: 0 },
  { name: 'lib/errors.ts', plus: 5, minus: 0 },
];

const CHECKS: readonly string[] = ['ci / build', 'gt validate', 'locadex / visual-qa'];

/**
 * The run as an evidence file: four exhibits under machined rule-labels —
 * the scan tree, the inference ledger, the diff on the dark panel, and the
 * pull request where the agent stops to wait. Every string, path, count and
 * API name is product-real; the sheets are ruled paper, edge to edge.
 */
export default function LocadexRun() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  useGSAP(
    () => {
      const scope = root.current;
      if (!scope) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const print = (rows: string, trigger: string) => {
        const targets = gsap.utils.toArray<HTMLElement>(rows, scope);
        if (targets.length === 0) return;
        gsap.fromTo(
          targets,
          { autoAlpha: 0, y: 5 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.26,
            stagger: 0.05,
            ease: 'power1.out',
            scrollTrigger: { trigger, start: 'top 82%', once: true },
          }
        );
      };

      print('.sgx-tree .sgx-lr', '.sgx-tree');
      print('.sgx-map .sgx-lr', '.sgx-map');
      print('.sgx-dl', '.sgx-diff');
      print('.sgx-pr-files .sgx-lr, .sgx-checks .sgx-lr, .sgx-times .sgx-lr', '.sgx-pr');
    },
    { scope: root }
  );

  return (
    <section className='tc-sec' id='run' ref={root}>
      <div className='sgx-head'>
        <span className='sgx-kicker' data-reveal>
          Run Nº 1184 · on the record
        </span>
        <h2 data-reveal>Push, scan, edit, translate, open PR.</h2>
        <p data-reveal>
          The whole loop runs without you. One run of the agent, filed as its artifacts — what it
          found, what it decided, what it changed, and the pull request where it stops to wait for
          you.
        </p>
      </div>

      {/* ---- exhibits A + B: what changed, and what it means ---- */}
      <div className='sgx-body'>
        <div className='sgx-duo'>
          <div className='sgx-col' data-reveal>
            <div className='sgx-rule'>
              <span>Exhibit A · scan</span>
              <i>push e4f21c9</i>
            </div>
            <p>
              A commit or pull request triggers the workflow, and the agent maps out what has
              changed. “Changed files only” is on by default — siblings outside the target
              directory are never touched.
            </p>
            <div className='sgx-ledger sgx-tree'>
              {TREE.map((row) => (
                <div
                  className={`sgx-lr${row.child ? ' is-child' : ''}${row.dim ? ' is-dim' : ''}`}
                  key={row.name}
                >
                  <span>{row.name}</span>
                  <span>{row.note}</span>
                </div>
              ))}
              <div className='sgx-lr is-sum'>
                <span>
                  11 files changed · <b>5 need i18n</b>
                </span>
                <span>14 strings</span>
              </div>
            </div>
          </div>

          <div className='sgx-col' data-reveal>
            <div className='sgx-rule'>
              <span>Exhibit B · inference</span>
              <i>per line</i>
            </div>
            <p>
              Scan is not grep. The agent reasons about your component structure and writes down
              what a translator would need — tone, variables, holds, and the terms that never
              translate.
            </p>
            <div className='sgx-ledger sgx-map'>
              <div className='sgx-lr is-head'>
                <span>found</span>
                <span>decision</span>
              </div>
              {MAP.map((row) => (
                <div className='sgx-lr' key={row.file}>
                  <code>
                    <span className='sgx-map-file'>{row.file}</span>
                    {row.found}
                  </code>
                  <span>
                    {row.verdict} <b>{row.api}</b>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ---- exhibit C: the diff, and the guardrails beside it ---- */}
        <div className='sgx-duo'>
          <div className='sgx-col' data-reveal>
            <div className='sgx-rule'>
              <span>Exhibit C · edit</span>
              <i>app/page.tsx</i>
            </div>
            <p>
              JSX wraps in <code className='tc-chip'>&lt;T&gt;</code>, bare strings become{' '}
              <code className='tc-chip'>gt()</code> calls — in your conventions, through your
              linter. Local edits are preserved, so a re-run never overwrites your hand-tuned copy.
            </p>
            <div className='sgx-panel sgx-diff sgx-code'>
              <div className='sgx-panel-bar'>
                <span>app/page.tsx</span>
                <span>locadex · edit</span>
              </div>
              <pre>
                <div className='sgx-dl is-hunk'>
                  <i> </i>
                  <code>@@ −4,4 +4,6 @@ export default function Home()</code>
                </div>
                <div className='sgx-dl is-ctx'>
                  <i> </i>
                  <code>{'  return ('}</code>
                </div>
                <div className='sgx-dl is-del'>
                  <i>−</i>
                  <code>{'    <h1>Hello, world!</h1>'}</code>
                </div>
                <div className='sgx-dl is-del'>
                  <i>−</i>
                  <code>{'    <p>Welcome back, {user.name}</p>'}</code>
                </div>
                <div className='sgx-bind'>
                  <div className='sgx-dl is-add'>
                    <i>+</i>
                    <code>
                      {'    <'}
                      <b>T</b>
                      {'>'}
                    </code>
                  </div>
                  <div className='sgx-dl is-add'>
                    <i>+</i>
                    <code>{'      <h1>Hello, world!</h1>'}</code>
                  </div>
                  <div className='sgx-dl is-add'>
                    <i>+</i>
                    <code>
                      {'      <p>Welcome back, <'}
                      <b>Var</b>
                      {'>{user.name}</'}
                      <b>Var</b>
                      {'></p>'}
                    </code>
                  </div>
                  <div className='sgx-dl is-add'>
                    <i>+</i>
                    <code>
                      {'    </'}
                      <b>T</b>
                      {'>'}
                    </code>
                  </div>
                </div>
                <div className='sgx-dl is-ctx'>
                  <i> </i>
                  <code>{'  )'}</code>
                </div>
                <div className='sgx-dl is-ctx'>
                  <i> </i>
                  <code>{'}'}</code>
                </div>
              </pre>
            </div>
          </div>

          <div className='sgx-col' data-reveal>
            <div className='sgx-rule'>
              <span>Guarded by default</span>
              <i>the review gate</i>
            </div>
            <p>
              An agent that edits code earns trust by stopping at the review gate. Every Locadex
              run ends at a pull request, not a deploy.
            </p>
            <ul className='tc-list'>
              <li>
                Changes arrive on a prefixed <code className='tc-chip'>locadex/</code> branch —
                never on <code className='tc-chip'>main</code>
              </li>
              <li>
                Auto-merge is off by default — opt in to merge-when-checks-pass, or keep the button
                yours
              </li>
              <li>Setup is a separate PR that you merge yourself first</li>
              <li>
                <code className='tc-chip'>Preserve local edits</code> and{' '}
                <code className='tc-chip'>Changed files only</code> ship on
              </li>
              <li>
                Your build commands and linter run in a sandboxed VM, with org secrets injected as
                env vars
              </li>
            </ul>
          </div>
        </div>

        {/* ---- exhibit D: the pull request, at full width ---- */}
        <div className='sgx-duo'>
          <div className='sgx-col' data-reveal style={{ gridColumn: '1 / -1' }}>
            <div className='sgx-rule'>
              <span>Exhibit D · pull request</span>
              <i>the run ends at your gate</i>
            </div>
            <div className='sgx-pr'>
              <div className='sgx-pr-head'>
                <div className='sgx-pr-title'>
                  Internationalize apps/web — wrap JSX in {'<T>'}
                  <span>#218</span>
                </div>
                <div className='sgx-pr-meta'>
                  <span className='sgx-bot'>
                    <Image src='/brand/no-bg-locadex-logo-light.png' alt='' width={15} height={15} />
                    locadex[bot]
                  </span>
                  <span>wants to merge</span>
                  <code className='tc-chip'>locadex/generate-code</code>
                  <Joint />
                  <code className='tc-chip'>main</code>
                  <span>· 5 files changed · +38 −6</span>
                </div>
              </div>

              <div className='sgx-pr-body'>
                <div>
                  <div className='sgx-pr-files sgx-ledger'>
                    {FILES.map((file) => (
                      <div className='sgx-lr' key={file.name}>
                        <span>{file.name}</span>
                        <span className='is-plus'>+{file.plus}</span>
                        <span className='is-minus'>−{file.minus}</span>
                      </div>
                    ))}
                  </div>
                  <div className='sgx-checks sgx-ledger'>
                    {CHECKS.map((check) => (
                      <div className='sgx-lr' key={check}>
                        <i>✓</i>
                        <span>{check}</span>
                        <span>passed</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className='sgx-gate'>
                    <b>Review required</b>
                    <p>
                      Locadex never merges its own pull request. Auto-merge stays off unless you
                      turn it on — the run ends here, at your gate.
                    </p>
                    <div className='sgx-gate-acts'>
                      <span className='sgx-gate-btn'>Approve</span>
                      <span className='sgx-gate-btn is-locked'>Merge pull request</span>
                    </div>
                  </div>
                  <div className='sgx-times sgx-ledger'>
                    <div className='sgx-lr'>
                      <span>09:41:44</span>
                      <span>
                        <b>opened</b> · locadex[bot]
                      </span>
                    </div>
                    <div className='sgx-lr'>
                      <span>09:42:03</span>
                      <span>
                        <b>translated</b> · 5 locales · 3.4 s
                      </span>
                    </div>
                    <div className='sgx-lr'>
                      <span>09:42:41</span>
                      <span>
                        <b>checks</b> · 3 passed
                      </span>
                    </div>
                    <div className='sgx-lr is-open'>
                      <span>—</span>
                      <span>
                        <b>merge</b> · waits for you
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---- standing automation: the three templates ---- */}
      <div className='sgx-head'>
        <span className='sgx-kicker' data-reveal>
          Workflows
        </span>
        <h2 data-reveal>Standing automation, not a setup script.</h2>
        <p data-reveal>
          Three templates, each with its own trigger, re-running as your code changes. Point one at
          a directory, give it your commands, and it works the way your repo does.
        </p>
      </div>

      <div className='sgx-body'>
        <div className='sgx-tpl' data-reveal>
          <div>
            <h3>Generate code</h3>
            <p>
              Wraps your source with <code className='tc-chip'>t()</code> and the{' '}
              <code className='tc-chip'>&lt;T&gt;</code> component, and opens the pull request.
            </p>
            <div className='sgx-tpl-trig'>
              trigger · <b>a pull request changes</b>
            </div>
          </div>
          <div>
            <h3>Generate translations and push</h3>
            <p>Creates translations in context and pushes them to your branch.</p>
            <div className='sgx-tpl-trig'>
              trigger · <b>a commit is pushed</b>
            </div>
          </div>
          <div>
            <h3>Keep locales in sync</h3>
            <p>Keeps every locale current with the source as it changes.</p>
            <div className='sgx-tpl-trig'>
              trigger · <b>started manually</b>
            </div>
          </div>
        </div>

        <div className='sgx-supported' data-reveal>
          Runs on <b>Next.js</b> · <b>Mintlify</b> · <b>Fern</b> · <b>Docusaurus</b> · <b>Vite</b>{' '}
          · <b>Gatsby</b> · <b>React</b> · <b>Redwood</b> · <b>React Router</b> ·{' '}
          <b>TanStack Start</b> — or locally,{' '}
          <b className='sgx-nowrap'>$ npx locadex@latest start</b>
        </div>
      </div>
    </section>
  );
}
