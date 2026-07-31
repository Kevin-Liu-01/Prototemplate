'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import { useRef } from 'react';

import { useQuietReveal } from '../sections/reveal';

import LocadexIso from './LocadexIso';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** The doubled-gauge joint: two threads travelling together, never merging. */
function Joint() {
  return (
    <svg className='ldx-joint' viewBox='0 0 30 24' width={26} height={21} aria-hidden='true'>
      <path d='M0 10.5h20' />
      <path d='M0 13.5h20' />
      <path className='ldx-joint-head' d='M21 6.5L29 12L21 17.5Z' />
    </svg>
  );
}

/** Scan: run #1184's file tree, counts per file, the sibling app skipped. */
const TREE: readonly { name: string; note: string; child?: boolean; dim?: boolean }[] = [
  { name: 'apps/web', note: 'target directory' },
  { name: 'app/page.tsx', note: '3 strings · L4 L5 L16', child: true },
  { name: 'app/checkout.tsx', note: '4 strings · gt()', child: true },
  { name: 'components/Tagline.tsx', note: '1 string · context', child: true },
  { name: 'components/Nav.tsx', note: '2 strings · <Var>', child: true },
  { name: 'lib/errors.ts', note: '4 strings · gt()', child: true },
  { name: 'apps/api', note: 'outside target · skipped', dim: true },
];

/** Map: what the agent decided, line by line — judgement, not grep. */
const MAP: readonly { file: string; found: string; verdict: string; api: string }[] = [
  { file: 'app/page.tsx · L4', found: '<h1>Hello, world!</h1>', verdict: 'wrap in', api: '<T>' },
  { file: 'app/checkout.tsx · L18', found: "'Payment received'", verdict: 'string —', api: 'gt()' },
  { file: 'components/Nav.tsx · L7', found: '{user.name}', verdict: 'never translated —', api: '<Var>' },
  { file: 'app/page.tsx · L16', found: 'new Date()', verdict: 'formats locally —', api: '<DateTime>' },
  { file: 'components/Tagline.tsx · L2', found: 'tagline copy', verdict: 'tone noted —', api: '$context' },
  { file: 'legal/terms.mdx', found: 'Terms of Service', verdict: 'held —', api: '$requiresReview' },
];

/** PR #218's file rows: five files, +38 −6 in total. */
const FILES: readonly { name: string; plus: number; minus: number }[] = [
  { name: 'app/page.tsx', plus: 9, minus: 2 },
  { name: 'app/checkout.tsx', plus: 11, minus: 3 },
  { name: 'components/Tagline.tsx', plus: 7, minus: 1 },
  { name: 'components/Nav.tsx', plus: 6, minus: 0 },
  { name: 'lib/errors.ts', plus: 5, minus: 0 },
];

const CHECKS: readonly { name: string }[] = [
  { name: 'ci / build' },
  { name: 'gt validate' },
  { name: 'locadex / visual-qa' },
];

/**
 * The run, told as its artifacts: the scan tree, the inference ledger, the
 * diff, and the pull request where the agent stops. Every string, path,
 * count and API name is product-real; the shells are the shell's own —
 * mats, cards, hatch bands, one dark panel per depth.
 */
