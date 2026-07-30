'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';

import PrismaticField from '@/components/shared/PrismaticField';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function PricingClose() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      ScrollTrigger.batch('[data-reveal]', {
        start: 'top 88%',
        once: true,
        onEnter: (batch) =>
          gsap.fromTo(
            batch,
            { y: 32, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, stagger: 0.08, duration: 0.9, ease: 'power3.out', overwrite: true }
          ),
      });
    },
    { scope: root }
  );

  return (
    <div ref={root}>
      <section className='ba-pricing ba-pad' id='pricing'>
        <div className='ba-wrap' style={{ textAlign: 'center' }}>
          <h2
            data-reveal
            style={{
              fontFamily: 'var(--display)',
              fontSize: 'var(--ba-head)',
              letterSpacing: '-0.045em',
              lineHeight: 1,
              margin: 0,
            }}
          >
            Pricing for everyone
          </h2>
          <p className='ba-phil' data-reveal>
            Usage-based, not seats — like the rest of your infrastructure.
          </p>
          <div className='ba-pgrid'>
            <div className='ba-plan ba-starter ba-sheet' data-reveal>
              <span className='ba-p-name'>Starter</span>
              <div className='ba-p-price'>
                $0 <small>/ from — pay as you go</small>
              </div>
              <p className='ba-p-sub'>Full-stack localization across buildtime, runtime, and review</p>
              <ul>
                <li>Unlimited projects</li>
                <li>Unlimited users</li>
                <li>Unlimited languages</li>
              </ul>
              <a className='ba-btn ba-btn-solid' href='#dashboard'>
                Get Started
              </a>
            </div>
            <div className='ba-plan ba-sheet' data-reveal>
              <span className='ba-p-name'>Enterprise</span>
              <div className='ba-p-price' style={{ fontSize: 30, padding: '9px 0 7px' }}>
                Custom
              </div>
              <p className='ba-p-sub'>For teams shipping at global scale</p>
              <ul>
                <li>SSO &amp; SOC 2 Type II · ISO 27001</li>
                <li>Forward-deployed engineers</li>
                <li>Dedicated Slack support</li>
              </ul>
              <a className='ba-btn' href='#contact'>
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* The close is the page's second lamp: the same dispersed light as the
          hero, laid as a low horizontal band under the closing line so the
          bottom of the document is lit rather than printed on matte card. */}
      <section className='ba-close ba-pad' id='demo'>
        <PrismaticField
          className='ba-close-field'
          preset='2'
          params={{ exposureScale: 3200 }}
          speed={0.34}
        />
        <div className='ba-wrap'>
          <h2 data-reveal>
            Deploy today
            <br />
            in <span className='ba-brushed'>every language</span>
          </h2>
          <p className='ba-body' data-reveal>
            Talk to an engineer about implementation or get started for free
          </p>
          <div className='ba-hero-ctas' data-reveal>
            <a className='ba-btn ba-btn-solid' href='#contact'>
              Get a Demo
            </a>
            <a className='ba-btn' href='#dashboard'>
              Sign Up
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
