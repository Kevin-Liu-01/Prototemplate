'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import Image from 'next/image';
import { useRef } from 'react';

gsap.registerPlugin(useGSAP);

/**
 * Slim fixed nav. Act II morphs the inner bar into the story dock, so the bar is
 * a single flex row with its own element hook (`.fm-nav-in`) for that FLIP.
 */
export default function Nav() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const onScroll = () => el.classList.toggle('fm-nav-scrim', window.scrollY > 90);
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
      return () => window.removeEventListener('scroll', onScroll);
    },
    { scope: root }
  );

  return (
    <header className='fm-nav' ref={root}>
      <div className='fm-nav-in'>
        <a className='fm-brand' href='#top' aria-label='General Translation home'>
          <Image
            src='/brand/no-bg-gt-logo-dark.png'
            alt=''
            width={26}
            height={26}
            className='fm-brand-mark'
            priority
          />
          <span>General Translation</span>
        </a>
        <nav className='fm-nav-links' aria-label='Primary'>
          <a href='#story' data-magnetic>
            Docs
          </a>
          <a href='#pricing' data-magnetic>
            Pricing
          </a>
          <a href='#review' data-magnetic>
            Enterprise
          </a>
          <a href='#features' data-magnetic>
            Blog
          </a>
        </nav>
        <div className='fm-nav-cta'>
          <a className='fm-btn fm-btn-ghost fm-btn-sm' href='#pricing' data-magnetic>
            Sign In
          </a>
          <a className='fm-btn fm-btn-solid fm-btn-sm' href='#close' data-magnetic>
            Get a Demo
          </a>
        </div>
      </div>
    </header>
  );
}
