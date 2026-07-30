'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import { useRef } from 'react';

import PrismaticField from '@/components/shared/PrismaticField';

import { CLOSERS } from '../content';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** Pricing, the closing frame, and the footer. */
export default function Tail() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      for (const el of gsap.utils.toArray<HTMLElement>('[data-rise]', root.current)) {
        gsap.from(el, {
          y: 30,
          autoAlpha: 0,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        });
      }

      const rot = root.current?.querySelector<HTMLElement>('[data-closer]');
      if (!rot) return;
      let i = 0;
      const cycle = () => {
        gsap.delayedCall(3, () => {
          i = (i + 1) % CLOSERS.length;
          gsap.to(rot, {
            opacity: 0,
            duration: 0.32,
            ease: 'power2.in',
            onComplete: () => {
              rot.textContent = CLOSERS[i] ?? CLOSERS[0] ?? '';
              gsap.to(rot, { opacity: 1, duration: 0.5, ease: 'power2.out' });
            },
          });
          cycle();
        });
      };
      cycle();
    },
    { scope: root }
  );

  return (
    <div ref={root}>
      {/* ===================== PRICING ===================== */}
      <section className='ap-section ap-pricing-sec' id='pricing' aria-label='Pricing'>
        <div className='ap-sec-head'>
          <h2 className='ap-sec-title' data-rise>
            Start free. Upgrade anytime.
          </h2>
          <p className='ap-sec-sub' data-rise>
            Usage-based, not seats. Full-stack localization across buildtime, runtime, and review.
          </p>
        </div>
        <div className='ap-plans'>
          <div className='ap-plan' data-rise>
            <div className='p-name'>Starter</div>
            <div className='p-price'>
              from <b>$0</b> · pay-as-you-go
            </div>
            <ul>
              <li>Unlimited projects, users, and languages</li>
              <li>Translation CDN with over-the-air updates</li>
              <li>Locadex agent workflows</li>
            </ul>
            <a className='solid' href='#closing'>
              Get Started
            </a>
          </div>
          <div className='ap-plan' data-rise>
            <div className='p-name'>Enterprise</div>
            <div className='p-price'>
              <b>Custom</b> pricing
            </div>
            <ul>
              <li>SSO, SOC 2 Type II, and ISO 27001</li>
              <li>Forward-deployed engineers</li>
              <li>Dedicated Slack support</li>
            </ul>
            <a className='solid' href='#closing'>
              Contact Us
            </a>
          </div>
        </div>
      </section>

      {/* ===================== CLOSING FRAME ===================== */}
      <section className='ap-closing' id='closing'>
        <div className='ap-closing-band' aria-hidden>
          <PrismaticField
            className='ap-field'
            preset='2'
            dpr={1}
            speed={0.4}
            params={{ exposureScale: 2500 }}
          />
        </div>
        <div className='ap-closing-copy'>
          <h2 className='ap-sec-title' data-rise>
            Deploy today in
            <br />
            <span className='chrome' data-closer>
              EVERY LANGUAGE
            </span>
          </h2>
          <p className='ap-sec-sub' data-rise>
            Talk to an engineer about implementation, or get started for free.
          </p>
          <div className='ap-ctas' data-rise>
            <a className='solid' href='#top'>
              Get a Demo
            </a>
            <a className='outline' href='#pricing'>
              Sign Up
            </a>
          </div>
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer className='ap-footer' aria-label='Footer'>
        <div className='ap-foot-grid'>
          <div className='ap-foot-brand'>
            <Image
              src='/brand/no-bg-gt-logo-dark.png'
              alt='General Translation'
              width={56}
              height={56}
            />
            <p>
              General Translation, Inc.
              <br />
              Language infrastructure for the internet.
            </p>
            <span className='ap-foot-comp'>SOC 2 Type II · GDPR · ISO 27001</span>
          </div>
          <div className='ap-foot-col'>
            <span className='ap-foot-lab'>Guides</span>
            <a href='#features'>Locadex Agent</a>
            <a href='#features'>Next.js</a>
            <a href='#features'>React</a>
            <a href='#features'>React Native</a>
          </div>
          <div className='ap-foot-col'>
            <span className='ap-foot-lab'>Resources</span>
            <a href='#features'>Documentation</a>
            <a href='#story'>Blog</a>
            <a href='#pricing'>Pricing</a>
            <a href='#top'>Supported Locales</a>
          </div>
          <div className='ap-foot-col'>
            <span className='ap-foot-lab'>Company</span>
            <a href='#closing'>Careers</a>
            <a href='#closing'>Contact</a>
            <a href='#closing'>GitHub</a>
            <a href='#closing'>Discord</a>
          </div>
          <div className='ap-foot-col'>
            <span className='ap-foot-lab'>Legal</span>
            <a href='#closing'>Terms of Service</a>
            <a href='#closing'>Privacy</a>
            <a href='#closing'>Acceptable Use</a>
          </div>
        </div>
        <div className='ap-foot-bottom'>
          <span>© 2026 General Translation, Inc. All rights reserved.</span>
          <span>118 locales · $0 to start</span>
        </div>
      </footer>
    </div>
  );
}
