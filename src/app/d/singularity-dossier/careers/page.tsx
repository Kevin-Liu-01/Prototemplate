import { ArrowUpRight, Mail } from 'lucide-react';

import Image from 'next/image';

import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import {
  ASHBY_JOB_BOARD,
  getJobPostings,
} from '../../singularity/company-sections/careers';
import SiteFooter from '../../singularity/sections/SiteFooter';
import TopNav from '../../singularity/sections/TopNav';

import CareersHorizon from './CareersHorizon';
import GlyphRain from './GlyphRain';
import LogosGrid from './LogosGrid';
import ScrollToPositionsButton from './ScrollToPositionsButton';

/* no Frameworks on this route — the footer's marks need the sheet directly
   (the toolchain enterprise subpage precedent) */
import '../../singularity/sections/logos-icons.css';
import '../../singularity/styles.css';
import '../styles.css';
import './careers.css';

export const metadata = {
  title: 'Careers — Dossier — GT Redesign',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

const CAREERS_EMAIL = 'careers@generaltranslation.com';

/**
 * Singularity · Dossier — the careers page ported whole from the live
 * redesign: the event-horizon hero with the locale orbit (printed in
 * ink on the light sheet), the customer proof wall, the live Ashby
 * openings ledger, and the glyph-rain close. The board is fetched
 * through the shared company-sections helper — same source, same
 * hourly revalidate as the live page.
 */
export default async function DossierCareersPage() {
  const openPositions = await getJobPostings();

  return (
    <SmoothScroll>
      <div className='singularity-root sgd-root careers-root'>
        <TopNav />
        <div className='tc-rail'>
          <section className='tc-sec careers-hero'>
            <CareersHorizon />

            <div className='careers-hero-copy'>
              <h1 aria-label="Bring the world's best products to the whole world">
                Bring the world&apos;s best products to the{' '}
                <span>whole world</span>
              </h1>

              <div className='careers-actions'>
                <ScrollToPositionsButton />
                <a
                  className='tc-btn careers-secondary-cta'
                  href={`mailto:${CAREERS_EMAIL}`}
                >
                  Get in Touch
                </a>
              </div>
            </div>
          </section>

          <section className='tc-sec careers-proof'>
            <p>Used by the world&apos;s best companies</p>
            <LogosGrid />
          </section>

          <section
            className='tc-sec careers-mission'
            aria-labelledby='careers-mission-title'
          >
            <div className='careers-mission-grid'>
              <div className='careers-mission-copy'>
                <h2 id='careers-mission-title'>Mission</h2>
                <p>
                  General Translation is building the language infrastructure
                  of the internet. We believe that the world&rsquo;s best
                  products should be accessible in Spanish, French, Japanese,
                  and every other language. We&rsquo;ve built the full stack
                  for localization: open-source i18n libraries, an AI-native
                  translation platform and API, and the agent Locadex. The
                  limiting factor for translation is no longer model quality,
                  but context and developer-first infrastructure. Which is why
                  we&rsquo;ve built the full stack to unlock an unbeatable
                  customer experience. We&rsquo;ve already become essential
                  infrastructure integrated into complex codebases reaching
                  millions of users, and we&rsquo;re scaling rapidly to
                  capture massive market demand.
                </p>
                <p>
                  We&rsquo;re looking for ambitious and exceptional
                  talent&mdash;people who can invent their way out of
                  impossible problems. You&rsquo;ll join a lean team with
                  unlimited AI token spend and extreme creative control. We
                  work in-person in San Francisco. We offer highly competitive
                  salary and equity, and provide top-tier benefits including
                  free meals, gym, Waymo rides from the office, and full
                  health coverage. You&rsquo;ll get career acceleration,
                  ownership, and resources you can&rsquo;t find at any other
                  early-stage company.
                </p>
                <p className='careers-mission-close'>
                  If you care deeply about your craft, we&rsquo;d love to
                  talk.
                </p>
              </div>
              <div className='careers-mission-scene'>
                <Image
                  alt='Two engineers pairing on code at our San Francisco office'
                  className='careers-mission-photo'
                  height={1502}
                  src='/careers/mission.jpg'
                  width={1400}
                />
              </div>
            </div>
          </section>

          <section
            id='positions'
            className='tc-sec careers-openings'
            aria-labelledby='careers-open-roles'
          >
            <div className='careers-section-head'>
              <h2 id='careers-open-roles'>Open roles</h2>
              <p>
                Join our team and help shape the future of global software.
              </p>
            </div>

            <div className='careers-ledger'>
              <div className='careers-role-row is-head' aria-hidden='true'>
                <span>Role</span>
                <span className='careers-role-column'>Team</span>
                <span className='careers-role-column'>Location</span>
                <span className='careers-role-column'>Type</span>
                <span aria-hidden='true' />
              </div>

              {openPositions.length > 0 ? (
                openPositions.map((position) => (
                  <a
                    className='careers-role-row'
                    href={position.url}
                    key={position.id}
                    rel='noopener noreferrer'
                    target='_blank'
                  >
                    <span className='careers-role-title'>
                      <span>{position.title}</span>
                      <span className='careers-role-mobile-meta'>
                        {position.team} · {position.location} ·{' '}
                        {position.type}
                      </span>
                    </span>
                    <span className='careers-role-column'>
                      {position.team}
                    </span>
                    <span className='careers-role-column'>
                      {position.location}
                    </span>
                    <span className='careers-role-column'>{position.type}</span>
                    <span className='careers-role-apply'>
                      Apply
                      <ArrowUpRight aria-hidden='true' />
                    </span>
                  </a>
                ))
              ) : (
                <div className='careers-empty-state'>
                  <p>
                    No open roles at the moment. Check back soon or reach out
                    to us directly.
                  </p>
                </div>
              )}

              <div className='careers-source-row'>
                <span>source · jobs.ashbyhq.com/{ASHBY_JOB_BOARD}</span>
                <span>refreshed hourly</span>
              </div>
            </div>
          </section>

          <section className='tc-sec careers-close'>
            <div className='careers-close-copy'>
              <h2>Don&apos;t see a role that fits?</h2>
              <p>
                We&apos;re always looking for talented people. Send us your
                resume and tell us how you&apos;d like to contribute.
              </p>
              <span className='careers-close-cta'>
                <a className='tc-btn' href={`mailto:${CAREERS_EMAIL}`}>
                  Get in Touch
                  <Mail aria-hidden='true' />
                </a>
              </span>
              <p className='careers-email'>{CAREERS_EMAIL}</p>
            </div>

            <GlyphRain
              className='careers-glyph-scene'
              canvasClassName='careers-glyph-canvas'
            />
          </section>

          <SiteFooter />
        </div>
      </div>
      <DirectionDock slug='singularity-dossier' />
    </SmoothScroll>
  );
}
