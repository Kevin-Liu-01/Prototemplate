'use client';

import { SiGithub } from '@icons-pack/react-simple-icons';
import { GitPullRequest } from 'lucide-react';
import Image from 'next/image';
import { useRef } from 'react';

import { useQuietReveal } from '../sections/reveal';

/** The settings panel, verbatim setting names from the Locadex config
 *  reference. The guard rails are the values: auto-merge off, local edits
 *  preserved, changed files only. */
const CONTROLS: readonly { k: string; v: string; guard?: boolean }[] = [
  { k: 'Target directory', v: 'apps/web' },
  { k: 'Framework', v: 'Next.js' },
  { k: 'Package manager', v: 'Detect automatically' },
  { k: 'Branch prefix', v: 'locadex/' },
  { k: 'Auto-merge', v: 'Off — review required', guard: true },
  { k: 'Preserve local edits', v: 'On', guard: true },
  { k: 'Changed files only', v: 'On', guard: true },
];

/** The three real automation templates; the triggers print once, beneath. */
const TEMPLATES: readonly { name: string; line: string }[] = [
  { name: 'Generate code', line: 'Wraps source with t() and the <T> component.' },
  { name: 'Generate translations and push', line: 'Creates translations in context and commits them.' },
  { name: 'Keep locales in sync', line: 'Re-runs as your source changes, so no locale drifts.' },
];

/**
 * Locadex, on rails: the work arrives as a reviewable PR on a prefixed
 * branch — auto-merge off by default, setup itself a PR you merge first —
 * beside the settings form that makes it run your repo's way.
 */
export default function LocadexGuard() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-sec' id='locadex' ref={root}>
      <div className='tc-head'>
        <GitPullRequest className='tc-head-icon' strokeWidth={1} aria-hidden />
        <h2 data-reveal>An agent on rails.</h2>
        <p data-reveal>
          Locadex internationalizes your code and opens pull requests with translations — every
          change reviewable, on a prefixed branch, and setup is a separate PR you merge yourself.
        </p>
      </div>

      <div className='tc-row is-wide-left'>
        <div className='tc-cell is-panel is-framed' data-reveal>
          <div className='tc-card'>
            <h3>Proof of work is a pull request</h3>
            <p>Red is your bare JSX, green is the same JSX wrapped — merged only after review.</p>
            <div className='tce-pr'>
              <div className='tce-pr-bar'>
                <SiGithub size={12} color='currentColor' aria-hidden />
                <b>locadex/generate-code → main</b>
                <span>PR #218</span>
              </div>
              <div className='tce-pr-diff'>
                <div className='is-hunk'>
                  <i> </i>
                  <code>@@ −12,3 +12,5 @@ app/checkout/page.tsx</code>
                </div>
                <div>
                  <i> </i>
                  <code>{'  <main>'}</code>
                </div>
                <div className='is-del'>
                  <i>−</i>
                  <code>{'    <p>Payment received</p>'}</code>
                </div>
                <div className='is-add'>
                  <i>+</i>
                  <code>{'    <T>'}</code>
                </div>
                <div className='is-add'>
                  <i>+</i>
                  <code>{'      <p>Payment received</p>'}</code>
                </div>
                <div className='is-add'>
                  <i>+</i>
                  <code>{'    </T>'}</code>
                </div>
                <div>
                  <i> </i>
                  <code>{'  </main>'}</code>
                </div>
              </div>
              <div className='tce-pr-meta'>
                <div>
                  <span>
                    <Image
                      className='tce-pr-agent'
                      src='/brand/locadex-light-no-bg.svg'
                      alt=''
                      width={13}
                      height={13}
                    />
                    opened by Locadex
                  </span>
                  <b>47 files changed</b>
                </div>
                <div>
                  <span>auto-merge</span>
                  <b>off — review required</b>
                </div>
                <div>
                  <span>merged by @sam</span>
                  <b>checks passed</b>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='tc-cell is-framed' data-reveal>
          <div className='tc-card'>
            <h3>Your repo shape, your commands</h3>
            <p>
              Point it at a directory; it runs in a sandbox with your org secrets injected as env
              vars.
            </p>
            <div className='tce-form'>
              {CONTROLS.map((row) => (
                <div className={`tce-frow${row.guard ? ' is-guard' : ''}`} key={row.k}>
                  <span>{row.k}</span>
                  <b>{row.v}</b>
                </div>
              ))}
            </div>
            <div className='tce-tree'>
              <div className='is-target'>
                <code>apps/web</code>
                <span>target</span>
              </div>
              <div>
                <code>apps/api</code>
                <span>out of scope</span>
              </div>
              <div>
                <code>packages/ui</code>
                <span>out of scope</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='tc-hatch' aria-hidden='true' />

      <div className='tc-row is-one'>
        <div className='tc-cell' data-reveal>
          <div className='tce-tri'>
            {TEMPLATES.map((template) => (
              <div key={template.name}>
                <h3>{template.name}</h3>
                <p>{template.line}</p>
              </div>
            ))}
          </div>
          <div className='tce-tri-foot'>
            <span>triggers</span>
            <b>a pull request changes · a commit is pushed · started manually</b>
          </div>
        </div>
      </div>
    </section>
  );
}
