'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';

import PrismaticField from '@/components/shared/PrismaticField';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** Run #1184, itemised: files, lines, sandbox time, LCUs, the bill. */
const SUMMARY: readonly { label: string; value: string; total?: boolean }[] = [
  { label: 'files touched', value: '11' },
  { label: 'lines changed', value: '44' },
  { label: 'sandbox', value: '6 m 12 s' },
  { label: 'LCUs · $5 each', value: '1.4' },
  { label: 'billed', value: '$7.00', total: true },
];

/**
 * The page's one full-bleed dark break: the wiki's promise as the close,
 * beside the most honest artifact an agent can show — the itemised bill
 * for the run the whole page has been narrating. Prismatic light owns the
 * band's edges; the content sits in the dark centre.
 */
export default function AgentBand() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const scope = root.current;
      if (!scope) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      ScrollTrigger.batch(gsap.utils.toArray<HTMLElement>('[data-cell]', scope), {
        start: 'top 88%',
        once: true,
        onEnter: (batch) =>
          gsap.fromTo(
            batch,
            { y: 20, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.07, ease: 'power2.out', overwrite: true }
          ),
      });

      gsap.fromTo(
        gsap.utils.toArray<HTMLElement>('.ldx-run-row', scope),
        { autoAlpha: 0, y: 5 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.3,
          stagger: 0.09,
          ease: 'power1.out',
          scrollTrigger: { trigger: '.ldx-run', start: 'top 80%', once: true },
        }
      );
    },
    { scope: root }
  );

  return (
    <section className='tc-band' id='connect' ref={root}>
      <PrismaticField className='tc-band-field' preset='2' speed={0.45} params={{ exposureScale: 2000 }} />
      <div className='tc-band-in'>
        <div className='tc-band-top'>
          <div data-cell>
            <h2>Zero engineering bandwidth.</h2>
            <p className='tc-band-sub'>
              Connect a GitHub repo and your app is translated — in native speed and quality, with your
              review in the loop.
            </p>
            <div className='tc-band-acts'>
              <a
                className='tc-btn tc-btn-solid'
                href='/dashboard/api/integrations/github/start?returnTo=%2Fproject%2Flocadex'
              >
                Connect GitHub
              </a>
              <a className='tc-btn tc-btn-line' href='/docs/platform/locadex'>
                Read the docs
              </a>
            </div>
          </div>

          <div className='ldx-run' data-cell>
            <div className='ldx-run-bar'>
              <span>locadex · run #1184</span>
              <span>summary</span>
            </div>
            <div className='ldx-run-body'>
              {SUMMARY.map((row) => (
                <div className={`ldx-run-row${row.total ? ' is-total' : ''}`} key={row.label}>
                  <span>{row.label}</span>
                  <b>{row.value}</b>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className='tc-band-grid'>
          <div data-cell>
            <h3>Metered, capped</h3>
            <p>
              Runs are billed at $5 per Locadex Compute Unit — files touched, lines changed, resources end
              to end. A usage limit is a hard cap.
            </p>
          </div>
          <div data-cell>
            <h3>Review stays yours</h3>
            <p>
              Every run ends at a pull request on a locadex/ branch. Auto-merge is off until you turn it
              on.
            </p>
          </div>
          <div data-cell>
            <h3>Standing automation</h3>
            <p>Three templates re-run as your code changes — on push, on PR, or started manually.</p>
          </div>
          <div data-cell>
            <h3>Your commands, sandboxed</h3>
            <p>
              Pre- and post-process commands and your linter run in a sandboxed VM, with your org&rsquo;s
              secrets as env vars.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
