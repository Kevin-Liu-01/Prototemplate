'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import Image from 'next/image';
import { useRef } from 'react';

gsap.registerPlugin(useGSAP);

/**
 * Floating machined nav pill. The shared story fades it out for the length of
 * the pin (it hands `navSelector` this element), because a clone of the bar
 * morphs into the story dock and two of them on screen would give it away.
 *
 * The fixed positioning lives on the surrounding dock, so `NavGuard` can retire
 * the whole pill over the closing act without ever fighting the story for the
 * inner element's opacity.
 */
export default function NavBar() {
  const nav = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from(nav.current, { yPercent: -140, autoAlpha: 0, duration: 0.7, delay: 0.15 });
    },
    { scope: nav }
  );

  return (
    <div className='bf-nav-dock'>
      <nav className='bf-nav' id='bf-nav' ref={nav} aria-label='Main'>
        <a className='bf-logo' href='#bf-hero'>
          <span className='bf-logomark'>
            <Image src='/brand/no-bg-gt-logo-dark.png' alt='' width={1198} height={1198} />
          </span>
          General Translation
        </a>
        <div className='bf-nav-links'>
          <a href='#bf-features'>Docs</a>
          <a href='#bf-pricing'>Pricing</a>
          <a href='#bf-features'>Enterprise</a>
          <a href='#bf-workspace'>Blog</a>
        </div>
        <div className='bf-nav-cta'>
          <a className='bf-btn bf-btn-line' href='#bf-pricing'>
            Sign In
          </a>
          <a className='bf-btn bf-btn-solid' href='#bf-close'>
            <span className='bf-irid' aria-hidden />
            Get a Demo
          </a>
        </div>
      </nav>
    </div>
  );
}
