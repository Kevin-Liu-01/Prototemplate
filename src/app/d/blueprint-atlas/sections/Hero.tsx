'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useRef } from 'react';

import PrismaticField from '@/components/shared/PrismaticField';

import HeroFlow from '../components/HeroFlow';

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, ScrambleTextPlugin);

/* Lowercase locale codes, not flag emoji: the codes are the product's own
   artifacts and they stay monochrome (§5 — the flags were the only
   multi-color marks on the page outside the prismatic field). */
const LOCALES: [string, string][] = [
  ['es', 'Español'], ['fr', 'Français'], ['ja', '日本語'], ['de', 'Deutsch'], ['zh', '中文'],
  ['pt', 'Português'], ['ko', '한국어'], ['it', 'Italiano'], ['hi', 'हिन्दी'], ['ar', 'العربية'],
  ['nl', 'Nederlands'], ['pl', 'Polski'], ['tr', 'Türkçe'], ['sv', 'Svenska'], ['vi', 'Tiếng Việt'],
  ['th', 'ไทย'], ['he', 'עברית'], ['el', 'Ελληνικά'], ['uk', 'Українська'], ['id', 'Bahasa'],
  ['ro', 'Română'], ['da', 'Dansk'],
];

const LANGS = ['Spanish', 'French', 'German', 'Japanese', 'Chinese', 'Portuguese', 'Korean', 'Arabic'];

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced) return;

      const tl = gsap.timeline({ defaults: { ease: 'power4.out', duration: 0.9 } });
      tl.fromTo('[data-sub]', { y: 22, autoAlpha: 0 }, { y: 0, autoAlpha: 1 }, 0.6)
        .fromTo('[data-ctas]', { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1 }, 0.75)
        .fromTo('[data-meta] > *', { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.12 }, 0.9);

      const split = SplitText.create('[data-h1]', {
        type: 'lines',
        mask: 'lines',
        autoSplit: true,
        onSplit(self) {
          return gsap.from(self.lines, {
            yPercent: 112,
            duration: 1.1,
            ease: 'expo.out',
            stagger: 0.09,
            delay: 0.25,
          });
        },
      });

      const marquee = gsap.to('[data-flags]', { xPercent: -50, duration: 48, repeat: -1, ease: 'none' });

      let li = 0;
      const spin = () => {
        li = (li + 1) % LANGS.length;
        gsap.to('[data-rot]', {
          duration: 1,
          scrambleText: { text: LANGS[li] ?? 'Spanish', chars: 'あ한عñ日ç語ß', speed: 0.6 },
          onComplete: () => gsap.delayedCall(1.8, spin),
        });
      };
      const first = gsap.delayedCall(2.4, spin);

      return () => {
        split.revert();
        marquee.kill();
        first.kill();
      };
    },
    { scope: root }
  );

  return (
    <header className='ba-hero' id='top' ref={root}>
      {/* The burst is committed, not dimmed to a smear: exposure is near the
          shader's own reference so the anisotropic streaks separate into
          spectrum, and the mask is an ellipse centred on the dial so the lobes
          converge on it instead of rotting in the frame corners. */}
      <PrismaticField className='ba-hero-field' params={{ exposureScale: 4200 }} speed={0.5} />
      <div className='ba-hero-shade' aria-hidden />

      <HeroFlow />

      <div className='ba-hero-copy'>
        <h1 data-h1>
          Launch in every
          <br />
          <span className='ba-brushed'>language</span>
        </h1>
        <p className='ba-hero-sub' data-sub>
          General Translation helps developers localize apps into{' '}
          <span className='ba-rot' data-rot>
            Spanish
          </span>
        </p>
        <div className='ba-hero-ctas' data-ctas>
          <a className='ba-btn ba-btn-solid' href='#story'>
            Get Started →
          </a>
          <a className='ba-btn' href='#docs'>
            Docs
          </a>
        </div>
      </div>

      {/* Two strips, not four. The flag marquee labels itself, so the only
          remaining label belongs to the wordmarks — which do need one. The
          "100+ languages supported" kicker and the 118-languages stat row said
          the same fact twice, forty pixels apart, and are gone. */}
      <div className='ba-hero-meta' data-meta>
        <div className='ba-flags' aria-hidden>
          <div className='ba-flags-track' data-flags>
            {[0, 1].map((pass) =>
              LOCALES.map(([code, name]) => (
                <span className='ba-flag' key={`${pass}-${name}`}>
                  <span className='ba-flag-code'>{code}</span> {name}
                </span>
              ))
            )}
          </div>
        </div>
        <div className='ba-trusted'>
          <span className='ba-kicker'>Trusted by the world&apos;s best companies</span>
          <div className='ba-trusted-row'>
            <span>Cursor</span>
            <span>Ramp</span>
            <span>Mintlify</span>
            <span>Profound</span>
            <span>Partiful</span>
            <span>ClickHouse</span>
          </div>
        </div>
      </div>
    </header>
  );
}
