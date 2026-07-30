'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useRef } from 'react';

import { flipTo } from '../components/flapEngine';
import FlapPhrase from '../components/FlapPhrase';
import { SplitFlapLine } from '../components/SplitFlapBoard';

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

const CTA_LANGUAGES = [
  'EVERY LANGUAGE',
  'CHAQUE LANGUE',
  'CADA IDIOMA',
  'ALLEN SPRACHEN',
  'すべての言語で',
];

const STATS = [
  ['118', 'languages'],
  ['1,000,000,000', 'users reachable'],
  ['6', 'frameworks'],
  ['$0', 'to start'],
];

export default function PricingClose() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced) return;

      gsap.utils.toArray<HTMLElement>('.ft-h2').forEach((heading) => {
        SplitText.create(heading, {
          type: 'lines',
          mask: 'lines',
          autoSplit: true,
          onSplit(self) {
            return gsap.from(self.lines, {
              yPercent: 110,
              duration: 1,
              ease: 'expo.out',
              stagger: 0.09,
              scrollTrigger: { trigger: heading, start: 'top 85%', once: true },
            });
          },
        });
      });

      ScrollTrigger.batch('.ft-price-card, .ft-stat-cell', {
        start: 'top 88%',
        once: true,
        onEnter: (batch) =>
          gsap.from(batch, { autoAlpha: 0, y: 28, stagger: 0.09, duration: 0.8 }),
      });

      // The closing board turns only after it has been settled in view for a
      // beat, so arriving on the section always reads a whole phrase.
      const rotator = root.current?.querySelector<HTMLElement>('#ft-cta-flap');
      let index = 0;
      let turn: gsap.core.Tween | undefined;
      const spin = () => {
        turn = gsap.delayedCall(6, () => {
          if (rotator && !document.hidden) {
            index = (index + 1) % CTA_LANGUAGES.length;
            const phrase = CTA_LANGUAGES[index] ?? 'EVERY LANGUAGE';
            flipTo(rotator, phrase.padEnd(14, ' '), { per: 0.015, cycles: 2 });
          }
          spin();
        });
      };
      ScrollTrigger.create({
        trigger: '.ft-close',
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => {
          turn?.kill();
          if (self.isActive) spin();
        },
      });
    },
    { scope: root }
  );

  return (
    <section ref={root}>
      <div className='ft-sect' id='ft-pricing'>
        <div className='ft-wrap'>
          <div className='ft-sect-head'>
            <h2 className='ft-h2'>
              Start free. <FlapPhrase text='UPGRADE ANYTIME' />
            </h2>
            <p className='ft-sect-sub'>
              Usage-based — you pay for the translation you ship, never for seats.
            </p>
          </div>

          {/* the plans lead the section — a pricing block that opens on a
              stat row is not a pricing block */}
          <div className='ft-price-grid'>
            <div className='ft-price-card is-featured'>
              <span className='ft-price-name'>Starter</span>
              <span className='ft-price-num'>
                $0<small> to start · pay as you go</small>
              </span>
              <ul className='ft-price-feats'>
                <li>Unlimited projects</li>
                <li>Unlimited users</li>
                <li>Unlimited languages</li>
              </ul>
              <a className='ft-btn ft-btn-solid' href='#ft-top'>
                Get Started
              </a>
            </div>
            <div className='ft-price-card'>
              <span className='ft-price-name'>Enterprise</span>
              <span className='ft-price-num is-sm'>
                Custom<small> pricing</small>
              </span>
              <ul className='ft-price-feats'>
                <li>SSO &amp; SOC 2 Type II · ISO 27001</li>
                <li>Forward-deployed engineers</li>
                <li>Dedicated Slack support</li>
              </ul>
              <a className='ft-btn ft-btn-line' href='#ft-top'>
                Contact Us
              </a>
            </div>
          </div>

          <div className='ft-stat-row'>
            {STATS.map(([value, label]) => (
              <div className='ft-stat-cell' key={label}>
                <span className='ft-stat-value'>{value}</span>
                <span className='ft-stat-label'>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className='ft-close'>
        <div className='ft-wrap'>
          <h2 className='ft-sr'>Deploy today in every language</h2>
          <span className='ft-board ft-close-board' aria-hidden>
            <SplitFlapLine text='DEPLOY TODAY IN' />
            <SplitFlapLine text='EVERY LANGUAGE' pad={14} id='ft-cta-flap' />
          </span>
          <p>Talk to an engineer about implementation or get started for free.</p>
          <div className='ft-hero-ctas'>
            <a className='ft-btn ft-btn-solid' href='#ft-pricing'>
              Get a Demo
            </a>
            <a className='ft-btn ft-btn-line' href='#ft-top'>
              Sign Up
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
