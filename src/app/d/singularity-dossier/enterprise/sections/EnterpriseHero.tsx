'use client';

import { useRef } from 'react';

import Cta from './Cta';

import HeroInkField from './HeroInkField';
import Image from 'next/image';

import {
  customerLogos,
  ENTERPRISE_HERO_CTA,
  infrastructureProof,
} from './data';

/**
 * The enterprise opening on the family ink: the ink field rises in the
 * band's margins (the copy cell is its measured clearing), flat copy on
 * the left, the customer proof ledger framed on the right. Logos hold
 * their dark-surface art and the certification marks invert — the
 * ground never changes with the theme.
 */
export default function EnterpriseHero() {
  const root = useRef<HTMLElement>(null);

  return (
    <section className='tc-sec' id='top' ref={root}>
      <div className='tc-row is-lead tce-hero-row'>
        <div className='tc-cell tce-hero'>
            <h1>
              <span>Full-stack localization</span>
              <span>for enterprises</span>
            </h1>
            <p className='tce-hero-sub'>
              Every company&apos;s localization needs are different. For
              leading global enterprises, General Translation applies
              automation, designs custom workflows, and carries
              international launches through production.
            </p>
          <div className='tce-hero-acts'>
            <Cta
              href={ENTERPRISE_HERO_CTA.href}
              ring
              tracked={ENTERPRISE_HERO_CTA.location}
              variant='solid'
            >
              Talk to Us <span aria-hidden='true'>→</span>
            </Cta>
            <Cta
              href='/enterprise/contact'
              tracked='services-cta-engineer'
              variant='outline'
            >
              Talk to an Engineer
            </Cta>
          </div>
          <div className='tce-hero-badges'>
            <Image
              src='/shields/soc-2-type-2.svg'
              alt='AICPA SOC 2 Type II certified'
              width={96}
              height={40}
            />
            <Image src='/shields/gdpr.svg' alt='GDPR compliant' width={96} height={40} />
            <Image
              src='/shields/iso-27001.svg'
              alt='ISO 27001 certified'
              width={96}
              height={40}
            />
          </div>
        </div>

        <div className='tc-cell is-framed tce-hero-frame'>
          {/* the rain lives in this column only — the two frame
              verticals bound it, and the solid card occludes it */}
          <HeroInkField />
          <div className='tc-card tce-hero-proof'>
              <h2>
                Trusted by <em>the world's best engineering teams</em>
              </h2>
            <div className='tce-hero-proof-rows'>
              {customerLogos.map((logo) => {
                const proof = infrastructureProof.find(
                  (item) => item.label === logo.name
                );
                return (
                  <div className='tce-hero-proof-row' key={logo.name}>
                    <span className='tce-hero-proof-logo'>
                      <Image
                        src={logo.lightSrc}
                        alt={logo.name}
                        width={150}
                        height={42}
                        className={`is-light ${logo.className ?? ''}`}
                      />
                      <Image
                        src={logo.darkSrc}
                        alt={logo.name}
                        width={150}
                        height={42}
                        className={`is-dark ${logo.className ?? ''}`}
                      />
                    </span>
                    <span className='tce-hero-proof-copy'>
                      {proof ? proof.value : null}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
