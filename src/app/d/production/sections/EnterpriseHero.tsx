'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';

import EnterpriseHeroInk from './EnterpriseHeroInk';
import {
  BADGES,
  customerLogos,
  ENTERPRISE_HERO_CTA,
  infrastructureProof,
} from './enterprise-data';

/**
 * The shipped EnterpriseHero (services-landing/EnterpriseHero.tsx).
 *
 * The enterprise opening on the family ink: the ink field rises in the
 * band's margins (the copy cell is its measured clearing), flat copy on the
 * left, the customer proof ledger framed on the right. Logos hold their
 * dark-surface art and the certification marks invert — the ground never
 * changes with the theme.
 *
 * Everything read here is the shipped page's own: the two-line headline,
 * both sub-paragraphs, the one solid ring-backed ask, the three
 * certification shields, and the five-row proof ledger (Ramp, Cursor,
 * Profound, Partiful, Sierra) with each customer's locale count.
 *
 * Two departures from the shipped component, both forced: gt-next's <T> and
 * useMessages() are gone (this repo renders the English resolution
 * plainly), and the shipped Cta component is spelled out as the concept's
 * own button pair — the .tch-cta ring wrapping .tc-btn.tc-btn-solid, which
 * is the same DOM and the same declarations as Cta variant='solid' ring.
 */
export default function EnterpriseHero() {
  const pathname = usePathname();
  const base = pathname?.match(/^\/d\/[^/]+/)?.[0] ?? '/d/production';

  return (
    <section className='tc-sec' id='top'>
      <div className='tc-row is-lead tce-hero-row'>
        <div className='tc-cell tce-hero'>
          <h1>
            <span>Scale to the world with</span>
            <span>full-stack localization</span>
          </h1>
          <p className='tce-hero-sub'>
            Every company&apos;s localization needs are different. General
            Translation adapts to your existing stack, workflows, and review
            process.
          </p>
          <p className='tce-hero-sub'>
            Use the platform with your own team, or work alongside our
            forward-deployed localization engineers to design automation and
            carry launches through production.
          </p>
          <div className='tce-hero-acts'>
            <span className='tch-cta'>
              <a
                className='tc-btn tc-btn-solid'
                href={`${base}${ENTERPRISE_HERO_CTA.href}`}
              >
                Talk to Us <span aria-hidden='true'>→</span>
              </a>
            </span>
          </div>
          <div className='tce-hero-badges'>
            {BADGES.map(({ alt, src }) => (
              <Image src={src} alt={alt} key={src} width={96} height={40} />
            ))}
          </div>
        </div>

        <div className='tc-cell is-framed tce-hero-frame'>
          {/* the rain lives in this column only — the two frame
              verticals bound it, and the solid card occludes it */}
          <EnterpriseHeroInk />
          <div className='tc-card tce-hero-proof'>
            <h2>
              Trusted by <em>the world&apos;s best engineering teams</em>
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
