'use client';

import { SiGithub } from '@icons-pack/react-simple-icons';
import Image from 'next/image';
import { useRef, useState } from 'react';

import { useMountEffect } from './use-mount-effect';
import LocaleFlag from './LocaleFlag';

import EnterpriseContextFork from './EnterpriseContextFork';


/**
 * The governance timeline — the enterprise page's middle argument as a
 * scroll-read: the head holds the left rail (sticky), and its three
 * load-bearing words light as their proof passes the viewport's
 * center. launch → the organization's context; security → the review
 * gate and the guarded PR together; operational → edge delivery. The
 * proof cards hang off a doubled spine on the right, each headed by
 * its stage rail — 01 organization · 02 review · 03 proof · 04
 * delivery — the annunciator grammar carried over from the plates.
 * No scroll hijack: the page scrolls normally, only the highlight
 * follows.
 */

type Stage = 'launch' | 'security' | 'operational';

/** Measured from a reader in Frankfurt's neighbourhood — the same five
 *  points of presence and latencies the delivery globe carries. */
const POPS: readonly {
  region: string;
  flag: string;
  ms: number;
  home?: boolean;
}[] = [
  { region: 'eu-central-1', flag: 'de', ms: 12, home: true },
  { region: 'us-east-1', flag: 'en', ms: 21 },
  { region: 'ap-northeast-1', flag: 'ja', ms: 34 },
  { region: 'ap-southeast-1', flag: 'zh-SG', ms: 41 },
  { region: 'ap-southeast-2', flag: 'en-AU', ms: 48 },
];

const MAX_MS = 48;

export default function GovernedExplorer() {
  const root = useRef<HTMLElement>(null);

  const [active, setActive] = useState<Stage>('launch');

  /* the highlight follows the proof: whichever group crosses the
     viewport's center band owns its word */
  useMountEffect(() => {
    const scope = root.current;
    if (!scope) return;
    const groups = Array.from(
      scope.querySelectorAll<HTMLElement>('[data-stage]')
    );
    if (groups.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const group = entry.target as HTMLElement;
          /* the lock-in is the group's own: blue held while IT spans the
             center band, released on exit — independent of which word
             is lit, so review and proof each take their own turn */
          group.classList.toggle('is-lit', entry.isIntersecting);
          if (!entry.isIntersecting) continue;
          const stage = group.dataset.stage as Stage | undefined;
          if (stage) setActive(stage);
        }
      },
      /* solidly in view: only the group spanning the viewport's center
         line owns the word and the border */
      { rootMargin: '-47% 0px -47%' }
    );
    for (const group of groups) observer.observe(group);
    return () => observer.disconnect();
  });

  return (
    <section className='tc-sec' id='governance' ref={root}>
      <div className='tcg-grid' data-active={active}>
        {/* ---- the left rail: the claim, its words as the index ---- */}
        <div className='tcg-side'>
            <h2 className='tcg-head'>
              Built for teams with real <em>launch</em>, <em>security</em>,
              and <em>operational</em> requirements
            </h2>
          <div className='tcg-badges' aria-hidden='true'>
            <Image src='/shields/soc-2-type-2.svg' alt='' width={96} height={40} />
            <Image src='/shields/gdpr.svg' alt='' width={96} height={40} />
            <Image src='/shields/iso-27001.svg' alt='' width={96} height={40} />
          </div>
        </div>

        {/* ---- the right rail: the proof, hung off the spine ---- */}
        <div className='tcg-flow'>
          <div className='tcg-spine' aria-hidden='true' />

          {/* launch — the organization's context */}
          <div className='tcg-group' data-stage='launch'>
            <article className='tcg-card'>
              <div className='tcg-card-body'>
                  <h3>Organization rules apply to every translation</h3>
                  <p>
                    Translations use the rules your organization sets. Below,
                    the same sentence with and without this rule.
                  </p>
                  <p className='tce-ba-note'>
                    &ldquo;Locadex is the GT agent. This product name should
                    never be translated.&rdquo;
                  </p>
                <EnterpriseContextFork />
              </div>
            </article>
          </div>

          {/* security — the gate holds, the PR proves */}
          <div className='tcg-group' data-stage='security'>
            <article className='tcg-card'>
              <div className='tcg-card-body'>
                  <h3>Translations ship only after review</h3>
                  <p>
                    Source and translation stay together in review. Neither is
                    published until a reviewer approves them.
                  </p>
                <div className='tcg-box'>
                <div
                  className='tce-gate'
                  role='img'
                  aria-label={'Source and translation run through a review gate: submitted with $requiresReview, held for review under the Legal label, then published as v214 after approval'}
                >
                  <span className='tce-gate-thread is-l' aria-hidden='true' />
                  <span className='tce-gate-thread is-m' aria-hidden='true' />
                  <span className='tce-gate-thread is-r' aria-hidden='true' />
                  <span className='tce-gate-box' aria-hidden='true'>
                      <span>Review gate</span>
                  </span>
                  <div className='tce-gate-cols'>
                    <div className='tce-gate-st'>
                        <b>Submitted</b>
                      <span>
                        <code>&lt;T $requiresReview&gt;</code>
                      </span>
                    </div>
                    <div className='tce-gate-st'>
                        <b>Held for review</b>
                        <span>Labels · Legal, Needs review</span>
                    </div>
                    <div className='tce-gate-st'>
                        <b>Published</b>
                        <span>Approved @mira · v214 · edge</span>
                    </div>
                  </div>
                </div>
                </div>
              </div>
            </article>
          </div>

          {/* security, continued — the PR proves it */}
          <div className='tcg-group' data-stage='security'>
            <article className='tcg-card'>
              <div className='tcg-card-body'>
                  <h3>Every change is a pull request</h3>
                  <p>
                    Locadex wraps your existing JSX for translation in a pull
                    request that merges only after review.
                  </p>
                <div className='tcg-box'>
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
                        <i className='tce-pr-agent' aria-hidden='true' />
                        Opened by Locadex
                      </span>
                        <b>47 files changed</b>
                    </div>
                    <div>
                        <span>Auto-merge</span>
                        <b>Off · review required</b>
                    </div>
                    <div>
                        <span>Merged by @sam</span>
                        <b className='is-ok'>Checks passed</b>
                    </div>
                  </div>
                </div>
                </div>
              </div>
            </article>
          </div>

          {/* operational — the delivery you can take back */}
          <div className='tcg-group' data-stage='operational'>
            <article className='tcg-card'>
              <div className='tcg-card-body'>
                  <h3>Served using a global, low-latency translation CDN</h3>
                  <p>
                    Push over-the-air updates without redeploying your app.
                  </p>
                <div className='tcg-box'>
                <div
                  className='tce-lat'
                  role='img'
                  aria-label={'Edge latency: eu-central-1 12 ms, us-east-1 21, ap-northeast-1 34, ap-southeast-1 41, ap-southeast-2 48 milliseconds'}
                >
                  <div className='tce-lat-head'>
                      <span>Point of presence</span>
                      <span>Latency</span>
                  </div>
                  {POPS.map((pop) => (
                    <div
                      className={`tce-lrow-lat${pop.home ? ' is-home' : ''}`}
                      key={pop.region}
                    >
                      <span className='tce-lat-code'>
                        <LocaleFlag locale={pop.flag} className='tce-lat-flag' />
                        {pop.region}
                      </span>
                      <span className='tce-lat-bar' aria-hidden='true'>
                        <i style={{ width: `${(pop.ms / MAX_MS) * 100}%` }} />
                      </span>
                      <b>{pop.ms} ms</b>
                    </div>
                  ))}
                </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
