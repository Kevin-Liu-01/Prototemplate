'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import { useRef } from 'react';

import PrismaticField from '@/components/shared/PrismaticField';

import { FEATURES, STATS } from '../content';

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrambleTextPlugin);

const CLOSERS = [
  'EVERY LANGUAGE',
  'CADA IDIOMA',
  'CHAQUE LANGUE',
  'すべての言語',
  'JEDER SPRACHE',
  '모든 언어',
];

/**
 * Acts IV–VII. Everything stamps in with a hard two-step cut — no eased
 * fades — which is the whole point of this direction.
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

      gsap.utils.toArray<HTMLElement>('.cm-sec-idx').forEach((el) => {
        const text = el.textContent ?? '';
        ScrollTrigger.create({
          trigger: el,
          start: 'top 92%',
          once: true,
          onEnter: () =>
            gsap.to(el, {
              duration: 0.45,
              scrambleText: { text, chars: '01<>_/\\', speed: 0.9 },
              ease: 'none',
            }),
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
      <section className='cm-section cm-review' id='review' aria-label='Translation editor'>
        <div className='cm-sec-head'>
          <span className='cm-sec-idx'>[04] TRANSLATION EDITOR //</span>
          <h2 className='cm-sec-title slab' data-stamp>
            Thoughts?
          </h2>
          <p className='cm-sec-sub' data-stamp>
            Agents write translations. You review, edit, and approve in a focused workspace.
          </p>
        </div>
        <div className='cm-ws' data-stamp>
          <div className='cm-ws-bar'>
            <span>PROJECT: EXAMPLE-APP</span>
            <span>BRANCH: locadex/i18n</span>
            <span>LOCALE: ES</span>
            <span className='live'>● LIVE</span>
          </div>
          <div className='cm-ws-grid'>
            <div className='cm-ws-pane'>
              <span className='k'>SOURCE — EN</span>
              <span className='cm-ws-line'>Hello, world!</span>
              <span className='cm-ws-line sel'>
                Ship it everywhere. Your app, in every language your users speak.
              </span>
              <span className='cm-ws-line'>Get started</span>
              <span className='cm-ws-line'>By continuing you agree to the Terms of Service.</span>
            </div>
            <div className='cm-ws-pane'>
              <span className='k'>TRANSLATION — ES · SIDE-BY-SIDE</span>
              <span className='cm-ws-line'>¡Hola, mundo!</span>
              <span className='cm-ws-line del'>Envíalo por todos lados. Tu app, en cada idioma.</span>
              <span className='cm-ws-line add'>
                Publícalo en todas partes. Tu aplicación, en cada idioma que hablan tus usuarios.
                <span className='cm-caret' />
              </span>
              <span className='cm-ws-line'>Al continuar, aceptas los Términos del Servicio.</span>
            </div>
          </div>
          <div className='cm-ws-foot'>
            <span>DIFF — REGENERATED 2m AGO</span>
            <span>EDIT BEFORE OR AFTER LIVE</span>
            <span className='approve'>APPROVE ✓</span>
          </div>
        </div>
      </section>

      {/* ============ ACT V — THE FEATURE GRID ============ */}
      <section className='cm-section cm-features' id='features' aria-label='Platform features'>
        <div className='cm-sec-head'>
          <span className='cm-sec-idx'>[05] THE PLATFORM //</span>
          <h2 className='cm-sec-title slab' data-stamp>
            Heavy machinery
          </h2>
          <p className='cm-sec-sub' data-stamp>
            Full-stack infrastructure for localizing apps, docs, and websites — for your next
            1,000,000,000 users.
          </p>
        </div>
        <div className='cm-feat-grid'>
          {FEATURES.map((feature) => (
            <div className='cm-feat' key={feature.title} data-stamp>
              <span className='cat'>{feature.cat} //</span>
              <h3>{feature.title}</h3>
              <p>{feature.body}</p>
            </div>
          ))}
        </div>
        <div className='cm-stat-row' data-stamp aria-label='By the numbers'>
          {STATS.map((stat) => (
            <div className='stat' key={stat.label}>
              <b>{stat.value}</b>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ============ PRICING ============ */}
      <section className='cm-section cm-pricing-sec' id='pricing' aria-label='Pricing'>
        <div className='cm-sec-head'>
          <span className='cm-sec-idx'>[06] PRICING //</span>
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
        <p className='cm-price-note'>USAGE-BASED PRICING → /PRICING/USAGE</p>
      </section>

      {/* ============ CLOSING ============ */}
      <section className='cm-closing' id='closing'>
        <PrismaticField
          className='cm-closing-field'
          preset='2'
          dpr={1}
          speed={0.45}
          params={{ exposureScale: 2600 }}
        />
        <span className='cm-sec-idx'>[07] REACH EVERY USER //</span>
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
              LANGUAGE INFRASTRUCTURE
              <br />
              FOR THE INTERNET.
              <br />
              <br />
              SOC 2 TYPE II · GDPR · ISO 27001
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
          <span>© 2026 GENERAL TRANSLATION, INC. ALL RIGHTS RESERVED.</span>
          <span>BUILT LIKE HEAVY MACHINERY · 118 LOCALES · $0 TO START</span>
        </div>
      </footer>
    </div>
  );
}
