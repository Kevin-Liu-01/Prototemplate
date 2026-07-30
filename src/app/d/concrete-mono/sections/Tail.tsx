'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import { useRef } from 'react';

import EditorWorkspace from '@/components/shared/EditorWorkspace';
import FeatureBento, { type FeatureBentoItem } from '@/components/shared/FeatureBento';
import PrismaticField from '@/components/shared/PrismaticField';

import {
  CodePanel,
  ConfigPanel,
  ContextPanel,
  DeliveryPanel,
  PreviewsPanel,
  RoutingPanel,
  RuntimePanel,
  TranslationPanel,
} from '../components/FeaturePanels';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const CLOSERS = [
  'EVERY LANGUAGE',
  'CADA IDIOMA',
  'CHAQUE LANGUE',
  'すべての言語',
  'JEDER SPRACHE',
  '모든 언어',
];

/**
 * Every cell is heading + body + the real artifact (FeaturePanels): actual
 * code, glossary rows, translations, paths, latencies — never abstract
 * line-art. `category` is deliberately empty — the kicker line it renders is
 * the `[05] EDGE` decoration the founder cut, and the concrete skin hides
 * the element outright.
 */
const FEATURE_ITEMS: FeatureBentoItem[] = [
  {
    key: 'code',
    category: '',
    title: 'Code',
    body: 'Developer-first libraries for React, Next.js, and more, battle-tested in production apps with millions of users.',
    diagram: <CodePanel />,
  },
  {
    key: 'context',
    category: '',
    title: 'Context',
    body: 'Glossaries, locale rules, and custom prompts. Control tone, terminology, and regional nuance.',
    diagram: <ContextPanel />,
  },
  {
    key: 'translation',
    category: '',
    title: 'Translation',
    body: 'AI agents that understand your project structure and localize your content in context.',
    diagram: <TranslationPanel />,
  },
  {
    key: 'routing',
    category: '',
    title: 'Routing',
    body: 'Automatic language detection and locale-based routing. SEO-friendly paths with zero configuration.',
    diagram: <RoutingPanel />,
  },
  {
    key: 'delivery',
    category: '',
    title: 'Delivery',
    body: 'A global, low-latency translation CDN. Push over-the-air updates without redeploying your app.',
    diagram: <DeliveryPanel />,
  },
  {
    key: 'previews',
    category: '',
    title: 'Previews',
    body: 'Preview translations in development before they go live. Catch issues early and ship with confidence.',
    diagram: <PreviewsPanel />,
  },
  {
    key: 'runtime',
    category: '',
    title: 'Live Translation',
    body: 'Translate user-generated content on demand, with low latency and full context.',
    diagram: <RuntimePanel />,
  },
  {
    key: 'config',
    category: '',
    title: 'Customization',
    body: 'Build your own language detection functions, locale-specific components, and formatting logic.',
    diagram: <ConfigPanel />,
  },
];

/**
 * Acts IV–VII. The review workspace and the platform grid are the shared
 * components, skinned in concrete; pricing, the close and the footer are local.
 * Everything stamps in with a hard two-step cut — no eased fades.
 */
