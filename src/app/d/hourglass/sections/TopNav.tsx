'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import { useRef, useState } from 'react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * The shell's slim ruled bar, but part of the hero's dark frame while the
 * hourglass is on screen (the sketch reads nav and hero as one dark plate).
 * Once the hero's bottom edge passes under the bar it flips to the light
 * shell's paper treatment. The flip is binary state, not motion, so it is
 * deliberately NOT gated behind prefers-reduced-motion.
 */
export default function TopNav() {
  const root = useRef<HTMLElement>(null);
  const [lit, setLit] = useState(false);

  useGSAP(() => {
    const hero = document.querySelector<HTMLElement>('.hg-hero');
    if (!hero) return;
    ScrollTrigger.create({
      trigger: hero,
      start: 'bottom top+=59',
      onEnter: () => setLit(true),
      onLeaveBack: () => setLit(false),
    });
  }, []);

  return (
    <header className='tc-nav hg-nav' data-lit={lit ? '' : undefined} data-tc-nav ref={root}>
      <div className='tc-nav-in'>
        <a className='tc-nav-brand' href='#top'>
          <Image
            src={lit ? '/brand/no-bg-gt-logo-light.png' : '/brand/no-bg-gt-logo-dark.png'}
            alt=''
            width={22}
            height={22}
          />
          General Translation
        </a>

        <nav className='tc-nav-links'>
          <a href='#frameworks'>Docs</a>
          <a href='#pricing'>Pricing</a>
          <a href='#platform'>Blog</a>
          <a href='#platform'>Enterprise</a>
        </nav>

        <div className='tc-nav-right'>
          <a href='#pricing'>Sign in</a>
          <a className='tc-btn tc-btn-solid tc-btn-sm' href='#pricing'>
            Get a demo
          </a>
        </div>
      </div>
    </header>
  );
}
