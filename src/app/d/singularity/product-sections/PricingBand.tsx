'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';

import PrismaticField from '@/components/shared/PrismaticField';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** The four stages, verbatim from the current pricing page — stages of one
 *  platform, not four SKUs. Filed as the dossier files its certificates. */
const STAGES: readonly { file: string; name: string; line: string }[] = [
  {
    file: 'stage · 01',
    name: 'Code → Internationalization',
    line: 'Mark up UI copy, route locales, and ship static translations in your codebase.',
  },
  {
    file: 'stage · 02',
    name: 'Content → Translation APIs',
    line: 'Translate user-generated and backend content on demand across every runtime surface.',
  },
  {
    file: 'stage · 03',
    name: 'Dashboard → Context Platform',
    line: 'Curate glossaries, style rules, and project context, along with editing, versioning, and integrations.',
  },
  {
    file: 'stage · 04',
    name: 'Locadex → Agent Automations',
    line: 'Locadex scans repos, updates i18n code, generates translations, runs visual QA, and opens guarded PRs.',
  },
];

/**
 * The page's one dark break, and the close: one platform, two plans,
 * published rates. Prismatic light owns the band's edges, the content
 * sits in the dark center, and the four stages file as certificates.
 */
export default function PricingBand() {
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
    },
    { scope: root }
  );

  return (
    <section className='tc-band' ref={root}>
      <PrismaticField
        className='tc-band-field'
        preset='1'
        speed={0.4}
        params={{ exposureScale: 2400 }}
      />
      <div className='tc-band-in'>
        <div className='sgx-band-head' data-cell>
          <h2>One platform. Two plans. Published rates.</h2>
          <p className='tc-band-sub'>
            Start at $0 with unlimited users, projects, and languages — or talk to an engineer
            about volume, custom workflows, and your security review.
          </p>
        </div>

        <div className='sgx-certs'>
          {STAGES.map((stage) => (
            <div className='sgx-cert' data-cell key={stage.file}>
              <span className='sgx-cert-file'>{stage.file}</span>
              <h3>{stage.name}</h3>
              <p>{stage.line}</p>
            </div>
          ))}
        </div>

        <div className='tc-band-acts' data-cell>
          <a className='tc-btn tc-btn-solid' href='#top'>
            Get started — $0
          </a>
          <a className='tc-btn tc-btn-line' href='#top'>
            Contact us
          </a>
        </div>
      </div>
    </section>
  );
}