export default function Tail() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced) return;

      gsap.utils.toArray<HTMLElement>('[data-stamp]').forEach((el) => {
        gsap.from(el, {
          scale: 1.3,
          autoAlpha: 0,
          duration: 0.2,
          ease: 'steps(2)',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        });
      });

      const rot = root.current?.querySelector<HTMLElement>('[data-closer]');
      if (rot) {
        let i = 0;
        const cycle = () => {
          gsap.delayedCall(2.6, () => {
            i = (i + 1) % CLOSERS.length;
            rot.textContent = CLOSERS[i] ?? CLOSERS[0] ?? '';
            gsap.fromTo(rot, { opacity: 0.3 }, { opacity: 1, duration: 0.28, ease: 'steps(2)' });
            cycle();
          });
        };
        cycle();
      }
    },
    { scope: root }
  );

  return (
    <div ref={root}>
      {/* ============ ACT IV — THE REVIEW WORKSPACE ============ */}
      <EditorWorkspace
        className='cm-editor'
        id='review'
        heading='Thoughts?'
        /* the notes are the run's own queue ledger, not a restatement of the
           workspace — the skin sets them into the heading band's right side,
           which otherwise ran ~60% empty dark (r2 item 3) */
        subheading='Agents write translations. You review, edit, and approve in a focused workspace.'
        notes={[
          'queue — es-419 · 5 strings',
          'revised — 1 · approved — 1',
          'reviewer — legal counsel',
          'webhook — requires_review',
        ]}
        meta='example-app · locadex/i18n · es-419'
        sourceLabel='Source — EN'
        targetLabel='Translation — ES'
        /* real counts along the plate's bottom edge */
        footer={['5 strings', '1 revised', '1 approved', 'run #482 · es-419']}
        /* stacked, not split: the side-by-side layout hung the workspace off
           the right margin and left the lower third of the act empty, against
           a page whose every other block starts on the same left axis */
        layout='stacked'
      />

      {/* ============ ACT V — THE FEATURE GRID ============ */}
      <FeatureBento
        className='cm-features'
        id='features'
        heading='Heavy machinery'
        subheading='Full-stack infrastructure for localizing apps, docs, and websites — for your next 1,000,000,000 users.'
        items={FEATURE_ITEMS}
        columns={4}
      />

      {/* ============ PRICING ============ */}
      <section className='cm-section cm-pricing-sec' id='pricing' aria-label='Pricing'>
        <div className='cm-sec-head'>
          <h2 className='cm-sec-title slab' data-stamp>
            Start free. Upgrade anytime.
          </h2>
          <p className='cm-sec-sub' data-stamp>
            Usage-based, not seats. Full-stack localization across buildtime, runtime, and review.
          </p>
        </div>
        <div className='cm-pricing'>
          <div className='cm-plan' data-stamp>
            <div className='p-name'>Starter</div>
            <div className='p-price'>
              from <b>$0</b> · pay-as-you-go
            </div>
            <ul>
              <li>Unlimited projects, unlimited users, unlimited languages</li>
              <li>Translation CDN + over-the-air updates</li>
              <li>Locadex agent workflows</li>
            </ul>
            <a className='solid' href='#closing'>
              Get Started
            </a>
          </div>
          <div className='cm-plan steel' data-stamp>
            <div className='p-name'>Enterprise</div>
            <div className='p-price'>
              <b>Custom</b> pricing
            </div>
            <ul>
              <li>SSO · SOC 2 Type II &amp; ISO 27001</li>
              <li>Forward-deployed engineers</li>
              <li>Dedicated Slack support</li>
            </ul>
            <a className='solid' href='#closing'>
              Contact Us
            </a>
          </div>
        </div>
      </section>

      {/* ============ CLOSING ============ */}
      <section className='cm-closing' id='closing'>
        {/* the wide horizontal burst, bright — the shader is the band's
            armature (AESTHETIC_ADDENDUM 2b): its light axis runs the full
            width and the copy sits in a composed dark pocket on the left,
            not in front of a flat black half (r2 item 6) */}
        <PrismaticField
          className='cm-closing-field'
          preset='1'
          dpr={1}
          speed={0.4}
          params={{ exposureScale: 2400 }}
        />
        <h2 className='slab' data-stamp>
          Deploy today in
          <br />
          <span className='chrome' data-closer>
            EVERY LANGUAGE
          </span>
        </h2>
        <p className='cm-sec-sub' data-stamp>
          Talk to an engineer about implementation or get started for free.
        </p>
        <div className='cm-hero-ctas' data-stamp>
          <a className='primary' href='#top'>
            Get a Demo
          </a>
          <a className='ghost' href='#pricing'>
            Sign Up
          </a>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className='cm-footer' aria-label='Footer'>
        <div className='cm-foot-grid'>
          <div className='cm-foot-brand'>
            <Image
              src='/brand/no-bg-gt-logo-dark.png'
              alt='General Translation'
              width={60}
              height={60}
            />
            <p>
              GENERAL TRANSLATION, INC.
              <br />
              LANGUAGE INFRASTRUCTURE FOR THE INTERNET.
            </p>
          </div>
          <div className='cm-foot-col'>
            <span className='k'>Guides</span>
            <a href='#features'>Locadex Agent</a>
            <a href='#features'>Next.js</a>
            <a href='#features'>React</a>
            <a href='#features'>React Native</a>
          </div>
          <div className='cm-foot-col'>
            <span className='k'>Resources</span>
            <a href='#features'>Documentation</a>
            <a href='#story'>Blog</a>
            <a href='#pricing'>Pricing</a>
            <a href='#top'>Supported Locales</a>
          </div>
          <div className='cm-foot-col'>
            <span className='k'>Company</span>
            <a href='#closing'>Careers</a>
            <a href='#closing'>Contact</a>
            <a href='#closing'>GitHub</a>
            <a href='#closing'>Discord</a>
          </div>
          <div className='cm-foot-col'>
            <span className='k'>Legal</span>
            <a href='#closing'>Terms of Service</a>
            <a href='#closing'>Privacy</a>
            <a href='#closing'>Acceptable Use</a>
          </div>
        </div>
        <div className='cm-foot-bottom'>
          <span>© 2026 General Translation, Inc.</span>
          <span>SOC 2 Type II · GDPR · ISO 27001</span>
        </div>
      </footer>
    </div>
  );
}
