'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';

import PrismaticField from '@/components/shared/PrismaticField';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const ROT2 = ['every language', 'cada idioma', 'chaque langue', 'すべての言語', 'jeder Sprache', '每一种语言'];

/** Admission, the closing wall, and the exit. */
export default function Closing() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
        gsap.fromTo(
          el,
          { autoAlpha: 0, y: 26 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 90%', once: true },
          }
        );
      });

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const rot = root.current?.querySelector<HTMLElement>('[data-rot2]');
      if (!rot) return;
      let i = 0;
      const id = window.setInterval(() => {
        i = (i + 1) % ROT2.length;
        rot.textContent = ROT2[i] ?? '';
        gsap.fromTo(rot, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.5 });
      }, 2600);
      return () => window.clearInterval(id);
    },
    { scope: root }
  );

  return (
    <div ref={root}>
      <section className='wg-pricing' id='pricing'>
        <h2 data-reveal>Start free. Upgrade anytime.</h2>
        <p className='phil' data-reveal>
          Usage-based, never per-seat — an entire localization department for every developer.
        </p>
        <div className='wg-plans'>
          <div className='wg-plan wg-frame' data-reveal>
            <span className='p-k'>Starter</span>
            <div className='p-price'>
              $0 <span>from — pay as you go</span>
            </div>
            <ul>
              <li>Unlimited projects</li>
              <li>Unlimited users</li>
              <li>Unlimited languages</li>
            </ul>
            <a className='wg-btn wg-btn-ink' href='#close'>
              Get Started <span className='wg-arr'>→</span>
            </a>
            <div className='wg-plinth' aria-hidden />
          </div>
          <div className='wg-plan wg-frame' data-reveal>
            <span className='p-k'>Enterprise</span>
            <div className='p-price'>
              Custom <span>pricing</span>
            </div>
            <ul>
              <li>SSO · SOC 2 Type II &amp; ISO 27001</li>
              <li>Forward-deployed engineers</li>
              <li>Slack support</li>
            </ul>
            <a className='wg-btn wg-btn-line' href='#close'>
              Contact Us
            </a>
            <div className='wg-plinth' aria-hidden />
          </div>
        </div>
      </section>

      <section className='wg-close' id='close'>
        <PrismaticField
          className='wg-close-field'
          preset='2'
          dpr={1}
          speed={0.5}
          params={{ exposureScale: 4200 }}
        />
        <div className='wg-stage-tint' aria-hidden />
        {/* the hero's viewfinder, closed: the same axis crossing under the last
            line, so the page ends on the object it opened with */}
        <div className='wg-cross-h' aria-hidden />
        <div className='wg-cross-v' aria-hidden />
        <div className='wg-close-inner'>
          <h2 data-reveal>
            Deploy today in{' '}
            <span className='rot2' data-rot2>
              every language
            </span>
          </h2>
          <p data-reveal>Talk to an engineer about implementation or get started for free</p>
          <div className='wg-hero-cta' data-reveal>
            <a className='wg-btn wg-btn-ink' href='#close'>
              Get a Demo <span className='wg-arr'>→</span>
            </a>
            <a className='wg-btn wg-btn-line' href='#pricing'>
              Sign Up
            </a>
          </div>
        </div>
      </section>

      <footer className='wg-footer'>
        <div className='wg-foot-grid'>
          <div className='wg-foot-brand'>
            <span className='wg-brand'>General Translation</span>
            <p>Language infrastructure for the internet — for your next 1,000,000,000 users.</p>
          </div>
          <div className='wg-foot-col'>
            <h5>Guides</h5>
            <a href='#story'>Locadex Agent</a>
            <a href='#features'>Next.js</a>
            <a href='#features'>React</a>
            <a href='#features'>React Native</a>
          </div>
          <div className='wg-foot-col'>
            <h5>Resources</h5>
            <a href='#features'>Documentation</a>
            <a href='#review'>Blog</a>
            <a href='#pricing'>Pricing</a>
            <a href='#top'>Supported Locales</a>
          </div>
          <div className='wg-foot-col'>
            <h5>Social</h5>
            <a href='#top'>GitHub</a>
            <a href='#top'>𝕏</a>
            <a href='#top'>Discord</a>
            <a href='#top'>LinkedIn</a>
          </div>
          <div className='wg-foot-col'>
            <h5>Company</h5>
            <a href='#top'>Careers</a>
            <a href='#close'>Contact</a>
            <a href='#top'>Terms of Service</a>
            <a href='#top'>Privacy</a>
          </div>
        </div>
        <div className='wg-foot-bottom'>
          <span>SOC 2 TYPE II · GDPR · ISO 27001</span>
          <span>© 2026 General Translation, Inc. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
