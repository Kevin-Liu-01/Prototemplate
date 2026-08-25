import { SiYcombinator } from '@icons-pack/react-simple-icons';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

import YcOrbitHorizon from './YcOrbitHorizon';
import { YC_LINKS } from './yc-links';

/**
 * THE SHIPPED /yc MASTHEAD, reproduced.
 *
 * 1-1 with the first section of apps/landing/src/components/pages/yc/
 * YcPage.tsx: the horizon fills the band, the partner lockup, headline and
 * the ONE action sit inside the hole (the real page carries a single CTA
 * here — Claim YC Deal, pointing at the claim record further down the same
 * page), and the copy is held back by the engine's orbit-hole-copy rule
 * until the shader blooms in.
 *
 * The shader wrapper's knobs are YcHorizon.tsx's, value for value:
 * orbitRadiusScale 1.36, redshiftDuration 150, fieldSpeed 0.45,
 * mobileWidthFactor 0.66, wideCenterYFactor 0.47, canvasHalfScale 2.05.
 */
export default function YcHero() {
  return (
    <section className='tc-sec yc-hero'>
      <YcOrbitHorizon
        className='yc-hole-scene'
        canvasClassName='yc-hole-canvas'
        classPrefix='yc'
        orbitRadiusScale={1.36}
        redshiftDuration={150}
        fieldSpeed={0.45}
        mobileWidthFactor={0.66}
        wideCenterYFactor={0.47}
        canvasHalfScale={2.05}
      />

      <div className='yc-hero-copy orbit-hole-copy'>
        <div
          className='yc-partner-lockup'
          aria-label='General Translation and Y Combinator'
        >
          <Image
            src='/brand/no-bg-gt-logo-dark.png'
            alt=''
            width={48}
            height={48}
          />
          <span aria-hidden='true'>×</span>
          <SiYcombinator
            className='yc-partner-yc'
            color='default'
            size={44}
            title=''
            aria-hidden='true'
          />
        </div>

        <h1 aria-label='Build something people want, in every language.'>
          Build something people want,
          <span>in every language.</span>
        </h1>

        <div className='yc-actions'>
          {/* Cta variant='on-ink-solid' ring size='lg' — the engine faces the
              component resolves to, on the raw anchor this repo uses for
              in-page hops */}
          <span className='tc-cta-ring'>
            <a
              className='tc-btn tc-btn-onink tc-btn-lg'
              href={YC_LINKS.heroClaim.href}
            >
              Claim YC Deal
              <ArrowRight aria-hidden='true' size={16} />
            </a>
          </span>
        </div>
      </div>
    </section>
  );
}
