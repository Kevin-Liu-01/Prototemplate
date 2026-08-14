import { SiYcombinator } from '@icons-pack/react-simple-icons';
import { ArrowRight, CircleCheck, Rocket } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import SiteFooter from '../../singularity/sections/SiteFooter';
import TopNav from '../../singularity/sections/TopNav';

import CursorTestimonial from './CursorTestimonial';
import EdgeGlobe from './EdgeGlobe';
import GlobeAtmosphere from './GlobeAtmosphere';
import YcContactForm from './YcContactForm';
import YcGlyphRain from './YcGlyphRain';
import YcHorizon from './YcHorizon';
import { YC_LINKS } from './yc-links';

/* no Frameworks on this route — the footer's marks need the sheet directly
   (the toolchain enterprise subpage precedent) */
import '../../singularity/sections/logos-icons.css';
import '../../singularity/styles.css';
import '../styles.css';
import './yc.css';

export const metadata = {
  title: 'YC — Dossier — GT Redesign',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * Singularity · Dossier — the YC page ported whole from the live
 * redesign: the horizon hero with the GT × YC lockup inside the disc,
 * the deal ledger against the glyph rain, the Cursor quote, the edge
 * globe close, and the claim form completing in place.
 */
export default function DossierYcPage() {
  return (
    <SmoothScroll>
      <div className='singularity-root sgd-root yc-root'>
        <TopNav />
        <div className='tc-rail'>
          <section className='tc-sec yc-hero'>
            <YcHorizon />

            <div className='yc-hero-copy'>
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
                <span className='yc-cta-ring is-on'>
                  <Link
                    className='tc-btn yc-primary-cta'
                    href={YC_LINKS.heroClaim.href}
                  >
                    Claim YC deal
                    <ArrowRight aria-hidden='true' />
                  </Link>
                </span>
              </div>
            </div>
          </section>

          <section className='tc-sec yc-glyph'>
            <div className='yc-glyph-copy'>
              <h2>One codebase. Every language.</h2>
              <p>
                General Translation gives startups one developer-first platform
                to localize apps, docs, and websites without slowing down the
                release cycle. Internationalize code, translate content, and
                review changes in the same workflow your team already uses.
              </p>
              <ul className='yc-benefits'>
                <li>
                  <CircleCheck className='yc-benefit-icon' aria-hidden='true' />
                  <span className='yc-benefit-copy'>
                    <span className='yc-benefit-emphasis'>$5,000</span>
                    <span> in credits for </span>
                    <span className='yc-benefit-emphasis'>12 months</span>
                  </span>
                </li>
                <li>
                  <CircleCheck className='yc-benefit-icon' aria-hidden='true' />
                  <span className='yc-benefit-copy'>
                    Dedicated Slack channel with the founders and engineers.
                  </span>
                </li>
                <li>
                  <CircleCheck className='yc-benefit-icon' aria-hidden='true' />
                  <span className='yc-benefit-copy'>
                    Feature your company as a use case on the General
                    Translation website (optional).
                  </span>
                </li>
                <li>
                  <CircleCheck className='yc-benefit-icon' aria-hidden='true' />
                  <span className='yc-benefit-copy'>
                    Direct access to the CEO&apos;s phone number on WhatsApp or
                    text.
                  </span>
                </li>
              </ul>
            </div>
            <YcGlyphRain />
          </section>

          <section className='tc-sec yc-testimonial'>
            <CursorTestimonial />
          </section>

          <section className='tc-sec yc-close'>
            <div className='yc-close-content'>
              <h2 aria-label='Go global before Demo Day.'>
                Go global before
                <span>Demo Day.</span>
              </h2>
              <p className='yc-close-copy'>
                Start free, connect your stack, and add languages without adding
                a localization backlog.
              </p>

              <div className='yc-actions yc-close-actions'>
                <span className='yc-cta-ring is-on'>
                  <Link
                    className='tc-btn yc-primary-cta'
                    href={YC_LINKS.closeClaim.href}
                  >
                    Claim YC deal
                    <Rocket aria-hidden='true' />
                  </Link>
                </span>
              </div>
            </div>

            <div className='yc-close-globe'>
              <GlobeAtmosphere />
              <EdgeGlobe />
            </div>
          </section>

          <YcContactForm embedded />

          <SiteFooter />
        </div>
      </div>
      <DirectionDock slug='singularity-dossier' />
    </SmoothScroll>
  );
}
