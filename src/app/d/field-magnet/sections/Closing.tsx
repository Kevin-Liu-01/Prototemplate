'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Image from 'next/image';
import { useRef } from 'react';

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

/** Pricing teaser, closing CTA, and the footer. */
export default function Closing() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.utils.toArray<HTMLElement>('h2', root.current).forEach((heading) => {
        SplitText.create(heading, {
          type: 'lines',
          mask: 'lines',
          autoSplit: true,
          /* fromTo, not from: immediateRender stays off, so a heading whose
             trigger never fires (stale positions behind the pinned story) is
             still visible rather than parked under its mask. */
          onSplit: (self) =>
            gsap.fromTo(
              self.lines,
              { yPercent: 110 },
              {
                yPercent: 0,
                duration: 0.9,
                ease: 'expo.out',
                stagger: 0.09,
                scrollTrigger: { trigger: heading, start: 'top 92%', once: true },
              }
            ),
        });
      });
      gsap.utils.toArray<HTMLElement>('[data-reveal]', root.current).forEach((el) => {
        gsap.fromTo(
          el,
          { autoAlpha: 0, y: 28 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 90%', once: true },
          }
        );
      });
    },
    { scope: root }
  );

  return (
    <div ref={root}>
      <section className='fm-sec' id='pricing'>
        <div className='fm-wrap'>
          <div className='fm-sec-head'>
            <h2>Pricing for everyone</h2>
            <p data-reveal>Full-stack localization across buildtime, runtime, and review.</p>
          </div>
          <div className='fm-pricing'>
            <div className='fm-plan fm-plan-starter' data-reveal>
              <h3>Starter</h3>
              <div className='fm-plan-price'>
                <b>$0</b> to start, then pay as you go
              </div>
              <ul>
                <li>Unlimited projects, unlimited users, unlimited languages</li>
                <li>Open-source SDKs + Translation CDN</li>
                <li>Locadex agent workflows, usage-priced</li>
              </ul>
              <a className='fm-btn fm-btn-solid' href='#close' data-magnetic>
                Get Started <span className='fm-arr'>→</span>
              </a>
            </div>
            <div className='fm-plan' data-reveal>
              <h3>Enterprise</h3>
              <div className='fm-plan-price'>Custom volume pricing, annual or usage</div>
              <ul>
                <li>SSO · SOC 2 Type II &amp; ISO 27001</li>
                <li>Forward-deployed engineers</li>
                <li>Dedicated Slack support</li>
              </ul>
              <a className='fm-btn fm-btn-ghost' href='#close' data-magnetic>
                Contact Us
              </a>
            </div>
          </div>
          <p className='fm-philosophy' data-reveal>
            Usage-based, not seats — we want translation abundance.
          </p>
        </div>
      </section>

      <section className='fm-close' id='close'>
        <div className='fm-wrap'>
          <h2 className='fm-close-h'>
            Deploy today
            <br />
            in every language
          </h2>
          <p data-reveal>Talk to an engineer about implementation or get started for free.</p>
          <div className='fm-ctas' data-reveal>
            <a className='fm-btn fm-btn-solid' href='#top' data-magnetic>
              Get a Demo <span className='fm-arr'>→</span>
            </a>
            <a className='fm-btn fm-btn-ghost' href='#top' data-magnetic>
              Sign Up
            </a>
          </div>
        </div>
      </section>

      <footer className='fm-foot'>
        <div className='fm-wrap'>
          <div className='fm-foot-grid'>
            <div className='fm-foot-brand'>
              <a className='fm-brand' href='#top'>
                <Image
                  src='/brand/no-bg-gt-logo-dark.png'
                  alt=''
                  width={24}
                  height={24}
                  className='fm-brand-mark'
                />
                <span>General Translation</span>
              </a>
              <p>Language infrastructure for the internet.</p>
              <p className='fm-compliance'>SOC 2 Type II · GDPR · ISO 27001</p>
            </div>
            <div className='fm-foot-col'>
              <div className='fm-foot-h'>Guides</div>
              <a href='#story'>Locadex Agent</a>
              <a href='#story'>Next.js</a>
              <a href='#story'>React</a>
              <a href='#story'>React Native</a>
            </div>
            <div className='fm-foot-col'>
              <div className='fm-foot-h'>Resources</div>
              <a href='#story'>Documentation</a>
              <a href='#features'>Blog</a>
              <a href='#pricing'>Pricing</a>
              <a href='#top'>Supported Locales</a>
            </div>
            <div className='fm-foot-col'>
              <div className='fm-foot-h'>Social</div>
              <a href='#top'>GitHub</a>
              <a href='#top'>X</a>
              <a href='#top'>LinkedIn</a>
              <a href='#top'>Discord</a>
            </div>
            <div className='fm-foot-col'>
              <div className='fm-foot-h'>Company</div>
              <a href='#top'>Careers</a>
              <a href='#top'>Contact</a>
              <a href='#top'>Terms of Service</a>
              <a href='#top'>Privacy</a>
            </div>
          </div>
          <div className='fm-foot-bottom'>
            <span>All systems operational</span>
            <span className='fm-copyright'>
              © 2026 General Translation, Inc. All rights reserved.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
