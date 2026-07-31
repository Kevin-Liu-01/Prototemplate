'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import { useRef } from 'react';

import { CTA_ROTATION } from '../data';

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrambleTextPlugin);

const FOOTER_COLS: ReadonlyArray<readonly [string, readonly string[]]> = [
  ['Product', ['Docs', 'Blog', 'Pricing', 'Supported Locales']],
  ['Company', ['Careers', 'Contact', 'Enterprise']],
  ['Community', ['GitHub', '𝕏', 'Discord', 'LinkedIn']],
  ['Legal', ['Terms of Service', 'Privacy', 'Acceptable Use']],
];

export default function ClosingBands() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from('.tb-reveal', {
        autoAlpha: 0,
        y: 26,
        duration: 0.9,
        stagger: 0.07,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.tb-pricing', start: 'top 92%', once: true },
      });

      /* The masthead clears for the sign-off: the pill otherwise lands straight
         on the closing CTA row, printing "Sign Up" through itself. Driven by a
         class rather than a tween, because the story's own scrubbed timeline
         owns this element's autoAlpha and would win the last write. */
      const clearNav = ScrollTrigger.create({
        trigger: '.tb-cta',
        start: 'top 42%',
        end: 'bottom top',
        toggleClass: { targets: '.tb-root .tb-nav', className: 'tb-nav--out' },
      });

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => clearNav.kill();
      let index = 1;
      const cycle = () => {
        gsap.to('#tb-cta-rot', {
          duration: 0.9,
          scrambleText: { text: CTA_ROTATION[index % CTA_ROTATION.length] ?? '', chars: 'lowerCase', speed: 0.4 },
          onComplete: () => {
            index += 1;
            gsap.delayedCall(2.4, cycle);
          },
        });
      };
      const st = ScrollTrigger.create({
        trigger: '.tb-cta',
        start: 'top 80%',
        once: true,
        onEnter: () => cycle(),
      });
      return () => {
        st.kill();
        clearNav.kill();
      };
    },
    { scope: root }
  );

  return (
    <div ref={root}>
      <section className='tb-pricing' id='tb-pricing'>
        <div className='tb-chyron'>
          <h2 className='tb-reveal'>Pricing for everyone</h2>
          <p className='tb-ch-sub tb-reveal'>
            Start free and upgrade anytime — full-stack localization across buildtime, runtime, and review.
          </p>
        </div>
        <div className='tb-plans'>
          <div className='tb-plan tb-plan--metal tb-reveal'>
            <p>Starter</p>
            <div className='tb-plan-price'>
              $0<small> to start · pay as you go</small>
            </div>
            <ul>
              <li>Unlimited projects, unlimited users, unlimited languages</li>
              <li>Open-source SDKs for 6 frameworks</li>
              <li>Translation CDN with over-the-air updates</li>
              <li>Locadex agent runs on your repos</li>
            </ul>
            <a className='tb-btn tb-btn--solid' href='#tb-cta'>
              Get Started
            </a>
          </div>
          <div className='tb-plan tb-reveal'>
            <p>Enterprise</p>
            <div className='tb-plan-price' style={{ fontSize: 34, lineHeight: 1.4 }}>
              Custom<small> pricing</small>
            </div>
            <ul>
              <li>SSO and role-based access</li>
              <li>SOC 2 Type II &amp; ISO 27001</li>
              <li>Forward-deployed engineers</li>
              <li>Dedicated Slack support</li>
            </ul>
            <a className='tb-btn tb-btn--line' href='#tb-cta'>
              Contact Us
            </a>
          </div>
        </div>
      </section>

      <section className='tb-cta' id='tb-cta'>
        <h2 className='tb-foil'>
          Deploy today
          <br />
          in <span id='tb-cta-rot'>every language</span>
        </h2>
        <p>Talk to an engineer about implementation or get started for free.</p>
        <div className='tb-ctas'>
          <a className='tb-btn tb-btn--solid' href='#tb-top'>
            Get a Demo
          </a>
          <a className='tb-btn tb-btn--line' href='#tb-top'>
            Sign Up
          </a>
        </div>
      </section>

      <footer className='tb-foot'>
        <div className='tb-foot-grid'>
          <div className='tb-foot-brand'>
            <span className='tb-logo'>
              <Image src='/brand/no-bg-gt-logo-dark.png' alt='General Translation' width={80} height={80} />
            </span>
            <p>Language infrastructure for the internet · EST. 2023 · SF</p>
          </div>
          <div className='tb-foot-cols'>
            {FOOTER_COLS.map(([heading, links]) => (
              <div className='tb-foot-col' key={heading}>
                <p>{heading}</p>
                {links.map((link) => (
                  <a href='#tb-top' key={link}>
                    {link}
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className='tb-foot-bottom'>
          <span>SOC 2 Type II · GDPR · ISO 27001</span>
          <span>© 2026 General Translation, Inc. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