export default function Pipeline() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  useGSAP(
    () => {
      const scope = root.current;
      if (!scope) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      /* each ledger prints once as it enters — rows, not blocks */
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
            stagger: 0.06,
            ease: 'power1.out',
            scrollTrigger: { trigger, start: 'top 82%', once: true },
          }
        );
      };

      print('.ldx-tree-row', '.ldx-tree');
      print('.ldx-map-row', '.ldx-map');
      print('.ldx-dl', '.ldx-diff');
      print('.ldx-pr-file, .ldx-check, .ldx-time', '.ldx-pr');
    },
    { scope: root }
  );

  return (
    <section className='tc-sec' id='pipeline' ref={root}>
      <div className='tc-head'>
        <h2 data-reveal>Push, scan, edit, translate, open PR.</h2>
        <p data-reveal>
          The whole loop runs without you. One run of the agent, shown as its artifacts — what it found,
          what it decided, what it changed, and the pull request where it stops to wait for you.
        </p>
      </div>

      {/* The run as one object before it is shown as artifacts: the exploded
          isometric stack (founder directive) replaces the old five-label
          strip — the same five stages, but each plane now carries its
          artifact and its measured line instead of a bare word. */}
      <LocadexIso />

      {/* ---- scan + map: what changed, and what it means ---- */}
      <div className='tc-row is-even ldx-stretch'>
        <div className='tc-cell is-tall is-framed' data-reveal>
          <div className='tc-card'>
            <h3>Scan codebase</h3>
            <p>
              A commit or pull request triggers the workflow, and the agent maps out what has changed.
              “Changed files only” is on by default — siblings outside the target directory are never
              touched.
            </p>
            <div className='ldx-panel'>
              <div className='ldx-panel-bar'>
                <span>locadex · scan</span>
                <span>push e4f21c9</span>
              </div>
              <div className='ldx-tree'>
                {TREE.map((row) => (
                  <div
                    className={`ldx-tree-row${row.child ? ' is-child' : ''}${row.dim ? ' is-dim' : ''}`}
                    key={row.name}
                  >
                    <span>{row.name}</span>
                    <span>{row.note}</span>
                  </div>
                ))}
                <div className='ldx-tree-row is-sum'>
                  <span>
                    11 files changed · <b>5 need i18n</b>
                  </span>
                  <span>14 strings</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='tc-cell is-tall is-framed' data-reveal>
          <div className='tc-card'>
            <h3>Context, inferred per line</h3>
            <p>
              Scan is not grep. The agent reasons about your component structure and writes down what a
              translator would need — tone, variables, holds, and the terms that never translate.
            </p>
            <div className='ldx-map'>
              <div className='ldx-map-row is-head'>
                <code>found</code>
                <span>decision</span>
              </div>
              {MAP.map((row) => (
                <div className='ldx-map-row' key={row.file}>
                  <code>
                    <span className='ldx-map-file'>{row.file}</span>
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
      </div>

      <div className='tc-hatch' aria-hidden='true' />

      {/* ---- edit: the diff, bound by the two threads ---- */}
      <div className='tc-row is-wide-left'>
        <div className='tc-cell is-tall is-framed' data-reveal>
          <div className='tc-card'>
            <h3>Edit code</h3>
            <p>
              JSX wraps in <code className='tc-chip'>&lt;T&gt;</code>, bare strings become{' '}
              <code className='tc-chip'>gt()</code> calls — in your conventions, through your linter. Local
              edits are preserved, so a re-run never overwrites your hand-tuned copy.
            </p>
            <div className='ldx-diff'>
              <div className='ldx-panel-bar'>
                <span>app/page.tsx</span>
                <span>locadex · edit</span>
              </div>
              <pre>
                <div className='ldx-dl is-hunk'>
                  <i> </i>
                  <code>@@ −4,4 +4,6 @@ export default function Home()</code>
                </div>
                <div className='ldx-dl is-ctx'>
                  <i> </i>
                  <code>{'  return ('}</code>
                </div>
                <div className='ldx-dl is-del'>
                  <i>−</i>
                  <code>{'    <h1>Hello, world!</h1>'}</code>
                </div>
                <div className='ldx-dl is-del'>
                  <i>−</i>
                  <code>{'    <p>Welcome back, {user.name}</p>'}</code>
                </div>
                <div className='ldx-bind'>
                  <div className='ldx-dl is-add'>
                    <i>+</i>
                    <code>
                      {'    <'}
                      <b>T</b>
                      {'>'}
                    </code>
                  </div>
                  <div className='ldx-dl is-add'>
                    <i>+</i>
                    <code>{'      <h1>Hello, world!</h1>'}</code>
                  </div>
                  <div className='ldx-dl is-add'>
                    <i>+</i>
                    <code>
                      {'      <p>Welcome back, <'}
                      <b>Var</b>
                      {'>{user.name}</'}
                      <b>Var</b>
                      {'></p>'}
                    </code>
                  </div>
                  <div className='ldx-dl is-add'>
                    <i>+</i>
                    <code>
                      {'    </'}
                      <b>T</b>
                      {'>'}
                    </code>
                  </div>
                </div>
                <div className='ldx-dl is-ctx'>
                  <i> </i>
                  <code>{'  )'}</code>
                </div>
                <div className='ldx-dl is-ctx'>
                  <i> </i>
                  <code>{'}'}</code>
                </div>
              </pre>
            </div>
          </div>
        </div>

        <div className='tc-cell is-tall ldx-guard' data-reveal>
          <h3>Guarded by default</h3>
          <p>
            An agent that edits code earns trust by stopping at the review gate. Every Locadex run ends at
            a pull request, not a deploy.
          </p>
          <ul className='tc-list'>
            <li>
              Changes arrive on a prefixed <code className='tc-chip'>locadex/</code> branch — never on{' '}
              <code className='tc-chip'>main</code>
            </li>
            <li>Auto-merge is off by default — opt in to merge-when-checks-pass, or keep the button yours</li>
            <li>Setup is a separate PR that you merge yourself first</li>
            <li>
              <code className='tc-chip'>Preserve local edits</code> and{' '}
              <code className='tc-chip'>Changed files only</code> ship on
            </li>
            <li>Your build commands and linter run in a sandboxed VM, with org secrets injected as env vars</li>
          </ul>
        </div>
      </div>

      <div className='tc-hatch' aria-hidden='true' />

      {/* ---- open PR: the review gate, at full width ---- */}
      <div className='tc-row is-one'>
        <div className='tc-cell is-bleed is-framed' data-reveal>
          <div className='tc-card'>
            <div className='tc-bleed-head'>
              <h3>Open PR</h3>
              <p>
                Pull request created for review — the struck lines are your bare JSX, the added lines the
                same JSX wrapped in <code className='tc-chip'>&lt;T&gt;</code>. The merge stays yours.
              </p>
            </div>
            <div className='tc-bleed-art'>
              <div className='ldx-prwrap'>
                <div className='ldx-pr'>
                  <div className='ldx-pr-head'>
                    <div className='ldx-pr-title'>
                      Internationalize apps/web — wrap JSX in {'<T>'}
                      <span>#218</span>
                    </div>
                    <div className='ldx-pr-meta'>
                      <span className='ldx-bot'>
                        <Image src='/brand/no-bg-locadex-logo-light.png' alt='' width={16} height={16} />
                        locadex[bot]
                      </span>
                      <span>wants to merge</span>
                      <code className='tc-chip'>locadex/generate-code</code>
                      <Joint />
                      <code className='tc-chip'>main</code>
                      <span>· 5 files changed · +38 −6</span>
                    </div>
                  </div>

                  <div className='ldx-pr-body'>
                    <div>
                      <div className='ldx-pr-files'>
                        {FILES.map((file) => (
                          <div className='ldx-pr-file' key={file.name}>
                            <span>{file.name}</span>
                            <span className='is-plus'>+{file.plus}</span>
                            <span className='is-minus'>−{file.minus}</span>
                          </div>
                        ))}
                      </div>
                      <div className='ldx-pr-checks'>
                        {CHECKS.map((check) => (
                          <div className='ldx-check' key={check.name}>
                            <i>✓</i>
                            <span>{check.name}</span>
                            <span>passed</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className='ldx-pr-gate'>
                        <b>Review required</b>
                        <p>
                          Locadex never merges its own pull request. Auto-merge stays off unless you turn
                          it on — the run ends here, at your gate.
                        </p>
                        <div className='ldx-gate-acts'>
                          <span className='ldx-gate-btn'>Approve</span>
                          <span className='ldx-gate-btn is-locked'>Merge pull request</span>
                        </div>
                      </div>
                      <div className='ldx-pr-times'>
                        <div className='ldx-time'>
                          <span>09:41:44</span>
                          <span>
                            <b>opened</b> · locadex[bot]
                          </span>
                        </div>
                        <div className='ldx-time'>
                          <span>09:42:03</span>
                          <span>
                            <b>translated</b> · 5 locales · 3.4 s
                          </span>
                        </div>
                        <div className='ldx-time'>
                          <span>09:42:41</span>
                          <span>
                            <b>checks</b> · 3 passed
                          </span>
                        </div>
                        <div className='ldx-time is-open'>
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
        </div>
      </div>

      {/* ---- standing automation: the three templates ---- */}
      <div className='tc-head'>
        <h2 data-reveal>Standing automation, not a setup script.</h2>
        <p data-reveal>
          Three templates, each with its own trigger, re-running as your code changes. Point one at a
          directory, give it your commands, and it works the way your repo does.
        </p>
      </div>

      <div className='ldx-tpl' data-reveal>
        <div>
          <h3>Generate code</h3>
          <p>
            Wraps your source with <code className='tc-chip'>t()</code> and the{' '}
            <code className='tc-chip'>&lt;T&gt;</code> component, and opens the pull request.
          </p>
          <div className='ldx-tpl-trig'>
            trigger · <b>a pull request changes</b>
          </div>
        </div>
        <div>
          <h3>Generate translations and push</h3>
          <p>Creates translations in context and pushes them to your branch.</p>
          <div className='ldx-tpl-trig'>
            trigger · <b>a commit is pushed</b>
          </div>
        </div>
        <div>
          <h3>Keep locales in sync</h3>
          <p>Keeps every locale current with the source as it changes.</p>
          <div className='ldx-tpl-trig'>
            trigger · <b>started manually</b>
          </div>
        </div>
      </div>

      {/* all ten runtimes carry the same ink — a two-tier list with no key
          reads as supported/unsupported, which the inventory does not say */}
      <div className='ldx-supported' data-reveal>
        Runs on <b>Next.js</b> · <b>Mintlify</b> · <b>Fern</b> · <b>Docusaurus</b> · <b>Vite</b> ·{' '}
        <b>Gatsby</b> · <b>React</b> · <b>Redwood</b> · <b>React Router</b> · <b>TanStack Start</b> — or
        locally, <b className='ldx-nowrap'>$ npx locadex@latest start</b>
      </div>
    </section>
  );
}
