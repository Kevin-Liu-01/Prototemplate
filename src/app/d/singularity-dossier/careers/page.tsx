import { ArrowUpRight, Mail } from 'lucide-react';

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
              <p>
                Join us on our mission to build a full internationalization
                stack, by developers, for developers.
              </p>

              <div className='careers-actions'>
                <ScrollToPositionsButton />
                <a
                  className='tc-btn careers-secondary-cta'
                  href={`mailto:${CAREERS_EMAIL}`}
                >
                  Get in touch
                </a>
              </div>
            </div>
          </section>

          <section className='tc-sec careers-proof'>
            <p>Used by the world&apos;s best companies</p>
            <LogosGrid />
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
                  Get in touch
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
