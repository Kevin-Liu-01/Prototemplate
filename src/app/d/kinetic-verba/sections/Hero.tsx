'use client';

import 'flag-icons/css/flag-icons.min.css';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef, useState } from 'react';

import PrismaticField from '@/components/shared/PrismaticField';

import HeroPairs from '../components/HeroPairs';
import HeroWheel from '../components/HeroWheel';
import KineticText from '../components/KineticText';
import PairStream from '../components/PairStream';
import { LANGUAGE_CHIPS, TRUSTED_BY } from '../lib/content';

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrambleTextPlugin);

const ROTOR = [
  'French',
  'German',
  'Japanese',
  'Chinese',
  'Portuguese',
  'Korean',
  'Italian',
  'Hindi',
  'Arabic',
  'Spanish',
];

/**
 * The hero is built on the burst, not floated over it.
 *
 * The type block takes the top of the frame — chip, headline, then the line
 * and the two calls to action on one rule beneath it — and the light band
 * below it is left entirely to the mechanic: the mark on the burst's dark
 * centre, with English components and their translations running out of it on
 * mirrored lanes. Nothing sits on the dial.
 */
export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);

  useGSAP(
    () => {
      const host = root.current;
      if (!host) return;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      gsap.fromTo(
        host.querySelectorAll('[data-hero-reveal]'),
        { autoAlpha: 0, y: 20 },
        { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.1, delay: 0.3, ease: 'power3.out' }
      );

      if (reduced) return;

      const rotor = host.querySelector<HTMLElement>('[data-rotor]');
      if (rotor) {
        const tl = gsap.timeline({ repeat: -1, delay: 1.2 });
        ROTOR.forEach((language) => {
          tl.to(rotor, {
            duration: 0.8,
            scrambleText: { text: language, chars: 'lowerCase', speed: 0.4 },
          }).to({}, { duration: 1.5 });
        });
      }

      const track = host.querySelector<HTMLElement>('[data-marquee]');
      if (track) {
        const loop = gsap.to(track, { xPercent: -50, ease: 'none', repeat: -1, duration: 42 });
        ScrollTrigger.create({
          trigger: track,
          start: 'top bottom',
          end: 'bottom top',
          onToggle: (self) => (self.isActive ? loop.play() : loop.pause()),
        });
      }
    },
    { scope: root }
  );

  const copy = () => {
    if (copied) return;
    navigator.clipboard?.writeText('npx gt@latest').catch(() => {});
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1300);
  };

  return (
    <header className='kv-hero' id='top' ref={root}>
      <PrismaticField className='kv-prism' params={{ exposureScale: 5400 }} speed={0.42} />
      <div className='kv-hero-dim' aria-hidden />

      <div className='kv-hero-lead'>
        <button className='kv-npx' type='button' onClick={copy}>
          <span className='kv-npx-dollar'>$</span>
          <span>{copied ? 'copied ✓' : 'npx gt@latest'}</span>
          <svg viewBox='0 0 16 16' fill='none' stroke='currentColor' strokeWidth='1.4' aria-hidden>
            <rect x='5' y='5' width='8' height='8' rx='1.5' />
            <path d='M3.5 10.5h-1a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v1' />
          </svg>
        </button>

        <h1 className='kv-h1'>
          <KineticText text='Launch in every language' intro='mount' baseWeight={620} />
        </h1>

        <div className='kv-hero-say'>
          <p className='kv-hero-sub' data-hero-reveal>
            General Translation helps developers localize apps into{' '}
            <span className='kv-rotor' data-rotor>
              Spanish
            </span>
            <span className='kv-caret' aria-hidden />
          </p>

          <div className='kv-hero-ctas' data-hero-reveal>
            <a className='kv-btn kv-btn-solid' href='#cta'>
              <span className='kv-iri' aria-hidden />
              Get Started <span aria-hidden>→</span>
            </a>
            <a className='kv-btn kv-btn-ghost' href='#how'>
              Docs
            </a>
          </div>
        </div>
      </div>

      <div className='kv-hero-mid'>
        <div
          className='kv-field'
          aria-label='English components leaving the GT mark beside their translations'
        >
          <PairStream />
        </div>
        <HeroWheel />
        <HeroPairs />
      </div>

      <div className='kv-hero-bottom'>
        <div className='kv-langs'>
          <p className='kv-langs-label'>100+ languages supported</p>
          <div className='kv-marq'>
            <div className='kv-marq-track' data-marquee>
              {[...LANGUAGE_CHIPS, ...LANGUAGE_CHIPS].map((chip, i) => (
                <span className='kv-lchip' key={`${chip.name}-${i}`}>
                  <span className={`kv-lflag fi fi-${chip.flag}`} aria-hidden='true' />
                  {chip.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className='kv-trusted'>
          <span className='kv-trusted-label'>Trusted by the world&apos;s best companies</span>
          <div className='kv-trusted-row'>
            {TRUSTED_BY.map((company) => (
              <span className={`kv-wordmark ${company.className}`} key={company.name}>
                {company.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
