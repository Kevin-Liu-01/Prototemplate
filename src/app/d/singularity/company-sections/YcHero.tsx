'use client';

import Image from 'next/image';
import { useRef } from 'react';

import { SiYcombinator } from '@icons-pack/react-simple-icons';

import { useQuietReveal } from '../sections/reveal';

/**
 * The YC programme page's masthead. The lockup, the headline and the single
 * action are verbatim from YcPage.tsx on the landing app — where the
 * headline sits over an orbit-horizon shader. This direction never puts type
 * on a moving field, so the same two lines are set as a filed masthead and
 * the deal's own terms print in the colophon underneath, drawn from the
 * benefit ledger and the claim form further down this page.
 */
export default function YcHero() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-sec' ref={root}>
      <div className='cp-hero cpy-hero'>
        <span
          aria-label='General Translation and Y Combinator'
          className='cpp-lockup'
          data-reveal
        >
          <Image
            alt=''
            className='cpp-lockup-mark'
            height={26}
            src='/brand/no-bg-gt-logo-light.png'
            width={26}
          />
          <i aria-hidden='true'>&times;</i>
          <SiYcombinator aria-hidden color='currentColor' size={24} />
        </span>

        <h1 data-reveal>
          Build something people want, <span>in every language.</span>
        </h1>

        <div className='cpc-hero-acts' data-reveal>
          <a className='tc-btn tc-btn-solid' href='#claim-your-yc-deal'>
            Claim YC Deal
          </a>
        </div>

        <div className='cp-colophon' data-reveal>
          <span>$5,000 in credits</span>
          <span>12 months</span>
          <span>founder verification required</span>
        </div>
      </div>
    </section>
  );
}
