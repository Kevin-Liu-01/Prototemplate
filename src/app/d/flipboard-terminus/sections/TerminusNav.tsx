'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import Image from 'next/image';
import { useRef } from 'react';

const LINKS = ['Docs', 'Pricing', 'Blog', 'Dashboard'];

/** Terminal concourse header: a floating pill that later morphs into the story dock. */
export default function TerminusNav() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from('.ft-nav-pill', {
        yPercent: -160,
        autoAlpha: 0,
        duration: 0.8,
        ease: 'power3.out',
      });
    },
    { scope: root }
  );

  return (
    <header className='ft-nav' ref={root}>
      <div className='ft-nav-pill' id='ft-nav-pill'>
        <a className='ft-nav-brand' href='#ft-top'>
          <span className='ft-mark'>
            <Image src='/brand/no-bg-gt-logo-dark.png' alt='' width={26} height={26} />
          </span>
          <span>General Translation</span>
        </a>
        <nav className='ft-nav-links' aria-label='Primary'>
          {LINKS.map((link) => (
            <a key={link} href='#ft-how'>
              {link}
            </a>
          ))}
        </nav>
        <a className='ft-btn ft-btn-solid ft-nav-cta' href='#ft-pricing'>
          Get a Demo
        </a>
      </div>
    </header>
  );
}
