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

/** The four controls, filed as certificates the way the dossier files them. */
const CERTS: readonly { file: string; name: string; copy: string }[] = [
  {
    file: 'ctrl · 01',
    name: 'Metered, capped',
    copy: 'Runs are billed at $5 per Locadex Compute Unit — files touched, lines changed, resources end to end. A Usage Limit is a hard cap.',
  },
  {
    file: 'ctrl · 02',
    name: 'Review stays yours',
    copy: 'Every run ends at a pull request on a locadex/ branch. Auto-merge is off until you turn it on.',
  },
  {
    file: 'ctrl · 03',
    name: 'Standing automation',
    copy: 'Three templates re-run as your code changes — on push, on PR, or started manually.',
  },
  {
    file: 'ctrl · 04',
    name: 'Your commands, sandboxed',
    copy: 'Pre- and post-process commands and your linter run in a sandboxed VM, with your org’s secrets as env vars.',
  },
];

/**
 * The page's one full-bleed dark break, and the close: the promise beside
 * the most honest artifact an agent can show — the itemised bill for the
 * run the whole page has been narrating — with the four controls filed as
 * dashed certificates below. Prismatic light owns the band's edges; the
 * content sits in the dark center.
 */
export default function LocadexBand() {
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
        gsap.utils.toArray<HTMLElement>('.sgx-bill-row', scope),
        { autoAlpha: 0, y: 5 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.3,
          stagger: 0.08,
          ease: 'power1.out',
          scrollTrigger: { trigger: '.sgx-bill', start: 'top 80%', once: true },
        }
      );
    },
    { scope: root }
  );

  return (
    <section className='tc-band' id='connect' ref={root}>
      <PrismaticField
        className='tc-band-field'
        preset='2'
        speed={0.45}
        params={{ exposureScale: 2000 }}
      />
      <div className='tc-band-in'>
        <div className='tc-band-top'>
          <div className='sgx-band-head' data-cell>
            <h2>Zero engineering bandwidth.</h2>
            <p className='tc-band-sub'>
              Connect a GitHub repo and your app is translated — in native speed and quality, with
              your review in the loop.
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

          <div className='sgx-panel sgx-bill' data-cell>
            <div className='sgx-panel-bar'>
              <span>locadex · run #1184</span>
              <span>summary</span>
            </div>
            <div className='sgx-bill-body'>
              {SUMMARY.map((row) => (
                <div className={`sgx-bill-row${row.total ? ' is-total' : ''}`} key={row.label}>
                  <span>{row.label}</span>
                  <b>{row.value}</b>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className='sgx-certs'>
          {CERTS.map((cert) => (
            <div className='sgx-cert' data-cell key={cert.file}>
              <span className='sgx-cert-file'>{cert.file}</span>
              <h3>{cert.name}</h3>
              <p>{cert.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
